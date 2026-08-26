import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";

// ASSUMED ENDPOINTS — adjust to match your backend if paths differ:
//   GET   /users                       -> full user directory              (existing)
//   GET   /hospitals                   -> partner hospitals list
//   PATCH /hospitals/:id/verify         -> marks a hospital as Verified

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const token = user?.token;

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [usersError, setUsersError] = useState(null);

  const [hospitals, setHospitals] = useState([]);
  const [loadingHospitals, setLoadingHospitals] = useState(true);
  const [hospitalsError, setHospitalsError] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);

  useEffect(() => {
    authFetch("/users", { token })
      .then((data) => setUsers(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching users:", err);
        // Distinguish "fetch failed" from "zero users" — previously this
        // silently fell through to an empty table with no explanation.
        setUsersError("Unable to load the user directory. Please refresh or try again shortly.");
      })
      .finally(() => setLoadingUsers(false));
  }, [token]);

  useEffect(() => {
    authFetch("/hospitals", { token })
      .then((data) => setHospitals(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Error fetching hospitals:", err);
        setHospitalsError("Unable to load partner hospitals. Please refresh or try again shortly.");
      })
      .finally(() => setLoadingHospitals(false));
  }, [token]);

  const verifyHospital = async (id) => {
    setVerifyingId(id);
    const previous = hospitals;
    // Optimistic update, rolled back if the backend rejects it.
    setHospitals((prev) => prev.map((h) => (h.id === id ? { ...h, state: "Verified" } : h)));
    try {
      await authFetch(`/hospitals/${id}/verify`, { method: "PATCH", token });
    } catch (err) {
      console.error("Failed to verify hospital:", err);
      setHospitals(previous);
      alert("Could not verify this hospital right now. Please try again.");
    } finally {
      setVerifyingId(null);
    }
  };

  const filteredUsers = users.filter(
    (u) =>
      (u.fullName || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.email || "").toLowerCase().includes(search.toLowerCase()) ||
      (u.role || "").toLowerCase().includes(search.toLowerCase())
  );

  const verifiedCount = hospitals.filter((h) => h.state === "Verified").length;
  const pendingCount = hospitals.filter((h) => h.state === "Pending").length;

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.logoBadge}>🛡️</div>
          <div>
            <h2 style={styles.brandTitle}>OrganSync Master Admin</h2>
            <span style={styles.brandSub}>Network Security & Governance</span>
          </div>
        </div>

        <div style={styles.userSection}>
          <div style={{ textAlign: "right" }}>
            <span style={styles.userName}>{user?.fullName || "Super Admin"}</span>
            <span style={styles.userRole}>Root Administrator</span>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout ↪
          </button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.grid4}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Total Registered Users</span>
            <h3 style={{ ...styles.metricVal, color: "#2563eb" }}>
              {loadingUsers ? "…" : usersError ? "—" : users.length}
            </h3>
            <small style={styles.metricSub}>Donors, Recipients, Hospitals</small>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Partner Hospitals</span>
            <h3 style={{ ...styles.metricVal, color: "#16a34a" }}>
              {loadingHospitals ? "…" : hospitalsError ? "—" : `${verifiedCount} Certified`}
            </h3>
            <small style={styles.metricSub}>Transplant Centers</small>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Pending Approvals</span>
            <h3 style={{ ...styles.metricVal, color: "#ea580c" }}>
              {loadingHospitals ? "…" : hospitalsError ? "—" : `${pendingCount} Requests`}
            </h3>
            <small style={styles.metricSub}>License Verification</small>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>System Health</span>
            <h3 style={{ ...styles.metricVal, color: usersError || hospitalsError ? "#dc2626" : "#16a34a" }}>
              {usersError || hospitalsError ? "Degraded" : "100% Online"}
            </h3>
            <small style={styles.metricSub}>API Gateway & DB Synced</small>
          </div>
        </div>

        <div style={styles.card}>
          <h3 style={styles.cardHeading}>🏥 Partner Hospital License Approvals</h3>
          <p style={styles.cardDesc}>Verify state medical licenses before enabling AI organ matching permissions.</p>

          {hospitalsError && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span>{hospitalsError}</span>
            </div>
          )}

          {loadingHospitals ? (
            <p style={{ color: "#64748b", padding: "16px 0" }}>Loading hospitals...</p>
          ) : hospitals.length === 0 && !hospitalsError ? (
            <p style={{ color: "#64748b", padding: "16px 0" }}>No partner hospitals registered yet.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Hospital Name</th>
                  <th style={styles.th}>State Medical License</th>
                  <th style={styles.th}>Verification Status</th>
                  <th style={styles.th}>Action</th>
                </tr>
              </thead>
              <tbody>
                {hospitals.map((h) => (
                  <tr key={h.id} style={styles.tr}>
                    <td style={styles.tdBold}>{h.name}</td>
                    <td style={styles.td}><code>{h.license}</code></td>
                    <td style={styles.td}>
                      <span style={h.state === "Verified" ? styles.badgeSuccess : styles.badgePending}>
                        {h.state}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {h.state === "Pending" ? (
                        <button
                          onClick={() => verifyHospital(h.id)}
                          style={styles.approveBtn}
                          disabled={verifyingId === h.id}
                        >
                          {verifyingId === h.id ? "Verifying..." : "Approve License"}
                        </button>
                      ) : (
                        <span style={{ color: "#64748b", fontSize: "13px", fontWeight: "600" }}>✓ Authorized</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div style={{ ...styles.card, marginTop: "28px" }}>
          <div style={styles.cardHeaderFlex}>
            <div>
              <h3 style={styles.cardHeading}>👥 System User Directory</h3>
              <p style={styles.cardDesc}>Centralized role-based access list from database.</p>
            </div>
            <input
              type="text"
              placeholder="Search user name, email, role..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={styles.searchInput}
            />
          </div>

          {usersError && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span>{usersError}</span>
            </div>
          )}

          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Full Name</th>
                <th style={styles.th}>Email Address</th>
                <th style={styles.th}>System Role</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loadingUsers ? (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    Loading users...
                  </td>
                </tr>
              ) : usersError ? null : filteredUsers.length > 0 ? (
                filteredUsers.map((u, i) => (
                  <tr key={u._id || i} style={styles.tr}>
                    <td style={styles.tdBold}>{u.fullName || "User"}</td>
                    <td style={styles.td}>{u.email}</td>
                    <td style={styles.td}>
                      <span style={styles.roleBadge}>{(u.role || "DONOR").toUpperCase()}</span>
                    </td>
                    <td style={styles.td}>
                      <span style={styles.badgeSuccess}>Active</span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: "center", padding: "24px", color: "#64748b" }}>
                    No users matching search query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: { minHeight: "100vh", background: "#f8fafc", fontFamily: "system-ui, sans-serif", color: "#0f172a" },
  topbar: { display: "flex", justifyContent: "space-between", alignItems: "center", background: "#ffffff", padding: "16px 36px", borderBottom: "1px solid #e2e8f0" },
  brand: { display: "flex", alignItems: "center", gap: "12px" },
  logoBadge: { background: "#eff6ff", padding: "8px 12px", borderRadius: "10px", fontSize: "20px" },
  brandTitle: { fontSize: "18px", fontWeight: "800", color: "#1e3a8a", margin: 0 },
  brandSub: { fontSize: "11px", color: "#64748b" },
  userSection: { display: "flex", alignItems: "center", gap: "18px" },
  userName: { fontWeight: "700", fontSize: "14px", display: "block" },
  userRole: { fontSize: "12px", color: "#dc2626", fontWeight: "700" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" },
  metricCard: { background: "#ffffff", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "14px" },
  metricLabel: { fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  metricVal: { fontSize: "22px", fontWeight: "800", margin: "6px 0 2px" },
  metricSub: { fontSize: "12px", color: "#94a3b8" },
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardHeaderFlex: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" },
  cardHeading: { fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: 0 },
  cardDesc: { fontSize: "14px", color: "#64748b", margin: "4px 0 0" },
  searchInput: { padding: "10px 16px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", width: "280px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { borderBottom: "2px solid #f1f5f9" },
  th: { padding: "12px 14px", fontSize: "13px", color: "#64748b", fontWeight: "700" },
  tr: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "14px", fontSize: "14px", color: "#334155" },
  tdBold: { padding: "14px", fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  badgeSuccess: { background: "#dcfce7", color: "#16a34a", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  badgePending: { background: "#ffedd5", color: "#ea580c", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  roleBadge: { background: "#eff6ff", color: "#2563eb", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700" },
  approveBtn: { background: "#2563eb", color: "#ffffff", border: "none", padding: "7px 14px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" },
  errorBox: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginBottom: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" },
};