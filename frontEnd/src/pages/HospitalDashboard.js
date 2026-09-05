import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import PortalSidebar from "../components/PortalSidebar";
import { useAuth } from "../context/AuthContext";
import { authFetch } from "../config/api";

import "./HospitalDashboard.css";

export default function HospitalDashboard() {
  const { user, logout } = useAuth();

  const token = user?.token;

  const hospitalId =
    user?.hospitalId ||
    user?.userId ||
    user?._id ||
    user?.id;

  // ========================================
  // SIDEBAR
  // ========================================

  const [activeTab, setActiveTab] =
    useState("dashboard");

  // ========================================
  // DASHBOARD STATS
  // ========================================

  const [stats, setStats] =
    useState(null);

  const [
    loadingStats,
    setLoadingStats
  ] = useState(true);

  // ========================================
  // TRANSPLANT CASES
  // ========================================

  const [
    transplantCases,
    setTransplantCases
  ] = useState([]);

  const [
    loadingCases,
    setLoadingCases
  ] = useState(true);

  const [
    casesError,
    setCasesError
  ] = useState(null);

  const [
    allocationIds,
    setAllocationIds
  ] = useState({});

  const [
    allocatingId,
    setAllocatingId
  ] = useState(null);


  //======================================
  //Verification of hospital
  //======================================

const [medicalRecords, setMedicalRecords] = useState([]);
const [medicalLoading, setMedicalLoading] = useState(false);
const [medicalError, setMedicalError] = useState("");
const [verifyingId, setVerifyingId] = useState(null);
const [analyzingId, setAnalyzingId] = useState(null);

  // ========================================
  // OPERATIONS
  // ========================================

  const [
    operations,
    setOperations
  ] = useState([]);

  const [
    loadingOperations,
    setLoadingOperations
  ] = useState(true);

  const [
    operationsError,
    setOperationsError
  ] = useState(null);

  // ========================================
  // SCHEDULE MODAL
  // ========================================

  const [
    schedulingCase,
    setSchedulingCase
  ] = useState(null);

  const [
    scheduleDate,
    setScheduleDate
  ] = useState("");

  const [
    scheduleTime,
    setScheduleTime
  ] = useState("");

  const [
    surgeon,
    setSurgeon
  ] = useState("");

  const [
    scheduling,
    setScheduling
  ] = useState(false);

  const [
    scheduleError,
    setScheduleError
  ] = useState(null);

  // ========================================
  // LOAD STATS
  // ========================================

  const loadStats =
    useCallback(async () => {
      if (!hospitalId) {
        setLoadingStats(false);
        return;
      }

      setLoadingStats(true);

      try {
        const data =
          await authFetch(
            `/hospitals/${hospitalId}/stats`,
            {
              token
            }
          );

        setStats(data);
      } catch (error) {
        console.error(
          "Hospital stats error:",
          error
        );

        setStats(null);
      } finally {
        setLoadingStats(false);
      }
    }, [hospitalId, token]);

  // ========================================
  // LOAD TRANSPLANT CASES
  // ========================================

  const loadTransplantCases =
    useCallback(async () => {
      setLoadingCases(true);
      setCasesError(null);

      try {
        const data =
          await authFetch(
            "/hospital/requests/accepted",
            {
              token
            }
          );

        const cases =
          Array.isArray(data)
            ? data
            : [];

        setTransplantCases(cases);

        const allocationMap = {};

        cases.forEach(
          (item) => {
            if (
              item.allocationId
            ) {
              allocationMap[
                item.id
              ] =
                item.allocationId;
            }
          }
        );

        setAllocationIds(
          (previous) => ({
            ...previous,
            ...allocationMap
          })
        );
      } catch (error) {
        console.error(
          "Failed to load transplant cases:",
          error
        );

        setCasesError(
          error.message ||
            "Unable to load donor-approved transplant cases."
        );
      } finally {
        setLoadingCases(false);
      }
    }, [token]);

  // ========================================
  // LOAD OPERATIONS
  // ========================================

  const loadOperations =
    useCallback(async () => {
      if (!hospitalId) {
        setLoadingOperations(
          false
        );
        return;
      }

      setLoadingOperations(true);
      setOperationsError(null);

      try {
        const data =
          await authFetch(
            `/hospitals/${hospitalId}/operations`,
            {
              token
            }
          );

        setOperations(
          Array.isArray(data)
            ? data
            : []
        );
      } catch (error) {
        console.error(
          "Operations error:",
          error
        );

        setOperationsError(
          error.message ||
            "Unable to load scheduled operations."
        );
      } finally {
        setLoadingOperations(
          false
        );
      }
    }, [hospitalId, token]);

  // ========================================
  // INITIAL LOAD
  // ========================================

  useEffect(() => {
    loadStats();
    loadTransplantCases();
    loadOperations();
  }, [
    loadStats,
    loadTransplantCases,
    loadOperations
  ]);

  // ========================================
  // INITIATE ALLOCATION
  // ========================================

  const initiateAllocation =
    async (request) => {
      if (!hospitalId) {
        alert(
          "Hospital ID is missing. Please login again."
        );
        return;
      }

      try {
        setAllocatingId(
          request.id
        );

        const data =
          await authFetch(
            "/allocations",
            {
              method: "POST",
              token,

              body: {
                requestId:
                  request.id,

                hospitalId
              }
            }
          );

        const allocationId =
          data?.allocation?._id ||
          data?.allocation?.id ||
          data?._id ||
          data?.id;

        if (!allocationId) {
          throw new Error(
            "Allocation was created but allocation ID was not returned."
          );
        }

        setAllocationIds(
          (previous) => ({
            ...previous,

            [request.id]:
              allocationId
          })
        );

        setTransplantCases(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                request.id
                  ? {
                      ...item,

                      status:
                        "Hospital Review",

                      allocationId
                    }
                  : item
            )
        );

        setSchedulingCase({
          ...request,

          status:
            "Hospital Review",

          allocationId
        });

        await loadStats();
      } catch (error) {
        console.error(
          "Allocation failed:",
          error
        );

        alert(
          error.message ||
            "Could not initiate hospital allocation."
        );
      } finally {
        setAllocatingId(null);
      }
    };

  // ========================================
  // OPEN SCHEDULE MODAL
  // ========================================

  const openScheduleModal =
    (request) => {
      const allocationId =
        request.allocationId ||
        allocationIds[
          request.id
        ];

      if (!allocationId) {
        alert(
          "Allocation ID is missing. Initiate allocation first."
        );

        return;
      }

      setSchedulingCase({
        ...request,
        allocationId
      });

      setScheduleDate("");
      setScheduleTime("");
      setSurgeon("");
      setScheduleError(null);
    };

  // ========================================
  // SCHEDULE TRANSPLANT
  // ========================================

  const scheduleTransplant =
    async () => {
      if (!schedulingCase) {
        return;
      }

      if (
        !scheduleDate ||
        !scheduleTime
      ) {
        setScheduleError(
          "Please select both date and time."
        );

        return;
      }

      const allocationId =
        schedulingCase
          .allocationId ||
        allocationIds[
          schedulingCase.id
        ];

      if (!allocationId) {
        setScheduleError(
          "Allocation ID is missing."
        );

        return;
      }

      try {
        setScheduling(true);
        setScheduleError(null);

        await authFetch(
          "/appointments",
          {
            method: "POST",
            token,

            body: {
              allocationId,
              date:
                scheduleDate,
              time:
                scheduleTime,

              surgeon:
                surgeon ||
                "To Be Assigned"
            }
          }
        );

        setTransplantCases(
          (previous) =>
            previous.map(
              (item) =>
                item.id ===
                schedulingCase.id
                  ? {
                      ...item,

                      status:
                        "Scheduled",

                      allocationId
                    }
                  : item
            )
        );

        setSchedulingCase(null);

        setScheduleDate("");
        setScheduleTime("");
        setSurgeon("");

        await Promise.all([
          loadOperations(),
          loadStats(),
          loadTransplantCases()
        ]);

        alert(
          "Transplant appointment scheduled successfully."
        );
      } catch (error) {
        console.error(
          "Scheduling failed:",
          error
        );

        setScheduleError(
          error.message ||
            "Unable to schedule transplant."
        );
      } finally {
        setScheduling(false);
      }
    };

  // ========================================
  // STATUS CLASS
  // ========================================

  const getStatusClass =
    (status) => {
      switch (status) {
        case "Accepted":
          return "hospital-badge-accepted";

        case "Hospital Review":
          return "hospital-badge-review";

        case "Scheduled":
          return "hospital-badge-scheduled";

        case "Completed":
          return "hospital-badge-completed";

        default:
          return "hospital-badge-pending";
      }
    };

  // ========================================
  // METRICS
  // ========================================

  const awaitingHospital =
    transplantCases.filter(
      (item) =>
        item.status ===
        "Accepted"
    ).length;

  const scheduledCount =
    transplantCases.filter(
      (item) =>
        item.status ===
        "Scheduled"
    ).length;

  // ========================================
  // CASES TABLE
  // ========================================

  const renderCases = (
    compact = false
  ) => {
    const visibleCases =
      compact
        ? transplantCases.slice(
            0,
            4
          )
        : transplantCases;

    return (
      <section className="hospital-panel">
        <div className="hospital-panel-header">
          <div>
            <h2 className="hospital-panel-title">
              🫀 Donor-Approved
              Transplant Cases
            </h2>

            {!compact && (
              <p className="hospital-panel-description">
                Review accepted
                donor-recipient matches
                and move them through
                allocation and scheduling.
              </p>
            )}
          </div>

          <div className="hospital-header-actions">
            <span className="hospital-purple-pill">
              {awaitingHospital} Pending
            </span>

            <button
              className="hospital-refresh-btn"
              onClick={
                loadTransplantCases
              }
            >
              ↻ Refresh
            </button>
          </div>
        </div>

        {casesError && (
          <div className="hospital-error-box">
            ⚠️ {casesError}
          </div>
        )}

        {loadingCases ? (
          <p className="hospital-muted">
            Loading transplant cases...
          </p>
        ) : visibleCases.length ===
          0 ? (
          <EmptyState
            icon="🏥"
            title="No donor-approved cases"
            text="Cases appear here after a donor accepts a recipient request."
          />
        ) : (
          <div className="hospital-table-wrapper">
            <table className="hospital-table">
              <thead>
                <tr>
                  <th>
                    Recipient
                  </th>

                  <th>
                    Donor
                  </th>

                  <th>
                    Organ
                  </th>

                  <th>
                    Blood Group
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
                {visibleCases.map(
                  (request) => {
                    const allocationId =
                      request.allocationId ||
                      allocationIds[
                        request.id
                      ];

                    return (
                      <tr
                        key={
                          request.id
                        }
                      >
                        <td className="hospital-td-bold">
                          {request.recipientName ||
                            "Recipient"}
                        </td>

                        <td>
                          {request.donorName ||
                            "Donor"}
                        </td>

                        <td>
                          {
                            request.organ
                          }
                        </td>

                        <td>
                          {
                            request.bloodGroup
                          }
                        </td>

                        <td>
                          <span
                            className={getStatusClass(
                              request.status
                            )}
                          >
                            {
                              request.status
                            }
                          </span>
                        </td>

                        {!compact && (
                          <td>
                            {request.status ===
                              "Accepted" && (
                              <button
                                className="hospital-allocate-btn"
                                disabled={
                                  allocatingId ===
                                  request.id
                                }
                                onClick={() =>
                                  initiateAllocation(
                                    request
                                  )
                                }
                              >
                                {allocatingId ===
                                request.id
                                  ? "Allocating..."
                                  : "Initiate Allocation"}
                              </button>
                            )}

                            {request.status ===
                              "Hospital Review" && (
                              <button
                                className="hospital-schedule-btn"
                                onClick={() =>
                                  openScheduleModal({
                                    ...request,
                                    allocationId
                                  })
                                }
                              >
                                📅 Schedule
                              </button>
                            )}

                            {request.status ===
                              "Scheduled" && (
                              <span className="hospital-done-text">
                                ✓ Appointment Scheduled
                              </span>
                            )}

                            {request.status ===
                              "Completed" && (
                              <span className="hospital-done-text">
                                ✓ Completed
                              </span>
                            )}
                          </td>
                        )}
                      </tr>
                    );
                  }
                )}
              </tbody>
            </table>
          </div>
        )}

        {compact &&
          transplantCases.length >
            4 && (
            <button
              className="hospital-link-btn"
              onClick={() =>
                setActiveTab(
                  "cases"
                )
              }
            >
              View all cases →
            </button>
          )}
      </section>
    );
  };
  //==================================
  // VERIFICATION TAB
  //==================================

  // LOAD PENDING MEDICAL RECORDS

  const loadPendingMedicalRecords = async () => {
  try {
    setMedicalLoading(true);
    setMedicalError("");

    const data = await authFetch(
      "/medical-records/hospital/pending",
      {
        token
      }
    );

    setMedicalRecords(
      Array.isArray(data)
        ? data
        : []
    );

  } catch (error) {
    console.error(
      "Load Medical Verification Queue Error:",
      error
    );

    setMedicalError(
      error.message ||
      "Unable to load medical records."
    );

  } finally {
    setMedicalLoading(false);
  }
};

