import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";

const ORGAN_OPTIONS = [
  "Kidney",
  "Liver",
  "Heart",
  "Lungs",
  "Pancreas",
  "Cornea"
];

export default function DonorDashboard() {
  const { user, logout } = useAuth();

  const token = user?.token;

  // Support whichever ID format comes from login
  const donorId =
    user?.userId ||
    user?._id ||
    user?.id;

  // =====================================================
  // PLEDGES
  // =====================================================

  const [pledges, setPledges] = useState([]);
  const [loadingPledges, setLoadingPledges] = useState(true);
  const [pledgeError, setPledgeError] = useState(null);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newOrgan, setNewOrgan] = useState("");
  const [savingPledge, setSavingPledge] = useState(false);
  const [addError, setAddError] = useState(null);

  const [revokingId, setRevokingId] = useState(null);

  // =====================================================
  // INCOMING RECIPIENT REQUESTS
  // =====================================================

  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loadingRequests, setLoadingRequests] = useState(true);
  const [requestError, setRequestError] = useState(null);
  const [updatingRequestId, setUpdatingRequestId] = useState(null);

  // =====================================================
  // LOAD DONOR PLEDGES
  // GET /api/pledges/:donorId
  // =====================================================

  const loadPledges = async () => {
    if (!donorId) {
      setLoadingPledges(false);
      return;
    }

    setLoadingPledges(true);
    setPledgeError(null);

    try {
      const data = await authFetch(
        `/pledges/${donorId}`,
        { token }
      );

      setPledges(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load pledges:",
        err
      );

      setPledgeError(
        "Unable to load your pledged organs right now."
      );
    } finally {
      setLoadingPledges(false);
    }
  };

  // =====================================================
  // LOAD INCOMING RECIPIENT REQUESTS
  // GET /api/donor/:donorId/requests
  // =====================================================

  const loadIncomingRequests = async () => {
    if (!donorId) {
      setLoadingRequests(false);
      return;
    }

    setLoadingRequests(true);
    setRequestError(null);

    try {
      const data = await authFetch(
        `/donor/${donorId}/requests`,
        { token }
      );

      setIncomingRequests(
        Array.isArray(data) ? data : []
      );
    } catch (err) {
      console.error(
        "Failed to load recipient requests:",
        err
      );

      setRequestError(
        "Unable to load incoming recipient requests."
      );
    } finally {
      setLoadingRequests(false);
    }
  };

  // =====================================================
  // INITIAL LOAD
  // =====================================================

  useEffect(() => {
    if (!donorId) return;

    loadPledges();
    loadIncomingRequests();

  }, [donorId]);

  // =====================================================
  // CREATE PLEDGE
  // POST /api/pledges/:donorId
  // =====================================================

  const submitPledge = async () => {
    if (!newOrgan) {
      setAddError(
        "Please select an organ to pledge."
      );
      return;
    }

    if (!donorId) {
      setAddError(
        "Donor ID is missing. Please login again."
      );
      return;
    }

    setSavingPledge(true);
    setAddError(null);

    try {
      const created = await authFetch(
        `/pledges/${donorId}`,
        {
          method: "POST",
          token,
          body: {
            organ: newOrgan
          }
        }
      );

      // Reload from MongoDB instead of creating
      // a fake/local pledge object.
      await loadPledges();

      setShowAddModal(false);
      setNewOrgan("");

      console.log(
        "Pledge created:",
        created
      );
    } catch (err) {
      console.error(
        "Failed to add pledge:",
        err
      );

      setAddError(
        err.message ||
        "Could not save this pledge."
      );
    } finally {
      setSavingPledge(false);
    }
  };

  // =====================================================
  // WITHDRAW PLEDGE
  // DELETE /api/pledges/:donorId/:pledgeId
  // =====================================================

  const revokePledge = async (pledgeId) => {
    const confirmed = window.confirm(
      "Withdraw this organ pledge?"
    );

    if (!confirmed) return;

    try {
      setRevokingId(pledgeId);

      await authFetch(
        `/pledges/${donorId}/${pledgeId}`,
        {
          method: "DELETE",
          token
        }
      );

      setPledges((previous) =>
        previous.filter(
          (pledge) =>
            pledge.id !== pledgeId
        )
      );
    } catch (err) {
      console.error(
        "Failed to revoke pledge:",
        err
      );

      alert(
        err.message ||
        "Could not withdraw this pledge."
      );
    } finally {
      setRevokingId(null);
    }
  };

  // =====================================================
  // DONOR ACCEPT / REJECT RECIPIENT REQUEST
  // PATCH /api/requests/:requestId/status
  // =====================================================

  const updateIncomingRequest = async (
    requestId,
    status
  ) => {
    try {
      setUpdatingRequestId(requestId);

      await authFetch(
        `/requests/${requestId}/status`,
        {
          method: "PATCH",
          token,
          body: {
            status
          }
        }
      );

      setIncomingRequests((previous) =>
        previous.map((request) =>
          request.id === requestId
            ? {
                ...request,
                status
              }
            : request
        )
      );

      // Accepted request may also change pledge status,
      // so refresh pledges from MongoDB.
      await loadPledges();

    } catch (err) {
      console.error(
        "Request update failed:",
        err
      );

      alert(
        err.message ||
        "Unable to update this request."
      );
    } finally {
      setUpdatingRequestId(null);
    }
  };

  // =====================================================
  // HELPER
  // =====================================================

  const pendingRequestCount =
    incomingRequests.filter(
      (request) =>
        request.status === "Pending"
    ).length;

  // =====================================================
  // UI
  // =====================================================

  return (
    <div style={styles.page}>

      {/* ================= HEADER ================= */}

      <header style={styles.topbar}>
        <div style={styles.brand}>
          <div style={styles.logoBadge}>
            ♥
          </div>

          <div>
            <h2 style={styles.brandTitle}>
              OrganSync
            </h2>

            <span style={styles.brandSub}>
              Donor Health Portal
            </span>
          </div>
        </div>

        <div style={styles.userSection}>
          <div style={styles.userInfo}>
            <span style={styles.userName}>
              {user?.fullName ||
                "Registered Donor"}
            </span>

            <span style={styles.userRole}>
              Verified Life Donor
            </span>
          </div>

          <button
            onClick={logout}
            style={styles.logoutBtn}
          >
            Logout ↪
          </button>
        </div>
      </header>

      <main style={styles.container}>

        {/* ================= WELCOME ================= */}

        <div style={styles.welcomeBanner}>
          <div>
            <h1 style={styles.welcomeTitle}>
              Welcome back,{" "}
              {user?.fullName || "Donor"} 👋
            </h1>

            <p style={styles.welcomeText}>
              Manage your organ pledges and
              review compatible recipient
              requests through OrganSync.
            </p>
          </div>

          <div style={styles.pledgeBadge}>
            <span
              style={{ fontSize: "24px" }}
            >
              🎖️
            </span>

            <div>
              <strong
                style={{
                  display: "block",
                  color: "#1e3a8a"
                }}
              >
                Universal Donor ID
              </strong>

              <span
                style={{
                  fontSize: "13px",
                  color: "#475569"
                }}
              >
                #
                {donorId
                  ? String(donorId)
                      .slice(-6)
                      .toUpperCase()
                  : "NOT-AVAILABLE"}
              </span>
            </div>
          </div>
        </div>

        {/* ================= STATS ================= */}

        <div style={styles.grid4}>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              🫀
            </div>

            <div>
              <span style={styles.statLabel}>
                Organs Pledged
              </span>

              <h3 style={styles.statValue}>
                {loadingPledges
                  ? "…"
                  : `${pledges.length} Registered`}
              </h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              📩
            </div>

            <div>
              <span style={styles.statLabel}>
                Recipient Requests
              </span>

              <h3
                style={{
                  ...styles.statValue,
                  color:
                    pendingRequestCount > 0
                      ? "#ea580c"
                      : "#16a34a"
                }}
              >
                {loadingRequests
                  ? "…"
                  : `${pendingRequestCount} Pending`}
              </h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              🩺
            </div>

            <div>
              <span style={styles.statLabel}>
                Medical Screening
              </span>

              <h3
                style={{
                  ...styles.statValue,
                  color: "#16a34a"
                }}
              >
                Verified Fit
              </h3>
            </div>
          </div>

          <div style={styles.statCard}>
            <div style={styles.statIconBox}>
              📜
            </div>

            <div>
              <span style={styles.statLabel}>
                Digital Consent
              </span>

              <h3
                style={{
                  ...styles.statValue,
                  color: "#2563eb"
                }}
              >
                Signed & Legal
              </h3>
            </div>
          </div>
        </div>

        {/* =================================================
            PLEDGES + DONOR CARD
        ================================================= */}

        <div style={styles.contentLayout}>

          {/* PLEDGES */}

          <div style={styles.tableCard}>
            <div style={styles.cardHeader}>
              <h3 style={styles.cardHeading}>
                My Pledged Organs
              </h3>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px"
                }}
              >
                <span style={styles.activePills}>
                  {pledges.length} Registered
                </span>

                <button
                  style={styles.addBtn}
                  onClick={() => {
                    setAddError(null);
                    setShowAddModal(true);
                  }}
                >
                  + Pledge Organ
                </button>
              </div>
            </div>

            {pledgeError && (
              <div style={styles.errorBox}>
                ⚠️ {pledgeError}
              </div>
            )}

            {loadingPledges ? (
              <p
                style={{
                  color: "#64748b",
                  padding: "20px 0"
                }}
              >
                Loading your pledges...
              </p>
            ) : pledges.length === 0 ? (
              <div style={styles.emptyState}>
                <span
                  style={{ fontSize: "32px" }}
                >
                  🫀
                </span>

                <h3>
                  No organs pledged yet
                </h3>

                <p>
                  Select "Pledge Organ" to
                  register an organ.
                </p>
              </div>
            ) : (
              <div style={styles.tableWrapper}>
                <table style={styles.table}>
                  <thead>
                    <tr style={styles.thRow}>
                      <th style={styles.th}>
                        Organ
                      </th>

                      <th style={styles.th}>
                        Registration Date
                      </th>

                      <th style={styles.th}>
                        Status
                      </th>

                      <th style={styles.th}>
                        Action
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {pledges.map((item) => (
                      <tr
                        key={item.id}
                        style={styles.tr}
                      >
                        <td style={styles.tdBold}>
                          {item.organ}
                        </td>

                        <td style={styles.td}>
                          {item.pledgeDate}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={
                              item.status ===
                              "Active & Pledged"
                                ? styles.badgeActive
                                : styles.badgeSuccess
                            }
                          >
                            {item.status}
                          </span>
                        </td>

                        <td style={styles.td}>
                          <button
                            style={
                              styles.revokeBtn
                            }
                            onClick={() =>
                              revokePledge(
                                item.id
                              )
                            }
                            disabled={
                              revokingId ===
                              item.id
                            }
                          >
                            {revokingId ===
                            item.id
                              ? "Withdrawing..."
                              : "Withdraw"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* DONOR CARD */}

          <div style={styles.idCardBox}>
            <div
              style={styles.donorIdHeader}
            >
              <span
                style={{
                  fontWeight: "800",
                  letterSpacing: "1px"
                }}
              >
                ORGAN DONOR CARD
              </span>

              <span
                style={{ fontSize: "18px" }}
              >
                ♥
              </span>
            </div>

            <div style={styles.donorIdBody}>
              <div
                style={styles.donorAvatar}
              >
                {(user?.fullName || "D")
                  .charAt(0)
                  .toUpperCase()}
              </div>

              <div
                style={styles.donorDetails}
              >
                <h4
                  style={{
                    margin: 0,
                    fontSize: "16px",
                    color: "#0f172a"
                  }}
                >
                  {user?.fullName ||
                    "Registered Donor"}
                </h4>

                <p
                  style={{
                    margin: "2px 0 8px",
                    fontSize: "12px",
                    color: "#64748b"
                  }}
                >
                  {user?.email}
                </p>

                <span
                  style={styles.roleTag}
                >
                  Certified Organ Donor
                </span>
              </div>
            </div>

            <div
              style={styles.donorIdFooter}
            >
              <div>
                <small
                  style={{
                    color: "#64748b",
                    display: "block"
                  }}
                >
                  Blood Type
                </small>

                <strong>
                  {user?.bloodGroup ||
                    "Not Specified"}
                </strong>
              </div>

              <div>
                <small
                  style={{
                    color: "#64748b",
                    display: "block"
                  }}
                >
                  Donor ID
                </small>

                <strong>
                  {donorId
                    ? String(donorId)
                        .slice(-6)
                        .toUpperCase()
                    : "—"}
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* =================================================
            INCOMING RECIPIENT REQUESTS
        ================================================= */}

        <div
          style={{
            ...styles.tableCard,
            marginTop: "28px"
          }}
        >
          <div style={styles.cardHeader}>
            <div>
              <h3
                style={styles.cardHeading}
              >
                📩 Incoming Recipient Requests
              </h3>

              <p
                style={{
                  color: "#64748b",
                  fontSize: "13px",
                  margin: "5px 0 0"
                }}
              >
                Review requests matched to
                your pledged organs.
              </p>
            </div>

            <span
              style={
                pendingRequestCount > 0
                  ? styles.pendingPill
                  : styles.activePills
              }
            >
              {pendingRequestCount} Pending
            </span>
          </div>

          {requestError && (
            <div style={styles.errorBox}>
              ⚠️ {requestError}
            </div>
          )}

          {loadingRequests ? (
            <p
              style={{
                color: "#64748b",
                padding: "20px 0"
              }}
            >
              Loading recipient requests...
            </p>
          ) : incomingRequests.length ===
            0 ? (
            <div style={styles.emptyState}>
              <span
                style={{ fontSize: "36px" }}
              >
                📭
              </span>

              <h3>
                No incoming requests
              </h3>

              <p>
                A compatible recipient request
                will appear here after matching.
              </p>
            </div>
          ) : (
            <div style={styles.tableWrapper}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.thRow}>
                    <th style={styles.th}>
                      Recipient
                    </th>

                    <th style={styles.th}>
                      Organ
                    </th>

                    <th style={styles.th}>
                      Blood Group
                    </th>

                    <th style={styles.th}>
                      Hospital
                    </th>

                    <th style={styles.th}>
                      Status
                    </th>

                    <th style={styles.th}>
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {incomingRequests.map(
                    (request) => (
                      <tr
                        key={request.id}
                        style={styles.tr}
                      >
                        <td
                          style={
                            styles.tdBold
                          }
                        >
                          {request.recipientName ||
                            request
                              .recipientId
                              ?.fullName ||
                            "Recipient"}
                        </td>

                        <td style={styles.td}>
                          {request.organ}
                        </td>

                        <td style={styles.td}>
                          {request.bloodGroup}
                        </td>

                        <td style={styles.td}>
                          {request.hospital ||
                            "Assigned Hospital"}
                        </td>

                        <td style={styles.td}>
                          <span
                            style={
                              request.status ===
                              "Accepted"
                                ? styles.badgeSuccess
                                : request.status ===
                                  "Rejected"
                                ? styles.badgeRejected
                                : styles.badgePending
                            }
                          >
                            {request.status ||
                              "Pending"}
                          </span>
                        </td>

                        <td style={styles.td}>
                          {request.status ===
                          "Pending" ? (
                            <div
                              style={{
                                display:
                                  "flex",
                                gap: "8px",
                                flexWrap:
                                  "wrap"
                              }}
                            >
                              <button
                                style={
                                  styles.acceptBtn
                                }
                                disabled={
                                  updatingRequestId ===
                                  request.id
                                }
                                onClick={() =>
                                  updateIncomingRequest(
                                    request.id,
                                    "Accepted"
                                  )
                                }
                              >
                                {updatingRequestId ===
                                request.id
                                  ? "Processing..."
                                  : "✓ Accept"}
                              </button>

                              <button
                                style={
                                  styles.rejectBtn
                                }
                                disabled={
                                  updatingRequestId ===
                                  request.id
                                }
                                onClick={() =>
                                  updateIncomingRequest(
                                    request.id,
                                    "Rejected"
                                  )
                                }
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span
                              style={{
                                color:
                                  "#64748b",
                                fontSize:
                                  "12px"
                              }}
                            >
                              Decision completed
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* =================================================
          ADD PLEDGE MODAL
      ================================================= */}

      {showAddModal && (
        <div
          style={styles.modalOverlay}
          onClick={() =>
            !savingPledge &&
            setShowAddModal(false)
          }
        >
          <div
            style={styles.modalBox}
            onClick={(e) =>
              e.stopPropagation()
            }
          >
            <h3
              style={{
                margin: "0 0 4px"
              }}
            >
              Pledge an Organ
            </h3>

            <p
              style={{
                margin: "0 0 16px",
                fontSize: "13px",
                color: "#64748b"
              }}
            >
              Register an available organ
              pledge with OrganSync.
            </p>

            <label style={styles.label}>
              Organ
            </label>

            <select
              value={newOrgan}
              onChange={(e) =>
                setNewOrgan(
                  e.target.value
                )
              }
              style={styles.select}
            >
              <option value="">
                Select an organ
              </option>

              {ORGAN_OPTIONS.map(
                (organName) => (
                  <option
                    key={organName}
                    value={organName}
                  >
                    {organName}
                  </option>
                )
              )}
            </select>

            {addError && (
              <div
                style={{
                  ...styles.errorBox,
                  marginTop: "12px"
                }}
              >
                ⚠️ {addError}
              </div>
            )}

            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-end",
                gap: "10px",
                marginTop: "20px"
              }}
            >
              <button
                style={styles.cancelBtn}
                onClick={() =>
                  setShowAddModal(false)
                }
                disabled={savingPledge}
              >
                Cancel
              </button>

              <button
                style={styles.confirmBtn}
                onClick={submitPledge}
                disabled={
                  savingPledge ||
                  !newOrgan
                }
              >
                {savingPledge
                  ? "Saving..."
                  : "Confirm Pledge"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =====================================================
// STYLES
// =====================================================

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily:
      "system-ui, -apple-system, sans-serif",
    color: "#0f172a"
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#ffffff",
    padding: "16px 36px",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 10
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px"
  },

  logoBadge: {
    background: "#fee2e2",
    color: "#ef4444",
    fontWeight: "900",
    fontSize: "18px",
    padding: "6px 12px",
    borderRadius: "10px"
  },

  brandTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e3a8a",
    margin: 0
  },

  brandSub: {
    fontSize: "11px",
    color: "#64748b",
    fontWeight: "600"
  },

  userSection: {
    display: "flex",
    alignItems: "center",
    gap: "20px"
  },

  userInfo: {
    textAlign: "right"
  },

  userName: {
    fontWeight: "700",
    fontSize: "14px",
    display: "block"
  },

  userRole: {
    fontSize: "12px",
    color: "#16a34a",
    fontWeight: "600"
  },

  logoutBtn: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    fontSize: "13px"
  },

  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "32px 24px"
  },

  welcomeBanner: {
    background:
      "linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)",
    border: "1px solid #bfdbfe",
    padding: "28px 32px",
    borderRadius: "16px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "20px",
    marginBottom: "28px"
  },

  welcomeTitle: {
    fontSize: "24px",
    fontWeight: "800",
    color: "#1e3a8a",
    margin: "0 0 6px"
  },

  welcomeText: {
    fontSize: "14px",
    color: "#334155",
    margin: 0,
    maxWidth: "680px",
    lineHeight: "1.5"
  },

  pledgeBadge: {
    background: "#ffffff",
    padding: "14px 20px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    gap: "14px",
    border: "1px solid #cbd5e1"
  },

  grid4: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px",
    marginBottom: "28px"
  },

  statCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "20px",
    borderRadius: "14px",
    display: "flex",
    alignItems: "center",
    gap: "16px"
  },

  statIconBox: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    background: "#f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px"
  },

  statLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase"
  },

  statValue: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "4px 0 0"
  },

  contentLayout: {
    display: "grid",
    gridTemplateColumns:
      "minmax(0, 2fr) minmax(280px, 1fr)",
    gap: "24px",
    alignItems: "start"
  },

  tableCard: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    overflow: "hidden"
  },

  tableWrapper: {
    width: "100%",
    overflowX: "auto"
  },

  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px",
    flexWrap: "wrap",
    gap: "12px"
  },

  cardHeading: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
    margin: 0
  },

  activePills: {
    background: "#e0f2fe",
    color: "#0284c7",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  pendingPill: {
    background: "#fef3c7",
    color: "#d97706",
    padding: "4px 12px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  addBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "8px 14px",
    borderRadius: "8px",
    fontWeight: "700",
    fontSize: "12px",
    cursor: "pointer"
  },

  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left"
  },

  thRow: {
    borderBottom:
      "2px solid #f1f5f9"
  },

  th: {
    padding: "12px",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  tr: {
    borderBottom:
      "1px solid #f1f5f9"
  },

  td: {
    padding: "14px 12px",
    fontSize: "14px",
    color: "#334155"
  },

  tdBold: {
    padding: "14px 12px",
    fontSize: "14px",
    fontWeight: "700",
    color: "#1e293b"
  },

  badgeSuccess: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  badgeActive: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  badgePending: {
    background: "#fef3c7",
    color: "#d97706",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  badgeRejected: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700",
    whiteSpace: "nowrap"
  },

  acceptBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "7px 12px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },

  rejectBtn: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    padding: "7px 12px",
    borderRadius: "7px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },

  revokeBtn: {
    background: "#fef2f2",
    color: "#dc2626",
    border: "1px solid #fca5a5",
    padding: "6px 12px",
    borderRadius: "6px",
    fontSize: "12px",
    fontWeight: "700",
    cursor: "pointer"
  },

  idCardBox: {
    background: "#ffffff",
    border: "2px solid #3b82f6",
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow:
      "0 10px 25px rgba(37,99,235,0.08)"
  },

  donorIdHeader: {
    background: "#2563eb",
    color: "#ffffff",
    padding: "14px 18px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: "13px"
  },

  donorIdBody: {
    padding: "20px 18px",
    display: "flex",
    gap: "16px",
    alignItems: "center"
  },

  donorAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "#e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "20px",
    fontWeight: "800",
    color: "#1e3a8a"
  },

  donorDetails: {
    flex: 1
  },

  roleTag: {
    background: "#f0fdf4",
    color: "#16a34a",
    padding: "2px 8px",
    borderRadius: "6px",
    fontSize: "11px",
    fontWeight: "700",
    border: "1px solid #bbf7d0"
  },

  donorIdFooter: {
    padding: "14px 18px",
    background: "#f8fafc",
    borderTop: "1px solid #e2e8f0",
    display: "flex",
    justifyContent: "space-between",
    gap: "12px",
    fontSize: "12px"
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "12px 16px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "13px",
    marginBottom: "12px"
  },

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b"
  },

  modalOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100
  },

  modalBox: {
    background: "#fff",
    borderRadius: "16px",
    padding: "28px",
    width: "380px",
    maxWidth: "90vw",
    boxShadow:
      "0 20px 40px rgba(0,0,0,0.2)"
  },

  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
    display: "block",
    marginBottom: "6px"
  },

  select: {
    width: "100%",
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#f8fafc"
  },

  cancelBtn: {
    background: "#f1f5f9",
    color: "#334155",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  },

  confirmBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    padding: "10px 18px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  }
};