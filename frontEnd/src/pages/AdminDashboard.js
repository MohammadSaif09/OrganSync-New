import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";
import "./AdminDashboard.css";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const token = user?.token;
  const [activeTab, setActiveTab] = useState("dashboard");

  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [cases, setCases] = useState([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [actionId, setActionId] = useState(null);

  const loadStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await authFetch("/admin/stats", { token });
      setStats(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load dashboard statistics.");
    } finally {
      setLoading(false);
    }
  }, [token]);

const [selectedHospital, setSelectedHospital] = useState(null);
const [showAddUser, setShowAddUser] = useState(false);
const [selectedCase, setSelectedCase] = useState(null);
const [recentActivity, setRecentActivity] = useState([]);

const [auditLogs, setAuditLogs] = useState([]);
const [auditSearch, setAuditSearch] = useState("");
const [auditFilter, setAuditFilter] = useState("ALL");

const loadRecentActivity = useCallback(async () => {
  try {
    const logs = await authFetch(
      "/admin/audit-logs",
      { token }
    );

    const formattedLogs = (logs || []).map((log) => ({
      id: log._id,

      type:
        log.entityType === "Hospital"
          ? "hospital"
          : log.entityType === "OrganRequest"
          ? "case"
          : "user",

      title: log.message,

      description: `${(log.action || "")
        .replaceAll("_", " ")} • ${log.actorName || "System"}`,

      date: log.createdAt
    }));

    setRecentActivity(
      formattedLogs.slice(0, 8)
    );

  } catch (error) {
    console.error(
      "Recent Activity Error:",
      error
    );

    setRecentActivity([]);
  }
}, [token]);


const [newUser, setNewUser] = useState({
  role: "donor",
  fullName: "",
  email: "",
  phone: "",
  password: "",
  bloodGroup: "",
  organ: "",
  license: ""
});

const [creatingUser, setCreatingUser] = useState(false);

  const loadUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await authFetch("/admin/users", { token });
      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadHospitals = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await authFetch("/admin/hospitals", { token });
      setHospitals(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load hospitals.");
    } finally {
      setLoading(false);
    }
  }, [token]);

  const loadAuditLogs = useCallback(async () => {
  try {
    setLoading(true);
    setError("");

    const data = await authFetch(
      "/admin/audit-logs",
      { token }
    );

    setAuditLogs(
      Array.isArray(data) ? data : []
    );

  } catch (err) {
    console.error(
      "Load Audit Logs Error:",
      err
    );

    setError(
      err.message ||
      "Unable to load audit logs."
    );
  } finally {
    setLoading(false);
  }
}, [token]);

  const loadCases = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const data = await authFetch("/admin/cases", { token });
      setCases(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError(err.message || "Unable to load transplant cases.");
    } finally {
      setLoading(false);
    }
  }, [token]);

