'use client'

import { useEffect, useState } from "react";
import styles from "./main.module.css";
import { Typography, List, Card, Empty, Checkbox, message } from 'antd';
const { Title, Text } = Typography;


const MainAdmin = (user: any) => {
    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("accessToken="));
    const token = tokenCookie?.split("=")[1];
    const [unapproved, setUnapproved] = useState<any[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [loadingIds, setLoadingIds] = useState<number[]>([]);

    useEffect(() => {
        async function fetchUnapprovedUsers() {
            try {
                const res = await fetch('http://localhost:5000/user/unapproved', {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                    cache: 'no-store',
                });

                if (!res.ok) {
                    throw new Error('Ошибка при получении данных');
                }

                const data = await res.json();
                setUnapproved(data);
            } catch (err: any) {
                setError(err.message || 'Произошла ошибка');
            } finally {
                setLoading(false);
            }
        }

        fetchUnapprovedUsers();
    }, []);

    const handleApprove = async (userId: number, checked: boolean) => {
        if (!checked) return; // Если чекбокс снят — ничего не делаем

        try {
            setLoadingIds((prev) => [...prev, userId]);
            const response = await fetch(`http://localhost:5000/user/approve/${userId}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                cache: 'no-store',
            });

            if (!response.ok) {
                throw new Error('Ошибка при подтверждении пользователя');
            }

            message.success('Пользователь подтверждён');
            setUnapproved((prev) => prev.filter((user) => user.id !== userId));
        } catch (error) {
            message.error((error as Error).message || 'Ошибка при подтверждении пользователя');
        } finally {
            setLoadingIds((prev) => prev.filter((id) => id !== userId));
        }
    };


    return (
        <main className={styles.main}>
            <section className={styles.mainWrapper}>
                <div className={styles.formSection}>
                    <Title level={1} className="mb-4">Неподтверждённые пользователи</Title>

                    {unapproved.length === 0 ? (
                        <Empty description="Нет неподтверждённых пользователей." />
                    ) : (
                        <List
                            grid={{ gutter: 16, column: 1 }}
                            dataSource={unapproved}
                            renderItem={(user) => (
                                <List.Item key={user.id}>
                                    <Card
                                        actions={[
                                            <Checkbox
                                                disabled={loadingIds.includes(user.id)}
                                                onChange={(e) => handleApprove(user.id, e.target.checked)}
                                            >
                                                Подтвердить
                                            </Checkbox>,
                                        ]}
                                    >
                                        <Text strong>{user.name} {user.surname}</Text>
                                        <br />
                                        <Text>Email: {user.email}</Text>
                                        <br />
                                        <Text>GitHub: {user.github}</Text>
                                    </Card>
                                </List.Item>
                            )}
                        />
                    )}
                </div>
            </section>
        </main>
    );
}

export default MainAdmin