// src/services/UserService.ts
import axios from "axios";
import { API_URL } from "./AuthService";

export type UserDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  gender?: string;
  status?: string;
};

export type UserDetailDto = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address?: {
    street?: string;
    number?: string;
    zipcode?: string;
    country?: string;
    city?: string;
  };
  dateOfBirth?: string;
  gender?: string;
  status?: string;
};

function getAuthHeaders() {
  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const getAllUsers = async (): Promise<UserDto[]> => {
  const res = await axios.get(`${API_URL}/admin/users`, { headers: getAuthHeaders() });
  return res.data;
};

export const getUserById = async (id: string): Promise<UserDetailDto> => {
  const res = await axios.get(`${API_URL}/admin/users/${id}`, { headers: getAuthHeaders() });
  return res.data;
};

export type StatusUpdateRequest = { status: "PENDING" | "ACCEPTED" | "REJECTED" | "DELETED" };

export const updateUserStatus = async (id: string, payload: StatusUpdateRequest) => {
  const res = await axios.patch(`${API_URL}/admin/users/${id}/status`, payload, { headers: getAuthHeaders() });
  return res.data;
};