useEffect(() => {
  if (activeTab === "dashboard") {
    loadStats();
    loadRecentActivity();
  }

  if (activeTab === "users") {
    loadUsers();
  }

  if (activeTab === "hospitals") {
    loadHospitals();
  }

  if (activeTab === "cases") {
    loadCases();
  }
  if (activeTab === "audit") {
  loadAuditLogs();
}
}, [
  activeTab,
  loadStats,
  loadUsers,
  loadHospitals,
  loadCases,
  loadRecentActivity,
  loadAuditLogs
]);

  const handleCreateUser = async (e) => {
  e.preventDefault();

  try {
    setCreatingUser(true);

    await authFetch("/admin/users", {
      method: "POST",
      token,
      body: newUser
    });

    setShowAddUser(false);

    setNewUser({
      role: "donor",
      fullName: "",
      email: "",
      phone: "",
      password: "",
      bloodGroup: "",
      organ: "",
      license: ""
    });

    await loadUsers();

  } catch (err) {
    alert(err.message || "Unable to create user.");
  } finally {
    setCreatingUser(false);
  }
};

  const updateUserStatus = async (userId, status) => {
    try {
      setActionId(userId);

      await authFetch(`/admin/users/${userId}/status`, {
        method: "PATCH",
        token,
        body: { status },
      });

      setUsers((prev) =>
        prev.map((u) =>
          u._id === userId
            ? { ...u, accountStatus: status }
            : u
        )
      );
    } catch (err) {
      alert(err.message || "Unable to update user status.");
    } finally {
      setActionId(null);
    }
  };

  const handleDeleteUser = async (userId, name) => {
  const confirmed = window.confirm(
    `Delete ${name}? This action cannot be undone.`
  );

  if (!confirmed) return;

  try {
    setActionId(userId);

    await authFetch(`/admin/users/${userId}`, {
      method: "DELETE",
      token
    });

    setUsers((prev) =>
      prev.filter((u) => u._id !== userId)
    );

  } catch (err) {
    alert(err.message || "Unable to delete user.");
  } finally {
    setActionId(null);
  }
};

  const updateHospitalVerification = async (hospitalId, status) => {
    try {
      setActionId(hospitalId);

      await authFetch(
        `/admin/hospitals/${hospitalId}/verification`,
        {
          method: "PATCH",
          token,
          body: { status },
        }
      );

      setHospitals((prev) =>
        prev.map((h) =>
          h.id === hospitalId
            ? { ...h, verificationState: status }
            : h
        )
      );
    } catch (err) {
      alert(err.message || "Unable to update hospital verification.");
    } finally {
      setActionId(null);
    }
  };

const adminUsers = users.filter(
  (u) => (u.role || "").toLowerCase() === "admin"
);

const normalUsers = users.filter(
  (u) => (u.role || "").toLowerCase() !== "admin"
);

