import React, { useEffect, useState } from "react";
import PortalSidebar from "../components/PortalSidebar";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";
import "./DonorDashboard.css";

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

  const donorId =
    user?.userId ||
    user?._id ||
    user?.id;

  const [activeTab, setActiveTab] =
    useState("dashboard");

  // =============================
  // PLEDGES
  // =============================

  const [pledges, setPledges] =
    useState([]);

  const [
    loadingPledges,
    setLoadingPledges
  ] = useState(true);

  const [
    pledgeError,
    setPledgeError
  ] = useState(null);

  const [
    showAddModal,
    setShowAddModal
  ] = useState(false);

  const [
    newOrgan,
    setNewOrgan
  ] = useState("");

  const [
    savingPledge,
    setSavingPledge
  ] = useState(false);

  const [
    addError,
    setAddError
  ] = useState(null);

  const [
    revokingId,
    setRevokingId
  ] = useState(null);

  // =============================
  // RECIPIENT REQUESTS
  // =============================

  const [
    incomingRequests,
    setIncomingRequests
  ] = useState([]);

  const [
    loadingRequests,
    setLoadingRequests
  ] = useState(true);

  const [
    requestError,
    setRequestError
  ] = useState(null);

  const [
    updatingRequestId,
    setUpdatingRequestId
  ] = useState(null);

  // =============================
  // LOAD PLEDGES
  // =============================

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
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Failed to load pledges:",
        error
      );

      setPledgeError(
        "Unable to load your pledged organs right now."
      );
    } finally {
      setLoadingPledges(false);
    }
  };

  // =============================
  // LOAD REQUESTS
  // =============================

  const loadIncomingRequests =
    async () => {
      if (!donorId) {
        setLoadingRequests(false);
        return;
      }

      setLoadingRequests(true);
      setRequestError(null);

      try {
        const data =
          await authFetch(
            `/donor/${donorId}/requests`,
            { token }
          );

        setIncomingRequests(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Failed to load recipient requests:",
          error
        );

        setRequestError(
          "Unable to load incoming recipient requests."
        );
      } finally {
        setLoadingRequests(false);
      }
    };

  // =============================
  // INITIAL LOAD
  // =============================

  useEffect(() => {
    if (!donorId) return;

    loadPledges();
    loadIncomingRequests();
  }, [donorId]);

  // =============================
  // CREATE PLEDGE
  // =============================

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
      await authFetch(
        `/pledges/${donorId}`,
        {
          method: "POST",
          token,
          body: {
            organ: newOrgan
          }
        }
      );

      await loadPledges();

      setShowAddModal(false);
      setNewOrgan("");
    } catch (error) {
      console.error(
        "Failed to add pledge:",
        error
      );

      setAddError(
        error.message ||
          "Could not save this pledge."
      );
    } finally {
      setSavingPledge(false);
    }
  };

  // =============================
  // WITHDRAW PLEDGE
  // =============================

  const revokePledge =
    async (pledgeId) => {
      const confirmed =
        window.confirm(
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

        await loadPledges();
      } catch (error) {
        console.error(
          "Failed to revoke pledge:",
          error
        );

        alert(
          error.message ||
            "Could not withdraw this pledge."
        );
      } finally {
        setRevokingId(null);
      }
    };

  // =============================
  // ACCEPT / REJECT
  // =============================

  const updateIncomingRequest =
    async (
      requestId,
      status
    ) => {
      try {
        setUpdatingRequestId(
          requestId
        );

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

        setIncomingRequests(
          (previous) =>
            previous.map(
              (request) =>
                request.id ===
                requestId
                  ? {
                      ...request,
                      status
                    }
                  : request
            )
        );

        await loadPledges();
      } catch (error) {
        console.error(
          "Request update failed:",
          error
        );

        alert(
          error.message ||
            "Unable to update this request."
        );
      } finally {
        setUpdatingRequestId(
          null
        );
      }
    };

  // =============================
  // COUNTERS
  // =============================

  const pendingRequestCount =
    incomingRequests.filter(
      (request) =>
        request.status ===
        "Pending"
    ).length;

  const activePledgeCount =
    pledges.filter(
      (pledge) =>
        pledge.status ===
        "Active & Pledged"
    ).length;

  const matchedPledgeCount =
    pledges.filter(
      (pledge) =>
        pledge.status ===
        "Matched - Donor Accepted"
    ).length;

  // =============================
  // STATUS CLASS
  // =============================

  const getRequestStatusClass = (
    status
  ) => {
    if (status === "Accepted") {
      return "donor-badge-success";
    }

    if (status === "Rejected") {
      return "donor-badge-rejected";
    }

    if (status === "Scheduled") {
      return "donor-badge-scheduled";
    }

    return "donor-badge-pending";
  };

  // =============================
  // PLEDGES
  // =============================

  const renderPledges = (
    compact = false
  ) => {
    const visiblePledges =
      compact
        ? pledges.slice(0, 4)
        : pledges;

    return (
      <section className="donor-panel">
        <div className="donor-panel-header">
          <div>
            <h2 className="donor-panel-title">
              🫀 My Pledged Organs
            </h2>

            {!compact && (
              <p className="donor-panel-description">
                Manage organs registered
                for recipient matching.
              </p>
            )}
          </div>

          <div className="donor-header-actions">
            <span className="donor-blue-pill">
              {pledges.length} Registered
            </span>

            <button
              className="donor-primary-btn"
              onClick={() => {
                setAddError(null);
                setNewOrgan("");
                setShowAddModal(true);
              }}
            >
              + Pledge Organ
            </button>
          </div>
        </div>

        {pledgeError && (
          <div className="donor-error-box">
            ⚠️ {pledgeError}
          </div>
        )}

        {loadingPledges ? (
          <p className="donor-muted">
            Loading pledged organs...
          </p>
        ) : visiblePledges.length ===
          0 ? (
          <EmptyState
            icon="🫀"
            title="No organs pledged"
            text="Select Pledge Organ to register an available organ."
          />
        ) : (
          <div className="donor-table-wrapper">
            <table className="donor-table">
              <thead>
                <tr>
                  <th>
                    Organ
                  </th>

                  <th>
                    Registration Date
                  </th>

                  <th>
                    Status
                  </th>

                  {!compact && (
                    <th>
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {visiblePledges.map(
                  (pledge) => (
                    <tr
                      key={pledge.id}
                    >
                      <td className="donor-td-bold">
                        {pledge.organ}
                      </td>

                      <td>
                        {
                          pledge.pledgeDate
                        }
                      </td>

                      <td>
                        <span
                          className={
                            pledge.status ===
                            "Active & Pledged"
                              ? "donor-badge-active"
                              : "donor-badge-success"
                          }
                        >
                          {pledge.status}
                        </span>
                      </td>

                      {!compact && (
                        <td>
                          <button
                            className="donor-withdraw-btn"
                            disabled={
                              revokingId ===
                              pledge.id
                            }
                            onClick={() =>
                              revokePledge(
                                pledge.id
                              )
                            }
                          >
                            {revokingId ===
                            pledge.id
                              ? "Withdrawing..."
                              : "Withdraw"}
                          </button>
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {compact &&
          pledges.length > 4 && (
            <button
              className="donor-link-btn"
              onClick={() =>
                setActiveTab(
                  "pledges"
                )
              }
            >
              View all pledges →
            </button>
          )}
      </section>
    );
  };

  // =============================
  // REQUESTS
  // =============================

  const renderRequests = (
    compact = false
  ) => {
    const visibleRequests =
      compact
        ? incomingRequests.slice(
            0,
            4
          )
        : incomingRequests;

    return (
      <section className="donor-panel">
        <div className="donor-panel-header">
          <div>
            <h2 className="donor-panel-title">
              📩 Recipient Requests
            </h2>

            {!compact && (
              <p className="donor-panel-description">
                Review compatible
                recipient requests sent
                to your pledged organs.
              </p>
            )}
          </div>

          <span
            className={
              pendingRequestCount > 0
                ? "donor-pending-pill"
                : "donor-green-pill"
            }
          >
            {pendingRequestCount} Pending
          </span>
        </div>

        {requestError && (
          <div className="donor-error-box">
            ⚠️ {requestError}
          </div>
        )}

        {loadingRequests ? (
          <p className="donor-muted">
            Loading recipient requests...
          </p>
        ) : visibleRequests.length ===
          0 ? (
          <EmptyState
            icon="📭"
            title="No incoming requests"
            text="Compatible recipient requests will appear here after matching."
          />
        ) : (
          <div className="donor-table-wrapper">
            <table className="donor-table">
              <thead>
                <tr>
                  <th>
                    Recipient
                  </th>

                  <th>
                    Organ
                  </th>

                  <th>
                    Blood Group
                  </th>

                  <th>
                    Hospital
                  </th>

                  <th>
                    Status
                  </th>

                  {!compact && (
                    <th>
                      Action
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {visibleRequests.map(
                  (request) => (
                    <tr
                      key={request.id}
                    >
                      <td className="donor-td-bold">
                        {request.recipientName ||
                          request
                            .recipientId
                            ?.fullName ||
                          "Recipient"}
                      </td>

                      <td>
                        {request.organ}
                      </td>

                      <td>
                        {
                          request.bloodGroup
                        }
                      </td>

                      <td>
                        {request.hospital ||
                          "Assigned Hospital"}
                      </td>

                      <td>
                        <span
                          className={getRequestStatusClass(
                            request.status
                          )}
                        >
                          {request.status ||
                            "Pending"}
                        </span>
                      </td>

                      {!compact && (
                        <td>
                          {request.status ===
                          "Pending" ? (
                            <div className="donor-action-row">
                              <button
                                className="donor-accept-btn"
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
                                className="donor-reject-btn"
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
                            <span className="donor-small-muted">
                              Decision completed
                            </span>
                          )}
                        </td>
                      )}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {compact &&
          incomingRequests.length >
            4 && (
            <button
              className="donor-link-btn"
              onClick={() =>
                setActiveTab(
                  "requests"
                )
              }
            >
              View all requests →
            </button>
          )}
      </section>
    );
  };

  // =============================
  // PROFILE
  // =============================

  const renderProfile = () => (
    <section className="donor-panel">
      <div className="donor-page-heading">
        <h1>
          Donor Profile
        </h1>

        <p>
          Your OrganSync donor
          registration information.
        </p>
      </div>

      <div className="donor-profile-grid">
        <ProfileItem
          label="Full Name"
          value={
            user?.fullName ||
            "Not specified"
          }
        />

        <ProfileItem
          label="Email"
          value={
            user?.email ||
            "Not specified"
          }
        />

        <ProfileItem
          label="Blood Group"
          value={
            user?.bloodGroup ||
            "Not specified"
          }
        />

        <ProfileItem
          label="Role"
          value="Certified Organ Donor"
        />

        <ProfileItem
          label="Registered Pledges"
          value={pledges.length}
        />

        <ProfileItem
          label="Donor ID"
          value={
            donorId
              ? String(donorId)
                  .slice(-6)
                  .toUpperCase()
              : "—"
          }
        />
      </div>
    </section>
  );

  // =============================
  // DASHBOARD
  // =============================

  const renderDashboard = () => (
    <>
      <section className="donor-welcome-banner">
        <div>
          <h1 className="donor-welcome-title">
            Welcome back,{" "}
            {user?.fullName ||
              "Donor"}{" "}
            👋
          </h1>

          <p className="donor-welcome-text">
            Manage your organ pledges
            and review compatible
            recipient requests through
            OrganSync.
          </p>
        </div>

        <div className="donor-id-badge">
          <span className="donor-id-icon">
            🎖️
          </span>

          <div>
            <small className="donor-small-muted donor-block">
              Universal Donor ID
            </small>

            <strong className="donor-block">
              #
              {donorId
                ? String(donorId)
                    .slice(-6)
                    .toUpperCase()
                : "N/A"}
            </strong>
          </div>
        </div>
      </section>

      <div className="donor-stats-grid">
        <StatCard
          icon="🫀"
          label="Organs Pledged"
          value={
            loadingPledges
              ? "..."
              : `${pledges.length} Registered`
          }
        />

        <StatCard
          icon="✅"
          label="Available Pledges"
          value={
            loadingPledges
              ? "..."
              : `${activePledgeCount} Active`
          }
          variant="success"
        />

        <StatCard
          icon="📩"
          label="Recipient Requests"
          value={
            loadingRequests
              ? "..."
              : `${pendingRequestCount} Pending`
          }
          variant={
            pendingRequestCount >
            0
              ? "warning"
              : "success"
          }
        />

        <StatCard
          icon="🤝"
          label="Matched Pledges"
          value={
            loadingPledges
              ? "..."
              : `${matchedPledgeCount} Matched`
          }
          variant="primary"
        />
      </div>

      <div className="donor-dashboard-grid">
        {renderPledges(true)}

        <section className="donor-id-card">
          <div className="donor-id-card-header">
            <span>
              ORGAN DONOR CARD
            </span>

            <span>
              ♥
            </span>
          </div>

          <div className="donor-id-card-body">
            <div className="donor-avatar">
              {(user?.fullName ||
                "D")
                .charAt(0)
                .toUpperCase()}
            </div>

            <div className="donor-id-card-details">
              <h3>
                {user?.fullName ||
                  "Registered Donor"}
              </h3>

              <p className="donor-small-muted">
                {user?.email}
              </p>

              <span className="donor-green-pill">
                Certified Organ Donor
              </span>
            </div>
          </div>

          <div className="donor-id-card-footer">
            <div>
              <small className="donor-small-muted donor-block">
                Blood Type
              </small>

              <strong className="donor-block">
                {user?.bloodGroup ||
                  "Not Specified"}
              </strong>
            </div>

            <div className="donor-align-right">
              <small className="donor-small-muted donor-block">
                Donor ID
              </small>

              <strong className="donor-block">
                {donorId
                  ? String(donorId)
                      .slice(-6)
                      .toUpperCase()
                  : "—"}
              </strong>
            </div>
          </div>
        </section>
      </div>

      <div className="donor-section-spacing">
        {renderRequests(true)}
      </div>
    </>
  );

  // =============================
  // MAIN
  // =============================

  return (
    <div className="donor-layout">
      <PortalSidebar
        portal="donor"
        activeTab={activeTab}
        setActiveTab={
          setActiveTab
        }
        logout={logout}
      />

      <main className="donor-main">
        {activeTab ===
          "dashboard" &&
          renderDashboard()}

        {activeTab ===
          "profile" &&
          renderProfile()}

        {activeTab ===
          "pledges" &&
          renderPledges(false)}

        {activeTab ===
          "requests" &&
          renderRequests(false)}
      </main>

      {showAddModal && (
        <div
          className="donor-modal-overlay"
          onClick={() =>
            !savingPledge &&
            setShowAddModal(false)
          }
        >
          <div
            className="donor-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2 className="donor-modal-title">
              Pledge an Organ
            </h2>

            <p className="donor-panel-description">
              Register an available
              organ pledge with
              OrganSync.
            </p>

            <label className="donor-label">
              Organ
            </label>

            <select
              value={newOrgan}
              onChange={(event) =>
                setNewOrgan(
                  event.target.value
                )
              }
              className="donor-input"
            >
              <option value="">
                Select an organ
              </option>

              {ORGAN_OPTIONS.map(
                (organName) => (
                  <option
                    value={organName}
                    key={organName}
                  >
                    {organName}
                  </option>
                )
              )}
            </select>

            {addError && (
              <div className="donor-error-box">
                ⚠️ {addError}
              </div>
            )}

            <div className="donor-modal-actions">
              <button
                className="donor-secondary-btn"
                disabled={
                  savingPledge
                }
                onClick={() =>
                  setShowAddModal(
                    false
                  )
                }
              >
                Cancel
              </button>

              <button
                className="donor-primary-btn"
                disabled={
                  savingPledge ||
                  !newOrgan
                }
                onClick={
                  submitPledge
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

// =============================
// HELPER COMPONENTS
// =============================

function StatCard({
  icon,
  label,
  value,
  variant = ""
}) {
  return (
    <div className="donor-stat-card">
      <div className="donor-stat-icon">
        {icon}
      </div>

      <div>
        <span className="donor-stat-label">
          {label}
        </span>

        <h3
          className={`donor-stat-value ${
            variant
              ? `donor-stat-${variant}`
              : ""
          }`}
        >
          {value}
        </h3>
      </div>
    </div>
  );
}

function ProfileItem({
  label,
  value
}) {
  return (
    <div className="donor-profile-item">
      <small className="donor-small-muted">
        {label}
      </small>

      <strong className="donor-profile-value">
        {value}
      </strong>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text
}) {
  return (
    <div className="donor-empty-state">
      <span className="donor-empty-icon">
        {icon}
      </span>

      <h3>
        {title}
      </h3>

      <p>
        {text}
      </p>
    </div>
  );
}