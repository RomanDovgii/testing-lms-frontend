'use client'
import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect } from 'react';
import { Menu, Layout, Typography, Dropdown, Button } from 'antd';
import { useSelector } from 'react-redux';
import { setUser } from '@/lib/redux/slices/userSlicer';
import { useAppDispatch } from '@/lib/hooks';
import { RootState } from '@/lib/redux/store';

const { Header: AntHeader } = Layout;
const { Text } = Typography;

const Links = {
    STUDENT: [
        { name: "Главная", link: "/user" },
        { name: "Задания", link: "/tasks" },
        { name: "Тесты", link: "/tests" },
    ],
    PROFESSOR: [
        { name: "Главная", link: "/user" },
        { name: "Задания", link: "/tasks" },
        { name: "Добавить задание", link: "/add-task" },
        { name: "Тесты", link: "/tests" },
        { name: "Добавить тест", link: "/add-test" }
    ],
    ADMIN: [
        { name: "Главная", link: "/user" },
    ],
    MENOTOR: [
        { name: "Главная", link: "/user" },
        { name: "Студенты", link: "/users" },
        { name: "Статистика", link: "/stats" },
    ],
};

type HeaderProps = {
    user: {
        github: string,
        group: string,
        id: number,
        name: string,
        role: string,
        surname: string
    } | null
}

const Header: React.FC<HeaderProps> = ({ user }) => {
    const dispatch = useAppDispatch();
    const router = useRouter();
    const pathname = usePathname();

    const storedUser = useSelector((state: RootState) => state.user);

    if (!user) {
        user = storedUser.user;
    } else {
        useEffect(() => {
            if (!storedUser?.user?.name) {
                dispatch(setUser(user));
            }
        }, [dispatch, storedUser, user]);
    }

    let links;
    switch (user?.role) {
        case 'студент':
            links = Links.STUDENT;
            break;
        case 'администратор':
            links = Links.ADMIN;
            break;
        case 'наставник':
            links = Links.MENOTOR;
            break;
        case 'преподаватель':
            links = Links.PROFESSOR;
            break;
        default:
            links = [];
            break;
    }

    const activeKey = links?.findIndex(link => link.link === pathname).toString();

    const items = links?.map((link, index) => ({
        key: index.toString(),
        label: (
            <Link href={link.link} style={{ color: 'white', fontWeight: 400 }}>
                {link.name}
            </Link>
        ),
        style: { marginLeft: index === 0 ? 0 : '1.25em', position: 'relative' }
    }));

    const menu = (
        <Menu
            items={[
                {
                    key: 'change-user',
                    label: (
                        <Link href="/change-user" style={{ width: '100%', display: 'block', padding: '0.5em 1em' }}>
                            Изменить пользователя
                        </Link>
                    ),
                },
                {
                    key: 'logout',
                    label: (
                        <Button
                            type="text"
                            danger
                            onClick={() => {
                                dispatch(setUser(null));
                                Cookies.remove('accessToken');
                                localStorage.clear();
                                router.push('/');
                            }}
                            style={{ width: '100%', textAlign: 'left' }}
                        >
                            Выйти
                        </Button>
                    ),
                },
            ]}
        />
    );

    return (
        <AntHeader
            style={{
                background: 'rgb(31, 41, 54)',
                minHeight: '4.375em',
                display: 'flex',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    maxWidth: '82.5em',
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}
            >
                <Menu
                    theme="dark"
                    mode="horizontal"
                    selectedKeys={[activeKey]}
                    style={{ background: 'transparent', fontSize: 24, fontFamily: 'Inter' }}
                    items={items}
                />

                <Dropdown overlay={menu} placement="bottomRight" trigger={['click']}>
                    <Text
                        style={{
                            color: 'white',
                            fontSize: 24,
                            fontFamily: 'Inter',
                            fontWeight: 400,
                            lineHeight: '29px',
                            userSelect: 'none',
                            cursor: 'pointer',
                        }}
                    >
                        {user?.surname} {user?.name}
                    </Text>
                </Dropdown>
            </div>
        </AntHeader>
    );
};

export default Header;
