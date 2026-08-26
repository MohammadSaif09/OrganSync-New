import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { login, setCurrentPage } = useAuth();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
      // Login successful hone par dashboard ya home par navigate karein:
      if (setCurrentPage) {
        setCurrentPage("dashboard");
      }
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Back to Home Navigation */}
        <button
          type="button"
          onClick={() => setCurrentPage("home")}
          style={styles.backBtn}
        >
          &larr; Back to Home
        </button>

        <h1 style={styles.title}>OrganSync</h1>
        <h2 style={styles.subtitle}>AI-Based Organ Donor &amp; Transplantation Portal</h2>

        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>
            Email / Username
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="user@example.com"
              required
              style={styles.input}
            />
          </label>

          <label style={styles.label}>
            Password
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </label>

          {error && <div style={styles.error}>{error}</div>}

          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? "Signing in..." : "Log In"}
          </button>
        </form>

        <p style={styles.footerText}>
          Don't have an account?{" "}
          <button onClick={() => setCurrentPage("register")} style={styles.linkBtn}>
            Register
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
    background: "#dbeafe",
    fontFamily: "system-ui, -apple-system, sans-serif",
    padding: "20px",
  },
  card: {
    width: "100%",
    maxWidth: 380,
    background: "#ffffff",
    borderRadius: 12,
    padding: "36px 32px",
    boxShadow: "0 4px 24px rgba(0,0,0,0.08)",
  },
  backBtn: {
    background: "none",
    border: "none",
    color: "#6b7280",
    fontSize: "13px",
    fontWeight: "500",
    cursor: "pointer",
    padding: 0,
    marginBottom: "16px",
    display: "block",
  },
  title: { fontSize: 26, fontWeight: 700, margin: 0, color: "#111827" },
  subtitle: { fontSize: 13, fontWeight: 400, color: "#6b7280", marginTop: 4, marginBottom: 24, lineHeight: "1.4" },
  form: { display: "flex", flexDirection: "column", gap: 16 },
  label: { display: "flex", flexDirection: "column", gap: 6, fontSize: 13, fontWeight: 500, color: "#374151" },
  input: { padding: "10px 12px", fontSize: 14, borderRadius: 8, border: "1px solid #d1d5db", outline: "none" },
  button: { marginTop: 8, padding: "12px", fontSize: 15, fontWeight: 600, color: "#fff", background: "#2563eb", border: "none", borderRadius: 8, cursor: "pointer" },
  error: { fontSize: 13, color: "#dc2626", background: "#fee2e2", padding: "8px 10px", borderRadius: 6, textAlign: "center" },
  footerText: { fontSize: 13, color: "#6b7280", textAlign: "center", marginTop: 20 },
  linkBtn: { background: "none", border: "none", color: "#2563eb", fontWeight: 600, cursor: "pointer", textDecoration: "underline" },
};