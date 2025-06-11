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

import { cookies } from 'next/headers'
import Header from '../../../components/layout/header/header'
import Footer from '../../../components/layout/footer/footer'
import MainUser from '../../../components/layout/main-user/main'
import MainAdmin from '../../../components/layout/main-admin/main'

type User = {
  github: string,
  group: string,
  id: number,
  name: string,
  role: string,
  surname: string
} | null

async function getUser(): Promise<User | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) return null

  const res = await fetch('http://localhost:5000/user/get-user', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    cache: 'no-store',
  })

  return res.json()
}

export default async function UserPage() {
  const user = await getUser();
  console.log(user)
  return (
    <>
      <Header user={user} />
      {user?.role === 'преподаватель' || user?.role === 'студент' ? (
        <MainUser user={user} />
      ) : user?.role === 'администратор' ? (
        <MainAdmin user={user} />
      ) : (
        <div>Нет доступа или неизвестная роль</div>
      )}
      <Footer></Footer>
    </>
  )
}