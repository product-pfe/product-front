// src/components/auth/login/Login.tsx
import React, { useContext, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../../context/authContext";
import { login, LoginData } from "../../../services/AuthService";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;

function base64UrlDecode(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4) b64 += "=";
  try {
    return decodeURIComponent(
      atob(b64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
  } catch {
    return "";
  }
}

/** Extrait la liste des rôles depuis un accessToken JWT (si présente) */
function parseRolesFromJwt(token?: string | null): string[] {
  if (!token) return [];
  try {
    const parts = token.split(".");
    if (parts.length < 2) return [];
    const payloadJson = base64UrlDecode(parts[1]);
    if (!payloadJson) return [];
    const payload = JSON.parse(payloadJson);
    // adapte selon shape de ton token: roles, role, authorities, etc.
    if (Array.isArray(payload.roles)) return payload.roles.map((r: any) => String(r).toUpperCase());
    if (Array.isArray(payload.authorities)) return payload.authorities.map((r: any) => String(r).toUpperCase());
    // some tokens use a single role string:
    if (typeof payload.role === "string") return [payload.role.toUpperCase()];
    return [];
  } catch {
    return [];
  }
}

const Login: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setTokens } = useContext(AuthContext);

  const [form, setForm] = useState<LoginData>({ email: "", password: "" });
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(false);

  const update = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    if (type === "checkbox" && name === "remember") {
      setRemember(checked);
      return;
    }
    setForm((s) => ({ ...s, [name]: value }));
    setFieldErrors((fe) => ({ ...fe, [name]: "" }));
    setError("");
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.email || !emailRegex.test(form.email)) errs.email = "Entrez un email valide";
    if (!form.password || form.password.length < 6) errs.password = "Mot de passe requis (min 6 caractères)";
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!validate()) return;

    try {
      setLoading(true);
      const resp = await login(form); // { accessToken, refreshToken, ... }

      const accessToken = resp.accessToken ?? null;
      const refreshToken = resp.refreshToken ?? null;

      // store tokens in context (and localStorage via context)
      setTokens(accessToken, refreshToken);

      // determine redirect:
      // 1) if user was trying to access a protected route before login, go back
      const from = (location.state as any)?.from?.pathname as string | undefined;
      if (from && from !== "/login") {
        navigate(from, { replace: true });
        return;
      }

      // 2) else, read roles from JWT and redirect accordingly
      const roles = parseRolesFromJwt(accessToken);
      const has = (r: string) => roles.includes(r.toUpperCase());

      if (has("ADMIN")) {
        navigate("/admin/users", { replace: true });
      } else if (has("USER")) {
        navigate("/products", { replace: true }); // ou "/student" selon ton app
      } else {
        // fallback: home
        navigate("/", { replace: true });
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Erreur lors de la connexion — vérifiez vos identifiants";
      if (err?.response?.data?.fieldErrors) {
        setFieldErrors(err.response.data.fieldErrors);
      } else {
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="p-6 sm:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-lg bg-yellow-400 flex items-center justify-center text-black font-bold">
                A
              </div>
              <div>
                <h1 className="text-2xl font-extrabold text-gray-900">Bienvenue</h1>
                <p className="text-sm text-gray-500">Connecte-toi pour gérer tes produits</p>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                aria-live="assertive"
                className="mb-4 rounded-md bg-red-50 border border-red-100 text-red-800 px-4 py-2 text-sm"
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={update}
                  autoComplete="username"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 ${
                    fieldErrors.email ? "border-red-400" : "border-gray-200"
                  }`}
                  aria-invalid={Boolean(fieldErrors.email)}
                  aria-describedby={fieldErrors.email ? "email-error" : undefined}
                />
                {fieldErrors.email && (
                  <p id="email-error" className="mt-1 text-xs text-red-600">
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              <div className="mb-3 relative">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Mot de passe
                </label>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={update}
                  autoComplete="current-password"
                  className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-yellow-300 focus:border-yellow-500 ${
                    fieldErrors.password ? "border-red-400" : "border-gray-200"
                  }`}
                  aria-invalid={Boolean(fieldErrors.password)}
                  aria-describedby={fieldErrors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-9 text-sm text-gray-500 hover:text-gray-700"
                  aria-label={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                >
                  {showPassword ? "Masquer" : "Voir"}
                </button>
                {fieldErrors.password && (
                  <p id="password-error" className="mt-1 text-xs text-red-600">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center justify-between mb-6">
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    name="remember"
                    checked={remember}
                    onChange={update}
                    className="h-4 w-4 rounded border-gray-300 text-yellow-500 focus:ring-yellow-300"
                  />
                  Se souvenir de moi
                </label>

                <Link to="/forgot-password" className="text-sm text-yellow-600 hover:underline">
                  Mot de passe oublié ?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex justify-center items-center gap-2 rounded-md bg-yellow-400 hover:bg-yellow-500 active:scale-95 transition px-4 py-2 text-black font-semibold shadow"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                    Connexion…
                  </>
                ) : (
                  "Se connecter"
                )}
              </button>
            </form>

            <div className="mt-6 flex items-center gap-3">
              <div className="flex-1 h-px bg-gray-200" />
              <div className="text-xs text-gray-400">ou</div>
              <div className="flex-1 h-px bg-gray-200" />
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{" "}
                <Link to="/register" className="font-medium text-yellow-600 hover:underline">
                  Créer un compte
                </Link>
              </p>
            </div>
          </div>

          <div className="bg-gray-50 px-6 py-3 text-center text-xs text-gray-500">
            En continuant, vous acceptez nos{" "}
            <Link to="/terms" className="text-yellow-600 hover:underline">
              conditions
            </Link>
            .
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;