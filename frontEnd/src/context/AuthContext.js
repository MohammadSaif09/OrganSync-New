import React, {
  createContext,
  useState,
  useContext
} from "react";

const AuthContext = createContext();

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8080/api/users";

export function AuthProvider({ children }) {

  // ==========================================
  // USER STATE
  // ==========================================
  const [user, setUser] = useState(() => {
    try {
      const savedUser =
        localStorage.getItem("user");

      return savedUser
        ? JSON.parse(savedUser)
        : null;

    } catch (error) {
      console.error(
        "Invalid saved user:",
        error
      );

      localStorage.removeItem("user");

      return null;
    }
  });


  // ==========================================
  // CURRENT PAGE
  // ==========================================
  const [currentPage, setCurrentPage] =
    useState(
      localStorage.getItem("user")
        ? "dashboard"
        : "login"
    );


  // ==========================================
  // LOGIN
  // ==========================================
  const login = async (email, password) => {

    const response = await fetch(
      `${API_BASE_URL}/login`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          email: email.trim(),
          password
        }),
      }
    );


    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      console.error(
        "Invalid login response:",
        error
      );
    }


    // ========================================
    // LOGIN FAILED
    // ========================================
    if (!response.ok) {

      throw new Error(
        data?.message ||
        "Invalid email or password"
      );
    }


    if (!data) {
      throw new Error(
        "Invalid response from server"
      );
    }


    // ========================================
    // BUILD LOGGED-IN USER
    // ========================================
    const userData = {

      userId:
        data.userId,

      fullName:
        data.fullName,

      role:
        data.role,

      email:
        data.email,

      phone:
        data.phone || "",

      bloodGroup:
        data.bloodGroup || "",

      organ:
        data.organ || "",

      hospital:
        data.hospital || "",

      accountStatus:
        data.accountStatus || "Active",

      verificationState:
        data.verificationState || "Pending",

      token:
        data.token || null

    };


    localStorage.setItem(
      "user",
      JSON.stringify(userData)
    );


    setUser(userData);

    setCurrentPage("dashboard");


    // IMPORTANT
    // Allows LoginPage to use returned user
    return userData;
  };


  // ==========================================
  // REGISTER
  // ==========================================
  const register = async (formData) => {

    const response = await fetch(
      `${API_BASE_URL}/register`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({

          role:
            formData.role,

          fullName:
            formData.fullName,

          phone:
            formData.phone,

          email:
            formData.email,

          password:
            formData.password,

          bloodGroup:
            formData.bloodGroup,

          organ:
            formData.organ,

          consent:
            formData.consent,

          license:
            formData.license

        }),
      }
    );


    let data = null;

    try {
      data = await response.json();
    } catch (error) {
      console.error(
        "Invalid registration response:",
        error
      );
    }


    if (!response.ok) {

      throw new Error(
        data?.message ||
        "Registration failed"
      );
    }


    setCurrentPage("login");

    return data;
  };


  // ==========================================
  // LOGOUT
  // ==========================================
  const logout = () => {

    localStorage.removeItem("user");

    setUser(null);

    setCurrentPage("login");
  };


  // ==========================================
  // CONTEXT
  // ==========================================
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


export const useAuth = () =>
  useContext(AuthContext);
