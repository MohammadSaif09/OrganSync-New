import React from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

import DonorDashboard from "./pages/DonorDashboard";
import RecipientDashboard from "./pages/RecipientDashboard";
import HospitalDashboard from "./pages/HospitalDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function Navigation() {
  const { user, currentPage } = useAuth();

  // Logged-in User Role Based Routing
  if (user) {
    const role = (user.role || "").toLowerCase().trim();

    if (role === "donor") {
      return <DonorDashboard />;
    }
    if (role === "recipient") {
      return <RecipientDashboard />;
    }
    if (role === "hospital") {
      return <HospitalDashboard />;
    }
    if (role === "admin") {
      return <AdminDashboard />;
    }

    return <HomePage />;
  }

  // Public Navigation
  if (currentPage === "home") {
    return <HomePage />;
  }
  if (currentPage === "register") {
    return <RegisterPage />;
  }

  return <LoginPage />;
}

export default function App() {
  return (
    <AuthProvider>
      <Navigation />
    </AuthProvider>
  );
}