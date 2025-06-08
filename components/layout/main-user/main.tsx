import { Card, Row, Col } from "antd";
import Anomalies from "../anomalies/anomalies";
import Copies from "../copies/copies";
import UserBlock from "../user-block/user-block";
import styles from "./main.module.css";

type MainUserProps = {
  user: {
    github: string;
    group: string;
    id: number;
    name: string;
    role: string;
    surname: string;
  } | null;
};

const MainUser: React.FC<MainUserProps> = ({ user }) => {
  return (
    <main className={styles.main}>
      <div className={styles.mainWrapper}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <section className={styles.info}>
              <UserBlock user={user} />
            </section>
            <section className={styles.smallSection}>
              <Card bordered={true} bodyStyle={{ padding: '1em' }}>
                <Anomalies />
              </Card>
            </section>
          </Col>
          <Col xs={24} md={12}>
            <Card bordered={true} bodyStyle={{ padding: '1em', height: '100%' }}>
              <Copies />
            </Card>
          </Col>
        </Row>
      </div>
    </main>
  );
};

export default MainUser;
