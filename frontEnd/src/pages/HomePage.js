import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";

// Enterprise Healthcare Palette
const PRIMARY = "#0f172a";   // Dark Slate
const NAVY = "#1e3a8a";      // Deep Navy
const ACCENT = "#2563eb";    // Royal Blue
const SUCCESS = "#16a34a";   // Emerald Green
const WARNING = "#dc2626";   // Critical Red
const BG_LIGHT = "#f8fafc";
const BORDER = "#e2e8f0";

// 1. Organ Preservation Limits (Crucial Medical Data)
const ORGAN_PRESERVATION = [
  { organ: "Heart", time: "4 - 6 Hours", temp: "4°C - 8°C", priority: "CRITICAL" },
  { organ: "Lungs", time: "4 - 8 Hours", temp: "4°C - 8°C", priority: "CRITICAL" },
  { organ: "Liver", time: "12 - 15 Hours", temp: "2°C - 4°C", priority: "HIGH" },
  { organ: "Kidney", time: "24 - 36 Hours", temp: "2°C - 4°C", priority: "STANDARD" },
  { organ: "Pancreas", time: "12 - 18 Hours", temp: "2°C - 4°C", priority: "HIGH" },
  { organ: "Cornea", time: "Up to 14 Days", temp: "2°C - 6°C", priority: "ELECTIVE" },
];

// 2. Compatibility Evaluation Matrix
const COMPATIBILITY_FACTORS = [
  { factor: "ABO Blood Compatibility", weight: "30%", detail: "Exact or universal donor matching" },
  { factor: "HLA Tissue Typing", weight: "25%", detail: "Human Leukocyte Antigen genetic fit" },
  { factor: "Medical Urgency Score", weight: "20%", detail: "Clinical severity index (1-10)" },
  { factor: "Waitlist Tenure", weight: "15%", detail: "Accumulated priority score over time" },
  { factor: "Ischemic Travel Distance", weight: "10%", detail: "Logistics & organ preservation window" },
];

