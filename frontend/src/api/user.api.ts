import { httpClient } from "./httpClient";

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  isActive: boolean;
  roles: string[];
}

export async function getAllUsers(): Promise<User[]> {
  const res = await httpClient("/api/users", { method: "GET" });
  // Giả sử backend trả về mảng user
  return res as User[];
}

export const userApi = {
  getAll: getAllUsers,
  create: async (data: Partial<User>) => {
    // Gọi API tạo user, trả về user vừa tạo
    return await httpClient("/api/users", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },
  // Có thể bổ sung các hàm khác nếu cần
};
