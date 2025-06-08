import Header from '../../../components/layout/header/header'
import Footer from '../../../components/layout/footer/footer'
import MainTasks from '../../../components/layout/main-tasks/main'

export default async function UserPage () {
    return (
        <>
            <Header user={null} />
            <MainTasks />
            <Footer></Footer>
        </>
    )
}