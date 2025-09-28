import React from "react";
import { Navigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/authContext";

interface ProtectedRouteProps { children: React.ReactNode; }

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { accessToken } = useContext(AuthContext);
  if (!accessToken) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

export default ProtectedRoute;