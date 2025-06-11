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

import { useState } from "react";
import { Form, Input, Button, Radio, Checkbox, Typography, Alert, Modal } from "antd";
import { useRouter } from "next/navigation";

const { Title, Paragraph } = Typography;

export default function Signup() {
  const router = useRouter();
  const [role, setRole] = useState<'student' | 'professor'>('student');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form] = Form.useForm();

  const [isConsentModalVisible, setIsConsentModalVisible] = useState(false);

  const handleRoleChange = (e: any) => {
    setRole(e.target.value);
    setError(null);
    form.resetFields();
  };

  const isValidPassword = (password: string): boolean => {
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasDigit = /\d/.test(password);

    if (!hasUpperCase) {
      setError('Пароль не содержит заглавных букв');
      return false;
    }
    if (!hasLowerCase) {
      setError('Пароль не содержит строчных');
      return false;
    }
    if (!hasDigit) {
      setError('Пароль не содержит цифр');
      return false;
    }

    return true;
  };

  const onFinishStudent = async (values: any) => {
    setLoading(true);
    setError(null);

    if (!isValidPassword(values.password)) {
      setLoading(false);
      return;
    }

    if (values.password !== values.passwordRepeat) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (!values.agreement) {
      setError('Подтвердите обработку данных');
      setLoading(false);
      return;
    }

    const groupRegex = /^(\d{3,4})-(\d{3,4})$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

    if (!groupRegex.test(values.group)) {
      setError('Ошибка в названии группы, убедитесь, что она в формате 000-000 или 0000-000');
      setLoading(false);
      return;
    }
    if (!emailRegex.test(values.email)) {
      setError('Ошибка в email, убедитесь, что он записан корректно');
      setLoading(false);
      return;
    }
    if (!githubUsernameRegex.test(values.github)) {
      setError('Ошибка в логине GitHub, убедитесь, что он указан корректно');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/authorization/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: values.name,
          surname: values.surname,
          group: values.group,
          email: values.email,
          password: values.password,
          github: values.github,
          isProfessor: false,
        }),
      });

      const response = await res.json();

      if (response.message === 'пользователь зарегистрирован' || response.message === 'User already exists') {
        router.push('/');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const onFinishProfessor = async (values: any) => {
    setLoading(true);
    setError(null);

    if (!isValidPassword(values.password)) {
      setLoading(false);
      return;
    }

    if (values.password !== values.passwordRepeat) {
      setError('Пароли не совпадают');
      setLoading(false);
      return;
    }

    if (!values.agreement) {
      setError('Подтвердите обработку данных');
      setLoading(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const githubUsernameRegex = /^[a-z\d](?:[a-z\d]|-(?=[a-z\d])){0,38}$/i;

    if (!emailRegex.test(values.email)) {
      setError('Ошибка в email, убедитесь, что он записан корректно');
      setLoading(false);
      return;
    }
    if (!githubUsernameRegex.test(values.github)) {
      setError('Ошибка в логине GitHub, убедитесь, что он указан корректно');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:5000/authorization/register', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          name: values.name,
          surname: values.surname,
          group: '000-000',
          email: values.email,
          password: values.password,
          github: values.github,
          isProfessor: true,
        }),
      });

      const response = await res.json();

      if (response.message === 'пользователь зарегистрирован' || response.message === 'User already exists') {
        router.push('/');
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Произошла ошибка при регистрации');
    } finally {
      setLoading(false);
    }
  };

  const showConsentModal = () => {
    setIsConsentModalVisible(true);
  };

  const handleConsentModalOk = () => {
    setIsConsentModalVisible(false);
  };

  const handleConsentModalCancel = () => {
    setIsConsentModalVisible(false);
  };

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2em' }}>
      <Title level={2} style={{ textAlign: 'center' }}>Регистрация</Title>
      <Radio.Group onChange={handleRoleChange} value={role} style={{ display: 'flex', justifyContent: 'center', marginBottom: '2em', gap: '3em' }}>
        <Radio value="student">Студент</Radio>
        <Radio value="professor">Преподаватель</Radio>
      </Radio.Group>

      {error && <Alert message={error} type="error" showIcon style={{ marginBottom: '1em' }} />}

      {role === 'student' && (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinishStudent}
          initialValues={{ agreement: false }}
          requiredMark={false}
          disabled={loading}
        >
          <Form.Item label="Логин GitHub" name="github" rules={[{ required: true, message: 'Введите логин GitHub' }]}>
            <Input placeholder="Логин GitHub" />
          </Form.Item>

          <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
            <Input.Password placeholder="Пароль" />
          </Form.Item>

          <Form.Item label="Подтверждение пароля" name="passwordRepeat" rules={[{ required: true, message: 'Повторите пароль' }]}>
            <Input.Password placeholder="Повторите пароль" />
          </Form.Item>

          <Form.Item label="Фамилия" name="surname" rules={[{ required: true, message: 'Введите фамилию' }]}>
            <Input placeholder="Иванов" />
          </Form.Item>

          <Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Введите имя' }]}>
            <Input placeholder="Иван" />
          </Form.Item>

          <Form.Item label="Номер группы" name="group" rules={[{ required: true, message: 'Введите номер группы' }]}>
            <Input placeholder="222-222" />
          </Form.Item>

          <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }, { type: 'email', message: 'Некорректный email' }]}>
            <Input placeholder="test@gmail.com" />
          </Form.Item>

          <Form.Item>
            <Button type="link" onClick={showConsentModal} style={{ paddingLeft: 0 }}>
              Посмотреть согласие
            </Button>
          </Form.Item>

          <Form.Item
            name="agreement"
            valuePropName="checked"
            rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('Необходимо согласие на обработку данных') }]}
          >
            <Checkbox>Согласие на обработку данных</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              Регистрация
            </Button>
          </Form.Item>
        </Form>
      )}

      {role === 'professor' && (
        <>
          <Paragraph style={{ fontWeight: 500, marginBottom: 16 }}>
            Вам будет сообщено, когда ваш аккаунт будет подтвержден в ручном режиме
          </Paragraph>

          <Form
            form={form}
            layout="vertical"
            onFinish={onFinishProfessor}
            initialValues={{ agreement: false }}
            requiredMark={false}
            disabled={loading}
          >
            <Form.Item label="Логин GitHub" name="github" rules={[{ required: true, message: 'Введите логин GitHub' }]}>
              <Input placeholder="Логин GitHub" />
            </Form.Item>

            <Form.Item label="Пароль" name="password" rules={[{ required: true, message: 'Введите пароль' }]}>
              <Input.Password placeholder="Пароль" />
            </Form.Item>

            <Form.Item label="Подтверждение пароля" name="passwordRepeat" rules={[{ required: true, message: 'Повторите пароль' }]}>
              <Input.Password placeholder="Повторите пароль" />
            </Form.Item>

            <Form.Item label="Фамилия" name="surname" rules={[{ required: true, message: 'Введите фамилию' }]}>
              <Input placeholder="Иванов" />
            </Form.Item>

            <Form.Item label="Имя" name="name" rules={[{ required: true, message: 'Введите имя' }]}>
              <Input placeholder="Иван" />
            </Form.Item>

            <Form.Item label="Email" name="email" rules={[{ required: true, message: 'Введите email' }, { type: 'email', message: 'Некорректный email' }]}>
              <Input placeholder="test@gmail.com" />
            </Form.Item>

            <Form.Item>
              <Button type="link" onClick={showConsentModal} style={{ paddingLeft: 0 }}>
                Посмотреть согласие
              </Button>
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              rules={[{ validator: (_, value) => value ? Promise.resolve() : Promise.reject('Необходимо согласие на обработку данных') }]}
            >
              <Checkbox>Согласие на обработку данных</Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block>
                Регистрация
              </Button>
            </Form.Item>
          </Form>
        </>
      )}

      <Modal
        title="Согласие на обработку персональных данных"
        visible={isConsentModalVisible}
        onOk={handleConsentModalOk}
        onCancel={handleConsentModalCancel}
        okText="Закрыть"
        cancelButtonProps={{ style: { display: 'none' } }}
      >
        <p>
          Настоящим я даю согласие на обработку моих персональных данных в соответствии с Федеральным законом №152-ФЗ "О персональных данных". Персональные данные будут использоваться исключительно для целей регистрации, идентификации и предоставления доступа к сервису.
        </p>
        <p>
          Я понимаю, что могу в любой момент отозвать свое согласие, обратившись к администратору сервиса.
        </p>
      </Modal>
    </main>
  );
}
