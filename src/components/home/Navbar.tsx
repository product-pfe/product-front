import React, { useContext } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/authContext";

const Navbar: React.FC = () => {
  const { accessToken, user, logout, hasRole } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <header className="bg-black text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/" className="text-yellow-400 font-bold no-underline">MyApp</Link>

          <nav className="hidden md:flex gap-2">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `px-3 py-2 rounded no-underline ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
              }
            >
              Home
            </NavLink>

            <NavLink
              to="/products"
              className={({ isActive }) =>
                `px-3 py-2 rounded no-underline ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
              }
            >
              Products
            </NavLink>

            {accessToken && (
              <NavLink
                to="/student"
                className={({ isActive }) =>
                  `px-3 py-2 rounded no-underline ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                }
              >
                My Products
              </NavLink>
            )}

            {hasRole("ADMIN") && (
              <NavLink
                to="/admin"
                className={({ isActive }) =>
                  `px-3 py-2 rounded no-underline ${isActive ? "bg-white/10" : "hover:bg-white/5"}`
                }
              >
                Admin
              </NavLink>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {!accessToken ? (
            <>
              <Link to="/login" className="px-4 py-2 rounded bg-yellow-400 text-black font-semibold no-underline">
                Login
              </Link>
              <Link to="/register" className="px-4 py-2 rounded border border-white/10 no-underline">
                Register
              </Link>
            </>
          ) : (
            <>
              <div className="hidden sm:block text-right mr-3">
                <div className="text-sm font-medium">{user?.email}</div>
                <div className="text-xs text-gray-300">{user?.roles?.join(", ")}</div>
              </div>
              <button
                onClick={() => { logout(); navigate("/login"); }}
                className="px-4 py-2 rounded bg-white/10 no-underline"
              >
                Logout
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;