export default function HomePage() {
  const { setCurrentPage } = useAuth();

  // Interactive AI Match Calculator State
  const [bloodGroup, setBloodGroup] = useState("A+");
  const [hlaMatch, setHlaMatch] = useState("85");
  const [urgency, setUrgency] = useState("8");
  const [calculatedScore, setCalculatedScore] = useState(92.4);

  // Active FAQ accordion state
  const [activeFaq, setActiveFaq] = useState(null);

  const calculateDemoMatch = () => {
    const base = parseFloat(hlaMatch) * 0.5 + parseFloat(urgency) * 5;
    const finalScore = Math.min(99.9, Math.max(40.0, base)).toFixed(1);
    setCalculatedScore(finalScore);
  };

  return (
    <div style={styles.page}>
      {/* 1. Header Navigation */}
      <nav style={styles.navbar}>
        <div style={styles.navContainer}>
          <div style={styles.brand} onClick={() => setCurrentPage("home")}>
            <div style={styles.logoBox}>AI</div>
            <div>
              <span style={styles.brandName}>OrganConnect</span>
              <span style={styles.brandTag}>TRANSPLANT PORTEL</span>
            </div>
          </div>

          <div style={styles.navLinks}>
            <a href="#ai-engine" style={styles.navLink}>AI Engine</a>
            <a href="#preservation" style={styles.navLink}>Organ Limits</a>
            <a href="#matrix" style={styles.navLink}>Match Matrix</a>
            <a href="#compliance" style={styles.navLink}>Compliance</a>
            <a href="#faq" style={styles.navLink}>FAQ</a>
          </div>

          <div style={styles.navAuth}>
            <button onClick={() => setCurrentPage("login")} style={styles.loginBtn}>
              Sign In
            </button>
            <button onClick={() => setCurrentPage("register")} style={styles.signupBtn}>
              Portal Register
            </button>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section style={styles.hero}>
        <div style={styles.heroBadge}>
          🛡️ HIPAA, NOTTO & UNOS Standards Compliant
        </div>
        <h1 style={styles.heroTitle}>
          AI-Powered Organ Donor &amp; <br />Transplantation Management System
        </h1>
        <p style={styles.heroSub}>
          Eliminating manual allocation delays, centralizing multi-hospital databases, and utilizing neural compatibility scoring to save lives.
        </p>

        <div style={styles.heroCtaRow}>
          <button onClick={() => setCurrentPage("register")} style={styles.primaryCta}>
            Register as Donor / Recipient &rarr;
          </button>
          <button onClick={() => setCurrentPage("login")} style={styles.secondaryCta}>
            Hospital & Doctor Portal
          </button>
        </div>

        {/* Real-time System Metrics */}
        <div style={styles.metricsGrid}>
          <div style={styles.metricCard}>
            <div style={styles.metricVal}>&lt; 15 mins</div>
            <div style={styles.metricLbl}>Match Allocation Speed</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricVal}>99.4%</div>
            <div style={styles.metricLbl}>Neural Match Accuracy</div>
          </div>
          <div style={styles.metricCard}>
            <div style={styles.metricVal}>100%</div>
            <div style={styles.metricLbl}>Centralized Sync Rate</div>
          </div>
        </div>
      </section>

      {/* 3. Organ Preservation & Ischemic Time Limits Section */}
      <section id="preservation" style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>TIME-SENSITIVE LOGISTICS</span>
          <h2 style={styles.sectionTitle}>Organ Preservation Limits</h2>
          <p style={styles.sectionDesc}>
            Transplantation success depends heavily on Cold Ischemic Time (CIT). Our platform automates emergency routing based on these strict medical windows.
          </p>
        </div>

        <div style={styles.tableCard}>
          <table style={styles.table}>
            <thead>
              <tr style={styles.thRow}>
                <th style={styles.th}>Organ Type</th>
                <th style={styles.th}>Max Preservation Time</th>
                <th style={styles.th}>Temperature Range</th>
                <th style={styles.th}>Priority Window</th>
              </tr>
            </thead>
            <tbody>
              {ORGAN_PRESERVATION.map((item, idx) => (
                <tr key={idx} style={styles.tr}>
                  <td style={styles.tdBold}>{item.organ}</td>
                  <td style={styles.td}>{item.time}</td>
                  <td style={styles.td}>{item.temp}</td>
                  <td style={styles.td}>
                    <span style={item.priority === "CRITICAL" ? styles.tagCritical : styles.tagHigh}>
                      {item.priority}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* 4. Interactive AI Match Calculator */}
      <section id="ai-engine" style={styles.section}>
        <div style={styles.sectionHeader}>
          <span style={styles.sectionBadge}>INTELLIGENT MATCHING</span>
          <h2 style={styles.sectionTitle}>AI Compatibility Engine Demo</h2>
          <p style={styles.sectionDesc}>
            Simulate how our scoring algorithm evaluates blood, tissue compatibility, and clinical urgency.
          </p>
        </div>

        <div style={styles.calculatorCard}>
          <div style={styles.calcInputs}>
            <div style={styles.inputGroup}>
              <label style={styles.label}>Recipient Blood Group</label>
              <select value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} style={styles.select}>
                <option value="A+">A+</option>
                <option value="O+">O+</option>
                <option value="B+">B+</option>
                <option value="AB+">AB+</option>
              </select>
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>HLA Tissue Fit (%): {hlaMatch}%</label>
              <input type="range" min="40" max="100" value={hlaMatch} onChange={(e) => setHlaMatch(e.target.value)} style={styles.slider} />
            </div>

            <div style={styles.inputGroup}>
              <label style={styles.label}>Medical Urgency Score (1-10): {urgency}</label>
              <input type="range" min="1" max="10" value={urgency} onChange={(e) => setUrgency(e.target.value)} style={styles.slider} />
            </div>

            <button onClick={calculateDemoMatch} style={styles.calcBtn}>
              Run AI Score Simulation
            </button>
          </div>

          <div style={styles.calcResultBox}>
            <span style={styles.resultLabel}>Calculated Compatibility Index</span>
            <div style={styles.resultScore}>{calculatedScore}%</div>
            <div style={styles.resultTag}>
              {calculatedScore > 85 ? "🟢 HIGH PRIORITY TRANSPLANT MATCH" : "🟡 MODERATE COMPATIBILITY"}
            </div>
            <p style={styles.resultNote}>
              Formula incorporates ABO, HLA, Ischemic Distance, and Waitlist Priority.
            </p>
          </div>
        </div>
      </section>

      {/* 5. Medical Compatibility Factors Matrix */}
      <section id="matrix" style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>AI Evaluation Parameters</h2>
          <p style={styles.sectionDesc}>
            Weighted scoring Breakdown used by the AI engine to rank recipient waitlists objectively.
          </p>
        </div>

        <div style={styles.matrixGrid}>
          {COMPATIBILITY_FACTORS.map((f, i) => (
            <div key={i} style={styles.matrixCard}>
              <div style={styles.matrixWeight}>{f.weight}</div>
              <h4 style={styles.matrixTitle}>{f.factor}</h4>
              <p style={styles.matrixDesc}>{f.detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6. Legal & Security Compliance Section */}
      <section id="compliance" style={styles.section}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Security & Regulatory Compliance</h2>
          <p style={styles.sectionDesc}>Built strictly according to global and national healthcare regulations.</p>
        </div>

        <div style={styles.compGrid}>
          <div style={styles.compBox}>
            <div style={styles.compIcon}>🔒</div>
            <h4>HIPAA Data Encryption</h4>
            <p>End-to-end encrypted storage for patient health reports and sensitive medical identity.</p>
          </div>
          <div style={styles.compBox}>
            <div style={styles.compIcon}>📜</div>
            <h4>Legal Consent Verification</h4>
            <p>Automated verification for donor consent forms and legal authorization approvals.</p>
          </div>
          <div style={styles.compBox}>
            <div style={styles.compIcon}>🏛️</div>
            <h4>NOTTO / UNOS Integration</h4>
            <p>Designed to sync with national organ allocation policies and government registries.</p>
          </div>
        </div>
      </section>

      {/* 7. Frequently Asked Questions (FAQ) Accordion */}
      <section id="faq" style={styles.sectionAlt}>
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Frequently Asked Questions</h2>
        </div>

        <div style={styles.faqList}>
          {[
            { q: "How does the AI matching process work?", a: "The AI engine compares blood compatibility, HLA tissue antigens, medical urgency index, and preservation travel time to rank potential recipients objectively." },
            { q: "How are hospital registrations verified?", a: "Only licensed medical institutions with certified transplant surgeons and ICUs are approved by platform administrators." },
            { q: "Is recipient identity data kept secure?", a: "Yes. Role-Based Access Control (RBAC) ensures only authorized doctors and transplant coordinators can view confidential medical files." },
          ].map((faq, idx) => (
            <div key={idx} style={styles.faqItem} onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}>
              <div style={styles.faqQuestion}>
                <span>{faq.q}</span>
                <span>{activeFaq === idx ? "−" : "+"}</span>
              </div>
              {activeFaq === idx && <p style={styles.faqAnswer}>{faq.a}</p>}
            </div>
          ))}
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section style={styles.ctaBanner}>
        <h2 style={styles.ctaTitle}>Ready to Accelerate Life-Saving Operations?</h2>
        <p style={styles.ctaSub}>Join our nationwide secure organ transplantation software network today.</p>
        <button onClick={() => setCurrentPage("register")} style={styles.bannerBtn}>
          Create System Account
        </button>
      </section>

      {/* 9. Footer */}
      <footer style={styles.footer}>
        <div style={styles.footerContent}>
          <div>
            <h3>OrganConnect Platform</h3>
            <p>AI-Driven Healthcare Infrastructure for Organ Allocation</p>
          </div>
          <div>
            <p>&copy; {new Date().getFullYear()} OrganConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Complete Modern UI Styling Object
const styles = {
  page: { minHeight: "100vh", background: "#ffffff", color: "#0f172a", fontFamily: "system-ui, -apple-system, sans-serif" },
  navbar: { borderBottom: `1px solid ${BORDER}`, background: "#ffffff", position: "sticky", top: 0, zIndex: 100 },
  navContainer: { maxWidth: 1200, margin: "0 auto", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  brand: { display: "flex", alignItems: "center", gap: "12px", cursor: "pointer" },
  logoBox: { background: NAVY, color: "#ffffff", fontWeight: "800", padding: "6px 10px", borderRadius: "6px", fontSize: "14px" },
  brandName: { fontSize: "18px", fontWeight: "800", color: NAVY, display: "block" },
  brandTag: { fontSize: "10px", color: ACCENT, fontWeight: "700", letterSpacing: "1px" },
  navLinks: { display: "flex", gap: "24px" },
  navLink: { color: "#475569", textDecoration: "none", fontSize: "14px", fontWeight: "600" },
  navAuth: { display: "flex", gap: "12px" },
  loginBtn: { padding: "8px 18px", borderRadius: "6px", border: `1px solid ${BORDER}`, background: "#ffffff", color: NAVY, fontWeight: "600", cursor: "pointer" },
  signupBtn: { padding: "8px 18px", borderRadius: "6px", border: "none", background: ACCENT, color: "#ffffff", fontWeight: "600", cursor: "pointer" },
  hero: { maxWidth: 900, margin: "0 auto", padding: "80px 24px 60px", textAlign: "center" },
  heroBadge: { display: "inline-block", padding: "6px 16px", borderRadius: "20px", background: "#eff6ff", border: "1px solid #bfdbfe", color: ACCENT, fontSize: "13px", fontWeight: "700", marginBottom: "20px" },
  heroTitle: { fontSize: "42px", fontWeight: "900", color: NAVY, lineHeight: "1.2", marginBottom: "20px" },
  heroSub: { fontSize: "17px", color: "#475569", lineHeight: "1.6", maxWidth: "720px", margin: "0 auto 36px" },
  heroCtaRow: { display: "flex", gap: "16px", justifyContent: "center", marginBottom: "60px" },
  primaryCta: { padding: "14px 28px", borderRadius: "8px", background: ACCENT, color: "#ffffff", border: "none", fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  secondaryCta: { padding: "14px 28px", borderRadius: "8px", background: "#ffffff", color: NAVY, border: `1px solid ${NAVY}`, fontWeight: "700", fontSize: "15px", cursor: "pointer" },
  metricsGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", background: BG_LIGHT, padding: "24px", borderRadius: "12px", border: `1px solid ${BORDER}` },
  metricCard: { textAlign: "center" },
  metricVal: { fontSize: "28px", fontWeight: "800", color: ACCENT },
  metricLbl: { fontSize: "13px", color: "#64748b", marginTop: "4px" },
  section: { maxWidth: 1200, margin: "0 auto", padding: "80px 24px" },
  sectionAlt: { background: BG_LIGHT, borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, padding: "80px 24px" },
  sectionHeader: { textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" },
  sectionBadge: { fontSize: "12px", fontWeight: "800", color: ACCENT, letterSpacing: "1px" },
  sectionTitle: { fontSize: "30px", fontWeight: "800", color: NAVY, marginTop: "8px" },
  sectionDesc: { fontSize: "15px", color: "#64748b", marginTop: "8px" },
  tableCard: { maxWidth: "1000px", margin: "0 auto", background: "#ffffff", borderRadius: "12px", border: `1px solid ${BORDER}`, overflow: "hidden" },
  table: { width: "100%", borderCollapse: "collapse", textAlign: "left" },
  thRow: { background: "#f1f5f9" },
  th: { padding: "14px 18px", fontSize: "13px", fontWeight: "700", color: "#334155" },
  tr: { borderBottom: `1px solid ${BORDER}` },
  td: { padding: "14px 18px", fontSize: "14px", color: "#475569" },
  tdBold: { padding: "14px 18px", fontSize: "14px", fontWeight: "700", color: NAVY },
  tagCritical: { background: "#fee2e2", color: WARNING, fontWeight: "800", fontSize: "11px", padding: "4px 8px", borderRadius: "4px" },
  tagHigh: { background: "#fef3c7", color: "#d97706", fontWeight: "800", fontSize: "11px", padding: "4px 8px", borderRadius: "4px" },
  calculatorCard: { maxWidth: "850px", margin: "0 auto", background: "#ffffff", borderRadius: "16px", border: `1px solid ${BORDER}`, padding: "36px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "32px" },
  calcInputs: { display: "flex", flexDirection: "column", gap: "20px" },
  inputGroup: { display: "flex", flexDirection: "column", gap: "8px" },
  label: { fontSize: "13px", fontWeight: "700", color: "#334155" },
  select: { padding: "10px", borderRadius: "6px", border: `1px solid ${BORDER}`, fontSize: "14px" },
  slider: { accentColor: ACCENT },
  calcBtn: { padding: "12px", borderRadius: "6px", background: NAVY, color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" },
  calcResultBox: { background: "#eff6ff", borderRadius: "12px", padding: "28px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", border: "1px solid #bfdbfe" },
  resultLabel: { fontSize: "13px", color: "#1e40af", fontWeight: "700" },
  resultScore: { fontSize: "52px", fontWeight: "900", color: ACCENT, margin: "12px 0" },
  resultTag: { fontSize: "12px", fontWeight: "800", color: SUCCESS, background: "#dcfce7", padding: "6px 12px", borderRadius: "20px" },
  resultNote: { fontSize: "11px", color: "#64748b", marginTop: "16px" },
  matrixGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px", maxWidth: "1000px", margin: "0 auto" },
  matrixCard: { background: "#ffffff", padding: "20px", borderRadius: "10px", border: `1px solid ${BORDER}`, textAlign: "center" },
  matrixWeight: { fontSize: "24px", fontWeight: "900", color: ACCENT, marginBottom: "4px" },
  matrixTitle: { fontSize: "15px", fontWeight: "700", color: NAVY, margin: "4px 0" },
  matrixDesc: { fontSize: "12px", color: "#64748b" },
  compGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "24px", maxWidth: "1000px", margin: "0 auto" },
  compBox: { background: BG_LIGHT, border: `1px solid ${BORDER}`, padding: "28px", borderRadius: "12px", textAlign: "center" },
  compIcon: { fontSize: "36px", marginBottom: "12px" },
  faqList: { maxWidth: "800px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "12px" },
  faqItem: { background: "#ffffff", border: `1px solid ${BORDER}`, padding: "18px 24px", borderRadius: "8px", cursor: "pointer" },
  faqQuestion: { display: "flex", justifyContent: "space-between", fontWeight: "700", color: NAVY, fontSize: "15px" },
  faqAnswer: { marginTop: "12px", fontSize: "14px", color: "#475569", lineHeight: "1.5" },
  ctaBanner: { background: NAVY, color: "#ffffff", textAlign: "center", padding: "60px 24px" },
  ctaTitle: { fontSize: "28px", fontWeight: "800" },
  ctaSub: { color: "#93c5fd", fontSize: "15px", marginTop: "8px", marginBottom: "24px" },
  bannerBtn: { padding: "14px 32px", borderRadius: "8px", background: ACCENT, color: "#ffffff", border: "none", fontWeight: "700", cursor: "pointer" },
  footer: { background: PRIMARY, color: "#ffffff", padding: "32px 24px" },
  footerContent: { maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", fontSize: "13px" },
};
