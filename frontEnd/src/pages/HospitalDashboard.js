import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";

// ASSUMED ENDPOINTS — adjust to match your backend if paths differ:
//   GET  /hospitals/:hospitalId/stats                        -> dashboard metric cards
//   POST /match/hospital  body: { organ, bloodGroup }         -> AI compatibility scoring, returns { donorOrganId, matches: [...] }
//   POST /allocations     body: { donorOrganId, recipientId } -> initiates an allocation
//   GET  /hospitals/:hospitalId/operations                    -> scheduled operations table

const ORGANS = ["Kidney", "Liver", "Heart", "Lungs", "Pancreas", "Cornea"];
const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

export default function HospitalDashboard() {
  const { user, logout } = useAuth();
  const token = user?.token;
  const hospitalId = user?.hospitalId || user?.userId;

  // ---- Metric cards ----
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    if (!hospitalId) {
      setLoadingStats(false);
      return;
    }
    authFetch(`/hospitals/${hospitalId}/stats`, { token })
      .then((data) => setStats(data))
      .catch((err) => {
        console.error("Failed to load hospital stats:", err);
        // Leave stats null — cards below fall back to a "—" placeholder,
        // rather than showing invented numbers.
      })
      .finally(() => setLoadingStats(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId]);

  // ---- AI Match ----
  const [organ, setOrgan] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [runningAI, setRunningAI] = useState(false);
  const [matches, setMatches] = useState(null);
  const [matchError, setMatchError] = useState(null);
  const [donorOrganId, setDonorOrganId] = useState(null);

  const handleRunAIMatch = async () => {
    if (!organ || !bloodGroup) {
      alert("Please select an organ and blood group to match against.");
      return;
    }
    setRunningAI(true);
    setMatches(null);
    setMatchError(null);
    try {
      const data = await authFetch("/match/hospital", {
        method: "POST",
        token,
        body: { organ, bloodGroup, hospitalId },
      });
      setMatches(Array.isArray(data?.matches) ? data.matches : []);
      setDonorOrganId(data?.donorOrganId || null);
    } catch (err) {
      console.error("AI match failed:", err);
      setMatchError("Unable to run compatibility scoring right now. Please try again shortly.");
    } finally {
      setRunningAI(false);
    }
  };

  // ---- Allocation ----
  const [allocatingId, setAllocatingId] = useState(null);
  const [allocatedIds, setAllocatedIds] = useState(new Set());

  const initiateAllocation = async (recipientId) => {
    setAllocatingId(recipientId);
    try {
      await authFetch("/allocations", {
        method: "POST",
        token,
        body: { donorOrganId, recipientId },
      });
      setAllocatedIds((prev) => new Set(prev).add(recipientId));
    } catch (err) {
      console.error("Allocation failed:", err);
      alert("Could not initiate allocation right now. Please try again or contact the network coordinator.");
    } finally {
      setAllocatingId(null);
    }
  };

  // ---- Scheduled operations ----
  const [operations, setOperations] = useState([]);
  const [loadingOps, setLoadingOps] = useState(true);
  const [opsError, setOpsError] = useState(null);

  useEffect(() => {
    if (!hospitalId) {
      setLoadingOps(false);
      return;
    }
    authFetch(`/hospitals/${hospitalId}/operations`, { token })
      .then((data) => setOperations(Array.isArray(data) ? data : []))
      .catch((err) => {
        console.error("Failed to load operations:", err);
        setOpsError("Unable to load the operations schedule right now.");
      })
      .finally(() => setLoadingOps(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hospitalId]);

  return (
    <div style={styles.page}>
      <header style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.logoBadge}>🏥</div>
          <div>
            <h2 style={styles.brandTitle}>OrganSync Medical Center</h2>
            <span style={styles.brandSub}>Certified Transplant Unit</span>
          </div>
        </div>

        <div style={styles.userSection}>
          <div style={{ textAlign: "right" }}>
            <span style={styles.userName}>{user?.fullName || "Partner Hospital"}</span>
            <span style={styles.userBadge}>Verified Partner Hospital</span>
          </div>
          <button onClick={logout} style={styles.logoutBtn}>
            Logout ↪
          </button>
        </div>
      </header>

      <main style={styles.container}>
        <div style={styles.grid4}>
          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Active Donor Organs</span>
            <h3 style={{ ...styles.metricVal, color: "#2563eb" }}>
              {loadingStats ? "…" : stats?.activeDonorOrgans != null ? `${stats.activeDonorOrgans} Available` : "—"}
            </h3>
            <small style={styles.metricSub}>Preserved in Cold Storage</small>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Urgent Waitlist</span>
            <h3 style={{ ...styles.metricVal, color: "#ea580c" }}>
              {loadingStats ? "…" : stats?.urgentWaitlist != null ? `${stats.urgentWaitlist} Critical` : "—"}
            </h3>
            <small style={styles.metricSub}>Tier 1 Candidates</small>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Transplants This Month</span>
            <h3 style={{ ...styles.metricVal, color: "#16a34a" }}>
              {loadingStats ? "…" : stats?.transplantsThisMonth != null ? `${stats.transplantsThisMonth} Completed` : "—"}
            </h3>
            <small style={styles.metricSub}>
              {stats?.successRate != null ? `${stats.successRate}% Success Rate` : ""}
            </small>
          </div>

          <div style={styles.metricCard}>
            <span style={styles.metricLabel}>Avg Allocation Time</span>
            <h3 style={styles.metricVal}>
              {loadingStats ? "…" : stats?.avgAllocationMinutes != null ? `${stats.avgAllocationMinutes} Mins` : "—"}
            </h3>
            <small style={styles.metricSub}>Neural Engine Optimized</small>
          </div>
        </div>

        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <div>
              <h2 style={styles.cardTitle}>⚡ AI Organ Allocation & Compatibility Scoring</h2>
              <p style={styles.cardDesc}>Multi-parameter matching (ABO, HLA, Distance & Clinical Urgency).</p>
            </div>
          </div>

          <div style={styles.searchRow}>
            <div style={styles.inputCol}>
              <label style={styles.label}>Donor Organ</label>
              <select value={organ} onChange={(e) => setOrgan(e.target.value)} style={styles.select}>
                <option value="">Select Organ</option>
                {ORGANS.map((o) => (
                  <option key={o} value={o}>{o}</option>
                ))}
              </select>
            </div>
            <div style={styles.inputCol}>
              <label style={styles.label}>Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={styles.select}>
                <option value="">Select Blood Group</option>
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
            <div style={{ alignSelf: "flex-end" }}>
              <button onClick={handleRunAIMatch} disabled={runningAI} style={styles.aiBtn}>
                {runningAI ? "Computing Compatibility Matrix..." : "⚡ Execute AI Match"}
              </button>
            </div>
          </div>

          {matchError && (
            <div style={styles.errorBox}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span>{matchError}</span>
            </div>
          )}

          {matches && matches.length === 0 && !matchError && (
            <div style={{ ...styles.resultBanner, background: "#fef3c7", border: "1px solid #fde68a", color: "#92400e" }}>
              <span>No compatible recipients found for this organ and blood group right now.</span>
            </div>
          )}

          {matches && matches.length > 0 && (
            <div style={{ marginTop: "24px" }}>
              <div style={styles.resultBanner}>
                <span>✅ AI Matching Generated <strong>{matches.length} Compatible Recipients</strong> for {organ} ({bloodGroup})</span>
              </div>

              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>Recipient ID</th>
                    <th style={styles.th}>Patient Name</th>
                    <th style={styles.th}>Blood Group</th>
                    <th style={styles.th}>Compatibility</th>
                    <th style={styles.th}>Urgency</th>
                    <th style={styles.th}>Distance</th>
                    <th style={styles.th}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {matches.map((item) => {
                    const isAllocated = allocatedIds.has(item.id);
                    return (
                      <tr key={item.id} style={styles.tr}>
                        <td style={styles.tdBold}>{item.id}</td>
                        <td style={styles.td}>{item.name}</td>
                        <td style={styles.td}>{item.blood}</td>
                        <td style={styles.td}>
                          <span style={styles.scorePill}>{item.score}</span>
                        </td>
                        <td style={styles.td}>
                          <span style={item.urgency === "Tier 1" ? styles.badgeCrit : styles.badgeWarn}>{item.urgency}</span>
                        </td>
                        <td style={styles.td}>{item.distance}</td>
                        <td style={styles.td}>
                          <button
                            style={{ ...styles.approveBtn, ...(isAllocated ? styles.approveBtnDone : {}) }}
                            onClick={() => initiateAllocation(item.id)}
                            disabled={allocatingId === item.id || isAllocated}
                          >
                            {isAllocated
                              ? "✓ Allocated"
                              : allocatingId === item.id
                                ? "Allocating..."
                                : "Initiate Allocation"}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div style={{ ...styles.card, marginTop: "28px" }}>
          <h3 style={styles.cardTitle}>🏥 Scheduled Hospital Operations</h3>
          <p style={styles.cardDesc}>Transplant team assignments and operating room readiness.</p>

          {loadingOps ? (
            <p style={{ color: "#64748b" }}>Loading schedule...</p>
          ) : opsError ? (
            <div style={styles.errorBox}>
              <span style={{ fontSize: "18px" }}>⚠️</span>
              <span>{opsError}</span>
            </div>
          ) : operations.length === 0 ? (
            <p style={{ color: "#64748b" }}>No operations scheduled.</p>
          ) : (
            <table style={styles.table}>
              <thead>
                <tr style={styles.thRow}>
                  <th style={styles.th}>Patient</th>
                  <th style={styles.th}>Organ Type</th>
                  <th style={styles.th}>Surgeon</th>
                  <th style={styles.th}>Scheduled Time</th>
                  <th style={styles.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {operations.map((op) => (
                  <tr key={op.id} style={styles.tr}>
                    <td style={styles.tdBold}>{op.patient}</td>
                    <td style={styles.td}>{op.organ}</td>
                    <td style={styles.td}>{op.surgeon}</td>
                    <td style={styles.td}>{op.scheduledTime}</td>
                    <td style={styles.td}>
                      <span style={op.status === "OR Ready" ? styles.badgeSuccess : styles.badgeWarn}>{op.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
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
  userBadge: { fontSize: "12px", color: "#2563eb", fontWeight: "600" },
  logoutBtn: { background: "#fee2e2", color: "#dc2626", border: "none", padding: "8px 16px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "13px" },
  container: { maxWidth: "1200px", margin: "0 auto", padding: "32px 24px" },
  grid4: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "28px" },
  metricCard: { background: "#ffffff", border: "1px solid #e2e8f0", padding: "20px", borderRadius: "14px" },
  metricLabel: { fontSize: "12px", color: "#64748b", fontWeight: "700", textTransform: "uppercase" },
  metricVal: { fontSize: "22px", fontWeight: "800", margin: "6px 0 2px" },
  metricSub: { fontSize: "12px", color: "#94a3b8" },
  card: { background: "#ffffff", border: "1px solid #e2e8f0", borderRadius: "16px", padding: "28px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)" },
  cardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" },
  cardTitle: { fontSize: "18px", fontWeight: "800", color: "#1e293b", margin: "0 0 4px" },
  cardDesc: { fontSize: "14px", color: "#64748b", margin: 0 },
  searchRow: { display: "flex", gap: "16px", flexWrap: "wrap", marginTop: "20px", marginBottom: "8px" },
  inputCol: { display: "flex", flexDirection: "column", gap: "6px", flex: 1, minWidth: "200px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#334155" },
  select: { padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e1", fontSize: "14px", background: "#f8fafc" },
  aiBtn: { background: "linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)", color: "#ffffff", border: "none", padding: "12px 24px", borderRadius: "8px", fontWeight: "700", cursor: "pointer", fontSize: "14px", boxShadow: "0 4px 12px rgba(37,99,235,0.2)", height: "42px" },
  errorBox: { background: "#fef2f2", border: "1px solid #fca5a5", color: "#991b1b", padding: "14px 18px", borderRadius: "10px", marginTop: "16px", display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" },
  resultBanner: { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534", padding: "12px 18px", borderRadius: "10px", marginBottom: "16px", fontSize: "14px" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { borderBottom: "2px solid #f1f5f9" },
  th: { padding: "12px 14px", fontSize: "13px", color: "#64748b", fontWeight: "700" },
  tr: { borderBottom: "1px solid #f8fafc" },
  td: { padding: "14px", fontSize: "14px", color: "#334155" },
  tdBold: { padding: "14px", fontSize: "14px", fontWeight: "700", color: "#1e293b" },
  scorePill: { background: "#eff6ff", color: "#2563eb", fontWeight: "800", padding: "4px 10px", borderRadius: "20px", fontSize: "13px" },
  badgeCrit: { background: "#fee2e2", color: "#dc2626", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  badgeWarn: { background: "#fef3c7", color: "#d97706", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  badgeSuccess: { background: "#dcfce7", color: "#16a34a", padding: "4px 10px", borderRadius: "20px", fontSize: "12px", fontWeight: "700" },
  approveBtn: { background: "#16a34a", color: "#ffffff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "700", cursor: "pointer", fontSize: "12px" },
  approveBtnDone: { background: "#94a3b8", cursor: "default" },
};