const filteredUsers = normalUsers.filter((u) => {
  const value = search.toLowerCase();

  return (
    (u.fullName || "").toLowerCase().includes(value) ||
    (u.email || "").toLowerCase().includes(value) ||
    (u.role || "").toLowerCase().includes(value)
  );
});

  const renderDashboard = () => {
    if (loading && !stats) {
      return <div className="admin-empty">Loading dashboard...</div>;
    }

    return (
      <>
        <div className="admin-page-heading">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Platform operations and governance overview.</p>
          </div>

          <button className="admin-refresh" onClick={() => {
              loadStats();
              loadRecentActivity();
            }}>
            Refresh
          </button>
        </div>

        {error && <div className="admin-error">{error}</div>}

        <div className="admin-stat-grid">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers ?? 0}
            subtitle="All platform accounts"
            icon="👥"
          />

          <StatCard
            title="Donors"
            value={stats?.donors ?? 0}
            subtitle="Registered donor accounts"
            icon="🫀"
          />

          <StatCard
            title="Recipients"
            value={stats?.recipients ?? 0}
            subtitle="Registered recipients"
            icon="🧑‍⚕️"
          />

          <StatCard
            title="Hospitals"
            value={stats?.hospitals ?? 0}
            subtitle="Partner hospitals"
            icon="🏥"
          />

          <StatCard
            title="Active Pledges"
            value={stats?.activePledges ?? 0}
            subtitle="Available donor pledges"
            icon="🤝"
          />

          <StatCard
            title="Pending Requests"
            value={stats?.pendingRequests ?? 0}
            subtitle="Waiting for donor action"
            icon="📨"
          />

          <StatCard
            title="Active Cases"
            value={stats?.acceptedCases ?? 0}
            subtitle="Accepted or scheduled cases"
            icon="📋"
          />

          <StatCard
            title="Appointments"
            value={stats?.appointments ?? 0}
            subtitle="Created appointments"
            icon="📅"
          />
        </div>

        <div className="admin-info-card">
          <h3>Pending Administrative Actions</h3>

          <div className="admin-action-row">
            <span>Hospital verifications pending</span>
            <strong>{stats?.pendingHospitals ?? 0}</strong>
          </div>

          <div className="admin-action-row">
            <span>Total allocations created</span>
            <strong>{stats?.allocations ?? 0}</strong>
          </div>

          <div className="admin-action-row">
            <span>Total operations recorded</span>
            <strong>{stats?.operations ?? 0}</strong>
          </div>
        </div>
        <div className="admin-card admin-activity-card">

  <div className="admin-card-header">
    <div>
      <h2>Recent Activity</h2>
      <p>Latest activity across OrganSync.</p>
    </div>
  </div>

  {recentActivity.length === 0 ? (
    <div className="admin-empty">
      No recent activity available.
    </div>
  ) : (
    <div className="admin-activity-list">

      {recentActivity.map((activity) => (
        <div
          className="admin-activity-item"
          key={activity.id}
        >

          <div
            className={`admin-activity-icon ${activity.type}`}
          >
            {activity.type === "hospital"
              ? "🏥"
              : activity.type === "case"
              ? "🫀"
              : "👤"}
          </div>

          <div className="admin-activity-content">
            <strong>{activity.title}</strong>

            <span>
              {activity.description}
            </span>
          </div>

          <div className="admin-activity-time">
            {new Date(
              activity.date
            ).toLocaleString()}
          </div>

        </div>
      ))}

    </div>
  )}

</div>
      </>
    );
  };

  const renderUsers = () => (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>User Management</h1>
          <p>Manage donor, recipient, hospital and administrator accounts.</p>
        </div>
         <button
  type="button"
  className="admin-add-btn"
  onClick={() => setShowAddUser(true)}
>
  + Add User
</button>
      </div>
{/* Add User Form */}
      {showAddUser && (
  <div className="admin-card admin-add-user-card">

    <div className="admin-form-title">
      <div>
        <h3>Add New User</h3>
        <p>Create a donor, recipient or hospital account.</p>
      </div>

      <button
        type="button"
        className="admin-close-btn"
        onClick={() => setShowAddUser(false)}
      >
        ✕
      </button>
    </div>

    <form onSubmit={handleCreateUser}>

      <div className="admin-form-grid">

        <div>
          <label>Account Type</label>

          <select
            value={newUser.role}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                role: e.target.value,
                bloodGroup: "",
                organ: "",
                license: ""
              })
            }
          >
            <option value="donor">Donor</option>
            <option value="recipient">Recipient</option>
            <option value="hospital">Hospital</option>
          </select>
        </div>

        <div>
          <label>
            {newUser.role === "hospital"
              ? "Hospital Name"
              : "Full Name"}
          </label>

          <input
            required
            value={newUser.fullName}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                fullName: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Email</label>

          <input
            required
            type="email"
            value={newUser.email}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                email: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Phone</label>

          <input
            required
            value={newUser.phone}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                phone: e.target.value
              })
            }
          />
        </div>

        <div>
          <label>Temporary Password</label>

          <input
            required
            type="password"
            minLength="6"
            value={newUser.password}
            onChange={(e) =>
              setNewUser({
                ...newUser,
                password: e.target.value
              })
            }
          />
        </div>

        {(newUser.role === "donor" ||
          newUser.role === "recipient") && (
          <div>
            <label>Blood Group</label>

            <select
              required
              value={newUser.bloodGroup}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  bloodGroup: e.target.value
                })
              }
            >
              <option value="">Select</option>
              <option>A+</option>
              <option>A-</option>
              <option>B+</option>
              <option>B-</option>
              <option>AB+</option>
              <option>AB-</option>
              <option>O+</option>
              <option>O-</option>
            </select>
          </div>
        )}

        {newUser.role === "recipient" && (
          <div>
            <label>Required Organ</label>

            <select
              required
              value={newUser.organ}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  organ: e.target.value
                })
              }
            >
              <option value="">Select organ</option>
              <option>Kidney</option>
              <option>Liver</option>
              <option>Heart</option>
              <option>Lungs</option>
              <option>Pancreas</option>
              <option>Cornea</option>
            </select>
          </div>
        )}

        {newUser.role === "hospital" && (
          <div>
            <label>Hospital License</label>

            <input
              required
              value={newUser.license}
              onChange={(e) =>
                setNewUser({
                  ...newUser,
                  license: e.target.value
                })
              }
            />
          </div>
        )}

      </div>

      <div className="admin-form-actions">

        <button
          type="button"
          className="admin-cancel-btn"
          onClick={() => setShowAddUser(false)}
        >
          Cancel
        </button>

        <button
          type="submit"
          className="admin-add-btn"
          disabled={creatingUser}
        >
          {creatingUser
            ? "Creating..."
            : "Create User"}
        </button>

      </div>

    </form>
  </div>
)}

