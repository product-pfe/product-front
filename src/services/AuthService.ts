// src/services/AuthService.ts
import axios from "axios";

export const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

/**
 * DTOs / Types
 */
export interface Address {
  street: string;
  number?: string;
  zipcode: string;
  country: string;
  city: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  firstName: string;
  lastName: string;
  email: string;
  address: Address;         // nested address (matches your form)
  dateOfBirth: string;      // ISO date string (yyyy-MM-dd)
  gender: "MALE" | "FEMALE" | string;
  password: string;
  confirmPassword: string;
}

/** Shape returned by auth endpoints (adapt if your backend differs) */
export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;

}

/**
 * axios instance
 */
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * Helper to set/remove Authorization header for the axios instance
 */
export const setAuthToken = (token?: string | null) => {
  if (token) {
    axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete axiosInstance.defaults.headers.common["Authorization"];
  }
};

/**
 * Auth API calls
 */
export const login = async (data: LoginData): Promise<AuthResponse> => {
  const res = await axiosInstance.post("/auth/login", data);
  return res.data;
};

export const register = async (data: RegisterData): Promise<AuthResponse | any> => {
  // If your backend expects flattened fields instead of nested address,
  // adapt the payload here before sending.
  const res = await axiosInstance.post("/auth/register", data);
  return res.data;
};

export const logout = async (token?: string) => {
  try {
    // If you want to use the instance header, set it then call:
    if (token) setAuthToken(token);
    await axiosInstance.post("/auth/logout", {});
    // remove header after logout
    setAuthToken(null);
  } catch (error) {
    console.error("Logout failed", error);
    throw error;
  }
};

export default {
  login,
  register,
  logout,
  setAuthToken,
};