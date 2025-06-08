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