import Header from '../../../components/layout/header/header'
import Footer from '../../../components/layout/footer/footer'
import MainTasks from '../../../components/layout/main-task/main'
import UploadTestForm from '../../../components/layout/add-test/add-test'

export default function TasksPage () {
    return (
        <>
            <Header user={null}/>
            <UploadTestForm/>
            <Footer />
        </>
    )
}