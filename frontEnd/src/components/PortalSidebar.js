import React from "react";

export default function PortalSidebar({
  portal,
  activeTab,
  setActiveTab,
  logout
}) {
  const configs = {
    donor: {
      title: "OrganSync",
      subtitle: "Donor Portal",
      icon: "🫀",
      items: [
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
          id: "pledges",
          label: "My Pledges",
          icon: "🫀"
        },
        {
          id: "requests",
          label: "Recipient Requests",
          icon: "📩"
        }
      ]
    },

    hospital: {
      title: "OrganSync",
      subtitle: "Hospital Portal",
      icon: "🏥",
      items: [
        {
          id: "dashboard",
          label: "Dashboard",
          icon: "📊"
        },
        {
          id: "cases",
          label: "Transplant Cases",
          icon: "🫀"
        },
        {
          id: "verification",
          label: "Medical Verification",
          icon: "⚕️"
        },
        {
          id: "operations",
          label: "Operations",
          icon: "🏥"
        },
        {
          id: "appointments",
          label: "Appointments",
          icon: "📅"
        }
      ]
    },

    recipient: {
      title: "OrganSync",
      subtitle: "Recipient Portal",
      icon: "🫀",
      items: [
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
          id: "requests",
          label: "Organ Requests",
          icon: "🫀"
        },
        {
          id: "appointments",
          label: "Appointments",
          icon: "📅"
        },
        {
          id: "records",
          label: "Medical Records",
          icon: "📄"
        }
      ]
    }
  };

  const config =
    configs[portal] ||
    configs.recipient;

  return (
    <aside style={styles.sidebar}>

      <div>
        <div style={styles.brand}>
          <div style={styles.logo}>
            {config.icon}
          </div>

          <div>
            <strong style={styles.title}>
              {config.title}
            </strong>

            <span style={styles.subtitle}>
              {config.subtitle}
            </span>
          </div>
        </div>

        <nav style={styles.nav}>
          {config.items.map((item) => (
            <button
              key={item.id}
              onClick={() =>
                setActiveTab(item.id)
              }
              style={{
                ...styles.navButton,

                ...(activeTab === item.id
                  ? styles.navButtonActive
                  : {})
              }}
            >
              <span style={styles.navIcon}>
                {item.icon}
              </span>

              <span>
                {item.label}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <button
        onClick={logout}
        style={styles.logoutButton}
      >
        ↪ Logout
      </button>

    </aside>
  );
}

const styles = {
  sidebar: {
    width: "240px",
    minWidth: "240px",

    height: "100vh",

    background: "#ffffff",

    borderRight:
      "1px solid #e2e8f0",

    padding: "24px 16px",

    display: "flex",
    flexDirection: "column",
    justifyContent:
      "space-between",

    position: "sticky",
    top: 0,

    overflowY: "auto"
  },

  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",

    paddingBottom: "24px",

    borderBottom:
      "1px solid #f1f5f9"
  },

  logo: {
    width: "42px",
    height: "42px",

    display: "flex",
    alignItems: "center",
    justifyContent: "center",

    background: "#eff6ff",

    borderRadius: "10px",

    fontSize: "20px"
  },

  title: {
    display: "block",

    color: "#1e3a8a",

    fontSize: "16px",
    fontWeight: "800"
  },

  subtitle: {
    display: "block",

    marginTop: "3px",

    color: "#64748b",

    fontSize: "11px"
  },

  nav: {
    marginTop: "24px",

    display: "flex",
    flexDirection: "column",

    gap: "8px"
  },

  navButton: {
    width: "100%",

    display: "flex",
    alignItems: "center",

    gap: "12px",

    padding: "12px 16px",

    border: "none",
    borderRadius: "10px",

    background: "transparent",

    color: "#475569",

    fontSize: "14px",
    fontWeight: "600",

    cursor: "pointer",

    textAlign: "left"
  },

  navButtonActive: {
    background: "#eff6ff",

    color: "#2563eb"
  },

  navIcon: {
    width: "20px",

    textAlign: "center"
  },

  logoutButton: {
    width: "100%",

    border: "none",

    background: "#fee2e2",

    color: "#dc2626",

    padding: "11px",

    borderRadius: "8px",

    fontWeight: "700",

    cursor: "pointer"
  }
};