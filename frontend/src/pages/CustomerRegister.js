import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getApiErrorMessage,
  hasErrors,
  sanitizers,
  validateRegistration,
} from "../utils/validation";
import "./Auth.css";
import axios from "axios";

const CustomerRegister = () => {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    idNumber: "",
    accountNumber: "",
    username: "",
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const sanitizeField = (name, value) => {
    if (name === "firstName" || name === "lastName")
      return sanitizers.personName(value);
    if (name === "idNumber") return sanitizers.digits(value, 13);
    if (name === "accountNumber") return sanitizers.digits(value, 10);
    if (name === "username") return sanitizers.email(value);
    return value;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: sanitizeField(name, value) }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateRegistration(form);
    setErrors(validationErrors);

    if (hasErrors(validationErrors)) {
      setError("Please correct the highlighted fields.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      await axios.post("/api/user/register", form);
      navigate("/customer-login");
    } catch (err) {
      setError(
        getApiErrorMessage(err, "Registration failed. Please try again."),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>Customer Register</h2>
        {error && (
          <div className="auth-error" role="alert">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            {errors.firstName && (
              <span className="field-error">{errors.firstName}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              required
            />
            {errors.lastName && (
              <span className="field-error">{errors.lastName}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="idNumber">ID Number</label>
            <input
              id="idNumber"
              name="idNumber"
              inputMode="numeric"
              value={form.idNumber}
              onChange={handleChange}
              required
            />
            {errors.idNumber && (
              <span className="field-error">{errors.idNumber}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="accountNumber">Account Number</label>
            <input
              id="accountNumber"
              name="accountNumber"
              inputMode="numeric"
              value={form.accountNumber}
              onChange={handleChange}
              required
            />
            {errors.accountNumber && (
              <span className="field-error">{errors.accountNumber}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              required
            />
            {errors.username && (
              <span className="field-error">{errors.username}</span>
            )}
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
            />
            {errors.password && (
              <span className="field-error">{errors.password}</span>
            )}
          </div>
          <button type="submit" className="auth-button" disabled={isSubmitting}>
            {isSubmitting ? "Registering..." : "Register"}
          </button>
        </form>
        <p className="auth-link">
          <a href="/customer-login">Already have account? Login</a>
        </p>
      </div>
    </div>
  );
};

export default CustomerRegister;
