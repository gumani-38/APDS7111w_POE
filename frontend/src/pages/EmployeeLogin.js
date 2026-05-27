import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  hasErrors,
  sanitizers,
  validateEmployeeLogin,
} from "../utils/validation";
import "./Auth.css";
import axios from "axios";
import { EmployeeContext } from "../context/EmployeeContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons"; // Added explicit icon imports
const EmployeeLogin = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const { employee, ready, fetchProfile } = useContext(EmployeeContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && employee) {
      navigate("/employee-dashboard");
    }
  }, [ready, employee, navigate]);

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

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      const validationErrors = validateEmployeeLogin({
        username,
        password,
      });
      setErrors(validationErrors);

      if (hasErrors(validationErrors)) {
        setError("Please correct the highlighted fields.");
        return;
      }
      setError("");
      setIsSubmitting(true);
      await axios.post("/api/employee/login", { username, password });
      await fetchProfile();

      navigate("/employee-dashboard");
    } catch (err) {
      setError(
        "Login failed. Please check your credentials and try again.",
        err,
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Employee Login</h2>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="username">Employee Username</label>
            <input
              id="username"
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => handleUsernameChange(e.target.value)}
              required
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>
          <div className="form-group password-group">
            <label htmlFor="password">Password</label>
            <div className="password-input-wrapper">
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => handlePasswordChange(e.target.value)}
                required
              />
              <span
                className="password-toggle-btn"
                onClick={() => setIsPasswordVisible((prev) => !prev)}
              >
                <FontAwesomeIcon
                  icon={isPasswordVisible ? faEye : faEyeSlash}
                />
              </span>
            </div>
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EmployeeLogin;
