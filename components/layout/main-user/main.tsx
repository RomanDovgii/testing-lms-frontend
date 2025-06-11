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
