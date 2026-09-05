import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";
import MedicalRecordsPage from "./MedicalRecordsPage";

const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-"
];

const ORGAN_OPTIONS = [
  "Kidney",
  "Liver",
  "Heart",
  "Lungs",
  "Pancreas",
  "Cornea"
];

export default function RecipientDashboard() {
  const { user, logout } = useAuth();

  const token = user?.token;

  const recipientId =
    user?.userId ||
    user?._id ||
    user?.id;

  const [activeTab, setActiveTab] =
    useState("dashboard");

  // =====================================================
// POTENTIAL MATCHES
// =====================================================

function PotentialMatches({
  recommendations,
  loading,
  error,
  message,
  actionId,
  onSendRequest,
  onDecline,
  onRefresh
}) {

  const activeRecommendations =
    recommendations.filter(
      (item) =>
        item.status === "Recommended"
    );

  const pastRecommendations =
    recommendations.filter(
      (item) =>
        item.status !== "Recommended"
    );


  if (loading) {
    return (
      <div style={styles.card}>
        <h2 style={styles.cardTitle}>
          Potential Matches
        </h2>

        <p style={styles.cardSubtitle}>
          Loading hospital screening
          recommendations...
        </p>
      </div>
    );
  }


  return (
    <div>

      {/* HEADER */}

      <div style={styles.matchesHeader}>

        <div>
          <span style={styles.matchesEyebrow}>
            HOSPITAL SCREENING
          </span>

          <h1 style={styles.matchesHeading}>
            Potential Matches
          </h1>

          <p style={styles.matchesSubtitle}>
            Review donor matches recommended
            after hospital-verified medical
            screening.
          </p>
        </div>

        <button
          style={styles.viewBtn}
          onClick={onRefresh}
        >
          ↻ Refresh
        </button>

      </div>


      {/* SAFETY */}

      <div style={styles.matchSafetyBanner}>
        <strong>
          Clinical screening support
        </strong>

        <p>
          A potential match does not confirm
          transplant eligibility. Final
          compatibility and allocation require
          hospital review.
        </p>
      </div>


      {error && (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>
      )}


      {message && (
        <div style={styles.successBox}>
          ✅ {message}
        </div>
      )}


      {/* ACTIVE MATCHES */}

      {activeRecommendations.length === 0 ? (

        <div style={styles.matchEmptyCard}>

          <div style={styles.matchEmptyIcon}>
            🧬
          </div>

          <h3>
            No new potential matches
          </h3>

          <p>
            Hospital recommendations will
            appear here after compatibility
            screening.
          </p>

        </div>

      ) : (

        <div style={styles.recommendationList}>

          {activeRecommendations.map(
            (item) => {

              const busy =
                actionId === item.id;

              return (

                <div
                  key={item.id}
                  style={
                    styles.recommendationCard
                  }
                >

                  {/* HEADER */}

                  <div
                    style={
                      styles.recommendationTop
                    }
                  >

                    <div>

                      <span
                        style={
                          styles.recommendedBy
                        }
                      >
                        RECOMMENDED BY
                      </span>

                      <strong
                        style={
                          styles.hospitalName
                        }
                      >
                        🏥 {item.hospitalName}
                      </strong>

                    </div>


                    <span
                      style={
                        styles.recommendationBadge
                      }
                    >
                      New Match
                    </span>

                  </div>


                  {/* DONOR */}

                  <div
                    style={
                      styles.recommendationDonor
                    }
                  >

                    <div
                      style={
                        styles.matchDonorAvatar
                      }
                    >
                      {item.donorName
                        ?.charAt(0)
                        ?.toUpperCase() ||
                        "D"}
                    </div>


                    <div>

                      <small
                        style={
                          styles.matchSmallLabel
                        }
                      >
                        POTENTIAL DONOR
                      </small>

                      <h2
                        style={
                          styles.matchDonorName
                        }
                      >
                        {item.donorName}
                      </h2>

                      <div
                        style={
                          styles.matchTags
                        }
                      >

                        <span
                          style={
                            styles.matchTag
                          }
                        >
                          🫀 {item.organ}
                        </span>

                        <span
                          style={
                            styles.matchTag
                          }
                        >
                          🩸{" "}
                          {
                            item.donorBloodGroup
                          }
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* COMPLETENESS */}

                  <div
                    style={
                      styles.completenessBox
                    }
                  >

                    <div
                      style={
                        styles.completenessHeader
                      }
                    >
                      <span>
                        Evidence Completeness
                      </span>

                      <strong>
                        {item.dataCompleteness}%
                      </strong>
                    </div>

                    <div
                      style={
                        styles.completenessTrack
                      }
                    >
                      <div
                        style={{
                          ...styles.completenessFill,

                          width:
                            `${Math.min(
                              Number(
                                item.dataCompleteness
                              ) || 0,
                              100
                            )}%`
                        }}
                      />
                    </div>

                    <small
                      style={
                        styles.completenessNote
                      }
                    >
                      This represents available
                      evidence, not a medical
                      compatibility percentage.
                    </small>

                  </div>


                  {/* FACTORS */}

                  <div
                    style={
                      styles.matchEvidenceGrid
                    }
                  >

                    <div>

                      <h4
                        style={
                          styles.matchEvidenceTitle
                        }
                      >
                        Screening Evidence
                      </h4>

                      {(item.factors || [])
                        .map(
                          (
                            factor,
                            index
                          ) => (

                          <div
                            key={index}
                            style={
                              styles.evidenceRow
                            }
                          >
                            <span
                              style={
                                styles.evidenceSuccess
                              }
                            >
                              ✓
                            </span>

                            <span>
                              {factor}
                            </span>
                          </div>

                        ))}

                    </div>


                    <div>

                      <h4
                        style={
                          styles.matchEvidenceTitle
                        }
                      >
                        Additional Evidence
                      </h4>

                      {(item
                        .missingEvidence ||
                        []).length === 0 ? (

                        <div
                          style={
                            styles.evidenceRow
                          }
                        >
                          <span
                            style={
                              styles.evidenceSuccess
                            }
                          >
                            ✓
                          </span>

                          <span>
                            No tracked evidence
                            currently missing.
                          </span>
                        </div>

                      ) : (

                        item
                          .missingEvidence
                          .map(
                            (
                              missing,
                              index
                            ) => (

                            <div
                              key={index}
                              style={
                                styles.evidenceRow
                              }
                            >
                              <span
                                style={
                                  styles.evidenceWarning
                                }
                              >
                                ○
                              </span>

                              <span>
                                {missing}
                              </span>
                            </div>

                          ))

                      )}

                    </div>

                  </div>


                  {/* ACTIONS */}

                  <div
                    style={
                      styles.recommendationActions
                    }
                  >

                    <button
                      type="button"
                      style={
                        styles.declineMatchBtn
                      }
                      disabled={busy}
                      onClick={() =>
                        onDecline(item)
                      }
                    >
                      Decline
                    </button>


                    <button
                      type="button"
                      style={
                        styles.sendDonorBtn
                      }
                      disabled={busy}
                      onClick={() =>
                        onSendRequest(item)
                      }
                    >
                      {busy
                        ? "Processing..."
                        : "Send Request to Donor"}
                    </button>

                  </div>

                </div>

              );
            }
          )}

        </div>

      )}


      {/* HISTORY */}

      {pastRecommendations.length > 0 && (

        <div
          style={{
            ...styles.card,
            marginTop: "24px"
          }}
        >

          <h2 style={styles.cardTitle}>
            Match History
          </h2>

          <p style={styles.cardSubtitle}>
            Previous hospital recommendations.
          </p>


          <div style={styles.requestList}>

            {pastRecommendations.map(
              (item) => (

                <div
                  key={item.id}
                  style={
                    styles.requestRow
                  }
                >

                  <div>

                    <strong>
                      {item.donorName}
                    </strong>

                    <span
                      style={
                        styles.historyMeta
                      }
                    >
                      {item.organ}
                      {" • "}
                      {item.hospitalName}
                    </span>

                  </div>


                  <span
                    style={
                      item.status ===
                      "Request Sent"
                        ? styles.badgeSuccess
                        : styles.badgeRejected
                    }
                  >
                    {item.status}
                  </span>

                </div>

              )
            )}

          </div>

        </div>

      )}

    </div>
  );
}

  // =====================================================
  // PROFILE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loadingProfile, setLoadingProfile] =
    useState(true);

  const [profileError, setProfileError] =
    useState(null);

  // =====================================================
  // MATCHING
  // =====================================================

  const [organ, setOrgan] = useState("");

  const [bloodGroup, setBloodGroup] =
    useState("");

  const [matching, setMatching] =
    useState(false);

  const [matchResult, setMatchResult] =
    useState(null);

  const [matchError, setMatchError] =
    useState(null);

  // =====================================================
  // REQUEST
  // =====================================================

  const [requesting, setRequesting] =
    useState(false);

  const [requestStatus, setRequestStatus] =
    useState(null);

  const [requestMessage, setRequestMessage] =
    useState("");

  const [
    requestRefreshKey,
    setRequestRefreshKey
  ] = useState(0);

  // =====================================================
