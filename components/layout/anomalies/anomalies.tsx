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

import { useEffect, useState } from "react";
import { List, Typography, Button, Space, Spin } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const { Title, Text } = Typography;

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const Anomalies = () => {
  const [anomalies, setAnomalies] = useState<any[]>([]);
  const [filteredAnomalies, setFilteredAnomalies] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.user.user);

  function incrementPage(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setPage(prev => prev + 1);
  }

  function decrementPage(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    setPage(prev => prev - 1);
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const cookies = document.cookie.split('; ');
        const tokenCookie = cookies.find(row => row.startsWith('accessToken='));
        const token = tokenCookie?.split('=')[1];

        if (!token) {
          console.warn('Token not found in cookies');
          setLoading(false);
          return;
        }

        const res = await fetch('http://localhost:5000/testing/get-anomalies', {
          headers: { Authorization: `Bearer ${token}` },
          cache: 'no-store',
        });

        const data = await res.json();
        setAnomalies(data);
      } catch (error) {
        console.error('Ошибка при получении данных:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!user) {
      setFilteredAnomalies(anomalies);
      setMaxPage(Math.floor(anomalies.length / 12));
      return;
    }

    if (user.role === 'студент') {
      const filtered = anomalies.filter(a => a.githubLogin === user.github);
      setFilteredAnomalies(filtered);
      setMaxPage(Math.floor(filtered.length / 12));
      setPage(0);
    } else {
      setFilteredAnomalies(anomalies);
      setMaxPage(Math.floor(anomalies.length / 12));
    }
  }, [anomalies, user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spin size="large" />
      </div>
    );
  }

  console.log(filteredAnomalies)

  return (
    <div>
      <Title level={2}>Аномалии:</Title>

      <List
        itemLayout="vertical"
        dataSource={filteredAnomalies.slice(page * 12, (page + 1) * 12)}
        renderItem={(item: any) => (
          <List.Item
            style={{
              padding: '5px 10px',
              borderBottom: '1px solid #f0f0f0',
            }}
            key={`${item.commitHash}`}
          >
            <Title level={4} style={{ marginBottom: 0 }}>
              Имя пользователя: {item.githubLogin}
            </Title>
            <Text>Хэш коммита: {item.commitHash}</Text><br/>
            <Text>Дата: {formatDate(item.commitDate)}</Text><br />
            <Text>Задание: {item.task.name}</Text>
          </List.Item>
        )}
      />

      <Space style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <Button onClick={decrementPage} disabled={page === 0}>
          предыдущие
        </Button>
        <Text strong style={{ fontSize: '1em', lineHeight: '1.8em' }}>{page + 1}</Text>
        <Button onClick={incrementPage} disabled={page === maxPage}>
          следующие
        </Button>
      </Space>
    </div>
  );
};

export default Anomalies;
