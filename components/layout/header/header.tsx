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
import Cookies from 'js-cookie';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Menu, Layout, Typography, Dropdown, Button, Drawer } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { logout, setUser } from '@/lib/redux/slices/userSlicer';
import { useAppDispatch } from '@/lib/hooks';
import { persistor, RootState } from '@/lib/redux/store';

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
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth < 1400);
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (!user) {
        user = storedUser.user;
    } else {
        useEffect(() => {
            if (!storedUser?.user?.name) {
                dispatch(setUser(user));
            }
        }, [dispatch, storedUser, user]);
    }

    let links: { name: string; link: string; }[];
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

    const menuItems = links?.map((link, index) => ({
        key: index.toString(),
        label: (
            <Link href={link.link} style={{ color: 'white', fontWeight: 400 }}>
                {link.name}
            </Link>
        ),
    }));

    const drawerMenu = (
        <Menu
            mode="vertical"
            selectedKeys={[activeKey]}
            items={links?.map((link, index) => ({
                key: index.toString(),
                label: (
                    <Link href={link.link} onClick={() => setDrawerVisible(false)}>
                        {link.name}
                    </Link>
                ),
            }))}
        />
    );

    const userMenu = (
        <Menu
            items={[
                {
                    key: 'change-user',
                    label: (
                        <Link href="/change-user" style={{ display: 'block', padding: '0.5em 1em' }}>
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
                                dispatch(logout());
                                Cookies.remove('accessToken');
                                localStorage.clear();
                                persistor.purge();
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
                padding: '0 1em',
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
                {isMobile ? (
                    <>
                        <Button
                            type="text"
                            icon={<MenuOutlined style={{ color: 'white', fontSize: 24 }} />}
                            onClick={() => setDrawerVisible(true)}
                        />
                        <Drawer
                            title="Меню"
                            placement="left"
                            onClose={() => setDrawerVisible(false)}
                            open={drawerVisible}
                            bodyStyle={{ padding: 0 }}
                        >
                            {drawerMenu}
                        </Drawer>
                    </>
                ) : (
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        selectedKeys={[activeKey]}
                        style={{ background: 'transparent', fontSize: 24, fontFamily: 'Inter', minWidth: '20em' }}
                        items={menuItems}
                    />
                )}

                <Dropdown overlay={userMenu} placement="bottomRight" trigger={['click']}>
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
