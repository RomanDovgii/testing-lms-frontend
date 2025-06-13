// Copyright (C) 2024 Roman Dovgii
// This file is part of LMS with github classroom integration.
//
// LMS with github classroom integration is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

'use client';

import { useSelector } from "react-redux";
import { List, Typography, Spin, Alert, Checkbox, Collapse, Descriptions, Table, Button, Modal, message, Form, Input } from "antd";
import styles from "./main.module.css";
import { useEffect, useState } from "react";
import { RootState } from '@/lib/redux/store';

const { Panel } = Collapse;
const { Title, Link, Paragraph } = Typography;

type User = {
  github: string;
  group: string;
  id: number;
  name: string;
  role: string;
  surname: string;
};

const MainTasks = () => {
  const globalUser = useSelector((state: RootState) => state.user);
  const [localUser, setLocalUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("accessToken="));
  const token = tokenCookie?.split("=")[1];

  useEffect(() => {
    if (globalUser?.user?.id) {
      setLocalUser(globalUser.user);
    }
  }, [globalUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (!localUser) return;

      setLoading(true);
      setError(null);

      try {
        if (!token) {
          setError('Токен не найден');
          setLoading(false);
          return;
        }

        const endpoint = localUser.role === 'преподаватель'
          ? `http://localhost:5000/${localUser.id}/tasks`
          : `http://localhost:5000/user/get-tasks/${localUser.github}`;

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        if (!res.ok) {
          throw new Error(`Ошибка сервера: ${res.statusText}`);
        }

        const data = await res.json();
        setTasks(data);
      } catch (error: any) {
        setError(error.message || 'Неизвестная ошибка');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [localUser, token]);

  const showEditModal = (task) => {
    setSelectedTask(task);
    setIsEditModalVisible(true);
  };

  const showDeleteModal = (task) => {
    setSelectedTask(task);
    setIsDeleteModalVisible(true);
  };

  const handleEditSubmit = async (values: { name: string; link: string; branch: string }) => {
    if (!localUser) {
      message.error('Пользователь не авторизован');
      return;
    }

    try {
      await updateTask({
        id: selectedTask.id,
        userId: localUser.id,
        name: values.name,
        link: values.link,
        branch: values.branch,
      });

      setIsEditModalVisible(false);
      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === selectedTask.id ? {...task, ...values} : task
        )
      );
      message.success('Задание обновлено');
    } catch (error) {
      console.error('Ошибка при обновлении задания:', error);
      message.error('Не удалось обновить задание');
    }
  };

  const handleDeleteConfirm = async () => {
    if (!localUser) {
      message.error('Пользователь не авторизован');
      return;
    }

    try {
      await deleteTask(selectedTask.id, localUser.id);
      setIsDeleteModalVisible(false);
      message.success('Задание удалено');
      setTasks(prevTasks => prevTasks.filter(task => task.id !== selectedTask.id));
    } catch (error) {
      console.error('Ошибка при удалении задания:', error);
      message.error('Не удалось удалить задание');
    }
  };

  async function handleCheck(id: number) {
    if (!token) {
      setError("Токен не найден");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:5000/user/add-check/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) throw new Error("Ошибка при добавлении в тестирование");

      const updatedTasks = tasks.map((task) => {
        if (task.id === id) {
          const checks = task.htmlCopyChecks;

          if (Array.isArray(checks) && checks.length > 0) {
            const updatedCheck = {
              ...checks[0],
              enabled: !checks[0].enabled,
            };

            return {
              ...task,
              htmlCopyChecks: [updatedCheck],
            };
          }

          return {
            ...task,
            htmlCopyChecks: [{
              enabled: true,
            }],
          };
        }

        return task;
      });

      setTasks(updatedTasks);
    } catch (err: any) {
      setError(err.message || "Неизвестная ошибка при запуске теста");
    } finally {
      setLoading(false);
    }
  }

  const updateTask = async (taskData) => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((row) => row.startsWith('accessToken='));
    const token = tokenCookie?.split('=')[1];

    try {
      const res = await fetch('http://localhost:5000/user/task/update', {
        method: 'POST', // Или PATCH, если сервер принимает PATCH
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(taskData),
      });

      if (!res.ok) {
        throw new Error('Не удалось обновить задание');
      }

      return await res.json();
    } catch (error) {
      console.error('Ошибка при обновлении задания:', error);
      throw error;
    }
  };

  const deleteTask = async (taskId, userId) => {
    const cookies = document.cookie.split('; ');
    const tokenCookie = cookies.find((row) => row.startsWith('accessToken='));
    const token = tokenCookie?.split('=')[1];

    try {
      const res = await fetch('http://localhost:5000/user/task/delete', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ taskId, userId }),
      });

      if (!res.ok) {
        throw new Error('Не удалось удалить задание');
      }

      return await res.json();
    } catch (error) {
      console.error('Ошибка при удалении задания:', error);
      throw error;
    }
  };

  if (loading) return <Spin tip="Загрузка..." style={{ display: 'flex', justifyContent: 'center', marginTop: '2rem' }} />;
  if (error) return <Alert type="error" message="Ошибка" description={error} style={{ margin: '2rem' }} />;

  const isTeacher = localUser?.role === 'преподаватель';

  return (
    <main className={styles.main}>
      <div className={styles.mainWrapper}>
        <List
          grid={{ gutter: 16, column: 2 }}
          dataSource={tasks}
          locale={{ emptyText: 'Нет заданий' }}
          renderItem={(item) => (
            <List.Item>
              <div className={styles.item}>
                <Title level={4} className={styles.heading}>
                  {item.githubLogin || item.name}
                </Title>

                <Link className={styles.link} href={item.link} target="_blank" rel="noopener noreferrer">
                  Ссылка на репозиторий
                </Link>
                <Paragraph className={styles.text}>Branch: {item.branch}</Paragraph>

                {item.createdAt && (
                  <Paragraph className={styles.text}>
                    Создано: {new Date(item.createdAt).toLocaleString("ru-RU", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Paragraph>
                )}

                {isTeacher && (
                  <>
                    <Paragraph className={styles.text}>Аномалии: {item.anomalies?.length || 0}</Paragraph>
                    <Paragraph className={styles.text}>Предполагаемые копирования: {item.htmlCopyMatches?.length || 0}</Paragraph>

                    <Checkbox
                      checked={item?.htmlCopyChecks?.[0]?.enabled}
                      onChange={() => handleCheck(item.id)}
                      disabled={loading}
                    >
                      Добавить в очередь на проверку копирования
                    </Checkbox>

                    <Button type="primary" onClick={() => showEditModal(item)} style={{ marginRight: 8 }}>
                      Изменить
                    </Button>
                    <Button danger onClick={() => showDeleteModal(item)}>
                      Удалить
                    </Button>

                    <Collapse ghost style={{ marginTop: "1rem" }}>
                      <Panel header={`Аномалии (${item.anomalies?.length || 0})`} key="1" style={{ backgroundColor: "#fafafa", borderRadius: 6 }}>
                        {(item.anomalies && item.anomalies.length > 0) ? (
                          <Descriptions bordered size="small" column={1} style={{ backgroundColor: "#fff", borderRadius: 6, padding: "1rem" }}>
                            {item.anomalies.map((anomaly: any, index: number) => (
                              <Descriptions.Item label={`Пользователь`} key={anomaly.id || index}>
                                <Typography.Text strong>{anomaly.githubLogin}</Typography.Text>
                                <br />
                                <Typography.Text type="secondary">
                                  {new Date(anomaly.commitDate).toLocaleString("ru-RU", {
                                    day: "2-digit",
                                    month: "long",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </Typography.Text> <br />
                                <Typography.Text strong>Хэш: {anomaly.commitHash}</Typography.Text>
                              </Descriptions.Item>
                            ))}
                          </Descriptions>
                        ) : (
                          <Paragraph>Нет аномалий</Paragraph>
                        )}
                      </Panel>

                      <Panel header={`Подозрения на копирование (${item.htmlCopyMatches?.length || 0})`} key="2" style={{ backgroundColor: "#fafafa", borderRadius: 6 }}>
                        {(item.htmlCopyMatches && item.htmlCopyMatches.length > 0) ? (
                          <Table
                            dataSource={item.htmlCopyMatches.map((match: any, idx: number) => ({
                              key: match.id || idx,
                              user1: match.githubLogin1 || "—",
                              user2: match.githubLogin2 || "—",
                              similarity: match.similarityPercent ? match.similarityPercent.toFixed(1) : "0",
                            }))}
                            columns={[
                              {
                                title: "Пользователь 1",
                                dataIndex: "user1",
                                key: "user1",
                                render: (text) => <strong>{text}</strong>,
                              },
                              {
                                title: "Пользователь 2",
                                dataIndex: "user2",
                                key: "user2",
                                render: (text) => <strong>{text}</strong>,
                              },
                              {
                                title: "Сходство",
                                dataIndex: "similarity",
                                key: "similarity",
                                render: (text) => (
                                  <span style={{ color: parseFloat(text) > 60 ? "red" : "black" }}>
                                    {text}%
                                  </span>
                                ),
                              },
                            ]}
                            pagination={false}
                            size="small"
                            style={{ backgroundColor: "#fff", borderRadius: 6, marginTop: "1rem" }}
                          />
                        ) : (
                          <Paragraph>Нет подозрений</Paragraph>
                        )}
                      </Panel>
                    </Collapse>
                  </>
                )}
              </div>
            </List.Item>
          )}
        />
        <Modal
          title="Редактировать задание"
          open={isEditModalVisible}
          onCancel={() => setIsEditModalVisible(false)}
          footer={null}
          destroyOnHidden
        >
          <Form
            layout="vertical"
            initialValues={{
              name: selectedTask?.name,
              link: selectedTask?.link,
              branch: selectedTask?.branch,
            }}
            onFinish={handleEditSubmit}
            key={selectedTask?.id}
          >
            <Form.Item
              label="Название"
              name="name"
              rules={[{ required: true, message: 'Введите название задания' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ссылка"
              name="link"
              rules={[{ required: true, message: 'Введите ссылку' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              label="Ветка"
              name="branch"
              rules={[{ required: true, message: 'Введите ветку' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item style={{ textAlign: 'right' }}>
              <Button onClick={() => setIsEditModalVisible(false)} style={{ marginRight: 8 }}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сохранить
              </Button>
            </Form.Item>
          </Form>
        </Modal>

        <Modal
          title="Удалить задание"
          open={isDeleteModalVisible}
          onOk={handleDeleteConfirm}
          onCancel={() => setIsDeleteModalVisible(false)}
          okText="Удалить"
          okButtonProps={{ danger: true }}
        >
          <p>Вы уверены, что хотите удалить это задание?</p>
        </Modal>
      </div>
    </main>
  );
};

export default MainTasks;
