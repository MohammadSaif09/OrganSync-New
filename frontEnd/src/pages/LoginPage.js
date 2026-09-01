import React, { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import "./LoginPage.css";

export default function LoginPage() {
  const { login, setCurrentPage } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Load remembered email when login page opens
  useEffect(() => {
    const rememberedEmail = localStorage.getItem(
      "organSyncRememberedEmail"
    );

    if (rememberedEmail) {
      setEmail(rememberedEmail);
      setRememberMe(true);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const cleanEmail = email.trim();

      await login(cleanEmail, password);

      // Remember only the email.
      // Never store the user's password in localStorage.
      if (rememberMe) {
        localStorage.setItem(
          "organSyncRememberedEmail",
          cleanEmail
        );
      } else {
        localStorage.removeItem(
          "organSyncRememberedEmail"
        );
      }
    } catch (err) {
      setError(
        err.message ||
          "Invalid email or password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="organ-login-page"
      style={{
        backgroundImage: `url(${process.env.PUBLIC_URL}/images/organsync-login-bg.jpg)`
      }}
    >
      <div className="organ-login-card">

        {/* OPTIONAL BACK TO HOME BUTTON

        <button
          type="button"
          className="back-home-link"
          onClick={() =>
            setCurrentPage("home")
          } 
        >
          ← Back to Home
        </button> */}

       

        <div className="lock-circle">
          🔒
        </div>

        <h1 className="login-title">
          Welcome Back
        </h1>

        <p className="login-subtitle">
          Login to your OrganSync account
        </p>

        <form
          onSubmit={handleSubmit}
          autoComplete="on"
        >
          {/* EMAIL */}

          <label
            className="login-label"
            htmlFor="email"
          >
            Email / Username
          </label>

          <div className="login-input-box">
            <span className="input-icon">
              ✉
            </span>

            <input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              placeholder="Enter your email"
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              required
            />
          </div>

          {/* PASSWORD */}

          <label
            className="login-label"
            htmlFor="password"
          >
            Password
          </label>

          <div className="login-input-box">
            <span className="input-icon">
              🔒
            </span>

            <input
              id="password"
              name="password"
              type="password"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
          </div>

          {/* OPTIONS */}

          <div className="login-options">

            <label className="remember-box">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) =>
                  setRememberMe(
                    e.target.checked
                  )
                }
              />

              <span>
                Remember me
              </span>
            </label>

            <button
              type="button"
              className="forgot-password-btn"
              onClick={() => {
                alert(
                  "Forgot password feature will be added soon."
                );
              }}
            >
              Forgot password?
            </button>

          </div>

          {/* ERROR */}

          {error && (
            <div className="login-error">
              ⚠️ {error}
            </div>
          )}

          {/* LOGIN BUTTON */}

          <button
            type="submit"
            className="main-login-btn"
            disabled={loading}
          >
            {loading
              ? "Logging in..."
              : "↪ Log In"}
          </button>

        </form>

        {/* REGISTER */}

        <div className="register-section">
          <span>
            Don't have an account?
          </span>

          <button
            type="button"
            onClick={() =>
              setCurrentPage("register")
            }
          >
            Register Now
          </button>
        </div>

      </div>
    </div>
  );
}