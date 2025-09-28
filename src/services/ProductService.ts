// src/services/ProductService.ts
import axios from "axios";
import type { ProductDto, ProductCreateRequest, ProductUpdateRequest } from "../types/product";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// --- named exports ---
export async function listProducts(category?: string): Promise<ProductDto[]> {
  const res = await api.get<ProductDto[]>("/products", { params: category ? { category } : {} });
  return res.data;
}

export async function getProductById(id: string): Promise<ProductDto> {
  const res = await api.get<ProductDto>(`/products/${id}`);
  return res.data;
}

export async function createProduct(payload: ProductCreateRequest): Promise<ProductDto> {
  const res = await api.post<ProductDto>("/products", payload);
  return res.data;
}

export async function updateProduct(id: string, payload: ProductUpdateRequest): Promise<ProductDto> {
  const res = await api.put<ProductDto>(`/products/${id}`, payload);
  return res.data;
}

export async function deleteProduct(id: string): Promise<void> {
  await api.delete(`/products/${id}`);
}

// optional default export (if you prefer)
export default {
  listProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};