// LOAD WHEN VERIFICATION TAB OPENS
  useEffect(() => {
  if (
    activeTab === "verification"
  ) {
    loadPendingMedicalRecords();
  }
}, [activeTab]);

const handleMedicalVerification =
  async (
    recordId,
    status
  ) => {
    try {
      setVerifyingId(recordId);
      setMedicalError("");

      await authFetch(
        `/medical-records/${recordId}/verify`,
        {
          method: "PATCH",
          token,
          body: {
            status,
            verifierId:
              hospitalId
          }
        }
      );

      await loadPendingMedicalRecords();

    } catch (error) {
      console.error(
        "Medical Verification Error:",
        error
      );

      setMedicalError(
        error.message ||
        "Unable to update medical record."
      );

    } finally {
      setVerifyingId(null);
    }
  };
  // ==========================================
// ANALYZE MEDICAL RECORD
// ==========================================

const handleAnalyzeMedicalRecord =
  async (recordId) => {

    try {

      setAnalyzingId(recordId);
      setMedicalError("");

      await authFetch(
        `/medical-records/${recordId}/analyze`,
        {
          method: "POST",
          token
        }
      );

      // Reload queue so extracted values
      // immediately appear on screen
      await loadPendingMedicalRecords();

    } catch (error) {

      console.error(
        "Medical Record Analysis Error:",
        error
      );

      setMedicalError(
        error.message ||
        "Unable to analyze medical record."
      );

    } finally {

      setAnalyzingId(null);

    }
  };

