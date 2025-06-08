'use client';

import { useSelector } from "react-redux";
import { Button, Select, Typography, Alert, List, Modal, Collapse, Descriptions } from "antd";
import styles from "./main.module.css";
import { useEffect, useState } from "react";
import { RootState } from '@/lib/redux/store';

const { Title, Paragraph, Link, Text } = Typography;
const { Panel } = Collapse;

type TaskOption = {
    value: number;
    label: string;
};

type User = {
    github: string;
    group: string;
    id: number;
    name: string;
    role: string;
    surname: string;
};

type ValidationError = {
    errors: string[];
    isValid: boolean;
};

type ValidationResultItem = {
    file: string;
    htmlValid: ValidationError;
    bemValid: ValidationError;
};

type ValidationErrorsResponse = {
    githubLogin?: string;
    overallValid?: boolean;
    errors?: any;
    results: ValidationResultItem[];
};

type TestResultFile = {
    filename: string;
    message: string;
    status: string;
    details?: any | null;
};

type TestResult = {
    branch: string;
    githubLogin: string;
    result: {
        files: TestResultFile[];
    };
    taskId: number;
    testId: number;
};

function removeDuplicates(items: { value: string | number; label: string }[]) {
    const seen = new Set<string>();
    return items.filter((item) => {
        const key = `${item.value}-${item.label}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
    });
}

function sortByLabel(items: { value: string | number; label: string }[]) {
    return items.slice().sort((a, b) => a.label.localeCompare(b.label));
}

const MainTests = () => {
    const globalUser = useSelector((state: RootState) => state.user);

    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("accessToken="));
    const token = tokenCookie?.split("=")[1];

    const [localUser, setLocalUser] = useState<User | null>(null);
    const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
    const [selectedTask, setSelectedTask] = useState<number | null>(null);
    const [studentOptions, setStudentOptions] = useState<{ value: string; label: string }[]>([]);
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<ValidationErrorsResponse | null>(null);
    const [tests, setTests] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [validationLoading, setValidationLoading] = useState(false);
    const [runTestLoadingId, setRunTestLoadingId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isValidationModalVisible, setIsValidationModalVisible] = useState(false);
    const [isRunTestModalVisible, setIsRunTestModalVisible] = useState(false);
    const [runTestResults, setRunTestResults] = useState<TestResult[]>([]);

    useEffect(() => {
        if (globalUser && globalUser.user?.id) {
            setLocalUser(globalUser.user);
        }
    }, [globalUser]);

    useEffect(() => {
        const fetchData = async () => {
            if (!localUser?.id) return;
            setLoading(true);
            setError(null);

            try {
                if (!token) {
                    setError("Токен не найден");
                    setLoading(false);
                    return;
                }

                if (localUser.role === "студент") {
                    const res = await fetch(`http://localhost:5000/user/get-tasks/${localUser.github}`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    });

                    if (!res.ok) throw new Error("Ошибка загрузки заданий студента");

                    const tasksData = await res.json();
                    const formattedTasks = sortByLabel(
                        tasksData.map((item: any) => ({ value: item.taskId, label: item.name }))
                    );
                    setTaskOptions(formattedTasks)
                    setSelectedStudent(localUser.github);
                    setStudentOptions([{ value: localUser.github, label: localUser.github }]);
                } else {
                    const testsRes = await fetch(`http://localhost:5000/user/${localUser.id}/tests`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    });

                    if (!testsRes.ok) throw new Error("Ошибка загрузки тестов");

                    const testsData = await testsRes.json();
                    setTests(testsData);

                    const participantsRes = await fetch(`http://localhost:5000/user/participants`, {
                        headers: { Authorization: `Bearer ${token}` },
                        cache: "no-store",
                    });

                    if (!participantsRes.ok) throw new Error("Ошибка загрузки участников");

                    const participantsData = await participantsRes.json();

                    const tasksData = removeDuplicates(
                        participantsData.map((item: any) => ({ value: item.taskId, label: item.taskName }))
                    );
                    const sortedTasksData = sortByLabel(tasksData);

                    const usersData = removeDuplicates(
                        participantsData.map((item: any) => ({ value: item.githubLogin, label: item.githubLogin }))
                    );
                    const sortedUsersData = sortByLabel(usersData);

                    setTaskOptions(sortedTasksData);
                    setStudentOptions(sortedUsersData);
                }
            } catch (err: any) {
                setError(err.message || "Неизвестная ошибка");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [localUser, token]);

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!selectedStudent || !selectedTask) {
            setError("Пожалуйста, выберите студента и задание.");
            return;
        }
        setValidationLoading(true);
        setValidationErrors(null);
        setError(null);

        try {
            const res = await fetch("http://localhost:5000/testing/validate-html", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    githubLogin: selectedStudent,
                    taskId: selectedTask,
                }),
            });

            if (!res.ok) throw new Error("Ошибка при проверке разметки");

            const validationData = await res.json();
            setValidationErrors(validationData);
            setIsValidationModalVisible(true);
        } catch (err: any) {
            setError(err.message || "Неизвестная ошибка при проверке разметки");
        } finally {
            setValidationLoading(false);
        }
    }

    async function handleRunTest(id: number) {
        setRunTestResults([]);
        console.log(runTestResults);
        if (!token) {
            setError("Токен не найден");
            return;
        }
        setRunTestLoadingId(id);
        setError(null);

        try {
            const res = await fetch(`http://localhost:5000/testing/run/${id}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) throw new Error("Ошибка при запуске теста");

            const testData = await res.json();
            console.log(testData)

            setRunTestResults(testData);
            setIsRunTestModalVisible(true);
        } catch (err: any) {
            setError(err.message || "Неизвестная ошибка при запуске теста");
        } finally {
            setRunTestLoadingId(null);
        }
    }

    async function handleStudentRunTest(taskId: number) {
    setRunTestResults([]);
    if (!token) {
        setError("Токен не найден");
        return;
    }
    if (!localUser?.github) {
        setError("GitHub логин пользователя не найден");
        return;
    }

    setRunTestLoadingId(taskId);
    setError(null);

    try {
        const res = await fetch(`http://localhost:5000/testing/student-run/${taskId}/${localUser.github}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        if (!res.ok) throw new Error("Ошибка при запуске теста");

        const testData = await res.json();
        setRunTestResults(testData);
        setIsRunTestModalVisible(true);
    } catch (err: any) {
        setError(err.message || "Неизвестная ошибка при запуске теста");
    } finally {
        setRunTestLoadingId(null);
    }
}

    const handleValidationModalClose = () => setIsValidationModalVisible(false);
    const handleRunTestModalClose = () => setIsRunTestModalVisible(false);
    if (localUser?.role === "преподаватель") {
        return (
            <main className={styles.main}>
                <div className={styles.mainWrapper}>
                    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                        <Title level={3}>Протестировать разметку конкретного студента</Title>
                        <Select
                            showSearch
                            placeholder="Выберите студента"
                            optionFilterProp="children"
                            onChange={(value) => setSelectedStudent(value)}
                            value={selectedStudent}
                            style={{ width: "100%", marginBottom: 16 }}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={studentOptions}
                            allowClear
                            disabled={validationLoading || runTestLoadingId !== null}
                        />
                        <Select
                            showSearch
                            placeholder="Выберите задание"
                            optionFilterProp="children"
                            onChange={(value) => setSelectedTask(value)}
                            value={selectedTask}
                            style={{ width: "100%", marginBottom: 16 }}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={taskOptions}
                            allowClear
                            disabled={validationLoading || runTestLoadingId !== null}
                        />
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={validationLoading}
                            disabled={!selectedStudent || !selectedTask || validationLoading || runTestLoadingId !== null}
                        >
                            Проверить разметку
                        </Button>
                    </form>

                    {error && (
                        <Alert message="Ошибка" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
                    )}

                    <List
                        grid={{ gutter: 16, column: 2 }}
                        dataSource={tests}
                        renderItem={(item) => (
                            <List.Item key={item.id}>
                                <div className={styles.item}>
                                    <Title level={4} className={styles.heading}>
                                        {item.title}
                                    </Title>
                                    <Paragraph className={styles.text}>{item.description}</Paragraph>
                                    <Paragraph className={styles.text}>Название файла: {item.filename}</Paragraph>
                                    <Paragraph>Связанные задания:</Paragraph>
                                    <List
                                        dataSource={item.tasks}
                                        renderItem={(innerItem: any) => (
                                            <List.Item key={innerItem.taskId} className={styles.item}>
                                                <Link href={innerItem.link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                                                    {innerItem.name}
                                                </Link>
                                                <Paragraph>id: {innerItem.taskId}</Paragraph>
                                            </List.Item>
                                        )}
                                        size="small"
                                        split={false}
                                    />
                                    <Button
                                        type="default"
                                        onClick={() => handleRunTest(item.id)}
                                        loading={runTestLoadingId === item.id}
                                        disabled={validationLoading || runTestLoadingId !== null}
                                    >
                                        Запустить
                                    </Button>
                                </div>
                            </List.Item>
                        )}
                        loading={loading}
                        locale={{ emptyText: "Нет тестов" }}
                    />

                    <Modal
                        title={validationErrors?.overallValid ? "Разметка валидна" : "Разметка не валидна"}
                        visible={isValidationModalVisible}
                        onCancel={handleValidationModalClose}
                        footer={[
                            <Button key="close" onClick={handleValidationModalClose}>
                                Закрыть
                            </Button>,
                        ]}
                        width={700}
                        destroyOnHidden
                        maskClosable
                    >
                        {!validationErrors && <p>Нет данных для отображения</p>}
                        {validationErrors?.results && (
                            <List
                                dataSource={validationErrors.results}
                                itemLayout="vertical"
                                renderItem={(item) => (
                                    <List.Item key={item.file}>
                                        <Title level={5}>{item.file}</Title>
                                        <Paragraph className={item.htmlValid.isValid ? styles.validText : styles.invalidText}>
                                            Валидность HTML: {item.htmlValid.isValid ? "Валидно" : "Не валидно"}
                                        </Paragraph>
                                        {item.htmlValid.errors.length > 0 && (
                                            <List
                                                dataSource={item.htmlValid.errors}
                                                renderItem={(errorItem, idx) => (
                                                    <List.Item key={idx} className={item.htmlValid.isValid ? styles.validText : styles.invalidText}>
                                                        {errorItem}
                                                    </List.Item>
                                                )}
                                                size="small"
                                                split={false}
                                            />
                                        )}

                                        <Paragraph className={item.bemValid.isValid ? styles.validText : styles.invalidText}>
                                            Валидность БЭМ: {item.bemValid.isValid ? "Валидно" : "Не валидно"}
                                        </Paragraph>
                                        {item.bemValid.errors.length > 0 && (
                                            <List
                                                dataSource={item.bemValid.errors}
                                                renderItem={(errorItem, idx) => (
                                                    <List.Item key={idx} className={item.bemValid.isValid ? styles.validText : styles.invalidText}>
                                                        {errorItem}
                                                    </List.Item>
                                                )}
                                                size="small"
                                                split={false}
                                            />
                                        )}
                                    </List.Item>
                                )}
                            />
                        )}
                    </Modal>

                    <Modal
                        title="Результаты запуска тестов"
                        open={isRunTestModalVisible}
                        onCancel={() => setIsRunTestModalVisible(false)}
                        destroyOnHidden
                        footer={[
                            <Button key="close" onClick={() => setIsRunTestModalVisible(false)}>
                                Закрыть
                            </Button>,
                        ]}
                        width={800}
                    >
                        {runTestResults.length > 0 ? (
                            runTestResults.map((testResult: TestResult) => (
                                <div key={testResult.testId} style={{ marginBottom: 20 }}>
                                    <Title level={4}>
                                        Тест: {testResult.testId} — {testResult.githubLogin} (Задание {testResult.taskId})
                                    </Title>
                                    <Collapse>
                                        {testResult.result.files.map((file: TestResultFile) => (
                                            <Panel
                                                header={
                                                    <span>
                                                        Файл: <b>{file.filename}</b> — Статус:{" "}
                                                        <span style={{ color: file.status === "passed" ? "green" : "red" }}>
                                                            {file.status}
                                                        </span>
                                                    </span>
                                                }
                                                key={file.filename}
                                                className={file.status !== "passed" ? styles.invalidText : undefined}
                                            >
                                                {file.status === "not_found" ? (
                                                    <Paragraph type="warning">{file.message || "Файл не найден"}</Paragraph>
                                                ) : file.details ? (
                                                    <>
                                                        {/* Обработка функций */}
                                                        {Array.isArray(file.details?.functions) && file.details.functions.length > 0 ? (
                                                            <Collapse>
                                                                {file.details.functions.map((func: any, idx: number) => (
                                                                    <Panel
                                                                        header={`${func.name}${func.error ? ` — Ошибка: ${func.error}` : ""}`}
                                                                        key={idx}
                                                                        className={func.error ? styles.invalidText : undefined}
                                                                    >
                                                                        {Array.isArray(func.checks) && func.checks.length > 0 ? (
                                                                            <List
                                                                                dataSource={func.checks}
                                                                                renderItem={(check: any, idx2: number) => (
                                                                                    <List.Item key={idx2}>
                                                                                        <Descriptions
                                                                                            size="small"
                                                                                            column={1}
                                                                                            bordered
                                                                                            style={{ width: "100%" }}
                                                                                            labelStyle={{ width: "150px" }}
                                                                                        >
                                                                                            <Descriptions.Item label="Ввод">
                                                                                                <pre>{JSON.stringify(check.input, null, 2)}</pre>
                                                                                            </Descriptions.Item>
                                                                                            <Descriptions.Item label="Ожидание">
                                                                                                <pre>{JSON.stringify(check.expected, null, 2)}</pre>
                                                                                            </Descriptions.Item>
                                                                                            <Descriptions.Item label="Фактический результат">
                                                                                                <pre>{JSON.stringify(check.actual, null, 2)}</pre>
                                                                                            </Descriptions.Item>
                                                                                            <Descriptions.Item label="Статус">
                                                                                                <Text type={check.passed ? "success" : "danger"}>
                                                                                                    {check.passed ? "Пройдено" : "Провалено"}
                                                                                                </Text>
                                                                                            </Descriptions.Item>
                                                                                        </Descriptions>
                                                                                    </List.Item>
                                                                                )}
                                                                                size="small"
                                                                                split={false}
                                                                            />
                                                                        ) : (
                                                                            <Paragraph>Проверок нет</Paragraph>
                                                                        )}
                                                                    </Panel>
                                                                ))}
                                                            </Collapse>
                                                        ) : (
                                                            <Paragraph>Нет данных по функциям</Paragraph>
                                                        )}

                                                        {/* Обработка тегов */}
                                                        {Array.isArray(file.details.tags) && (
                                                            <List
                                                                header="Результаты по тегам:"
                                                                dataSource={file.details.tags}
                                                                renderItem={(tag: any) => (
                                                                    <List.Item>
                                                                        <Text>
                                                                            Тег: <b>{tag.tag}</b> — Ожидалось: {tag.required}, Найдено: {tag.found} —{" "}
                                                                            <span style={{ color: tag.passed ? "green" : "red" }}>
                                                                                {tag.passed ? "Пройдено" : "Провалено"}
                                                                            </span>
                                                                        </Text>
                                                                    </List.Item>
                                                                )}
                                                                size="small"
                                                                bordered
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <Paragraph>{file.message || "Нет дополнительных данных"}</Paragraph>
                                                )}
                                            </Panel>
                                        ))}
                                    </Collapse>

                                </div>
                            ))
                        ) : (
                            <Paragraph>Нет данных</Paragraph>
                        )}
                    </Modal>

                </div>
            </main>
        );
    }
    if (localUser?.role === "студент") {
        return (
            <main className={styles.main}>
                <div className={styles.mainWrapper}>
                    <form onSubmit={handleSubmit} style={{ marginBottom: "2rem" }}>
                        <Title level={3}>Протестировать разметку конкретного студента</Title>
                        <Select
                            showSearch
                            placeholder="Выберите студента"
                            optionFilterProp="children"
                            onChange={(value) => setSelectedStudent(value)}
                            value={selectedStudent}
                            style={{ width: "100%", marginBottom: 16 }}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={studentOptions}
                            allowClear
                            disabled={localUser?.role === "студент" || validationLoading || runTestLoadingId !== null}
                        />

                        <Select
                            showSearch
                            placeholder="Выберите задание"
                            optionFilterProp="children"
                            onChange={(value) => setSelectedTask(value)}
                            value={selectedTask}
                            style={{ width: "100%", marginBottom: 16 }}
                            filterOption={(input, option) =>
                                (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                            }
                            options={taskOptions}
                            allowClear
                            disabled={validationLoading || runTestLoadingId !== null}
                        />
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={validationLoading}
                            disabled={!selectedStudent || !selectedTask || validationLoading || runTestLoadingId !== null}
                        >
                            Проверить разметку
                        </Button>
                    </form>

                    {error && (
                        <Alert message="Ошибка" description={error} type="error" showIcon style={{ marginBottom: 16 }} />
                    )}

                    <List
                        grid={{ gutter: 16, column: 2 }}
                        dataSource={taskOptions}
                        renderItem={(item) => (
                            <List.Item key={item.value}>
                                <div className={styles.item}>
                                    <Title level={4} className={styles.heading}>{item.label}</Title>
                                    <Button
                                        type="default"
                                        onClick={() => handleStudentRunTest(item.value)}
                                        disabled={validationLoading || runTestLoadingId !== null}
                                    >
                                        Запустить
                                    </Button>
                                </div>
                            </List.Item>
                        )}
                        loading={loading}
                        locale={{ emptyText: "Нет заданий" }}
                    />

                    <Modal
                        title={validationErrors?.overallValid ? "Разметка валидна" : "Разметка не валидна"}
                        visible={isValidationModalVisible}
                        onCancel={handleValidationModalClose}
                        footer={[
                            <Button key="close" onClick={handleValidationModalClose}>
                                Закрыть
                            </Button>,
                        ]}
                        width={700}
                        destroyOnHidden
                        maskClosable
                    >
                        {!validationErrors && <p>Нет данных для отображения</p>}
                        {validationErrors?.results && (
                            <List
                                dataSource={validationErrors.results}
                                itemLayout="vertical"
                                renderItem={(item) => (
                                    <List.Item key={item.file}>
                                        <Title level={5}>{item.file}</Title>
                                        <Paragraph className={item.htmlValid.isValid ? styles.validText : styles.invalidText}>
                                            Валидность HTML: {item.htmlValid.isValid ? "Валидно" : "Не валидно"}
                                        </Paragraph>
                                        {item.htmlValid.errors.length > 0 && (
                                            <List
                                                dataSource={item.htmlValid.errors}
                                                renderItem={(errorItem, idx) => (
                                                    <List.Item key={idx} className={item.htmlValid.isValid ? styles.validText : styles.invalidText}>
                                                        {errorItem}
                                                    </List.Item>
                                                )}
                                                size="small"
                                                split={false}
                                            />
                                        )}

                                        <Paragraph className={item.bemValid.isValid ? styles.validText : styles.invalidText}>
                                            Валидность БЭМ: {item.bemValid.isValid ? "Валидно" : "Не валидно"}
                                        </Paragraph>
                                        {item.bemValid.errors.length > 0 && (
                                            <List
                                                dataSource={item.bemValid.errors}
                                                renderItem={(errorItem, idx) => (
                                                    <List.Item key={idx} className={item.bemValid.isValid ? styles.validText : styles.invalidText}>
                                                        {errorItem}
                                                    </List.Item>
                                                )}
                                                size="small"
                                                split={false}
                                            />
                                        )}
                                    </List.Item>
                                )}
                            />
                        )}
                    </Modal>

                    <Modal
                        title="Результаты запуска тестов"
                        open={isRunTestModalVisible}
                        onCancel={() => setIsRunTestModalVisible(false)}
                        destroyOnHidden
                        footer={[
                            <Button key="close" onClick={() => setIsRunTestModalVisible(false)}>
                                Закрыть
                            </Button>,
                        ]}
                        width={800}
                    >
                        {runTestResults.length > 0 ? (
                            runTestResults.map((testResult: TestResult) => (
                                <div key={testResult.testId} style={{ marginBottom: 20 }}>
                                    <Title level={4}>
                                        Тест: {testResult.testId} — {testResult.githubLogin} (Задание {testResult.taskId})
                                    </Title>
                                    <Collapse>
                                        {testResult.result.files.map((file: TestResultFile) => (
                                            <Panel
                                                header={
                                                    <span>
                                                        Файл: <b>{file.filename}</b> — Статус:{" "}
                                                        <span style={{ color: file.status === "passed" ? "green" : "red" }}>
                                                            {file.status}
                                                        </span>
                                                    </span>
                                                }
                                                key={file.filename}
                                                className={file.status !== "passed" ? styles.invalidText : undefined}
                                            >
                                                {file.status === "not_found" ? (
                                                    <Paragraph type="warning">{file.message || "Файл не найден"}</Paragraph>
                                                ) : file.details ? (
                                                    <>
                                                        {/* Обработка функций */}
                                                        {Array.isArray(file.details?.functions) && file.details.functions.length > 0 ? (
                                                            <Collapse>
                                                                {file.details.functions.map((func: any, idx: number) => (
                                                                    <Panel
                                                                        header={`${func.name}${func.error ? ` — Ошибка: ${func.error}` : ""}`}
                                                                        key={idx}
                                                                        className={func.error ? styles.invalidText : undefined}
                                                                    >
                                                                        {Array.isArray(func.checks) && func.checks.length > 0 ? (
                                                                            <List
                                                                                dataSource={func.checks}
                                                                                renderItem={(check: any, idx2: number) => (
                                                                                    <List.Item key={idx2}>
                                                                                        <Descriptions
                                                                                            size="small"
                                                                                            column={1}
                                                                                            bordered
                                                                                            style={{ width: "100%" }}
                                                                                            labelStyle={{ width: "150px" }}
                                                                                        >
                                                                                            <Descriptions.Item label="Ввод">
                                                                                                <pre>{JSON.stringify(check.input, null, 2)}</pre>
                                                                                            </Descriptions.Item>
                                                                                            <Descriptions.Item label="Ожидание">
                                                                                                <pre>{JSON.stringify(check.expected, null, 2)}</pre>
                                                                                            </Descriptions.Item>
                                                                                            <Descriptions.Item label="Фактический результат">
                                                                                                <pre>{JSON.stringify(check.actual, null, 2)}</pre>
                                                                                            </Descriptions.Item>
                                                                                            <Descriptions.Item label="Статус">
                                                                                                <Text type={check.passed ? "success" : "danger"}>
                                                                                                    {check.passed ? "Пройдено" : "Провалено"}
                                                                                                </Text>
                                                                                            </Descriptions.Item>
                                                                                        </Descriptions>
                                                                                    </List.Item>
                                                                                )}
                                                                                size="small"
                                                                                split={false}
                                                                            />
                                                                        ) : (
                                                                            <Paragraph>Проверок нет</Paragraph>
                                                                        )}
                                                                    </Panel>
                                                                ))}
                                                            </Collapse>
                                                        ) : (
                                                            <Paragraph>Нет данных по функциям</Paragraph>
                                                        )}

                                                        {/* Обработка тегов */}
                                                        {Array.isArray(file.details.tags) && (
                                                            <List
                                                                header="Результаты по тегам:"
                                                                dataSource={file.details.tags}
                                                                renderItem={(tag: any) => (
                                                                    <List.Item>
                                                                        <Text>
                                                                            Тег: <b>{tag.tag}</b> — Ожидалось: {tag.required}, Найдено: {tag.found} —{" "}
                                                                            <span style={{ color: tag.passed ? "green" : "red" }}>
                                                                                {tag.passed ? "Пройдено" : "Провалено"}
                                                                            </span>
                                                                        </Text>
                                                                    </List.Item>
                                                                )}
                                                                size="small"
                                                                bordered
                                                            />
                                                        )}
                                                    </>
                                                ) : (
                                                    <Paragraph>{file.message || "Нет дополнительных данных"}</Paragraph>
                                                )}
                                            </Panel>
                                        ))}
                                    </Collapse>

                                </div>
                            ))
                        ) : (
                            <Paragraph>Нет данных</Paragraph>
                        )}
                    </Modal>

                </div>
            </main>
        );
    }
};

export default MainTests;
