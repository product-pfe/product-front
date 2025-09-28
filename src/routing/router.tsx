// src/router.tsx
import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import UsersList from "../components/admin/UsersList";
import UserDetail from "../components/admin/UserDetail";
import RequireAuth from "./RequireAuth";
import ProductList from "../components/products/ProductList";
import ProductForm from "../components/products/ProductForm";
import ProductDetail from "../components/products/ProductDetail";

// lazy pages (ou importe directement)
const Home = lazy(() => import("../components/home/Home"));
const Login = lazy(() => import("../components/auth/login/Login"));
const Register = lazy(() => import("../components/auth/register/Register"));

const LoadingFallback: React.FC = () => <div className="p-8 text-center">Loading…</div>;

export default function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* public */}
        <Route path="/products" element={<ProductList />} />
        <Route path="/products/:id" element={<ProductDetail />} />

        {/* protected */}
        <Route path="/products/new" element={<RequireAuth><ProductForm mode="create" /></RequireAuth>} />
        <Route path="/products/:id/edit" element={<RequireAuth><ProductForm mode="edit" /></RequireAuth>} />

        <Route
          path="//admin/users"
          element={
            <RequireAuth roles={["ADMIN"]}>
              <UsersList />
            </RequireAuth>
          }
        />

       
      <Route
        path="/admin/users/:id"
        element={
         <RequireAuth roles={["ADMIN"]}>
              <UserDetail />
            </RequireAuth>
        }
      />

        <Route path="*" element={<Navigate to="/404" replace />} />
      </Routes>
    </Suspense>
  );
}