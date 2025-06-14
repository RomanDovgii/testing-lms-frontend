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
  Modal,
  Typography,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import { CopyOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Paragraph, Title, Text } = Typography;

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

  const [isSampleModalVisible, setIsSampleModalVisible] = useState(false);

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

  const showSampleModal = () => {
    setIsSampleModalVisible(true);
  };

  const handleSampleModalOk = () => {
    setIsSampleModalVisible(false);
  };

  const handleSampleModalCancel = () => {
    setIsSampleModalVisible(false);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(jsonContent);
      message.success('Скопировано!');
    } catch (err) {
      message.error('Ошибка при копировании');
    }
  };

  const jsonContent = `[
  {
    "filename": "index.js",
    "functions": [
      {
        "name": "addNumbers",
        "inputs": [
          ["1", "3"],
          ["2", "3"]
        ],
        "outputs": ["4", "5"]
      },
      {
        "name": "addOne",
        "inputs": ["1", "3"],
        "outputs": ["2", "4"]
      }
    ]
  },
  {
    "filename": "index.html",
    "requiredTags": [
      {
        "tag": "h1",
        "quantity": 1
      },
      {
        "tag": "h2",
        "quantity": 10
      }
    ]
  }
]`;

  return (
    <>
      <Button
        type="default"
        style={{ marginBottom: 24, display: "block", marginLeft: "auto", marginRight: "auto" }}
        onClick={showSampleModal}
      >
        Посмотреть образец
      </Button>

      <Modal
        title="Образец кода"
        visible={isSampleModalVisible}
        onOk={handleSampleModalOk}
        onCancel={handleSampleModalCancel}
        okText="Закрыть"
        cancelButtonProps={{ style: { display: "none" } }}
        width={800}
      >
        <div style={{ position: 'relative' }}>
          <Button
            icon={<CopyOutlined />}
            size="small"
            onClick={handleCopy}
            style={{ position: 'absolute', right: 10, top: 10, zIndex: 1 }}
          >
            Копировать
          </Button>

          <SyntaxHighlighter language="json" style={oneDark} wrapLongLines>
            {jsonContent}
          </SyntaxHighlighter>
        </div>
      </Modal>

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
    </>
  );
}
