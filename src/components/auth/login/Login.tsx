import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { login, LoginData } from "../../../services/AuthService";

const Login: React.FC = () => {
  const [formData, setFormData] = useState<LoginData>({
    email: "",
    password: "",
  });
  const [error, setError] = useState<string>("");
  const { setTokens } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const data = await login(formData);
      console.log(data["accessToken"]);
      setTokens(data["accessToken"], data["refreshToken"]);
      navigate("/student");
    } catch (err: any) {
      setError(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center">
      <div
        className="card shadow-lg border-0 p-4"
        style={{
          maxWidth: "400px",
          width: "100%",
          borderRadius: "1rem",
          backgroundColor: "#FFFFFF", // White card
        }}
      >
        <div className="card-body">
          <h2
            className="card-title text-center mb-4 fw-bold"
            style={{
              color: "#FFC107",
              backgroundColor: "##000000",
            }} // Yellow heading
          >
            Welcome Back
          </h2>

          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label
                htmlFor="email"
                className="form-label"
                style={{ color: "#000000" }}
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <div className="mb-3">
              <label
                htmlFor="password"
                className="form-label"
                style={{ color: "#000000" }}
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>

            <button
              type="submit"
              className="btn w-100"
              style={{
                backgroundColor: "#FFC107", // Yellow button
                color: "#000000", // Black text
                fontWeight: "bold",
              }}
            >
              Login
            </button>
          </form>

          <div className="mt-3 text-center">
            <a
              href="/register"
              className="text-decoration-none"
              style={{ color: "#000000" }}
            >
              Don’t have an account? <strong>Sign up</strong>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
