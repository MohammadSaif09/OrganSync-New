import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

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
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    try {
      await register({ role, ...formData });
    } catch (err) {
      setError(err.message || "Something went wrong!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>Create Your Account</h2>
        <p style={styles.subtitle}>Register as a Donor, Recipient, or Hospital</p>

        <div style={styles.tabGroup}>
          {["donor", "recipient", "hospital"].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRole(r)}
              style={{
                ...styles.tabBtn,
                ...(role === r ? styles.activeTab : {}),
              }}
            >
              {r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <input
              type="text"
              name="fullName"
              placeholder={role === "hospital" ? "Hospital Name" : "Full Name"}
              value={formData.fullName}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone Number"
              value={formData.phone}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
            style={styles.input}
          />

          <div style={styles.row}>
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>

          {/* Conditional Rendering: Show Blood Group & Organ options only for Donor / Recipient */}
          {role !== "hospital" && (
            <div style={styles.row}>
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Blood Group</option>
                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>

              <select
                name="organ"
                value={formData.organ}
                onChange={handleChange}
                required
                style={styles.input}
              >
                <option value="">Organ Option</option>
                {["Kidney", "Liver", "Heart", "Lungs", "Pancreas", "Cornea"].map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
          )}

          <label style={styles.checkboxLabel}>
            <input
              type="checkbox"
              name="consent"
              checked={formData.consent}
              onChange={handleChange}
              required
            />
            I agree to share relevant information for matching & processing.
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Registering..." : "Create Account"}
          </button>
        </form>

        <p style={styles.footerText}>
          Already have an account?{" "}
          <button onClick={() => setCurrentPage("login")} style={styles.linkBtn}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#f4f6f8",
    fontFamily: "system-ui, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: 480,
    background: "#ffffff",
    borderRadius: 12,
    padding: "32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  title: { fontSize: 22, fontWeight: 700, margin: 0, color: "#111827", textAlign: "center" },
  subtitle: { fontSize: 13, color: "#6b7280", marginTop: 4, marginBottom: 20, textAlign: "center" },
  tabGroup: { display: "flex", background: "#f3f4f6", padding: 4, borderRadius: 8, gap: 4, marginBottom: 16 },
  tabBtn: {
    flex: 1,
    padding: "8px",
    border: "none",
    background: "transparent",
    borderRadius: 6,
    fontSize: 14,
    fontWeight: 500,
    color: "#4b5563",
    cursor: "pointer",
    transition: "all 0.2s",
  },
  activeTab: {
    background: "#ffffff",
    color: "#111827",
    boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
  },
  form: { display: "flex", flexDirection: "column", gap: 12 },
  row: { display: "flex", gap: 12 },
  input: {
    flex: 1,
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #d1d5db",
    fontSize: 14,
    outline: "none",
    width: "100%",
    boxSizing: "border-box",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    color: "#4b5563",
    margin: "4px 0",
    cursor: "pointer",
  },
  error: {
    color: "#ef4444",
    fontSize: 13,
    textAlign: "center",
    background: "#fef2f2",
    padding: "8px",
    borderRadius: 6,
  },
  button: {
    padding: "12px",
    borderRadius: 6,
    border: "none",
    background: "#2563eb",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
    marginTop: 8,
  },
  footerText: { fontSize: 13, color: "#6b7280", textAlign: "center", marginTop: 20 },
  linkBtn: { border: "none", background: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", padding: 0 },
};