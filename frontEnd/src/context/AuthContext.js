import React, { createContext, useState, useContext } from "react";

const AuthContext = createContext();

const API_BASE_URL =
  "http://localhost:8080/api/users";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [currentPage, setCurrentPage] = useState(
    localStorage.getItem("user") ? "dashboard" : "login"
  );

  // ============================
  // LOGIN
  // ============================
  const login = async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Invalid email or password");
    }

    const userData = {
  userId: data.userId,
  fullName: data.fullName,
  role: data.role,
  email: data.email,
  bloodGroup: data.bloodGroup,
  organ: data.organ,
  hospital: data.hospital
};

    localStorage.setItem("user", JSON.stringify(userData));
    setUser(userData);
    setCurrentPage("dashboard");
  };

  // ============================
  // REGISTER
  // ============================
  const register = async (formData) => {
    const response = await fetch(API_BASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        role: formData.role,
        fullName: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        bloodGroup: formData.bloodGroup,
        organ: formData.organ,
        consent: formData.consent,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Registration failed");
    }

    alert("Registration Successful! Please login.");
    setCurrentPage("login");
  };

  // ============================
  // LOGOUT
  // ============================
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setCurrentPage("login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        currentPage,
        setCurrentPage,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);