// HOSPITAL MATCH RECOMMENDATIONS
// =====================================================

const [
  recommendations,
  setRecommendations
] = useState([]);

const [
  recommendationsLoading,
  setRecommendationsLoading
] = useState(false);

const [
  recommendationsError,
  setRecommendationsError
] = useState("");

const [
  recommendationActionId,
  setRecommendationActionId
] = useState(null);

const [
  recommendationMessage,
  setRecommendationMessage
] = useState("");

  // =====================================================
  // LOAD PROFILE
  // =====================================================

  useEffect(() => {
    if (!recipientId) {
      setLoadingProfile(false);
      return;
    }

    const loadProfile = async () => {
      setLoadingProfile(true);
      setProfileError(null);

      try {
        const data = await authFetch(
          `/users/${recipientId}`,
          {
            token
          }
        );

        setProfile(data);

        // Recipient's blood group should come
        // from their registered profile.
        if (data?.bloodGroup) {
          setBloodGroup(data.bloodGroup);
        }

        // Also preselect registered organ if available.
        if (
          data?.organ &&
          ORGAN_OPTIONS.includes(data.organ)
        ) {
          setOrgan(data.organ);
        }
      } catch (error) {
        console.error(
          "Profile fetch failed:",
          error
        );

        setProfileError(
          "Unable to load your profile right now."
        );
      } finally {
        setLoadingProfile(false);
      }
    };

    loadProfile();

  }, [recipientId, token]);

  // =====================================================
// LOAD HOSPITAL RECOMMENDATIONS
// =====================================================

