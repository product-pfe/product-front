import axios from "axios";

const API_URL = "http://localhost:8080";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  city: string;
  dateOfBirth: string; // ISO date string
  gender: string;
  password: string;
  confirmPassword: string;
}

export const login = async (data: LoginData) => {
  const response = await axios.post(`${API_URL}/auth/login`, data);
  return response.data; // Expected to contain the JWT token
};

export const register = async (data: RegisterData) => {
  const response = await axios.post(`${API_URL}/auth/register`, data);
  return response.data; // Should return { accessToken, refreshToken, ... }
};

export const logout = async (token: string) => {
  try {
    await axios.post(
      `${API_URL}/logout`,
      {},
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
};
