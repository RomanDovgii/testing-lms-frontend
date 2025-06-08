'use client'

import { useSelector } from "react-redux";
import { Button, Input, Form, message } from "antd";
import styles from "./main.module.css";
import { useEffect, useState } from "react";
import { RootState } from '@/lib/redux/store';
import { useRouter } from "next/navigation";

function getCookie(name: string) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    if (match) return decodeURIComponent(match[2]);
    return null;
}

type User = {
    github: string,
    group: string,
    id: number,
    name: string,
    role: string,
    surname: string
}

const MainTask = () => {
    const router = useRouter();
    const globalUser = useSelector((state: RootState) => state.user);
    const [localUser, setLocalUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (globalUser) {
            setLocalUser(globalUser.user);
        }
        if (globalUser?.user?.role) {
        if (globalUser?.user?.role !== "преподаватель") {
          router.push('/user');
        }
      }
    }, [globalUser]);

    const onFinish = async (values: any) => {
        setIsLoading(true);
        const token = getCookie('accessToken');
        if (!token) {
            message.error('Пользователь не авторизован');
            setIsLoading(false);
            return;
        }

        const githubUrlRegex = /^https:\/\/classroom\.github\.com\/classrooms\/\d+-[\w-]+\/assignments\/[\w-]+$/;

        if (!githubUrlRegex.test(values.link)) {
            message.error("Введите корректную ссылку на GitHub");
            setIsLoading(false);
            return;
        }

        try {
            const res = await fetch('http://localhost:5000/testing/add-task', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    name: values.name,
                    link: values.link,
                    branch: values.branch,
                    taskId: Number(values.taskId),
                    ownerId: localUser?.id
                }),
            });

            if (!res.ok) {
                const err = await res.json();
                message.error(err.message || 'Ошибка при отправке');
                setIsLoading(false);
                return;
            }

            message.success('Задание успешно добавлено');
            router.push('/tasks');
        } catch (err) {
            message.error('Ошибка сети');
            setIsLoading(false);
        }
    };

    return (
        <main className={styles.main}>
            <section className={styles.mainWrapper}>
                <div className={styles.formSection}>
                    <h2>Добавить задание</h2>
                    <Form
                        layout="vertical"
                        onFinish={onFinish}
                        initialValues={{ branch: 'main' }}
                    >
                        <Form.Item
                            label="Название задания"
                            name="name"
                            rules={[{ required: true, message: 'Введите название задания' }]}
                        >
                            <Input disabled={isLoading} />
                        </Form.Item>
                        <Form.Item
                            label="Ссылка на задание"
                            name="link"
                            rules={[
                                { required: true, message: 'Введите ссылку на GitHub' },
                                { 
                                    pattern: /^https:\/\/classroom\.github\.com\/classrooms\/\d+-[\w-]+\/assignments\/[\w-]+$/, 
                                    message: 'Введите корректную ссылку на GitHub' 
                                }
                            ]}
                        >
                            <Input disabled={isLoading} />
                        </Form.Item>
                        <Form.Item
                            label="Название ветки"
                            name="branch"
                            rules={[{ required: true, message: 'Введите название ветки' }]}
                        >
                            <Input disabled={isLoading} />
                        </Form.Item>
                        <Form.Item
                            label="ID задания в Github"
                            name="taskId"
                            rules={[
                                { required: true, message: 'Введите ID задания' },
                                { pattern: /^\d{1,6}$/, message: 'ID должен быть числом до 6 цифр' }
                            ]}
                        >
                            <Input disabled={isLoading} maxLength={6} />
                        </Form.Item>
                        <Form.Item>
                            <Button type="primary" htmlType="submit" loading={isLoading}>
                                Добавить задание
                            </Button>
                        </Form.Item>
                    </Form>
                </div>
                <div className={styles.availableTasks}>
                </div>
            </section>
        </main>
    );
};

export default MainTask;
