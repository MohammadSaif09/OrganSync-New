import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./RegisterPage.css";

export default function RegisterPage() {
  const { register, setCurrentPage } = useAuth();

  const [role, setRole] = useState("donor");

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    bloodGroup: "",
    organ: "",
    consent: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const {
      name,
      value,
      type,
      checked
    } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? checked
          : value
    }));
  };

  const handleRoleChange = (newRole) => {
    setRole(newRole);

    setFormData((prev) => ({
      ...prev,
      role: newRole
    }));

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      formData.password !==
      formData.confirmPassword
    ) {
      setError(
        "Passwords do not match."
      );
      return;
    }

    if (!formData.consent) {
      setError(
        "Please accept the consent agreement."
      );
      return;
    }

    setLoading(true);

    try {
      await register({
        ...formData,
        role
      });
    } catch (err) {
      setError(
        err.message ||
          "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const organLabel =
    role === "recipient"
      ? "Organ Needed"
      : role === "donor"
      ? "Organ to Pledge"
      : "Transplant Specialization";

  return (
    <div
      className="register-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/organsync-login-bg.jpg)`
      }}
    >
      <div className="register-overlay" />

      <div className="register-card">
        <div className="register-icon-circle">
          ✚
        </div>

        <h1 className="register-title">
          Join OrganSync
        </h1>

        <p className="register-subtitle">
          Create your secure transplant coordination account
        </p>

        <div className="register-role-tabs">
          <button
            type="button"
            className={
              role === "donor"
                ? "register-role-btn active"
                : "register-role-btn"
            }
            onClick={() =>
              handleRoleChange("donor")
            }
          >
            <span>🫀</span>
            Donor
          </button>

          <button
            type="button"
            className={
              role === "recipient"
                ? "register-role-btn active"
                : "register-role-btn"
            }
            onClick={() =>
              handleRoleChange("recipient")
            }
          >
            <span>🤝</span>
            Recipient
          </button>

          <button
            type="button"
            className={
              role === "hospital"
                ? "register-role-btn active"
                : "register-role-btn"
            }
            onClick={() =>
              handleRoleChange("hospital")
            }
          >
            <span>🏥</span>
            Hospital
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          <div className="register-grid">
            <div className="register-field">
              <label htmlFor="fullName">
                Full Name
              </label>

              <div className="register-input-box">
                <span className="register-input-icon">
                  👤
                </span>

                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder={
                    role === "hospital"
                      ? "Hospital / Center Name"
                      : "Enter your full name"
                  }
                  autoComplete="name"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="phone">
                Phone Number
              </label>

              <div className="register-input-box">
                <span className="register-input-icon">
                  ☎
                </span>

                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  required
                />
              </div>
            </div>
          </div>

          <div className="register-field">
            <label htmlFor="email">
              Email Address
            </label>

            <div className="register-input-box">
              <span className="register-input-icon">
                ✉
              </span>

              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="name@example.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="register-grid">
            <div className="register-field">
              <label htmlFor="password">
                Password
              </label>

              <div className="register-input-box">
                <span className="register-input-icon">
                  🔒
                </span>

                <input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>

            <div className="register-field">
              <label htmlFor="confirmPassword">
                Confirm Password
              </label>

              <div className="register-input-box">
                <span className="register-input-icon">
                  ✓
                </span>

                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={
                    formData.confirmPassword
                  }
                  onChange={handleChange}
                  placeholder="Confirm password"
                  autoComplete="new-password"
                  required
                />
              </div>
            </div>
          </div>

          {role !== "hospital" && (
            <div className="register-grid">
              <div className="register-field">
                <label htmlFor="bloodGroup">
                  Blood Group
                </label>

                <select
                  id="bloodGroup"
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select blood group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div className="register-field">
                <label htmlFor="organ">
                  {organLabel}
                </label>

                <select
                  id="organ"
                  name="organ"
                  value={formData.organ}
                  onChange={handleChange}
                  required
                >
                  <option value="">
                    Select organ
                  </option>
                  <option value="Kidney">
                    Kidney
                  </option>
                  <option value="Liver">
                    Liver
                  </option>
                  <option value="Heart">
                    Heart
                  </option>
                  <option value="Lungs">
                    Lungs
                  </option>
                  <option value="Pancreas">
                    Pancreas
                  </option>
                  <option value="Cornea">
                    Cornea
                  </option>
                </select>
              </div>
            </div>
          )}

          {role === "hospital" && (
            <div className="register-hospital-note">
              <span>🏥</span>

              <div>
                <strong>
                  Hospital Registration
                </strong>

                <p>
                  Your hospital account can be verified
                  by the OrganSync administrator before
                  accessing transplant operations.
                </p>
              </div>
            </div>
          )}

          <label className="register-consent">
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
            />

            <span>
              I consent to securely share relevant
              information for transplant matching and
              processing.
            </span>
          </label>

          {error && (
            <div className="register-error">
              ⚠️ {error}
            </div>
          )}

          <button
            type="submit"
            className="register-submit-btn"
            disabled={loading}
          >
            {loading
              ? "Creating Account..."
              : "Create Account →"}
          </button>
        </form>

        <div className="register-footer">
          <span>
            Already have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage("login")
            }
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
}