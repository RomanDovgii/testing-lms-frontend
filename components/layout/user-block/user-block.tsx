import React from "react";
import Title from "antd/es/typography/Title";
import Text from "antd/es/typography/Text";
import { Typography, Space } from "antd";

type UserBlockProps = {
  user: {
    github: string;
    group: string;
    id: number;
    name: string;
    role: string;
    surname: string;
  } | null;
};

const UserBlock: React.FC<UserBlockProps> = ({ user }) => {
  return (
    <Space
      direction="vertical"
      size="middle"
      style={{ height: "100%", justifyContent: "center", display: "flex" }}
    >
      <Title level={4} style={{ margin: 0 }}>
        Фамилия и имя
      </Title>
      <Text style={{ fontSize: "1.25em" }}>
        {user ? `${user.name} ${user.surname}` : "-"}
      </Text>
      <Text
        strong
        style={{ fontSize: "1.5em", marginTop: "1em", display: "block" }}
      >
        {user?.role || "-"}
      </Text>
    </Space>
  );
};

export default UserBlock;
