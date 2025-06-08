import Header from '../../../components/layout/header/header'
import Footer from '../../../components/layout/footer/footer'
import MainChangeUser from '../../../components/layout/main-change-user/main'

export default async function UserPage () {
    return (
        <>
            <Header user={null} />
            <MainChangeUser/>
            <Footer></Footer>
        </>
    )
}