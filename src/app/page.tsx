'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, Space } from "antd";
import Link from "next/link";
import 'antd/dist/reset.css';
import styles from "./page.module.css";

const { Title, Text } = Typography;

export default function Home() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(values: { identifier: string; password: string }) {
    setLoading(true);

    const res = await fetch('http://localhost:5000/authorization/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    });

    const user = await res.json();

    if (user.accessToken) {
      document.cookie = `accessToken=${user.accessToken}; path=/; max-age=3600`;
      router.push('/user');
    } else {
      alert('Ошибка входа');
    }

    setLoading(false);
  }

  return (
    <main className={styles.loginWrapper}>
      <Space direction="vertical" size="large" className={styles.loginForm}>
        <Title level={2} className={styles.loginHeading}>Вход</Title>

        <Form
          name="login"
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark={false}
        >
          <Form.Item
            label="Логин"
            name="identifier"
            rules={[{ required: true, message: 'Пожалуйста, введите логин' }]}
          >
            <Input placeholder="Логин" />
          </Form.Item>

          <Form.Item
            label="Пароль"
            name="password"
            rules={[{ required: true, message: 'Пожалуйста, введите пароль' }]}
          >
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Войти
            </Button>
          </Form.Item>
        </Form>

        <Text className={styles.loginSmallText}>или</Text>

        <div style={{ textAlign: 'center' }}>
          <Link href="/signup" passHref>
            <Button type="link">Регистрация</Button>
          </Link>
        </div>
      </Space>
    </main>
  );
}