const loadRecommendations = async () => {

  if (!recipientId) {
    return;
  }

  try {

    setRecommendationsLoading(true);
    setRecommendationsError("");

    const data = await authFetch(
      `/match-recommendations/recipient/${recipientId}`,
      {
        token
      }
    );

    setRecommendations(
      Array.isArray(data)
        ? data
        : []
    );

  } catch (error) {

    console.error(
      "Load Recommendations Error:",
      error
    );

    setRecommendationsError(
      error.message ||
      "Unable to load potential matches."
    );

  } finally {

    setRecommendationsLoading(false);

  }
};
useEffect(() => {

  if (
    activeTab === "matches" &&
    recipientId
  ) {
    loadRecommendations();
  }

}, [
  activeTab,
  recipientId,
  token
]);

  // =====================================================
  // FIND DONOR FROM ACTIVE PLEDGES
  // GET /api/users/match
  // =====================================================

  const findDonor = async () => {
    if (!organ || !bloodGroup) {
      alert(
        "Please select both blood group and required organ."
      );
      return;
    }

    setMatching(true);

    setMatchResult(null);

    setMatchError(null);

    setRequestStatus(null);

    setRequestMessage("");

    try {
      const data = await authFetch(
        `/users/match?organ=${encodeURIComponent(
          organ
        )}&bloodGroup=${encodeURIComponent(
          bloodGroup
        )}`,
        {
          token
        }
      );

      setMatchResult(data);

    } catch (error) {
      console.error(
        "Donor matching failed:",
        error
      );

      setMatchError(
        error.message ||
          "Unable to check donor availability right now."
      );
    } finally {
      setMatching(false);
    }
  };

  // =====================================================
  // CREATE ORGAN REQUEST
  // POST /api/requests
  // =====================================================

  const requestApproval = async () => {
    if (!matchResult?.matched) {
      return;
    }

    if (!recipientId) {
      setRequestStatus("error");

      setRequestMessage(
        "Recipient ID is missing. Please logout and login again."
      );

      return;
    }

    if (
      !matchResult.donorId ||
      !matchResult.pledgeId
    ) {
      setRequestStatus("error");

      setRequestMessage(
        "Matched donor information is incomplete. Please run the match again."
      );

      return;
    }

    setRequesting(true);

    setRequestStatus(null);

    setRequestMessage("");

    try {
      const createdRequest =
        await authFetch("/requests", {
          method: "POST",

          token,

          body: {
            recipientId,

            donorId:
              matchResult.donorId,

            pledgeId:
              matchResult.pledgeId,

            organ:
              matchResult.organ,

            bloodGroup:
              matchResult.bloodGroup,

            hospital:
              matchResult.hospital ||
              "Assigned Hospital"
          }
        });

      console.log(
        "Organ request created:",
        createdRequest
      );

      setRequestStatus("success");

      setRequestMessage(
        "Request sent successfully. The matched donor can now review and approve it."
      );

      // Refresh recent requests immediately.
      setRequestRefreshKey(
        (previous) => previous + 1
      );

    } catch (error) {
      console.error(
        "Failed to submit request:",
        error
      );

      setRequestStatus("error");

      setRequestMessage(
        error.message ||
          "Could not submit your approval request."
      );

    } finally {
      setRequesting(false);
    }
  };

  // =====================================================
// SEND RECOMMENDED MATCH TO DONOR
// =====================================================

const sendRecommendedDonorRequest =
  async (recommendation) => {

    if (!recipientId) {
      setRecommendationsError(
        "Recipient ID is missing. Please login again."
      );
      return;
    }

    try {

      setRecommendationActionId(
        recommendation.id
      );

      setRecommendationsError("");
      setRecommendationMessage("");

      // -----------------------------------------------
      // 1. CREATE REAL ORGAN REQUEST
      // -----------------------------------------------

      await authFetch(
        "/requests",
        {
          method: "POST",
          token,

          body: {
            recipientId,

            donorId:
              recommendation.donorId,

            pledgeId:
              recommendation.pledgeId,

            organ:
              recommendation.organ,

            bloodGroup:
              recommendation.bloodGroup,

            hospital:
              recommendation.hospitalName ||
              "Assigned Hospital"
          }
        }
      );


      // -----------------------------------------------
      // 2. MARK RECOMMENDATION AS REQUEST SENT
      // -----------------------------------------------

      await authFetch(
        `/match-recommendations/${recommendation.id}/status`,
        {
          method: "PATCH",
          token,

          body: {
            recipientId,
            status: "Request Sent"
          }
        }
      );


      setRecommendationMessage(
        `Request sent to ${recommendation.donorName}. The donor can now review your request.`
      );


      // Refresh recommendations
      await loadRecommendations();


      // Refresh Organ Requests tab
      setRequestRefreshKey(
        (previous) =>
          previous + 1
      );

    } catch (error) {

      console.error(
        "Send Recommended Request Error:",
        error
      );

      setRecommendationsError(
        error.message ||
        "Unable to send request to donor."
      );

    } finally {

      setRecommendationActionId(
        null
      );

    }
  };

  // =====================================================
// DECLINE HOSPITAL RECOMMENDATION
// =====================================================

