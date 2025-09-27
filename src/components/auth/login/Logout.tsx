import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { logout } from "../../../services/AuthService";

const Logout: React.FC = () => {
  const { accessToken, setTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Access token :::: " + accessToken);
      if (accessToken) {
        await logout(accessToken);
      }
    } catch (err) {
      console.error("Logout failed", err);
    }

    // Clear tokens from context and localStorage
    setTokens(null, null);
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to login page
    navigate("/login");
  };

  return (
    <button className="btn btn-outline-danger" onClick={handleLogout}>
      Logout
    </button>
  );
};

export default Logout;