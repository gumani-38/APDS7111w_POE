import React, { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  hasErrors,
  sanitizers,
  validateCustomerLogin,
} from "../utils/validation";
import "./Auth.css";
import axios from "axios";
import { UserContext } from "../context/UserContext";
import toast from "react-hot-toast";

const CustomerLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const { fetchProfile, user, ready } = useContext(UserContext);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    if (ready && user) {
      navigate("/customer-dashboard");
    }
  }, [ready, user, navigate]);

  if (!ready) {
    return <div>Loading...</div>;
  }

  const handleUsernameChange = (value) => {
    setUsername(sanitizers.email(value));
    setErrors((prev) => ({ ...prev, username: "" }));
    setError("");
  };

  const handlePasswordChange = (value) => {
    setPassword(value);
    setErrors((prev) => ({ ...prev, password: "" }));
    setError("");
  };
  const handleAccountNumberChange = (value) => {
    setAccountNumber(sanitizers.digits(value, 10));
    setErrors((prev) => ({ ...prev, accountNumber: "" }));
    setError("");
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateCustomerLogin({
      username,
      accountNumber,
      password,
    });
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      setError("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await axios.post("/api/user/login", {
        username,
        accountNumber,
        password,
      });
      await fetchProfile(); // Refresh user profile after login
      setError("");
      toast.success("Login successful!");
      navigate("/customer-dashboard");
    } catch (err) {
      const errMsg = getApiErrorMessage(err, "Unexpected error occurred.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Customer Login</h2>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        {/* {step === "password" ? ( */}
        <form onSubmit={handlePasswordSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
              autoFocus
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="username">Account Number</label>
            <input
              id="accountNumber"
              type="text"
              value={accountNumber}
              onChange={(e) => handleAccountNumberChange(e.target.value)}
              required
              autoFocus
            />
            {errors.accountNumber && (
              <span className="field-error">{errors.accountNumber}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => handlePasswordChange(e.target.value)}
              required
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
        <p className="auth-link">
          <a href="/customer-register">Don't have an account? Register</a>
        </p>
      </div>
    </div>
  );
};

export default CustomerLogin;
