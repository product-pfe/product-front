import React, { useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import ReactDatePicker from "react-datepicker";
// import "react-datepicker/dist/react-datepicker.css"; // ensure this CSS is imported once

// --- DTO-aligned Types (mirror your Java records) ---
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
  dateOfBirth: string; // ISO LocalDate (yyyy-MM-dd)
  gender: Gender;
  password: string;
  confirmPassword: string;
}

// Replace with your actual API call if you have AuthService.register
async function register(payload: RegisterRequest) {
  const res = await fetch("/api/v1/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.message || "Registration failed");
  }
  return res.json();
}

// --- Helpers ---
const toLocalDateString = (d: Date | null) =>
  d
    ? new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
        .toISOString()
        .slice(0, 10) // yyyy-MM-dd
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

  const strength = useMemo(
    () => passwordStrength(form.password),
    [form.password]
  );

  const updateField = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const key = name.split(".")[1] as keyof Address;
      setForm((prev) => ({
        ...prev,
        address: { ...prev.address, [key]: value },
      }));
    } else if (name === "gender") {
      setForm((prev) => ({ ...prev, gender: value as Gender }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value } as RegisterRequest));
    }
  };

  const validate = () => {
    const v: Record<string, string> = {};

    if (!form.firstName.trim()) v.firstName = "First name is required";
    if (!form.lastName.trim()) v.lastName = "Last name is required";
    if (!emailRegex.test(form.email)) v.email = "Enter a valid email";

    if (!dateObj) v.dateOfBirth = "Date of birth is required";
    else {
      const today = new Date();
      const age =
        today.getFullYear() -
        dateObj.getFullYear() -
        (today <
        new Date(today.getFullYear(), dateObj.getMonth(), dateObj.getDate())
          ? 1
          : 0);
      if (age < 13) v.dateOfBirth = "You must be at least 13 years old";
    }

    if (!form.address.street.trim()) v["address.street"] = "Street is required";
    if (!form.address.city.trim()) v["address.city"] = "City is required";
    if (!form.address.country.trim())
      v["address.country"] = "Country is required";
    if (!form.address.zipcode.trim())
      v["address.zipcode"] = "Zip code is required";

    if (form.password.length < 8) v.password = "Min 8 characters";
    if (form.password !== form.confirmPassword)
      v.confirmPassword = "Passwords do not match";

    setErrors(v);
    return Object.keys(v).length === 0;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    if (!validate()) return;

    const payload: RegisterRequest = {
      ...form,
      dateOfBirth: toLocalDateString(dateObj), // yyyy-MM-dd
    };

    try {
      setSubmitting(true);
      await register(payload);
      navigate("/login");
    } catch (err: any) {
      setServerError(err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // NOTE: no background class here => uses your global background
    <div className="container-fluid min-vh-100 d-flex align-items-center justify-content-center p-3 theme-yellow">
      {/* Local (scoped) yellow accent rules */}
      <style>{`
        .theme-yellow .form-control:focus {
          border-color: #facc15; /* yellow-400 */
          box-shadow: 0 0 0 0.25rem rgba(250, 204, 21, 0.35);
        }
        .theme-yellow .form-check-input:checked {
          background-color: #facc15;
          border-color: #facc15;
        }
        .theme-yellow .form-check-input:focus {
          box-shadow: 0 0 0 0.25rem rgba(250, 204, 21, 0.35);
          border-color: #facc15;
        }
        .btn-yellow {
          background-color: #facc15; /* yellow-400 */
          border-color: #facc15;
          color: #111; /* near-black text for contrast */
        }
        .btn-yellow:hover, .btn-yellow:focus {
          background-color: #eab308; /* yellow-500 */
          border-color: #eab308;
          color: #111;
        }
        .link-yellow {
          color: #eab308;
        }
        .link-yellow:hover, .link-yellow:focus {
          color: #ca8a04; /* yellow-600 */
          text-decoration: underline;
        }
      `}</style>

      <div
        className="card shadow border-0 w-100"
        style={{ maxWidth: 780, borderRadius: "1rem" }}
      >
        <div className="card-body p-4 p-md-5">
          <div className="text-center mb-4">
            <h2
              className="fw-bold mb-1"
              style={{ color: "#eab308" /* yellow-500 */ }}
            >
              Create an Account
            </h2>
            <p className="text-muted mb-0">Join us in less than a minute</p>
          </div>

          {serverError && (
            <div className="alert alert-danger" role="alert">
              {serverError}
            </div>
          )}

          <form onSubmit={onSubmit} noValidate>
            {/* Name */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label">First Name</label>
                <input
                  name="firstName"
                  className={`form-control ${
                    errors.firstName ? "is-invalid" : ""
                  }`}
                  value={form.firstName}
                  onChange={updateField}
                  placeholder="e.g. Imad"
                  required
                />
                {errors.firstName && (
                  <div className="invalid-feedback">{errors.firstName}</div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label">Last Name</label>
                <input
                  name="lastName"
                  className={`form-control ${
                    errors.lastName ? "is-invalid" : ""
                  }`}
                  value={form.lastName}
                  onChange={updateField}
                  placeholder="e.g. Makhlas"
                  required
                />
                {errors.lastName && (
                  <div className="invalid-feedback">{errors.lastName}</div>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mb-3">
              <label className="form-label">Email</label>
              <input
                type="email"
                name="email"
                className={`form-control ${errors.email ? "is-invalid" : ""}`}
                value={form.email}
                onChange={updateField}
                placeholder="you@example.com"
                required
              />
              {errors.email && (
                <div className="invalid-feedback">{errors.email}</div>
              )}
            </div>

            {/* Address */}
            <fieldset className="border rounded-3 p-3 p-md-4 mb-3">
              <legend className="float-none w-auto px-2 small text-uppercase text-secondary mb-0">
                Address
              </legend>
              <div className="row g-3">
                <div className="col-12 col-md-8">
                  <label className="form-label">Street</label>
                  <input
                    name="address.street"
                    className={`form-control ${
                      errors["address.street"] ? "is-invalid" : ""
                    }`}
                    value={form.address.street}
                    onChange={updateField}
                    placeholder="123 Avenue des Champs-Élysées"
                    required
                  />
                  {errors["address.street"] && (
                    <div className="invalid-feedback">
                      {errors["address.street"]}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label">Number</label>
                  <input
                    name="address.number"
                    className="form-control"
                    value={form.address.number}
                    onChange={updateField}
                    placeholder="Apt / No."
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label">City</label>
                  <input
                    name="address.city"
                    className={`form-control ${
                      errors["address.city"] ? "is-invalid" : ""
                    }`}
                    value={form.address.city}
                    onChange={updateField}
                    placeholder="Fès"
                    required
                  />
                  {errors["address.city"] && (
                    <div className="invalid-feedback">
                      {errors["address.city"]}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Zip Code</label>
                  <input
                    name="address.zipcode"
                    className={`form-control ${
                      errors["address.zipcode"] ? "is-invalid" : ""
                    }`}
                    value={form.address.zipcode}
                    onChange={updateField}
                    placeholder="30000"
                    required
                  />
                  {errors["address.zipcode"] && (
                    <div className="invalid-feedback">
                      {errors["address.zipcode"]}
                    </div>
                  )}
                </div>
                <div className="col-12 col-md-3">
                  <label className="form-label">Country</label>
                  <input
                    name="address.country"
                    className={`form-control ${
                      errors["address.country"] ? "is-invalid" : ""
                    }`}
                    value={form.address.country}
                    onChange={updateField}
                    placeholder="Morocco"
                    required
                  />
                  {errors["address.country"] && (
                    <div className="invalid-feedback">
                      {errors["address.country"]}
                    </div>
                  )}
                </div>
              </div>
            </fieldset>

            {/* Date of Birth + Gender */}
            <div className="row g-3 mb-3">
              <div className="col-12 col-md-6">
                <label className="form-label">Date of Birth</label>
                <ReactDatePicker
                  selected={dateObj}
                  onChange={(d) => {
                    setDateObj(d);
                    setForm((prev) => ({
                      ...prev,
                      dateOfBirth: toLocalDateString(d),
                    }));
                  }}
                  dateFormat="yyyy-MM-dd"
                  maxDate={new Date()}
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  placeholderText="YYYY-MM-DD"
                  className={`form-control ${
                    errors.dateOfBirth ? "is-invalid" : ""
                  }`}
                  required
                />
                {errors.dateOfBirth && (
                  <div className="invalid-feedback d-block">
                    {errors.dateOfBirth}
                  </div>
                )}
              </div>
              <div className="col-12 col-md-6">
                <label className="form-label d-block">Gender</label>
                <div className="d-flex gap-3 align-items-center">
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="genderMale"
                      value="MALE"
                      checked={form.gender === "MALE"}
                      onChange={updateField}
                    />
                    <label className="form-check-label" htmlFor="genderMale">
                      Male
                    </label>
                  </div>
                  <div className="form-check">
                    <input
                      className="form-check-input"
                      type="radio"
                      name="gender"
                      id="genderFemale"
                      value="FEMALE"
                      checked={form.gender === "FEMALE"}
                      onChange={updateField}
                    />
                    <label className="form-check-label" htmlFor="genderFemale">
                      Female
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Passwords */}
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                name="password"
                className={`form-control ${
                  errors.password ? "is-invalid" : ""
                }`}
                value={form.password}
                onChange={updateField}
                placeholder="At least 8 characters"
                required
              />
              {errors.password && (
                <div className="invalid-feedback">{errors.password}</div>
              )}
              <div className="mt-2">
                <div
                  className="progress"
                  role="progressbar"
                  aria-label="password strength"
                >
                  <div
                    className={`progress-bar ${
                      strength <= 2
                        ? "bg-danger"
                        : strength === 3
                        ? "bg-warning"
                        : "bg-success"
                    }`}
                    style={{ width: `${(strength / 5) * 100}%` }}
                  />
                </div>
                <small className="text-muted">
                  Use upper/lowercase, numbers, and symbols for a stronger
                  password.
                </small>
              </div>
            </div>

            <div className="mb-4">
              <label className="form-label">Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                className={`form-control ${
                  errors.confirmPassword ? "is-invalid" : ""
                }`}
                value={form.confirmPassword}
                onChange={updateField}
                required
              />
              {errors.confirmPassword && (
                <div className="invalid-feedback">{errors.confirmPassword}</div>
              )}
            </div>

            <button
              type="submit"
              className="btn btn-yellow w-100 py-2 fw-semibold"
              disabled={submitting}
            >
              {submitting ? "Creating your account…" : "Register"}
            </button>

            <div className="text-center mt-3">
              <span className="text-muted">Already have an account? </span>
              <Link
                to="/login"
                className="text-decoration-none fw-semibold link-yellow"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