{/* ADMINISTRATOR ACCOUNT */}
{adminUsers.map((admin) => (
  <div className="admin-owner-card" key={admin._id}>

    <div className="admin-owner-left">

      <div className="admin-owner-avatar">
        🛡️
      </div>

      <div>
        <div className="admin-owner-label">
          PLATFORM ADMINISTRATOR
        </div>

        <h3>
          {admin.fullName || "OrganSync Admin"}
        </h3>

        <p>{admin.email}</p>
      </div>

    </div>

    <div className="admin-owner-right">

      <span className="admin-role-badge">
        ADMIN
      </span>

      <span className="admin-status active">
        Active
      </span>

      <span className="admin-protected-badge">
        🔒 Protected Account
      </span>

    </div>

  </div>
))}
{/* Existing System Users */}

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <div className="admin-table-header">
          <h3>System Users</h3>

          <input
            className="admin-search"
            type="text"
            placeholder="Search name, email or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Blood Group</th>
                <th>Organ</th>
                <th>Account Status</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    No users found.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => {
                  const status = u.accountStatus || "Active";

                  return (
                    <tr key={u._id}>
                      <td>{u.fullName || "—"}</td>
                      <td>{u.email || "—"}</td>

                      <td>
                        <span className="admin-role-badge">
                          {(u.role || "user").toUpperCase()}
                        </span>
                      </td>

                      <td>{u.bloodGroup || "—"}</td>
                      <td>{u.organ || "—"}</td>

                      <td>
                        <span
                          className={
                            status === "Active"
                              ? "admin-status active"
                              : "admin-status suspended"
                          }
                        >
                          {status}
                        </span>
                      </td>

                     <td>
  {u.role === "admin" ? (
    <span className="admin-muted">
      Protected
    </span>
  ) : (
    <div className="admin-btn-group">

      {/* SUSPEND / ACTIVATE */}
      {status === "Active" ? (
        <button
          className="admin-btn-danger"
          disabled={actionId === u._id}
          onClick={() =>
            updateUserStatus(
              u._id,
              "Suspended"
            )
          }
        >
          {actionId === u._id
            ? "Updating..."
            : "Suspend"}
        </button>
      ) : (
        <button
          className="admin-btn-success"
          disabled={actionId === u._id}
          onClick={() =>
            updateUserStatus(
              u._id,
              "Active"
            )
          }
        >
          {actionId === u._id
            ? "Updating..."
            : "Activate"}
        </button>
      )}


      {/* DELETE */}
      <button
        className="admin-btn-delete"
        disabled={actionId === u._id}
        onClick={() =>
          handleDeleteUser(
            u._id,
            u.fullName || "this user"
          )
        }
      >
        Delete
      </button>

    </div>
  )}
</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );

  const renderHospitals = () => (
  <>
    <div className="admin-page-heading">
      <div>
        <h1>Hospital Management</h1>
        <p>Review registered hospitals and license verification status.</p>
      </div>
    </div>

    {error && <div className="admin-error">{error}</div>}

    <div className="admin-card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Hospital</th>
              <th>Email</th>
              <th>Phone</th>
              <th>License</th>
              <th>Verification</th>
              <th>Account</th>
              <th>Action</th>
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="admin-empty">
                  Loading hospitals...
                </td>
              </tr>
            ) : hospitals.length === 0 ? (
              <tr>
                <td colSpan="8" className="admin-empty">
                  No hospitals found.
                </td>
              </tr>
            ) : (
              hospitals.map((hospital) => {
                const accountStatus =
                  hospital.accountStatus || "Active";

                return (
                  <tr key={hospital.id}>
                    <td>{hospital.fullName}</td>
                    <td>{hospital.email}</td>
                    <td>{hospital.phone || "—"}</td>
                    <td>{hospital.license || "Not provided"}</td>

                    <td>
                      <span
                        className={`admin-status ${
                          hospital.verificationState === "Verified"
                            ? "active"
                            : hospital.verificationState === "Rejected"
                            ? "suspended"
                            : "pending"
                        }`}
                      >
                        {hospital.verificationState || "Pending"}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          accountStatus === "Active"
                            ? "admin-status active"
                            : "admin-status suspended"
                        }
                      >
                        {accountStatus}
                      </span>
                    </td>

                    <td>
                      <div className="admin-btn-group">

                        <button
                          className="admin-view-btn"
                          onClick={() =>
                            setSelectedHospital(hospital)
                          }
                        >
                          View Details
                        </button>

                        {hospital.verificationState === "Pending" && (
                          <>
                            <button
                              className="admin-btn-success"
                              disabled={actionId === hospital.id}
                              onClick={() =>
                                updateHospitalVerification(
                                  hospital.id,
                                  "Verified"
                                )
                              }
                            >
                              Verify
                            </button>

                            <button
                              className="admin-btn-danger"
                              disabled={actionId === hospital.id}
                              onClick={() =>
                                updateHospitalVerification(
                                  hospital.id,
                                  "Rejected"
                                )
                              }
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {accountStatus === "Active" ? (
                          <button
                            className="admin-btn-danger"
                            disabled={actionId === hospital.id}
                            onClick={() =>
                              updateUserStatus(
                                hospital.id,
                                "Suspended"
                              )
                            }
                          >
                            Suspend
                          </button>
                        ) : (
                          <button
                            className="admin-btn-success"
                            disabled={actionId === hospital.id}
                            onClick={() =>
                              updateUserStatus(
                                hospital.id,
                                "Active"
                              )
                            }
                          >
                            Activate
                          </button>
                        )}

                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>

    {selectedHospital && (
      <div className="admin-modal-overlay">
        <div className="admin-hospital-modal">

          <div className="admin-modal-header">
            <div>
              <h2>{selectedHospital.fullName}</h2>
              <p>Hospital Account Details</p>
            </div>

            <button
              className="admin-modal-close"
              onClick={() => setSelectedHospital(null)}
            >
              ✕
            </button>
          </div>

          <div className="admin-detail-grid">

            <DetailItem
              label="Hospital Name"
              value={selectedHospital.fullName}
            />

            <DetailItem
              label="Email"
              value={selectedHospital.email}
            />

            <DetailItem
              label="Phone"
              value={selectedHospital.phone || "Not provided"}
            />

            <DetailItem
              label="Medical License"
              value={selectedHospital.license || "Not provided"}
            />

            <DetailItem
              label="Verification Status"
              value={
                selectedHospital.verificationState || "Pending"
              }
            />

            <DetailItem
              label="Account Status"
              value={
                selectedHospital.accountStatus || "Active"
              }
            />

            <DetailItem
              label="Registered On"
              value={
                selectedHospital.createdAt
                  ? new Date(
                      selectedHospital.createdAt
                    ).toLocaleDateString()
                  : "—"
              }
            />

          </div>

          <div className="admin-modal-actions">

            {selectedHospital.verificationState === "Pending" && (
              <>
                <button
                  className="admin-btn-success"
                  onClick={async () => {
                    await updateHospitalVerification(
                      selectedHospital.id,
                      "Verified"
                    );

                    setSelectedHospital((prev) => ({
                      ...prev,
                      verificationState: "Verified"
                    }));
                  }}
                >
                  Verify Hospital
                </button>

                <button
                  className="admin-btn-danger"
                  onClick={async () => {
                    await updateHospitalVerification(
                      selectedHospital.id,
                      "Rejected"
                    );

                    setSelectedHospital((prev) => ({
                      ...prev,
                      verificationState: "Rejected"
                    }));
                  }}
                >
                  Reject Hospital
                </button>
              </>
            )}

            {(selectedHospital.accountStatus || "Active") ===
            "Active" ? (
              <button
                className="admin-btn-danger"
                onClick={async () => {
                  await updateUserStatus(
                    selectedHospital.id,
                    "Suspended"
                  );

                  setSelectedHospital((prev) => ({
                    ...prev,
                    accountStatus: "Suspended"
                  }));

                  setHospitals((prev) =>
                    prev.map((h) =>
                      h.id === selectedHospital.id
                        ? {
                            ...h,
                            accountStatus: "Suspended"
                          }
                        : h
                    )
                  );
                }}
              >
                Suspend Account
              </button>
            ) : (
              <button
                className="admin-btn-success"
                onClick={async () => {
                  await updateUserStatus(
                    selectedHospital.id,
                    "Active"
                  );

                  setSelectedHospital((prev) => ({
                    ...prev,
                    accountStatus: "Active"
                  }));

                  setHospitals((prev) =>
                    prev.map((h) =>
                      h.id === selectedHospital.id
                        ? {
                            ...h,
                            accountStatus: "Active"
                          }
                        : h
                    )
                  );
                }}
              >
                Activate Account
              </button>
            )}

          </div>
        </div>
      </div>
    )}
  </>
);

  const renderCases = () => (
    <>
      <div className="admin-page-heading">
        <div>
          <h1>Transplant Cases</h1>
          <p>Read-only operational overview of transplant requests.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Recipient</th>
                <th>Donor</th>
                <th>Organ</th>
                <th>Blood Group</th>
                <th>Hospital</th>
                <th>Status</th>
                <th>Created</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    Loading transplant cases...
                  </td>
                </tr>
              ) : cases.length === 0 ? (
                <tr>
                  <td colSpan="8" className="admin-empty">
                    No transplant cases found.
                  </td>
                </tr>
              ) : (
                cases.map((item) => (
                  <tr key={item.id}>
                    <td>{item.recipientName}</td>
                    <td>{item.donorName}</td>
                    <td>{item.organ}</td>
                    <td>{item.bloodGroup}</td>
                    <td>{item.hospital}</td>

                    <td>
                      <span className="admin-status pending">
                        {item.status}
                      </span>
                    </td>

                    <td>
                      {item.createdAt
                        ? new Date(item.createdAt).toLocaleDateString()
                        : "—"}
                    </td>
                        <td>
                    <button
                      className="admin-view-btn"
                      onClick={() => setSelectedCase(item)}
                    >
                      View Details
                    </button>
                  </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {selectedCase && (
  <div className="admin-modal-overlay">
    <div className="admin-case-modal">

      <div className="admin-modal-header">
        <div>
          <h2>Transplant Case Details</h2>
          <p>
            Case ID: {selectedCase.id}
          </p>
        </div>

        <button
          className="admin-modal-close"
          onClick={() => setSelectedCase(null)}
        >
          ✕
        </button>
      </div>

      <div className="admin-detail-grid">

        <DetailItem
          label="Recipient"
          value={selectedCase.recipientName}
        />

        <DetailItem
          label="Donor"
          value={selectedCase.donorName}
        />

        <DetailItem
          label="Organ"
          value={selectedCase.organ}
        />

        <DetailItem
          label="Blood Group"
          value={selectedCase.bloodGroup}
        />

        <DetailItem
          label="Hospital"
          value={selectedCase.hospital}
        />

        <DetailItem
          label="Request Status"
          value={selectedCase.status}
        />

        <DetailItem
          label="Created On"
          value={
            selectedCase.createdAt
              ? new Date(
                  selectedCase.createdAt
                ).toLocaleString()
              : "—"
          }
        />

      </div>

      <div className="admin-case-section">
        <h3>Case Progress</h3>

        <div className="admin-timeline">

          <TimelineItem
            title="Request Created"
            complete={true}
          />

          <TimelineItem
            title="Donor Approval"
            complete={[
              "Accepted",
              "Hospital Review",
              "Scheduled",
              "Completed"
            ].includes(selectedCase.status)}
          />

          <TimelineItem
            title="Hospital Review"
            complete={[
              "Hospital Review",
              "Scheduled",
              "Completed"
            ].includes(selectedCase.status)}
          />

          <TimelineItem
            title="Appointment Scheduled"
            complete={[
              "Scheduled",
              "Completed"
            ].includes(selectedCase.status)}
          />

          <TimelineItem
            title="Transplant Completed"
            complete={
              selectedCase.status === "Completed"
            }
          />

        </div>
      </div>

      <div className="admin-case-notice">
        Admin access is read-only. Clinical compatibility,
        approval and transplant decisions are handled by the
        authorized hospital team.
      </div>

    </div>
  </div>
)}
    </>
  );

  const renderAuditLogs = () => {
  const filteredAuditLogs = auditLogs.filter((log) => {
    const matchesFilter =
      auditFilter === "ALL" ||
      log.action === auditFilter;

    const searchValue =
      auditSearch.trim().toLowerCase();

    const searchableText = `
      ${log.message || ""}
      ${log.entityName || ""}
      ${log.entityType || ""}
      ${log.actorName || ""}
      ${log.action || ""}
    `.toLowerCase();

    const matchesSearch =
      !searchValue ||
      searchableText.includes(searchValue);

    return matchesFilter && matchesSearch;
  });

  return (
    <>
      <div className="admin-page-heading">

        <div>
          <h1>Audit Logs</h1>
          <p>
            Administrative activity and account changes
            across OrganSync.
          </p>
        </div>

        <button
          type="button"
          className="admin-refresh"
          onClick={loadAuditLogs}
        >
          Refresh
        </button>

      </div>


      {error && (
        <div className="admin-error">
          {error}
        </div>
      )}


      <div className="admin-card">

        <div className="admin-audit-toolbar">

          <input
            type="text"
            className="admin-search"
            placeholder="Search audit logs..."
            value={auditSearch}
            onChange={(e) =>
              setAuditSearch(e.target.value)
            }
          />


          <select
            className="admin-audit-filter"
            value={auditFilter}
            onChange={(e) =>
              setAuditFilter(e.target.value)
            }
          >

            <option value="ALL">
              All Actions
            </option>

            <option value="USER_CREATED">
              User Created
            </option>

            <option value="USER_DELETED">
              User Deleted
            </option>

            <option value="USER_SUSPENDED">
              User Suspended
            </option>

            <option value="USER_ACTIVATED">
              User Activated
            </option>

            <option value="HOSPITAL_VERIFIED">
              Hospital Verified
            </option>

            <option value="HOSPITAL_REJECTED">
              Hospital Rejected
            </option>

          </select>

        </div>


        <div className="admin-table-wrap">

          <table className="admin-table">

            <thead>
              <tr>
                <th>Date & Time</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Activity</th>
                <th>Performed By</th>
              </tr>
            </thead>


            <tbody>

              {loading ? (

                <tr>
                  <td
                    colSpan="5"
                    className="admin-empty"
                  >
                    Loading audit logs...
                  </td>
                </tr>

              ) : filteredAuditLogs.length === 0 ? (

                <tr>
                  <td
                    colSpan="5"
                    className="admin-empty"
                  >
                    No audit logs found.
                  </td>
                </tr>

              ) : (

                filteredAuditLogs.map((log) => (

                  <tr key={log._id}>

                    <td>
                      {log.createdAt
                        ? new Date(
                            log.createdAt
                          ).toLocaleString()
                        : "—"}
                    </td>


                    <td>
                      <span className="admin-audit-action">
                        {(log.action || "UNKNOWN")
                          .replaceAll("_", " ")}
                      </span>
                    </td>


                    <td>

                      <strong>
                        {log.entityName || "—"}
                      </strong>

                      <div className="admin-audit-subtext">
                        {log.entityType || "—"}
                      </div>

                    </td>


                    <td>
                      {log.message || "—"}
                    </td>


                    <td>

                      <strong>
                        {log.actorName || "System"}
                      </strong>

                      <div className="admin-audit-subtext">
                        {log.actorRole || ""}
                      </div>

                    </td>

                  </tr>

                ))

              )}

            </tbody>

          </table>

        </div>

      </div>
    </>
  );
};

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-logo">
          <div className="admin-logo-icon">🫀</div>

          <div>
            <h2>OrganSync</h2>
            <span>Admin Portal</span>
          </div>
        </div>

        <nav className="admin-nav">
          <SidebarItem
            label="Dashboard"
            icon="📊"
            active={activeTab === "dashboard"}
            onClick={() => setActiveTab("dashboard")}
          />

          <SidebarItem
            label="Users"
            icon="👥"
            active={activeTab === "users"}
            onClick={() => setActiveTab("users")}
          />

          <SidebarItem
            label="Hospitals"
            icon="🏥"
            active={activeTab === "hospitals"}
            onClick={() => setActiveTab("hospitals")}
          />

          <SidebarItem
            label="Transplant Cases"
            icon="🫀"
            active={activeTab === "cases"}
            onClick={() => setActiveTab("cases")}
          />
          <SidebarItem
  label="Audit Logs"
  icon="📋"
  active={activeTab === "audit"}
  onClick={() => setActiveTab("audit")}
/>

        </nav>

        <div className="admin-sidebar-bottom">
          <button className="admin-logout" onClick={logout}>
            ↪ Logout
          </button>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <strong>{user?.fullName || "Administrator"}</strong>
            <span>Platform Administrator</span>
          </div>
        </header>

        <section className="admin-content">
          {activeTab === "dashboard" && renderDashboard()}
          {activeTab === "users" && renderUsers()}
          {activeTab === "hospitals" && renderHospitals()}
          {activeTab === "cases" && renderCases()}
          {activeTab === "audit" && renderAuditLogs()}
        </section>
      </main>
    </div>
  );
}

function SidebarItem({ label, icon, active, onClick }) {
  return (
    <button
      className={`admin-nav-item ${active ? "active" : ""}`}
      onClick={onClick}
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function StatCard({ title, value, subtitle, icon }) {
  return (
    <div className="admin-stat-card">
      <div className="admin-stat-icon">{icon}</div>

      <div>
        <span className="admin-stat-title">{title}</span>
        <h2>{value}</h2>
        <small>{subtitle}</small>
      </div>
    </div>
  );
}


function DetailItem({ label, value }) {
  return (
    <div className="admin-detail-item">
      <span>{label}</span>
      <strong>{value || "—"}</strong>
    </div>
  );
}
function TimelineItem({ title, complete }) {
  return (
    <div className="admin-timeline-item">

      <div
        className={
          complete
            ? "admin-timeline-dot complete"
            : "admin-timeline-dot"
        }
      >
        {complete ? "✓" : ""}
      </div>

      <div>
        <strong>{title}</strong>
        <span>
          {complete ? "Completed" : "Pending"}
        </span>
      </div>

    </div>
  );
}