import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import { useAuth } from "../../context/AuthContext";
import { GoogleLogin } from "@react-oauth/google";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  
  // State for messages
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(""); 
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login, isAuth } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuth) {
      navigate("/", { replace: true });
    }
  }, [isAuth, navigate]);

  // Clear messages when switching modes
  useEffect(() => {
    setError("");
    setSuccess("");
  }, [isRegister]);

  // ---------------- GOOGLE LOGIN ----------------
  const handleGoogleLogin = async (credentialResponse) => {
    if (!credentialResponse?.credential) {
      setError("Google login failed");
      return;
    }

    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: credentialResponse.credential,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Google login failed");
        return;
      }

      login(data.access_token, data.username);
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      setError("Google login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- PASSWORD LOGIN / REGISTER ----------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");
    setLoading(true);

    const baseUrl = process.env.REACT_APP_API_URL;

    try {
      if (isRegister) {
        const res = await fetch(`${baseUrl}/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            username: username.trim(),
            password,
          }),
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.detail || "Registration failed.");
          return;
        }

        // --- SUCCESS HANDLING ---
        setSuccess("Account created successfully! Please log in.");
        setIsRegister(false); // Switch back to login view so they can log in
        setUsername("");
        setPassword("");
        
      } else {
        const formData = new URLSearchParams();
        formData.append("username", username.trim());
        formData.append("password", password);

        const res = await fetch(`${baseUrl}/token`, {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: formData,
        });

        const data = await res.json();

        if (!res.ok) {
          setError("Invalid credentials. Please try again.");
          return;
        }

        login(data.access_token, username.trim());
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError("Server connection failed. Is the backend running?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">
          {isRegister ? "INITIATE SEQUENCE" : "SYSTEM LOGIN"}
        </h1>

        <p className="login-subtitle">
          {isRegister
            ? "Create your pilot identity"
            : "Welcome back to Bot Raider"}
        </p>

        {/* Display Error or Success Messages */}
        {error && <div className="error-msg">⚠️ {error}</div>}
        {success && <div className="success-msg">✅ {success}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="input-group">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button className="auth-btn" disabled={loading}>
            {loading
              ? "Processing..."
              : isRegister
              ? "Create Account"
              : "Access System"}
          </button>
        </form>

        {/* GOOGLE LOGIN ONLY FOR LOGIN MODE */}
        {!isRegister && (
          <>
            <div className="divider">
              <span>OR</span>
            </div>

            <div className="google-login">
              <GoogleLogin
                onSuccess={handleGoogleLogin}
                onError={() => setError("Google login failed")}
                disabled={loading}
              />
            </div>
          </>
        )}

        <div
          className="toggle-link"
          onClick={() => {
            setIsRegister(!isRegister);
          }}
        >
          {isRegister
            ? "Already have clearance? Log In"
            : "New pilot? Register access code"}
        </div>
      </div>
    </div>
  );
}