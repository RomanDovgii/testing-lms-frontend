"use client";

import { RootState } from "@/lib/redux/store";
import { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  Form,
  Input,
  Upload,
  Button,
  Select,
  message,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { TextArea } = Input;

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

export default function UploadTestForm() {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<any[]>([]);
  const [taskOptions, setTaskOptions] = useState<TaskOption[]>([]);
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const router = useRouter();

  const globalUser = useSelector((state: RootState) => state.user);

  const cookies = document.cookie.split("; ");
  const tokenCookie = cookies.find((row) => row.startsWith("accessToken="));
  const token = tokenCookie?.split("=")[1];

  const [localUser, setLocalUser] = useState<User | null>(null);

  useEffect(() => {
    if (globalUser?.user?.id) {
      setLocalUser(globalUser.user);
      if (globalUser.user.role) {
        if (globalUser.user.role !== "преподаватель") {
          router.push('/user');
        }
      }
    }
  }, [globalUser]);

  useEffect(() => {
    const fetchData = async () => {
      if (localUser?.id) {
        try {
          if (!token) {
            console.warn("Token not found in cookies");
            return;
          }

          const res = await fetch(`http://localhost:5000/${localUser.id}/tasks`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          });

          const data = await res.json();
          const options = data.map((item: any) => ({
            value: item.id,
            label: item.name,
          }));
          setTaskOptions(options);
        } catch (error) {
          console.error("Ошибка при получении данных:", error);
        }
      }
    };

    fetchData();
  }, [localUser]);

  const handleSubmit = async (values: any) => {
    if (!fileList.length) {
      message.warning("Пожалуйста, выберите файл");
      return;
    }

    if (!localUser?.id) {
      return;
    }

    const formData = new FormData();
    formData.append("file", fileList[0]);
    formData.append("title", values.title);
    formData.append("description", values.description || "");
    formData.append("userId", String(localUser.id));
    formData.append("taskIds", JSON.stringify(values.taskIds || []));

    try {
      const response = await fetch("http://localhost:5000/user/upload-test", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText);
      }

      const data = await response.json();
      message.success("Тест успешно загружен!");
      console.log("Успешно загружено:", data);
      form.resetFields();
      setFileList([]);
      router.push('/tests')
    } catch (error: any) {
      console.error("Ошибка при загрузке:", error.message);
      message.error("Ошибка при загрузке: " + error.message);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
      style={{ maxWidth: 500, margin: "auto" }}
    >
      <Form.Item
        name="file"
        label="Файл теста"
        rules={[{ required: true, message: "Пожалуйста, выберите файл" }]}
      >
        <Upload
          beforeUpload={(file) => {
            setFileList([file]);
            return false;
          }}
          fileList={fileList}
          onRemove={() => setFileList([])}
        >
          <Button icon={<UploadOutlined />}>Выбрать файл</Button>
        </Upload>
      </Form.Item>

      <Form.Item
        name="title"
        label="Название"
        rules={[{ required: true, message: "Введите название теста" }]}
      >
        <Input placeholder="Введите название теста" />
      </Form.Item>

      <Form.Item name="description" label="Описание">
        <TextArea placeholder="Введите описание" rows={3} />
      </Form.Item>

      <Form.Item name="taskIds" label="Задания">
        <Select
          mode="multiple"
          options={taskOptions}
          placeholder="Выберите задания"
          onChange={(value) => setSelectedTasks(value)}
        />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Загрузить тест
        </Button>
      </Form.Item>
    </Form>
  );
}
