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

'use client'

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Form, Input, Button, Typography, Space } from "antd";
import Link from "next/link";
import 'antd/dist/reset.css';
import styles from "./page.module.css";
import { logout } from "@/lib/redux/slices/userSlicer";
import Cookies from 'js-cookie';
import { persistor } from "@/lib/redux/store";
import { useAppDispatch } from "@/lib/hooks";

const { Title, Text } = Typography;

export default function Home() {
  const dispatch = useAppDispatch();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();
  const router = useRouter();

  useEffect(() => {
      dispatch(logout());
      Cookies.remove('accessToken');
      localStorage.clear();
      persistor.purge();
    }, [])

  async function handleSubmit(values: { identifier: string; password: string }) {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/authorization/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values)
      });

      const data = await res.json();
      console.log(data);

      if (res.ok && data.accessToken) {
        document.cookie = `accessToken=${data.accessToken}; path=/; max-age=3600`;
        router.push('/user');
      } else {
        // Обработка ошибки от сервера
        if (data.message === 'user is not active') {
          setError('Аккаунт ожидает активации');
        } else {
          setError(data.message || 'Ошибка входа. Проверьте логин и пароль.');
        }
      }
    } catch (error) {
      // Обработка сетевой ошибки
      setError('Ошибка сети. Попробуйте позже.');
    }

    setLoading(false);
  }

  return (
    <main className={styles.loginWrapper}>
      <Space direction="vertical" size="large" className={styles.loginForm}>
        <Title level={2} className={styles.loginHeading}>Вход</Title>

        <Form
          form={form}
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

          {error && (
            <div style={{ marginTop: '-0.5em', marginBottom: '1em' }}>
              <Text type="danger">{error}</Text>
            </div>
          )}
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

