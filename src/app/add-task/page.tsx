import Header from '../../../components/layout/header/header'
import Footer from '../../../components/layout/footer/footer'
import MainTasks from '../../../components/layout/main-task/main'

export default function TasksPage () {
    return (
        <>
            <Header user={null}/>
            <MainTasks/>
            <Footer />
        </>
    )
}