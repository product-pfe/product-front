import React, { ReactNode, useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/authContext";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { accessToken } = useContext(AuthContext);

  if (accessToken == null) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
