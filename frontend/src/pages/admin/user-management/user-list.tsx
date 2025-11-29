import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { getAllUsers } from "../../../api/user.api";
import type { User } from "../../../api/user.api";

const columns = [
  { title: "ID", dataIndex: "id", key: "id" },
  { title: "Username", dataIndex: "username", key: "username" },
  { title: "Email", dataIndex: "email", key: "email" },
  { title: "Full Name", dataIndex: "fullName", key: "fullName" },
  { title: "Phone", dataIndex: "phone", key: "phone" },
  { title: "Active", dataIndex: "isActive", key: "isActive", render: (v: boolean) => v ? "Yes" : "No" },
  { title: "Roles", dataIndex: "roles", key: "roles", render: (roles: string[]) => roles.join(", ") },
];

const UserList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then((data: User[]) => setUsers(data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="p-8">
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <Table columns={columns} dataSource={users} rowKey="id" loading={loading} pagination={{ pageSize: 10 }} />
    </div>
  );
};

export default UserList;