const declineRecommendation =
  async (recommendation) => {

    try {

      setRecommendationActionId(
        recommendation.id
      );

      setRecommendationsError("");
      setRecommendationMessage("");

      await authFetch(
        `/match-recommendations/${recommendation.id}/status`,
        {
          method: "PATCH",
          token,

          body: {
            recipientId,
            status: "Declined"
          }
        }
      );

      setRecommendationMessage(
        "Match recommendation declined."
      );

      await loadRecommendations();

    } catch (error) {

      console.error(
        "Decline Recommendation Error:",
        error
      );

      setRecommendationsError(
        error.message ||
        "Unable to decline recommendation."
      );

    } finally {

      setRecommendationActionId(
        null
      );

    }
  };

  // =====================================================
  // CONTENT
  // =====================================================

  const renderContent = () => {

    // ---------------- PROFILE ----------------

    if (activeTab === "profile") {
      return (
        <Profile
          profile={profile}
          loading={loadingProfile}
          error={profileError}
        />
      );
    }

    // ---------------- POTENTIAL MATCHES ----------------

if (activeTab === "matches") {
  return (
    <PotentialMatches
      recommendations={recommendations}
      loading={recommendationsLoading}
      error={recommendationsError}
      message={recommendationMessage}
      actionId={recommendationActionId}
      onSendRequest={
        sendRecommendedDonorRequest
      }
      onDecline={
        declineRecommendation
      }
      onRefresh={
        loadRecommendations
      }
    />
  );
}

    // ---------------- REQUESTS ----------------

    if (activeTab === "requests") {
      return (
        <OrganRequests
          userId={recipientId}
          token={token}
          refreshKey={requestRefreshKey}
        />
      );
    }

    // ---------------- APPOINTMENTS ----------------

    if (activeTab === "appointments") {
      return (
        <Appointments
          userId={recipientId}
          token={token}
        />
      );
    }

    // ---------------- RECORDS ----------------

   if (activeTab === "records") {
  return <MedicalRecordsPage />;
}



    // =====================================================
    // DASHBOARD
    // =====================================================

    return (
      <>
        <header style={styles.header}>
          <div>
            <h1 style={styles.heading}>
              Good Day,{" "}
              {user?.fullName ||
                "Recipient"}{" "}
              👋
            </h1>

            <p style={styles.subheading}>
              Patient Priority Monitor &
              Organ Allocation Waitlist
            </p>
          </div>

          <div style={styles.statusPill}>
            <span
              style={styles.pulseDot}
            />

            <span>
              Priority Tier 1 (Active)
            </span>
          </div>
        </header>

        {/* =====================================
            STATS
        ====================================== */}

        <div style={styles.grid3}>
          <div style={styles.statBox}>
            <div style={styles.statHeader}>
              <span>
                Waitlist Status
              </span>

              <span
                style={styles.statBadge}
              >
                Active
              </span>
            </div>

            <h2
              style={{
                ...styles.statNum,
                color: "#2563eb"
              }}
            >
              Awaiting Donor
            </h2>

            <small
              style={{
                color: "#64748b"
              }}
            >
              Registered on National Registry
            </small>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statHeader}>
              <span>
                Medical Urgency
              </span>

              <span
                style={{
                  ...styles.statBadge,
                  background: "#fee2e2",
                  color: "#dc2626"
                }}
              >
                Critical
              </span>
            </div>

            <h2
              style={{
                ...styles.statNum,
                color: "#dc2626"
              }}
            >
              Tier 1 Priority
            </h2>

            <small
              style={{
                color: "#64748b"
              }}
            >
              Continuous Matching Enabled
            </small>
          </div>

          <div style={styles.statBox}>
            <div style={styles.statHeader}>
              <span>
                Hospital Unit
              </span>

              <span
                style={{
                  ...styles.statBadge,
                  background: "#f0fdf4",
                  color: "#16a34a"
                }}
              >
                Verified
              </span>
            </div>

            <h2 style={styles.statNum}>
              {profile?.hospital ||
                "Assigned Hospital"}
            </h2>

            <small
              style={{
                color: "#64748b"
              }}
            >
              Assigned Transplant Center
            </small>
          </div>
        </div>

        {/* =====================================
            DONOR MATCH SEARCH
        ====================================== */}

        <div style={styles.card}>
          <h2 style={styles.cardTitle}>
            🔍 Check Compatible Donor
            Availability
          </h2>

          <p style={styles.cardSubtitle}>
            Search active donor pledges using
            your organ requirement and blood
            group.
          </p>

          <div style={styles.searchRow}>
            {/* BLOOD GROUP */}

            <div style={styles.inputCol}>
              <label style={styles.label}>
                Patient Blood Group
              </label>

              <select
                value={bloodGroup}
                onChange={(e) =>
                  setBloodGroup(
                    e.target.value
                  )
                }
                style={styles.select}
              >
                <option value="">
                  Select Blood Group
                </option>

                {BLOOD_GROUPS.map(
                  (bg) => (
                    <option
                      key={bg}
                      value={bg}
                    >
                      {bg}
                    </option>
                  )
                )}
              </select>

              {profile?.bloodGroup && (
                <small
                  style={{
                    color: "#64748b"
                  }}
                >
                  Registered blood group:{" "}
                  {profile.bloodGroup}
                </small>
              )}
            </div>

            {/* ORGAN */}

            <div style={styles.inputCol}>
              <label style={styles.label}>
                Required Organ
              </label>

              <select
                value={organ}
                onChange={(e) =>
                  setOrgan(
                    e.target.value
                  )
                }
                style={styles.select}
              >
                <option value="">
                  Select Organ
                </option>

                {ORGAN_OPTIONS.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  )
                )}
              </select>
            </div>

            {/* SEARCH BUTTON */}

            <div
              style={{
                alignSelf: "flex-end"
              }}
            >
              <button
                onClick={findDonor}
                disabled={matching}
                style={styles.searchBtn}
              >
                {matching
                  ? "Checking Donor Pledges..."
                  : "⚡ Run Match Search"}
              </button>
            </div>
          </div>

          {/* MATCH API ERROR */}

          {matchError && (
            <div style={styles.errorBox}>
              <span
                style={{
                  fontSize: "20px"
                }}
              >
                ⚠️
              </span>

              <span>
                {matchError}
              </span>
            </div>
          )}

          {/* =====================================
              MATCH FOUND
          ====================================== */}

          {matchResult?.matched && (
            <div style={styles.resultBox}>
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "12px"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center"
                  }}
                >
                  <span
                    style={{
                      fontSize: "28px"
                    }}
                  >
                    🟢
                  </span>

                  <div>
                    <h3
                      style={{
                        margin: 0,
                        color: "#14532d"
                      }}
                    >
                      Compatible Donor Pledge
                      Found!
                    </h3>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color: "#166534",
                        fontSize: "13px"
                      }}
                    >
                      Organ:{" "}
                      <strong>
                        {
                          matchResult.organ
                        }
                      </strong>

                      {" | "}

                      Blood Group:{" "}
                      <strong>
                        {
                          matchResult.bloodGroup
                        }
                      </strong>
                    </p>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        color: "#166534",
                        fontSize: "13px"
                      }}
                    >
                      Donor:{" "}
                      <strong>
                        {matchResult.donorName ||
                          "Matched Donor"}
                      </strong>
                    </p>
                  </div>
                </div>

                <div
                  style={styles.scoreBadge}
                >
                  Compatible
                </div>
              </div>

              <div
                style={styles.matchActions}
              >
                <span>
                  Center:{" "}
                  <strong>
                    {matchResult.hospital ||
                      "Assigned Hospital"}
                  </strong>
                </span>

                <button
                  style={styles.applyBtn}
                  onClick={
                    requestApproval
                  }
                  disabled={
                    requesting ||
                    requestStatus ===
                      "success"
                  }
                >
                  {requesting
                    ? "Submitting..."
                    : requestStatus ===
                      "success"
                    ? "✓ Request Submitted"
                    : "Request Donor Approval"}
                </button>
              </div>

              {/* SUCCESS */}

              {requestStatus ===
                "success" && (
                <div
                  style={
                    styles.successBox
                  }
                >
                  ✅ {requestMessage}
                </div>
              )}

              {/* ERROR */}

              {requestStatus ===
                "error" && (
                <div
                  style={{
                    ...styles.errorBox,
                    marginTop: "12px"
                  }}
                >
                  ⚠️ {requestMessage}
                </div>
              )}
            </div>
          )}

          {/* =====================================
              NO MATCH
          ====================================== */}

          {matchResult &&
            !matchResult.matched && (
              <div
                style={{
                  ...styles.resultBox,
                  background: "#fef2f2",
                  borderColor: "#fca5a5"
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "12px",
                    alignItems: "center",
                    color: "#991b1b"
                  }}
                >
                  <span
                    style={{
                      fontSize: "24px"
                    }}
                  >
                    ⚠️
                  </span>

                  <div>
                    <strong>
                      No compatible active
                      donor pledge found.
                    </strong>

                    <p
                      style={{
                        margin:
                          "4px 0 0",
                        fontSize: "13px"
                      }}
                    >
                      {matchResult.message ||
                        "No donor is currently available."}
                    </p>
                  </div>
                </div>
              </div>
            )}
        </div>

        {/* =====================================
            RECENT REQUESTS
        ====================================== */}

        <div
          style={{
            ...styles.card,
            marginTop: "24px"
          }}
        >
          <div
            style={
              styles.cardHeaderFlex
            }
          >
            <h2
              style={styles.cardTitle}
            >
              Recent Organ Requests
            </h2>

            <button
              onClick={() =>
                setActiveTab(
                  "requests"
                )
              }
              style={styles.viewBtn}
            >
              View All
            </button>
          </div>

          <RecentRequestsPreview
            userId={recipientId}
            token={token}
            refreshKey={
              requestRefreshKey
            }
          />
        </div>
      </>
    );
  };

  // =====================================================
  // MAIN LAYOUT
  // =====================================================

  return (
    <div style={styles.wrapper}>
      <aside style={styles.sidebar}>
        <div>
          <div style={styles.sideBrand}>
            <div
              style={styles.sideBadge}
            >
              🫀
            </div>

            <div>
              <strong
                style={{
                  fontSize: "16px",
                  color: "#1e3a8a",
                  display: "block"
                }}
              >
                OrganSync
              </strong>

              <span
                style={{
                  fontSize: "11px",
                  color: "#64748b"
                }}
              >
                Recipient Portal
              </span>
            </div>
          </div>

          <nav style={styles.navMenu}>
            {[
              {
                id: "dashboard",
                label: "Dashboard",
                icon: "📊"
              },
              {
                id: "profile",
                label: "Profile",
                icon: "👤"
              },
              {
                id: "matches",
                label: "Potential Matches",
                icon: "🧬"
              },
              {
                id: "requests",
                label:
                  "Organ Requests",
                icon: "🫀"
              },
              {
                id:
                  "appointments",
                label:
                  "Appointments",
                icon: "📅"
              },
              {
                id: "records",
                label:
                  "Medical Records",
                icon: "📄"
              }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(
                    tab.id
                  )
                }
                style={{
                  ...styles.navBtn,

                  ...(activeTab ===
                  tab.id
                    ? styles.navBtnActive
                    : {})
                }}
              >
                <span>
                  {tab.icon}
                </span>

                <span>
                  {tab.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={logout}
          style={styles.sideLogout}
        >
          ↪ Logout
        </button>
      </aside>

      <main style={styles.main}>
        {renderContent()}
      </main>
    </div>
  );
}

// =====================================================
// PROFILE
// =====================================================

function Profile({
  profile,
  loading,
  error
}) {
  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>
        My Profile
      </h2>

      <p style={styles.cardSubtitle}>
        Personal and transplant
        registration information.
      </p>

      {loading ? (
        <p>
          Loading profile...
        </p>

      ) : error ? (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>

      ) : profile ? (
        <div style={styles.profileGrid}>

          <ProfileItem
            label="Full Name"
            value={profile.fullName}
          />

          <ProfileItem
            label="Email"
            value={profile.email}
          />

          <ProfileItem
            label="Phone"
            value={
              profile.phone ||
              "Not Specified"
            }
          />

          <ProfileItem
            label="Blood Group"
            value={
              profile.bloodGroup ||
              "Not Specified"
            }
          />

          <ProfileItem
            label="Required Organ"
            value={
              profile.organ ||
              "Not Specified"
            }
          />

        </div>
      ) : (
        <p
          style={{
            color: "#64748b"
          }}
        >
          Unable to load profile.
        </p>
      )}
    </div>
  );
}