const handleViewMedicalRecord =
  (recordId) => {
    window.open(
      `http://localhost:8080/api/medical-records/file/${recordId}`,
      "_blank"
    );
  };
// ==========================================
// RENDER MEDICAL VERIFICATION TAB
// ==========================================

const renderMedicalVerification = () => {
  if (activeTab !== "verification") {
    return null;
  }

  return (
    <div className="mv-page">

      {/* HEADER */}
      <div className="mv-page-header">

        <div>
          <div className="mv-eyebrow">
            CLINICAL REVIEW
          </div>

          <h1>
            Medical Verification
          </h1>

          <p>
            Review recipient medical documents,
            validate extracted clinical data and
            approve records for compatibility matching.
          </p>
        </div>


        <div className="mv-header-stat">

          <div className="mv-header-stat-icon">
            ✓
          </div>

          <div>
            <strong>
              {medicalRecords.length}
            </strong>

            <span>
              Pending Reviews
            </span>
          </div>

        </div>

      </div>


      {/* INFO BANNER */}
      <div className="mv-info-banner">

        <div className="mv-info-icon">
          i
        </div>

        <div>
          <strong>
            Hospital verification required
          </strong>

          <p>
            Only verified medical information
            should be used by the OrganSync
            compatibility engine.
          </p>
        </div>

      </div>


      {/* ERROR */}
      {medicalError && (
        <div className="mv-error">
          {medicalError}
        </div>
      )}


      {/* LOADING */}
      {medicalLoading ? (

        <div className="mv-state-card">

          <div className="mv-loader" />

          <h3>
            Loading medical records
          </h3>

          <p>
            Retrieving documents waiting
            for clinical review...
          </p>

        </div>

      ) : medicalRecords.length === 0 ? (

        /* EMPTY STATE */

        <div className="mv-state-card">

          <div className="mv-empty-icon">
            ✓
          </div>

          <h3>
            You're all caught up
          </h3>

          <p>
            No medical documents are currently
            waiting for verification.
          </p>

        </div>

      ) : (

        /* RECORDS */

        <div className="mv-record-list">

          {medicalRecords.map((record) => {

            const extracted =
              record.extractedData || {};

            const isExtracted =
              record.extractionStatus === "Extracted";

            const patientName =
              record.patient?.fullName ||
              "Unknown Patient";

            const initials =
              patientName
                .split(" ")
                .filter(Boolean)
                .map((word) =>
                  word.charAt(0)
                )
                .join("")
                .substring(0, 2)
                .toUpperCase();


            return (
              <div
                key={record.id}
                className="mv-record-card"
              >

                {/* ===================================== */}
                {/* PATIENT HEADER */}
                {/* ===================================== */}

                <div className="mv-card-header">

                  <div className="mv-patient-main">

                    <div className="mv-avatar">
                      {initials}
                    </div>


                    <div>

                      <div className="mv-patient-name-row">

                        <h2>
                          {patientName}
                        </h2>


                        <span
                          className={
                            isExtracted
                              ? "mv-status mv-status-success"
                              : "mv-status mv-status-warning"
                          }
                        >

                          <span className="mv-status-dot" />

                          {record.extractionStatus}

                        </span>

                      </div>


                      <div className="mv-patient-meta">

                        <span>
                          {
                            record.patient?.email ||
                            "-"
                          }
                        </span>

                        <span className="mv-dot">
                          •
                        </span>

                        <span>
                          {
                            record.patient?.phone ||
                            "-"
                          }
                        </span>

                      </div>

                    </div>

                  </div>


                  {/* DOCUMENT TYPE */}

                  <div className="mv-document-badge">

                    <span className="mv-document-icon">
                      ▤
                    </span>

                    <div>

                      <small>
                        DOCUMENT
                      </small>

                      <strong>
                        {record.documentType}
                      </strong>

                    </div>

                  </div>

                </div>


                {/* ===================================== */}
                {/* BODY */}
                {/* ===================================== */}

                <div className="mv-card-body">


                  {/* LEFT CONTENT */}

                  <div className="mv-main-column">


                    {/* ================================ */}
                    {/* RECIPIENT DETAILS */}
                    {/* ================================ */}

                    <div className="mv-section">

                      <div className="mv-section-header">

                        <div>

                          <span className="mv-section-number">
                            01
                          </span>

                          <h3>
                            Recipient Details
                          </h3>

                        </div>

                      </div>


                      <div className="mv-info-grid">


                        <div className="mv-info-item">

                          <span>
                            Organ Required
                          </span>

                          <strong>
                            {
                              record.patient?.organ ||
                              "Not specified"
                            }
                          </strong>

                        </div>


                        <div className="mv-info-item">

                          <span>
                            Registered Blood Group
                          </span>

                          <strong className="mv-blood-value">
                            {
                              record.patient?.bloodGroup ||
                              "-"
                            }
                          </strong>

                        </div>


                        <div className="mv-info-item">

                          <span>
                            Laboratory
                          </span>

                          <strong>
                            {
                              record.laboratory ||
                              "-"
                            }
                          </strong>

                        </div>


                        <div className="mv-info-item">

                          <span>
                            Report Date
                          </span>

                          <strong>
                            {
                              record.reportDate
                                ? new Date(
                                    record.reportDate
                                  ).toLocaleDateString(
                                    "en-IN"
                                  )
                                : "-"
                            }
                          </strong>

                        </div>

                      </div>

                    </div>


                    {/* ================================ */}
                    {/* EXTRACTED DATA */}
                    {/* ================================ */}

                    <div className="mv-section">

                      <div className="mv-section-header">

                        <div>

                          <span className="mv-section-number">
                            02
                          </span>

                          <h3>
                            Extracted Clinical Data
                          </h3>

                        </div>


                        <span
                          className={
                            isExtracted
                              ? "mv-ai-badge success"
                              : "mv-ai-badge pending"
                          }
                        >
                          {
                            isExtracted
                              ? "Extraction Complete"
                              : "Awaiting Analysis"
                          }
                        </span>

                      </div>


                      <div className="mv-clinical-grid">


                        {/* BLOOD */}

                        <div className="mv-clinical-card">

                          <div className="mv-clinical-icon">
                            🩸
                          </div>

                          <div>

                            <span>
                              Blood Group
                            </span>

                            <strong>
                              {
                                extracted.bloodGroup ||
                                "Not detected"
                              }
                            </strong>

                          </div>

                        </div>


                        {/* HEIGHT */}

                        <div className="mv-clinical-card">

                          <div className="mv-clinical-icon">
                            ↕
                          </div>

                          <div>

                            <span>
                              Height
                            </span>

                            <strong>
                              {
                                extracted.heightCm
                                  ? `${extracted.heightCm} cm`
                                  : "Not available"
                              }
                            </strong>

                          </div>

                        </div>


                        {/* WEIGHT */}

                        <div className="mv-clinical-card">

                          <div className="mv-clinical-icon">
                            ⚖
                          </div>

                          <div>

                            <span>
                              Weight
                            </span>

                            <strong>
                              {
                                extracted.weightKg
                                  ? `${extracted.weightKg} kg`
                                  : "Not available"
                              }
                            </strong>

                          </div>

                        </div>

                      </div>


                      {/* HLA */}

                      <div className="mv-hla-box">

                        <div className="mv-hla-title">
                          HLA Typing
                        </div>


                        <div className="mv-hla-values">

                          <span>
                            HLA-A

                            <strong>
                              {
                                extracted.hla?.hlaA?.length
                                  ? extracted.hla.hlaA.join(", ")
                                  : "—"
                              }
                            </strong>
                          </span>


                          <span>
                            HLA-B

                            <strong>
                              {
                                extracted.hla?.hlaB?.length
                                  ? extracted.hla.hlaB.join(", ")
                                  : "—"
                              }
                            </strong>
                          </span>


                          <span>
                            HLA-DR

                            <strong>
                              {
                                extracted.hla?.hlaDR?.length
                                  ? extracted.hla.hlaDR.join(", ")
                                  : "—"
                              }
                            </strong>
                          </span>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ================================= */}
                  {/* RIGHT REVIEW PANEL */}
                  {/* ================================= */}

                  <aside className="mv-review-panel">

                    <div className="mv-review-title">
                      Review Document
                    </div>


                    <div className="mv-file-card">

                      <div className="mv-file-icon">
                        PDF
                      </div>


                      <div className="mv-file-content">

                        <strong>
                          {record.fileName}
                        </strong>

                        <span>
                          {record.documentType}
                        </span>

                      </div>

                    </div>


                    <button
                      type="button"
                      className="mv-view-btn"
                      onClick={() =>
                        handleViewMedicalRecord(
                          record.id
                        )
                      }
                    >
                      View Original Report
                    </button>


                    <div className="mv-review-divider" />


                    <div className="mv-review-check">

                      <span>
                        Verification status
                      </span>

                      <strong>
                        Pending Review
                      </strong>

                    </div>


                    {/* ANALYSIS WARNING */}

                    {!isExtracted && (

                      <div className="mv-warning-box">

                        <strong>
                          Analysis required
                        </strong>

                        <p>
                          This document must be
                          analyzed before it can
                          be verified.
                        </p>

                      </div>

                    )}


                    {/* ====================================== */}
{/* ACTIONS */}
{/* ====================================== */}

<div className="mv-review-actions">

  {/* REJECT */}
  <button
    type="button"
    className="mv-reject-btn"
    disabled={
      verifyingId === record.id ||
      analyzingId === record.id
    }
    onClick={() =>
      handleMedicalVerification(
        record.id,
        "Rejected"
      )
    }
  >
    ✕ Reject
  </button>


  {/* ====================================== */}
  {/* NOT PROCESSED → SHOW ANALYZE */}
  {/* EXTRACTED → SHOW VERIFY */}
  {/* ====================================== */}

  {!isExtracted ? (

    <button
      type="button"
      className="mv-analyze-btn"
      disabled={
        analyzingId === record.id
      }
      onClick={() =>
        handleAnalyzeMedicalRecord(
          record.id
        )
      }
    >
      {
        analyzingId === record.id
          ? "Analyzing..."
          : "Analyze Document"
      }
    </button>

  ) : (

    <button
      type="button"
      className="mv-verify-btn"
      disabled={
        verifyingId === record.id ||
        analyzingId === record.id
      }
      onClick={() =>
        handleMedicalVerification(
          record.id,
          "Verified"
        )
      }
    >
      {
        verifyingId === record.id
          ? "Processing..."
          : "✓ Verify Record"
      }
    </button>

  )}

</div>

                  </aside>

                </div>

              </div>
            );
          })}

        </div>
      )}

    </div>
  );
};

  // ========================================
  // OPERATIONS
  // ========================================

  const renderOperations = (
    compact = false
  ) => {
    const visibleOperations =
      compact
        ? operations.slice(
            0,
            4
          )
        : operations;

    return (
      <section className="hospital-panel">
        <div className="hospital-panel-header">
          <div>
            <h2 className="hospital-panel-title">
              🏥 Scheduled Hospital
              Operations
            </h2>

            {!compact && (
              <p className="hospital-panel-description">
                Transplant team
                assignments, surgeons,
                schedules and
                operating-room readiness.
              </p>
            )}
          </div>

          <button
            className="hospital-refresh-btn"
            onClick={
              loadOperations
            }
          >
            ↻ Refresh
          </button>
        </div>

        {operationsError && (
          <div className="hospital-error-box">
            ⚠️ {operationsError}
          </div>
        )}

        {loadingOperations ? (
          <p className="hospital-muted">
            Loading scheduled
            operations...
          </p>
        ) : visibleOperations.length ===
          0 ? (
          <EmptyState
            icon="📅"
            title="No Operations Scheduled"
            text="Schedule a donor-approved transplant case first."
          />
        ) : (
          <div className="hospital-table-wrapper">
            <table className="hospital-table">
              <thead>
                <tr>
                  <th>
                    Patient
                  </th>

                  <th>
                    Organ
                  </th>

                  <th>
                    Surgeon
                  </th>

                  <th>
                    Scheduled Time
                  </th>

                  <th>
                    Status
                  </th>
                </tr>
              </thead>

              <tbody>
                {visibleOperations.map(
                  (operation) => (
                    <tr
                      key={
                        operation.id ||
                        operation._id
                      }
                    >
                      <td className="hospital-td-bold">
                        {operation.patient ||
                          "Patient"}
                      </td>

                      <td>
                        {operation.organ}
                      </td>

                      <td>
                        {operation.surgeon ||
                          "To Be Assigned"}
                      </td>

                      <td>
                        {operation.scheduledTime ||
                          "—"}
                      </td>

                      <td>
                        <span
                          className={
                            operation.status ===
                            "OR Ready"
                              ? "hospital-badge-completed"
                              : "hospital-badge-review"
                          }
                        >
                          {operation.status ||
                            "Scheduled"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}

        {compact &&
          operations.length > 4 && (
            <button
              className="hospital-link-btn"
              onClick={() =>
                setActiveTab(
                  "operations"
                )
              }
            >
              View all operations →
            </button>
          )}
      </section>
    );
  };

  // ========================================
  // APPOINTMENTS TAB
  // ========================================

  const renderAppointments =
    () => (
      <section className="hospital-panel">
        <div className="hospital-page-heading">
          <h1>
            Appointments
          </h1>

          <p>
            Schedule approved transplant
            cases and manage upcoming
            hospital procedures.
          </p>
        </div>

        <div className="hospital-appointment-summary">
          <div className="hospital-appointment-icon">
            📅
          </div>

          <div>
            <h3>
              {scheduledCount} Scheduled
              Transplant
              {scheduledCount === 1
                ? ""
                : "s"}
            </h3>

            <p>
              To schedule a new
              transplant, open
              Transplant Cases and
              initiate allocation for
              an accepted case.
            </p>

            <button
              className="hospital-primary-btn"
              onClick={() =>
                setActiveTab(
                  "cases"
                )
              }
            >
              Open Transplant Cases
            </button>
          </div>
        </div>

        <div className="hospital-section-spacing">
          {renderOperations(false)}
        </div>
      </section>
    );

  // ========================================
  // DASHBOARD
  // ========================================

  const renderDashboard =
    () => (
      <>
        <section className="hospital-welcome-banner">
          <div>
            <span className="hospital-welcome-label">
              VERIFIED TRANSPLANT UNIT
            </span>

            <h1>
              Welcome,{" "}
              {user?.fullName ||
                "Partner Hospital"}
            </h1>

            <p>
              Manage donor-approved
              transplant cases,
              allocations and surgical
              schedules through
              OrganSync.
            </p>
          </div>

          <div className="hospital-verified-card">
            <span className="hospital-verified-icon">
              🏥
            </span>

            <div>
              <small>
                Hospital ID
              </small>

              <strong>
                #
                {hospitalId
                  ? String(
                      hospitalId
                    )
                      .slice(-6)
                      .toUpperCase()
                  : "N/A"}
              </strong>
            </div>
          </div>
        </section>

        <div className="hospital-metrics-grid">
          <MetricCard
            label="Active Donor Organs"
            loading={
              loadingStats
            }
            value={
              stats?.activeDonorOrgans !=
              null
                ? `${stats.activeDonorOrgans} Available`
                : "—"
            }
            sub="Available donor pledges"
            variant="primary"
          />

          <MetricCard
            label="Urgent Waitlist"
            loading={
              loadingStats
            }
            value={
              stats?.urgentWaitlist !=
              null
                ? `${stats.urgentWaitlist} Critical`
                : "—"
            }
            sub="Active transplant candidates"
            variant="warning"
          />

          <MetricCard
            label="Transplants This Month"
            loading={
              loadingStats
            }
            value={
              stats?.transplantsThisMonth !=
              null
                ? `${stats.transplantsThisMonth} Completed`
                : "—"
            }
            sub={
              stats?.successRate !=
              null
                ? `${stats.successRate}% Success Rate`
                : "Completed procedures"
            }
            variant="success"
          />

          <MetricCard
            label="Cases Awaiting Hospital"
            loading={
              loadingCases
            }
            value={`${awaitingHospital} Pending`}
            sub="Donor-approved cases"
            variant="purple"
          />
        </div>

        {renderCases(true)}

        <div className="hospital-section-spacing">
          {renderOperations(true)}
        </div>
      </>
    );

  // ========================================
  // MAIN
  // ========================================

  return (
    <div className="hospital-layout">
      <PortalSidebar
        portal="hospital"
        activeTab={
          activeTab
        }
        setActiveTab={
          setActiveTab
        }
        logout={logout}
      />

      <main className="hospital-main">

  {activeTab === "dashboard" &&
    renderDashboard()
  }

  {activeTab === "cases" &&
    renderCases(false)
  }

  {activeTab === "verification" &&
    renderMedicalVerification()
  }

  {activeTab === "operations" &&
    renderOperations(false)
  }

  {activeTab === "appointments" &&
    renderAppointments()
  }

</main>

      {/* ====================================
          SCHEDULE MODAL
      ==================================== */}

      {schedulingCase && (
        <div
          className="hospital-modal-overlay"
          onClick={() =>
            !scheduling &&
            setSchedulingCase(null)
          }
        >
          <div
            className="hospital-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <h2 className="hospital-modal-title">
              Schedule Transplant
            </h2>

            <p className="hospital-modal-description">
              Confirm the hospital
              schedule for this
              donor-approved transplant.
            </p>

            <div className="hospital-case-summary">
              <SummaryItem
                label="Recipient"
                value={
                  schedulingCase.recipientName ||
                  "Recipient"
                }
              />

              <SummaryItem
                label="Donor"
                value={
                  schedulingCase.donorName ||
                  "Donor"
                }
              />

              <SummaryItem
                label="Organ"
                value={
                  schedulingCase.organ
                }
              />

              <SummaryItem
                label="Blood Group"
                value={
                  schedulingCase.bloodGroup
                }
              />
            </div>

            <label className="hospital-label">
              Transplant Date
            </label>

            <input
              type="date"
              className="hospital-input"
              value={
                scheduleDate
              }
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(event) =>
                setScheduleDate(
                  event.target.value
                )
              }
            />

            <label className="hospital-label">
              Time
            </label>

            <input
              type="time"
              className="hospital-input"
              value={
                scheduleTime
              }
              onChange={(event) =>
                setScheduleTime(
                  event.target.value
                )
              }
            />

            <label className="hospital-label">
              Surgeon
            </label>

            <input
              type="text"
              className="hospital-input"
              value={surgeon}
              placeholder="e.g. Dr. Sharma"
              onChange={(event) =>
                setSurgeon(
                  event.target.value
                )
              }
            />

            {scheduleError && (
              <div className="hospital-error-box">
                ⚠️ {scheduleError}
              </div>
            )}

            <div className="hospital-modal-actions">
              <button
                className="hospital-secondary-btn"
                disabled={
                  scheduling
                }
                onClick={() =>
                  setSchedulingCase(
                    null
                  )
                }
              >
                Cancel
              </button>

              <button
                className="hospital-primary-btn"
                disabled={
                  scheduling
                }
                onClick={
                  scheduleTransplant
                }
              >
                {scheduling
                  ? "Scheduling..."
                  : "Confirm Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================================
// HELPER COMPONENTS
// ========================================

function MetricCard({
  label,
  loading,
  value,
  sub,
  variant = ""
}) {
  return (
    <div className="hospital-metric-card">
      <span className="hospital-metric-label">
        {label}
      </span>

      <h3
        className={`hospital-metric-value ${
          variant
            ? `hospital-metric-${variant}`
            : ""
        }`}
      >
        {loading
          ? "…"
          : value}
      </h3>

      <small className="hospital-metric-sub">
        {sub}
      </small>
    </div>
  );
}

function EmptyState({
  icon,
  title,
  text
}) {
  return (
    <div className="hospital-empty-state">
      <span className="hospital-empty-icon">
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

function SummaryItem({
  label,
  value
}) {
  return (
    <div className="hospital-summary-item">
      <small>
        {label}
      </small>

      <strong>
        {value || "—"}
      </strong>
    </div>
  );
}