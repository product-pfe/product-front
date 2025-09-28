import React, { ReactElement, useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/authContext";

type RequireAuthProps = {
  children: ReactElement;
  /**
   * optional list of allowed roles. If omitted or empty -> only authentication is required.
   * Example: ["ADMIN"] or ["ADMIN","USER"]
   */
  roles?: string[];
};

const normalize = (s: string) => s.trim().toUpperCase();

const RequireAuth: React.FC<RequireAuthProps> = ({ children, roles }) => {
  const { accessToken, user } = useContext(AuthContext);
  const location = useLocation();

  // Not logged in -> redirect to login, keep url to come back after login
  if (!accessToken) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If no roles required, allow
  if (!roles || roles.length === 0) {
    return children;
  }

  // If user has no roles, forbidden
  const userRoles = user?.roles ?? [];
  if (!Array.isArray(userRoles) || userRoles.length === 0) {
    return <Navigate to="/forbidden" replace />;
  }

  // check intersection (case-insensitive)
  const allowed = roles
    .map(normalize)
    .some((r) => userRoles.map(normalize).includes(r));

  if (!allowed) {
    return <Navigate to="/forbidden" replace />;
  }

  return children;
};

export default RequireAuth;