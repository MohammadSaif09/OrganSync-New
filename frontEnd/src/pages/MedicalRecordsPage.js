import React, {
  useCallback,
  useEffect,
  useState
} from "react";

import { useAuth } from "../context/AuthContext";

import {
  authFetch,
  API_BASE_URL
} from "../config/api";

import "./MedicalRecordsPage.css";


export default function MedicalRecordsPage() {

  const { user } = useAuth();


  const [
    records,
    setRecords
  ] = useState([]);


  const [
    loading,
    setLoading
  ] = useState(true);


  const [
    error,
    setError
  ] = useState("");


  const [
    uploadOpen,
    setUploadOpen
  ] = useState(false);


  const [
    uploading,
    setUploading
  ] = useState(false);


  const [
    selectedFile,
    setSelectedFile
  ] = useState(null);


  const [
    formData,
    setFormData
  ] = useState({
    documentType:
      "Blood Group Report",

    laboratory:
      "",

    reportDate:
      ""
  });


  // ==========================================
  // LOAD MEDICAL RECORDS
  // ==========================================

  const loadRecords =
    useCallback(
      async () => {

        if (!user?.userId) {
          setRecords([]);

          setError(
            "Recipient user ID is missing. Please log out and log in again."
          );

          setLoading(false);

          return;
        }


        try {

          setLoading(true);
          setError("");


          console.log(
            "Loading medical records for:",
            user.userId
          );


          const data =
            await authFetch(
              `/medical-records/${user.userId}`
            );


          console.log(
            "Medical Records Response:",
            data
          );


          setRecords(
            Array.isArray(data)
              ? data
              : []
          );


        } catch (err) {

          console.error(
            "Load Medical Records Error:",
            err
          );


          setRecords([]);


          setError(
            err.message ||
              "Unable to load medical records."
          );


        } finally {

          setLoading(false);

        }

      },
      [user?.userId]
    );


  useEffect(() => {

    loadRecords();

  }, [loadRecords]);


  // ==========================================
  // FORM CHANGE
  // ==========================================

  const handleChange =
    (event) => {

      const {
        name,
        value
      } = event.target;


      setFormData(
        (previous) => ({
          ...previous,

          [name]:
            value
        })
      );

    };


  // ==========================================
  // UPLOAD RECORD
  // ==========================================

  const handleUpload =
    async (event) => {

      event.preventDefault();


      if (!selectedFile) {

        setError(
          "Please select a medical document."
        );

        return;

      }


      if (!user?.userId) {

        setError(
          "Recipient user ID is missing."
        );

        return;

      }


      try {

        setUploading(true);
        setError("");


        const body =
          new FormData();


        body.append(
          "file",
          selectedFile
        );


        body.append(
          "documentType",
          formData.documentType
        );


        if (
          formData.laboratory
        ) {

          body.append(
            "laboratory",
            formData.laboratory
          );

        }


        if (
          formData.reportDate
        ) {

          body.append(
            "reportDate",
            formData.reportDate
          );

        }


        const data =
          await authFetch(
            `/medical-records/${user.userId}/upload`,
            {
              method:
                "POST",

              body
            }
          );


        console.log(
          "Medical Record Uploaded:",
          data
        );


        setUploadOpen(
          false
        );


        setSelectedFile(
          null
        );


        setFormData({
          documentType:
            "Blood Group Report",

          laboratory:
            "",

          reportDate:
            ""
        });


        await loadRecords();


      } catch (err) {

        console.error(
          "Upload Medical Record Error:",
          err
        );


        setError(
          err.message ||
            "Unable to upload medical record."
        );


      } finally {

        setUploading(
          false
        );

      }

    };


  // ==========================================
  // VIEW FILE
  // ==========================================

  const handleView =
    (recordId) => {

      window.open(
        `${API_BASE_URL}/medical-records/file/${recordId}`,
        "_blank",
        "noopener,noreferrer"
      );

    };


  // ==========================================
  // DELETE RECORD
  // ==========================================

  const handleDelete =
    async (recordId) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this medical record?"
        );


      if (!confirmed) {
        return;
      }


      try {

        setError("");


        await authFetch(
          `/medical-records/${recordId}`,
          {
            method:
              "DELETE"
          }
        );


        setRecords(
          (previous) =>
            previous.filter(
              (record) =>
                record.id !==
                recordId
            )
        );


      } catch (err) {

        console.error(
          "Delete Medical Record Error:",
          err
        );


        setError(
          err.message ||
            "Unable to delete medical record."
        );

      }

    };


  // ==========================================
  // STATUS HELPERS
  // ==========================================

  const getVerificationClass =
    (status) => {

      if (
        status ===
        "Verified"
      ) {
        return "verified";
      }


      if (
        status ===
        "Rejected"
      ) {
        return "rejected";
      }


      return "pending";

    };


  const getExtractionClass =
    (status) => {

      if (
        status ===
        "Extracted"
      ) {
        return "extracted";
      }


      if (
        status ===
        "Failed"
      ) {
        return "failed";
      }


      return "not-processed";

    };


  // ==========================================
  // MATCHING READINESS
  // ==========================================

  const hasBloodReport =
    records.some(
      (record) =>
        record.documentType ===
        "Blood Group Report"
    );


  const hasHlaReport =
    records.some(
      (record) =>
        record.documentType ===
        "HLA Typing Report"
    );


  const hasCrossmatch =
    records.some(
      (record) =>
        record.documentType ===
        "Crossmatch Report"
    );


  const completedRequired =
    [
      hasBloodReport,
      hasHlaReport,
      hasCrossmatch
    ].filter(Boolean)
      .length;


  const readiness =
    Math.round(
      (
        completedRequired /
        3
      ) *
        100
    );


  // ==========================================
  // UI
  // ==========================================

  return (

    <div className="medical-records-page">


      {/* ======================================
          PAGE HEADER
      ======================================= */}

      <div className="medical-records-header">

        <div>

          <h1>
            Medical Records
          </h1>

          <p>
            Upload and manage medical
            documents used for transplant
            compatibility analysis.
          </p>

        </div>


        <button
          type="button"
          className="medical-upload-button"
          onClick={() => {

            setError("");

            setUploadOpen(
              true
            );

          }}
        >
          + Upload Document
        </button>

      </div>


      {/* ======================================
          ERROR
      ======================================= */}

      {error && (

        <div className="medical-error">

          ⚠ {error}

        </div>

      )}


      {/* ======================================
          MATCHING READINESS
      ======================================= */}

      <div className="matching-readiness-card">

        <div className="matching-readiness-top">

          <div>

            <h2>
              Matching Readiness
            </h2>

            <p>
              Required medical evidence
              for compatibility analysis.
            </p>

          </div>


          <div className="readiness-score">

            {readiness}%

          </div>

        </div>


        <div className="readiness-bar">

          <div
            className="readiness-bar-value"
            style={{
              width:
                `${readiness}%`
            }}
          />

        </div>


        <div className="readiness-items">

          <RequirementItem
            label="Blood Group Report"
            completed={
              hasBloodReport
            }
          />


          <RequirementItem
            label="HLA Typing Report"
            completed={
              hasHlaReport
            }
          />


          <RequirementItem
            label="Crossmatch Report"
            completed={
              hasCrossmatch
            }
          />

        </div>

      </div>


      {/* ======================================
          RECORDS
      ======================================= */}

      <div className="medical-records-card">

        <div className="records-section-header">

          <div>

            <h2>
              Uploaded Documents
            </h2>

            <p>

              {records.length}

              {" "}

              medical document

              {records.length === 1
                ? ""
                : "s"}

            </p>

          </div>


          <button
            type="button"
            className="medical-refresh-button"
            onClick={
              loadRecords
            }
            disabled={
              loading
            }
          >

            {loading
              ? "Loading..."
              : "↻ Refresh"}

          </button>

        </div>


        {loading ? (

          <div className="medical-empty">

            Loading medical records...

          </div>

        ) : records.length ===
          0 ? (

          <div className="medical-empty">

            <div className="medical-empty-icon">
              📄
            </div>


            <h3>
              No medical records yet
            </h3>


            <p>
              Upload your first medical
              document to begin building
              your transplant profile.
            </p>


            <button
              type="button"
              onClick={() =>
                setUploadOpen(
                  true
                )
              }
            >
              Upload Document
            </button>

          </div>

        ) : (

          <div className="medical-record-list">

            {records.map(
              (record) => (

                <div
                  key={
                    record.id
                  }
                  className="medical-record-row"
                >

                  <div className="record-file-icon">

                    📄

                  </div>


                  <div className="record-main-info">

                    <div className="record-title-row">

                      <h3>
                        {
                          record.documentType
                        }
                      </h3>


                      <span
                        className={`verification-badge ${
                          getVerificationClass(
                            record.verificationStatus
                          )
                        }`}
                      >

                        {
                          record.verificationStatus
                        }

                      </span>

                    </div>


                    <p className="record-file-name">

                      {
                        record.fileName
                      }

                    </p>


                    <div className="record-meta">

                      <span>

                        🧪{" "}

                        {
                          record.laboratory ||
                          "Laboratory not specified"
                        }

                      </span>


                      <span>

                        📅{" "}

                        {
                          record.reportDate
                            ? new Date(
                                record.reportDate
                              )
                                .toLocaleDateString(
                                  "en-GB"
                                )
                            : "No report date"
                        }

                      </span>


                      <span>

                        📦{" "}

                        {
                          formatFileSize(
                            record.fileSize
                          )
                        }

                      </span>

                    </div>


                    <div className="record-analysis">

                      <span
                        className={`extraction-badge ${
                          getExtractionClass(
                            record.extractionStatus
                          )
                        }`}
                      >

                        AI Extraction:
                        {" "}

                        {
                          record.extractionStatus
                        }

                      </span>


                      {
                        record
                          .extractedData
                          ?.bloodGroup && (

                          <span className="extracted-value">

                            Blood Group:
                            {" "}

                            <strong>

                              {
                                record
                                  .extractedData
                                  .bloodGroup
                              }

                            </strong>

                          </span>

                        )
                      }


                      {
                        record
                          .extractedData
                          ?.hla &&
                        (
                          record.extractedData.hla.hlaA?.length >
                            0 ||
                          record.extractedData.hla.hlaB?.length >
                            0 ||
                          record.extractedData.hla.hlaDR?.length >
                            0
                        ) && (

                          <span className="extracted-value">

                            HLA data available

                          </span>

                        )
                      }

                    </div>

                  </div>


                  <div className="record-actions">

                    <button
                      type="button"
                      className="record-view-button"
                      onClick={() =>
                        handleView(
                          record.id
                        )
                      }
                    >
                      View
                    </button>


                    <button
                      type="button"
                      className="record-delete-button"
                      onClick={() =>
                        handleDelete(
                          record.id
                        )
                      }
                    >
                      Delete
                    </button>

                  </div>

                </div>

              )
            )}

          </div>

        )}

      </div>


      {/* ======================================
          UPLOAD MODAL
      ======================================= */}

      {uploadOpen && (

        <div className="medical-modal-overlay">

          <div className="medical-modal">

            <div className="medical-modal-header">

              <div>

                <h2>
                  Upload Medical Document
                </h2>

                <p>
                  PDF, JPG, JPEG or PNG.
                  Maximum size 10 MB.
                </p>

              </div>


              <button
                type="button"
                className="medical-modal-close"
                onClick={() => {

                  setUploadOpen(
                    false
                  );

                  setSelectedFile(
                    null
                  );

                }}
              >
                ×
              </button>

            </div>


            <form
              onSubmit={
                handleUpload
              }
            >

              <div className="medical-form-field">

                <label>
                  Document Type
                </label>


                <select
                  name="documentType"
                  value={
                    formData.documentType
                  }
                  onChange={
                    handleChange
                  }
                  required
                >

                  <option value="Blood Group Report">
                    Blood Group Report
                  </option>

                  <option value="HLA Typing Report">
                    HLA Typing Report
                  </option>

                  <option value="Crossmatch Report">
                    Crossmatch Report
                  </option>

                  <option value="Medical Summary">
                    Medical Summary
                  </option>

                  <option value="Other">
                    Other
                  </option>

                </select>

              </div>


              <div className="medical-form-field">

                <label>
                  Medical Document
                </label>


                <div className="medical-file-box">

                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={
                      (event) =>
                        setSelectedFile(
                          event.target
                            .files?.[0] ||
                            null
                        )
                    }
                    required
                  />


                  {selectedFile && (

                    <p>

                      Selected:
                      {" "}

                      {
                        selectedFile.name
                      }

                    </p>

                  )}

                </div>

              </div>


              <div className="medical-form-grid">

                <div className="medical-form-field">

                  <label>
                    Laboratory / Hospital
                  </label>


                  <input
                    type="text"
                    name="laboratory"
                    value={
                      formData.laboratory
                    }
                    onChange={
                      handleChange
                    }
                    placeholder="Apollo Diagnostics"
                  />

                </div>


                <div className="medical-form-field">

                  <label>
                    Report Date
                  </label>


                  <input
                    type="date"
                    name="reportDate"
                    value={
                      formData.reportDate
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>


              <div className="medical-info-note">

                🔒 Your document will be
                stored as medical information
                and marked Pending until
                verification.

              </div>


              <div className="medical-modal-actions">

                <button
                  type="button"
                  className="medical-cancel-button"
                  onClick={() => {

                    setUploadOpen(
                      false
                    );

                    setSelectedFile(
                      null
                    );

                  }}
                >
                  Cancel
                </button>


                <button
                  type="submit"
                  className="medical-submit-button"
                  disabled={
                    uploading
                  }
                >

                  {
                    uploading
                      ? "Uploading..."
                      : "Upload Document"
                  }

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>

  );

}


// ==========================================
// REQUIREMENT ITEM
// ==========================================

function RequirementItem({
  label,
  completed
}) {

  return (

    <div
      className={
        completed
          ? "requirement-item complete"
          : "requirement-item"
      }
    >

      <span className="requirement-icon">

        {
          completed
            ? "✓"
            : "○"
        }

      </span>


      <span>
        {label}
      </span>

    </div>

  );

}


// ==========================================
// FILE SIZE FORMAT
// ==========================================

function formatFileSize(
  bytes
) {

  if (!bytes) {
    return "0 KB";
  }


  if (
    bytes <
    1024 *
      1024
  ) {

    return `${(
      bytes /
      1024
    ).toFixed(
      1
    )} KB`;

  }


  return `${(
    bytes /
    (
      1024 *
      1024
    )
  ).toFixed(
    1
  )} MB`;

}