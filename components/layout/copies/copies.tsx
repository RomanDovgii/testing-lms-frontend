'use client';

import { useEffect, useState } from "react";
import { List, Card, Typography, Button, Space, Spin } from "antd";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/redux/store";

const { Title, Paragraph, Link } = Typography;

function formatDate(isoString: string): string {
  const date = new Date(isoString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const Copies = () => {
  const [copies, setCopies] = useState<any[]>([]);
  const [filteredCopies, setFilteredCopies] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [maxPage, setMaxPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const user = useSelector((state: RootState) => state.user.user);

  const incrementPage = () => setPage(prev => prev + 1);
  const decrementPage = () => setPage(prev => prev - 1);

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

        const res = await fetch('http://localhost:5000/testing/get-copies', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          cache: 'no-store',
        });

        const data = await res.json();
        data.sort((a: any, b: any) =>
          new Date(b.detectedAt).getTime() - new Date(a.detectedAt).getTime()
        );

        setCopies(data);
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
      setFilteredCopies(copies);
      setMaxPage(Math.floor(copies.length / 9));
      return;
    }

    if (user.role === 'студент') {
      const filtered = copies.filter(
        (item) => item.githubLogin1 === user.github || item.githubLogin2 === user.github
      );
      setFilteredCopies(filtered);
      setMaxPage(Math.floor(filtered.length / 9));
      setPage(0);
    } else {
      setFilteredCopies(copies);
      setMaxPage(Math.floor(copies.length / 9));
    }
  }, [copies, user]);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <Spin size="large" />
      </div>
    );
  }

  const paginatedData = filteredCopies.slice(page * 9, (page + 1) * 9);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: 24 }}>
      <Title level={3}>Копии:</Title>

      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={paginatedData}
        renderItem={(item) => (
          <List.Item
            style={{
              listStyle: 'none',
              padding: '5px 10px',
            }}
            key={`${item.id}-${item.githubLogin1}-${item.githubLogin2}`}
          >
            <Card>
              <Title level={5}>
                Пользователи: {item.githubLogin1} - {item.githubLogin2}
              </Title>
              <Paragraph>Файл: {item.filename}</Paragraph>
              <Paragraph>Процент совпадения: {item.similarityPercent}%</Paragraph>
              <Paragraph>Дата обнаружения: {formatDate(item.detectedAt)}</Paragraph>
              <Paragraph>Задание: {item.task.name}</Paragraph>
              <Link href={item.task.link} target="_blank">Ссылка на задание</Link>
            </Card>
          </List.Item>
        )}
      />

      <Space
        style={{
          marginTop: '1rem',
          paddingBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
        }}
      >
        <Button onClick={decrementPage} disabled={page === 0}>
          предыдущие
        </Button>

        <span
          style={{
            color: '#212121',
            fontFamily: 'Inter, sans-serif',
            fontSize: '1em',
            fontWeight: 700,
            lineHeight: '1.8em',
            letterSpacing: 0,
            textAlign: 'center',
            minWidth: '40px',
          }}
        >
          {page + 1}
        </span>

        <Button onClick={incrementPage} disabled={page === maxPage}>
          следующие
        </Button>
      </Space>
    </div>
  );
};

export default Copies;
