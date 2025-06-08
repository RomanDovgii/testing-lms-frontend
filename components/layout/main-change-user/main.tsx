'use client'

import { useDispatch, useSelector } from "react-redux";
import { Button, Input, Form, message } from "antd";
import { useEffect, useState } from "react";
import { RootState } from '@/lib/redux/store';
import { setUser } from "@/lib/redux/slices/userSlicer";

const MainChangeUser = () => {
    const [form] = Form.useForm();
    const dispatch = useDispatch();
    const [loading, setLoading] = useState(false);

    const [messageApi, contextHolder] = message.useMessage();

    const cookies = document.cookie.split("; ");
    const tokenCookie = cookies.find((row) => row.startsWith("accessToken="));
    const token = tokenCookie?.split("=")[1];

    const user = useSelector((state: RootState) => state.user.user);

    useEffect(() => {
        if (user) {
            form.setFieldsValue({
                name: user.name,
                surname: user.surname,
                github: user.github,
            });
        }
    }, [user, form]);

    const onFinish = async (values: { name: string; surname: string; github: string }) => {
        if (!user) return;

        setLoading(true);

        try {
            const response = await fetch('http://localhost:5000/user/update', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    id: user.id,
                    name: values.name,
                    surname: values.surname,
                    github: values.github,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка обновления пользователя');
            }

            dispatch(
                setUser({
                    ...user,
                    name: values.name,
                    surname: values.surname,
                    github: values.github,
                })
            );

            messageApi.success('Профиль успешно обновлён');
        } catch (error) {
            messageApi.error('Не удалось обновить профиль');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return <p>Пользователь не найден</p>;

    return (
        <>
            {contextHolder}
            <Form
                form={form}
                layout="vertical"
                onFinish={onFinish}
                style={{ maxWidth: 400, margin: '0 auto' }}
            >
                <Form.Item
                    label="Имя"
                    name="name"
                    rules={[{ required: true, message: 'Пожалуйста, введите имя' }]}
                >
                    <Input placeholder="Имя" />
                </Form.Item>

                <Form.Item
                    label="Фамилия"
                    name="surname"
                    rules={[{ required: true, message: 'Пожалуйста, введите фамилию' }]}
                >
                    <Input placeholder="Фамилия" />
                </Form.Item>

                <Form.Item
                    label="GitHub"
                    name="github"
                    rules={[{ required: true, message: 'Пожалуйста, введите GitHub' }]}
                >
                    <Input placeholder="GitHub" />
                </Form.Item>

                <Form.Item>
                    <Button type="primary" htmlType="submit" block loading={loading}>
                        Сохранить изменения
                    </Button>
                </Form.Item>
            </Form>
        </>
    );
};

export default MainChangeUser;