function ProfileItem({
  label,
  value
}) {
  return (
    <div>
      <label
        style={
          styles.profileLabel
        }
      >
        {label}
      </label>

      <p
        style={
          styles.profileVal
        }
      >
        {value}
      </p>
    </div>
  );
}

// =====================================================
// FETCHED LIST HOOK
// =====================================================

function useFetchedList(
  path,
  token,
  enabledKey,
  refreshKey = 0
) {
  const [items, setItems] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  useEffect(() => {
    if (!enabledKey) {
      setItems([]);
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const data =
          await authFetch(path, {
            token
          });

        if (!cancelled) {
          setItems(
            Array.isArray(data)
              ? data
              : []
          );
        }
      } catch (error) {
        console.error(
          `Failed to load ${path}:`,
          error
        );

        if (!cancelled) {
          setError(
            "Unable to load this right now."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };

  }, [
    path,
    token,
    enabledKey,
    refreshKey
  ]);

  return {
    items,
    loading,
    error
  };
}

// =====================================================
// STATUS STYLE
// =====================================================

function getRequestStatusStyle(
  status
) {
  switch (status) {
    case "Accepted":
      return styles.badgeSuccess;

    case "Completed":
      return styles.badgeSuccess;

    case "Scheduled":
      return styles.badgeActive;

    case "Hospital Review":
      return styles.badgeActive;

    case "Rejected":
      return styles.badgeRejected;

    default:
      return styles.badgePending;
  }
}

// =====================================================
// ORGAN REQUESTS
// =====================================================

function OrganRequests({
  userId,
  token,
  refreshKey
}) {
  const path =
    userId
      ? `/users/${userId}/requests`
      : "";

  const {
    items,
    loading,
    error
  } = useFetchedList(
    path,
    token,
    userId,
    refreshKey
  );

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>
        Organ Requests
      </h2>

      <p style={styles.cardSubtitle}>
        Track donor approval and
        transplant status.
      </p>

      {loading ? (
        <p
          style={{
            color: "#64748b"
          }}
        >
          Loading your requests...
        </p>

      ) : error ? (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>

      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <span
            style={{
              fontSize: "32px"
            }}
          >
            🫀
          </span>

          <h3>
            No organ requests yet
          </h3>

          <p>
            Run a donor match from the
            dashboard first.
          </p>
        </div>

      ) : (
        <div
          style={
            styles.requestList
          }
        >
          {items.map((request) => (
            <div
              key={request.id}
              style={
                styles.requestRow
              }
            >
              <div>
                <strong>
                  {request.organ}
                </strong>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "3px"
                  }}
                >
                  {
                    request.bloodGroup
                  }{" "}
                  Blood Group
                </span>

                {request.donorName && (
                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      marginTop:
                        "3px"
                    }}
                  >
                    Donor:{" "}
                    {
                      request.donorName
                    }
                  </span>
                )}
              </div>

              <span
                style={getRequestStatusStyle(
                  request.status
                )}
              >
                {request.status ||
                  "Pending"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// =====================================================
// RECENT REQUESTS
// =====================================================

function RecentRequestsPreview({
  userId,
  token,
  refreshKey
}) {
  const path =
    userId
      ? `/users/${userId}/requests`
      : "";

  const {
    items,
    loading,
    error
  } = useFetchedList(
    path,
    token,
    userId,
    refreshKey
  );

  if (loading) {
    return (
      <p
        style={{
          color: "#64748b"
        }}
      >
        Loading...
      </p>
    );
  }

  if (error) {
    return (
      <div style={styles.errorBox}>
        ⚠️ {error}
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <p
        style={{
          color: "#64748b"
        }}
      >
        No requests yet.
      </p>
    );
  }

  return (
    <div style={styles.requestList}>
      {items
        .slice(0, 3)
        .map((request) => (
          <div
            key={request.id}
            style={styles.requestRow}
          >
            <div>
              <strong>
                {request.organ}
              </strong>

              <span
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#64748b"
                }}
              >
                {request.bloodGroup}{" "}
                Blood Group
              </span>
            </div>

            <span
              style={getRequestStatusStyle(
                request.status
              )}
            >
              {request.status ||
                "Pending"}
            </span>
          </div>
        ))}
    </div>
  );
}

// =====================================================
// APPOINTMENTS
// =====================================================

function Appointments({
  userId,
  token
}) {
  const path =
    userId
      ? `/appointments/user/${userId}`
      : "";

  const {
    items,
    loading,
    error
  } = useFetchedList(
    path,
    token,
    userId
  );

  return (
    <div style={styles.card}>
      <h2 style={styles.cardTitle}>
        Appointments
      </h2>

      <p style={styles.cardSubtitle}>
        Transplant-related hospital
        appointments.
      </p>

      {loading ? (
        <p>
          Loading appointments...
        </p>

      ) : error ? (
        <div style={styles.errorBox}>
          ⚠️ {error}
        </div>

      ) : items.length === 0 ? (
        <div style={styles.emptyState}>
          <span
            style={{
              fontSize: "32px"
            }}
          >
            📅
          </span>

          <h3>
            No Upcoming Appointments
          </h3>

          <p>
            Hospital appointments will
            appear here after scheduling.
          </p>
        </div>

      ) : (
        <div style={styles.requestList}>
          {items.map(
            (appointment) => (
              <div
                key={
                  appointment.id
                }
                style={
                  styles.requestRow
                }
              >
                <div>
                  <strong>
                    {appointment.type ||
                      "Appointment"}
                  </strong>

                  <span
                    style={{
                      display:
                        "block",
                      fontSize:
                        "12px",
                      color:
                        "#64748b"
                    }}
                  >
                    {
                      appointment.dateTime
                    }
                  </span>
                </div>

                <span
                  style={
                    styles.badgeActive
                  }
                >
                  {appointment.status ||
                    "Scheduled"}
                </span>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}



// =====================================================
// STYLES
// =====================================================

const styles = {
  wrapper: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "system-ui, sans-serif"
  },

  sidebar: {
    width: "240px",
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    position: "sticky",
    top: 0,
    height: "100vh"
  },

  sideBrand: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    paddingBottom: "24px",
    borderBottom: "1px solid #f1f5f9"
  },

  sideBadge: {
    background: "#eff6ff",
    padding: "8px",
    borderRadius: "8px",
    fontSize: "20px"
  },

  navMenu: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    marginTop: "24px"
  },

  navBtn: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#475569",
    fontWeight: "600",
    fontSize: "14px",
    cursor: "pointer",
    textAlign: "left"
  },

  navBtnActive: {
    background: "#eff6ff",
    color: "#2563eb"
  },

  sideLogout: {
    background: "#fee2e2",
    color: "#dc2626",
    border: "none",
    padding: "10px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer"
  },

  main: {
    flex: 1,
    padding: "36px 40px",
    maxWidth: "1400px",
    overflow: "hidden"
  },

  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "28px",
    flexWrap: "wrap",
    gap: "16px"
  },

  heading: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0
  },

  subheading: {
    fontSize: "14px",
    color: "#64748b",
    margin: "4px 0 0"
  },

  statusPill: {
    background: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#16a34a",
    padding: "6px 14px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontWeight: "700",
    fontSize: "13px"
  },

  pulseDot: {
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    background: "#16a34a"
  },

  grid3: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(260px, 1fr))",
    gap: "20px",
    marginBottom: "28px"
  },

  statBox: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    padding: "20px",
    borderRadius: "14px"
  },

  statHeader: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#64748b",
    fontWeight: "600"
  },

  statBadge: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "11px",
    fontWeight: "700"
  },

  statNum: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "8px 0 4px"
  },

  card: {
    background: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "28px",
    boxShadow:
      "0 1px 3px rgba(0,0,0,0.05)"
  },

  cardTitle: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#1e293b",
    margin: "0 0 4px"
  },

  cardSubtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "0 0 24px"
  },

  cardHeaderFlex: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "16px"
  },

  viewBtn: {
    background: "#f1f5f9",
    border: "1px solid #cbd5e1",
    padding: "6px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer"
  },

  searchRow: {
    display: "flex",
    gap: "16px",
    flexWrap: "wrap",
    marginBottom: "8px"
  },

  inputCol: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    flex: 1,
    minWidth: "200px"
  },

  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155"
  },

  select: {
    padding: "10px 14px",
    borderRadius: "8px",
    border: "1px solid #cbd5e1",
    fontSize: "14px",
    background: "#f8fafc"
  },

  searchBtn: {
    background: "#2563eb",
    color: "#ffffff",
    border: "none",
    padding: "11px 24px",
    borderRadius: "8px",
    fontWeight: "700",
    cursor: "pointer",
    height: "42px"
  },

  errorBox: {
    background: "#fef2f2",
    border: "1px solid #fca5a5",
    color: "#991b1b",
    padding: "14px 18px",
    borderRadius: "10px",
    marginTop: "16px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
    fontSize: "14px"
  },

  successBox: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    color: "#166534",
    padding: "12px 16px",
    borderRadius: "10px",
    marginTop: "14px",
    fontSize: "13px",
    fontWeight: "600"
  },

  resultBox: {
    background: "#f0fdf4",
    border: "1px solid #86efac",
    borderRadius: "12px",
    padding: "20px",
    marginTop: "16px"
  },

  scoreBadge: {
    background: "#16a34a",
    color: "#ffffff",
    fontWeight: "800",
    fontSize: "14px",
    padding: "6px 14px",
    borderRadius: "20px"
  },

  matchActions: {
    marginTop: "16px",
    paddingTop: "14px",
    borderTop: "1px solid #dcfce7",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px"
  },

  applyBtn: {
    background: "#16a34a",
    color: "#ffffff",
    border: "none",
    padding: "8px 18px",
    borderRadius: "6px",
    fontWeight: "700",
    cursor: "pointer"
  },

  requestList: {
    display: "flex",
    flexDirection: "column",
    gap: "12px"
  },

  requestRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    padding: "14px 18px",
    borderRadius: "10px",
    gap: "16px"
  },

  badgePending: {
    background: "#fef3c7",
    color: "#d97706",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  badgeSuccess: {
    background: "#dcfce7",
    color: "#16a34a",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  badgeActive: {
    background: "#eff6ff",
    color: "#2563eb",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  badgeRejected: {
    background: "#fee2e2",
    color: "#dc2626",
    padding: "4px 10px",
    borderRadius: "20px",
    fontSize: "12px",
    fontWeight: "700"
  },

  profileGrid: {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
  },

  profileLabel: {
    fontSize: "12px",
    color: "#64748b",
    fontWeight: "600",
    textTransform: "uppercase"
  },

  profileVal: {
    fontSize: "15px",
    color: "#1e293b",
    marginTop: "4px",
    fontWeight: "500"
  },

  emptyState: {
    textAlign: "center",
    padding: "40px 20px",
    color: "#64748b"
  },
  matchesHeader: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "20px",
  marginBottom: "20px"
},

matchesEyebrow: {
  display: "block",
  color: "#2563eb",
  fontSize: "11px",
  fontWeight: "800",
  letterSpacing: "1.2px",
  marginBottom: "6px"
},

matchesHeading: {
  margin: 0,
  color: "#0f172a",
  fontSize: "28px",
  fontWeight: "800"
},

matchesSubtitle: {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: "14px"
},

matchSafetyBanner: {
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "12px",
  padding: "14px 18px",
  marginBottom: "22px",
  color: "#1e3a8a"
},

recommendationList: {
  display: "flex",
  flexDirection: "column",
  gap: "20px"
},

recommendationCard: {
  background: "#ffffff",
  border: "1px solid #dbe3ee",
  borderRadius: "16px",
  overflow: "hidden",
  boxShadow:
    "0 4px 18px rgba(15,23,42,0.05)"
},

recommendationTop: {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "18px 22px",
  borderBottom: "1px solid #f1f5f9"
},

recommendedBy: {
  display: "block",
  fontSize: "9px",
  fontWeight: "800",
  color: "#94a3b8",
  letterSpacing: "1px"
},

hospitalName: {
  display: "block",
  marginTop: "4px",
  color: "#334155",
  fontSize: "14px"
},

recommendationBadge: {
  background: "#ecfdf5",
  color: "#047857",
  padding: "5px 10px",
  borderRadius: "20px",
  fontSize: "11px",
  fontWeight: "800"
},

recommendationDonor: {
  display: "flex",
  alignItems: "center",
  gap: "14px",
  padding: "22px"
},

matchDonorAvatar: {
  width: "52px",
  height: "52px",
  borderRadius: "14px",
  background: "#dcfce7",
  color: "#047857",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "20px",
  fontWeight: "800"
},

matchSmallLabel: {
  color: "#94a3b8",
  fontSize: "9px",
  fontWeight: "800"
},

matchDonorName: {
  margin: "2px 0 7px",
  fontSize: "20px",
  color: "#0f172a"
},

matchTags: {
  display: "flex",
  gap: "7px"
},

matchTag: {
  background: "#f1f5f9",
  color: "#475569",
  padding: "4px 9px",
  borderRadius: "6px",
  fontSize: "11px",
  fontWeight: "700"
},

completenessBox: {
  margin: "0 22px 20px",
  padding: "16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: "10px"
},

completenessHeader: {
  display: "flex",
  justifyContent: "space-between",
  fontSize: "12px",
  color: "#475569",
  marginBottom: "8px"
},

completenessTrack: {
  height: "7px",
  background: "#dbeafe",
  borderRadius: "20px",
  overflow: "hidden"
},

completenessFill: {
  height: "100%",
  background: "#2563eb",
  borderRadius: "20px"
},

completenessNote: {
  display: "block",
  marginTop: "7px",
  color: "#94a3b8",
  fontSize: "10px"
},

matchEvidenceGrid: {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "20px",
  padding: "0 22px 20px"
},

matchEvidenceTitle: {
  color: "#334155",
  fontSize: "12px",
  margin: "0 0 10px",
  textTransform: "uppercase"
},

evidenceRow: {
  display: "flex",
  gap: "8px",
  alignItems: "flex-start",
  marginBottom: "8px",
  color: "#475569",
  fontSize: "12px",
  lineHeight: "1.5"
},

evidenceSuccess: {
  color: "#059669",
  fontWeight: "900"
},

evidenceWarning: {
  color: "#d97706",
  fontWeight: "900"
},

recommendationActions: {
  display: "flex",
  justifyContent: "flex-end",
  gap: "10px",
  padding: "16px 22px",
  background: "#fafcff",
  borderTop: "1px solid #f1f5f9"
},

declineMatchBtn: {
  padding: "9px 16px",
  background: "#ffffff",
  border: "1px solid #fecaca",
  color: "#dc2626",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
},

sendDonorBtn: {
  padding: "9px 18px",
  background: "#2563eb",
  border: "none",
  color: "#ffffff",
  borderRadius: "8px",
  fontWeight: "700",
  cursor: "pointer"
},

matchEmptyCard: {
  textAlign: "center",
  padding: "50px 20px",
  background: "#ffffff",
  border: "1px dashed #cbd5e1",
  borderRadius: "16px",
  color: "#64748b"
},

matchEmptyIcon: {
  fontSize: "34px"
},

historyMeta: {
  display: "block",
  marginTop: "4px",
  fontSize: "12px",
  color: "#64748b"
}
};