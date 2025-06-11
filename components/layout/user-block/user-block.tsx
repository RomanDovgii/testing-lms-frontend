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
