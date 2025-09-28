// src/components/auth/register/Register.tsx
import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { register as registerService } from "../../../services/AuthService";

export type Gender = "MALE" | "FEMALE";

export interface Address {
  street: string;
  number: string;
  zipcode: string;
  country: string;
  city: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  address: Address;
  dateOfBirth: string; // yyyy-MM-dd
  gender: Gender;
  password: string;
  confirmPassword: string;
}

/* helpers */
const toLocalDateString = (d: Date | null) =>
  d
    ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        .toISOString()
        .slice(0, 10)
    : "";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
const passwordStrength = (pwd: string) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[a-z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return Math.min(score, 5);
};

/* Address subcomponent */
const AddressFields: React.FC<{
  address: Address;
  onChange: (a: Address) => void;
  errors: Record<string, string>;
}> = ({ address, onChange, errors }) => {
  const set = (k: keyof Address, v: string) => onChange({ ...address, [k]: v });
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Street</label>
        <input
          name="street"
          value={address.street}
          onChange={(e) => set("street", e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-300 ${
            errors["address.street"] ? "border-red-400" : "border-gray-200"
          }`}
          placeholder="123 Avenue des Champs-Élysées"
        />
        {errors["address.street"] && <p className="mt-1 text-xs text-red-600">{errors["address.street"]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Number</label>
        <input
          name="number"
          value={address.number}
          onChange={(e) => set("number", e.target.value)}
          className="mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-300 border-gray-200"
          placeholder="Apt / No."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">City</label>
        <input
          name="city"
          value={address.city}
          onChange={(e) => set("city", e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-300 ${
            errors["address.city"] ? "border-red-400" : "border-gray-200"
          }`}
          placeholder="Fès"
        />
        {errors["address.city"] && <p className="mt-1 text-xs text-red-600">{errors["address.city"]}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Zip code</label>
        <input
          name="zipcode"
          value={address.zipcode}
          onChange={(e) => set("zipcode", e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-300 ${
            errors["address.zipcode"] ? "border-red-400" : "border-gray-200"
          }`}
          placeholder="30000"
        />
        {errors["address.zipcode"] && <p className="mt-1 text-xs text-red-600">{errors["address.zipcode"]}</p>}
      </div>

      <div className="lg:col-span-2">
        <label className="block text-sm font-medium text-gray-700">Country</label>
        <input
          name="country"
          value={address.country}
          onChange={(e) => set("country", e.target.value)}
          className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:ring-2 focus:ring-yellow-300 ${
            errors["address.country"] ? "border-red-400" : "border-gray-200"
          }`}
          placeholder="Morocco"
        />
        {errors["address.country"] && <p className="mt-1 text-xs text-red-600">{errors["address.country"]}</p>}
      </div>
    </div>
  );
};

/* Elegant left panel: illustration + features */
const LeftPanel: React.FC = () => {
  return (
    <div className="hidden lg:flex lg:flex-col lg:justify-center lg:items-start p-10 bg-gradient-to-br from-yellow-400 to-yellow-600 text-white gap-6">
      <div className="w-full max-w-xs">
        <svg viewBox="0 0 600 400" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg" aria-hidden>
          <defs>
            <linearGradient id="g1" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="rgba(255,255,255,0.18)" />
              <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
            </linearGradient>
          </defs>
          <rect rx="24" width="100%" height="100%" fill="url(#g1)" />
          <g transform="translate(30,30)" fill="none" stroke="white" strokeOpacity="0.9" strokeWidth="2">
            <circle cx="120" cy="80" r="38" strokeOpacity="0.18" />
            <rect x="180" y="40" width="220" height="120" rx="12" strokeOpacity="0.12" />
            <path d="M24 200 q80 -60 160 -20 t160 10" strokeOpacity="0.14" />
          </g>
        </svg>
      </div>

      <div>
        <h2 className="text-3xl font-extrabold leading-tight">Gère tes produits</h2>
        <p className="mt-2 text-sm text-yellow-100 max-w-xs">
          Catalogue, stocks et métriques — tout au même endroit. Simple, sécurisé et rapide pour les petites boutiques.
        </p>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 w-full max-w-xs">
        <div className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
          <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-white">📦</div>
          <div>
            <div className="text-sm font-medium">Gestion d’inventaire</div>
            <div className="text-xs text-yellow-100">Ajoute, modifie et suis tes produits facilement</div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
          <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-white">📈</div>
          <div>
            <div className="text-sm font-medium">Rapports clairs</div>
            <div className="text-xs text-yellow-100">Valeur stock, best-sellers et tendances</div>
          </div>
        </div>

        <div className="flex items-start gap-3 bg-white/10 rounded-lg p-3">
          <div className="w-9 h-9 rounded-md bg-white/20 flex items-center justify-center text-white">🔒</div>
          <div>
            <div className="text-sm font-medium">Sécurité</div>
            <div className="text-xs text-yellow-100">JWT & vérifications côté serveur</div>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <a
          href="#features"
          className="inline-flex items-center gap-2 text-sm font-medium bg-white/10 hover:bg-white/20 px-3 py-2 rounded-md"
        >
          Découvrir les fonctionnalités →
        </a>
      </div>
    </div>
  );
};

const Register: React.FC = () => {
  const navigate = useNavigate();

  const [dateObj, setDateObj] = useState<Date | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState<RegisterRequest>({
    firstName: "",
    lastName: "",
    email: "",
    address: { street: "", number: "", zipcode: "", country: "", city: "" },
    dateOfBirth: "",
    gender: "MALE",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [serverError, setServerError] = useState<string>("");

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);

  const updateField = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof Address;
      setForm((prev) => ({ ...prev, address: { ...prev.address, [key]: value } }));
    } else if (name === "gender") {
      setForm((prev) => ({ ...prev, gender: value as Gender }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as RegisterRequest));
    }
  };

  const setAddress = (addr: Address) => setForm((prev) => ({ ...prev, address: addr }));

  const validate = () => {
    const v: Record<string, string> = {};
    if (!form.firstName.trim()) v.firstName = "Le prénom est requis";
    if (!form.lastName.trim()) v.lastName = "Le nom est requis";
    if (!emailRegex.test(form.email)) v.email = "Email invalide";

    if (!dateObj) v.dateOfBirth = "Date de naissance requise";
    else {
      const today = new Date();
      const age =
        today.getFullYear() -
        dateObj.getFullYear() -
        (today < new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate()) ? 1 : 0);
      if (age < 13) v.dateOfBirth = "Vous devez avoir au moins 13 ans";
    }

    if (!form.address.street.trim()) v["address.street"] = "Rue requise";
    if (!form.address.city.trim()) v["address.city"] = "Ville requise";
    if (!form.address.country.trim()) v["address.country"] = "Pays requis";
    if (!form.address.zipcode.trim()) v["address.zipcode"] = "Code postal requis";

    if (form.password.length < 8) v.password = "Min 8 caractères";
    if (form.password !== form.confirmPassword) v.confirmPassword = "Les mots de passe ne correspondent pas";

    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    // build payload matching your backend DTO; adapt if your backend expects a different shape
    const payload = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      address: {
        street: form.address.street,
        number: form.address.number,
        zipcode: form.address.zipcode,
        country: form.address.country,
        city: form.address.city,
      },
      dateOfBirth: toLocalDateString(dateObj),
      gender: form.gender,
      password: form.password,
      confirmPassword: form.confirmPassword,
    };

    try {
      setSubmitting(true);
      // call your centralized service (axios)
      await registerService(payload);
      // If your register endpoint returns tokens and you want to log in automatically:
      // const res = await registerService(payload);
      // setTokens(res.accessToken, res.refreshToken);

      navigate("/login");
    } catch (err: any) {
      // prefer structured field errors from backend
      const fe = err?.response?.data?.fieldErrors;
      if (fe && typeof fe === "object") {
        setErrors((prev) => ({ ...prev, ...fe }));
      } else {
        setServerError(err?.response?.data?.message || err?.message || "Registration failed");
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-yellow-50 via-white to-yellow-100 px-6 py-12">
      <div className="w-full max-w-5xl">
        <div className="bg-white/95 rounded-3xl shadow-xl border border-gray-100 overflow-hidden grid grid-cols-1 lg:grid-cols-3">
          {/* Left decorative panel (elegant) */}
          <LeftPanel />

          {/* FORM (takes 2 cols on large screens) */}
          <div className="lg:col-span-2 p-8 sm:p-10">
            <div className="max-w-3xl mx-auto">
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-800">Créer un compte</h3>
                <p className="text-sm text-gray-500">Inscris-toi en quelques étapes — rapide et sécurisé.</p>
              </div>

              {serverError && (
                <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-100 rounded-md p-3">
                  {serverError}
                </div>
              )}

              <form onSubmit={onSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Prénom</label>
                    <input
                      name="firstName"
                      value={form.firstName}
                      onChange={updateField}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                        errors.firstName ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="Imad"
                    />
                    {errors.firstName && <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom</label>
                    <input
                      name="lastName"
                      value={form.lastName}
                      onChange={updateField}
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                        errors.lastName ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholder="Makhlas"
                    />
                    {errors.lastName && <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={updateField}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                      errors.email ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="you@example.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>

                <AddressFields address={form.address} onChange={setAddress} errors={errors} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date de naissance</label>
                    <ReactDatePicker
                      selected={dateObj}
                      onChange={(d) => {
                        setDateObj(d);
                        setForm((prev) => ({ ...prev, dateOfBirth: toLocalDateString(d) }));
                      }}
                      dateFormat="yyyy-MM-dd"
                      className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                        errors.dateOfBirth ? "border-red-400" : "border-gray-200"
                      }`}
                      placeholderText="YYYY-MM-DD"
                      maxDate={new Date()}
                      showYearDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                    />
                    {errors.dateOfBirth && <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Genre</label>
                    <div className="mt-1 flex items-center gap-4">
                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="MALE"
                          checked={form.gender === "MALE"}
                          onChange={updateField}
                          className="h-4 w-4 text-yellow-500 focus:ring-yellow-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Homme</span>
                      </label>

                      <label className="inline-flex items-center">
                        <input
                          type="radio"
                          name="gender"
                          value="FEMALE"
                          checked={form.gender === "FEMALE"}
                          onChange={updateField}
                          className="h-4 w-4 text-yellow-500 focus:ring-yellow-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">Femme</span>
                      </label>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mot de passe</label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={updateField}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                      errors.password ? "border-red-400" : "border-gray-200"
                    }`}
                    placeholder="Au moins 8 caractères"
                  />
                  {errors.password && <p className="mt-1 text-xs text-red-600">{errors.password}</p>}

                  <div className="mt-2">
                    <div className="h-2 bg-gray-200 rounded overflow-hidden">
                      <div
                        className={`h-full ${strength <= 2 ? "bg-red-500" : strength === 3 ? "bg-yellow-400" : "bg-green-500"}`}
                        style={{ width: `${(strength / 5) * 100}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-gray-500">Utilise majuscules, minuscules, chiffres et symboles.</p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Confirmer le mot de passe</label>
                  <input
                    name="confirmPassword"
                    type="password"
                    value={form.confirmPassword}
                    onChange={updateField}
                    className={`mt-1 block w-full rounded-md border px-3 py-2 shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-300 ${
                      errors.confirmPassword ? "border-red-400" : "border-gray-200"
                    }`}
                  />
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>}
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-md bg-yellow-400 hover:bg-yellow-500 active:scale-98 text-black font-semibold shadow"
                  >
                    {submitting ? "Création en cours…" : "Créer mon compte"}
                  </button>
                </div>

                <div className="text-center text-sm text-gray-600">
                  Déjà un compte ?{" "}
                  <Link to="/login" className="text-yellow-600 font-medium hover:underline">
                    Se connecter
                  </Link>
                </div>
              </form>
            </div>
          </div> {/* end form */}
        </div>
      </div>
    </div>
  );
};

export default Register;