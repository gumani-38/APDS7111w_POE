import React, { useState } from "react";
import { hasErrors, sanitizers, validatePayment } from "../utils/validation";
import "../pages/Dashboard.css"; // keep this for other styles
import axios from "axios";

const CreatePaymentModal = ({ onClose, onPaymentCreated }) => {
  const [step, setStep] = useState("form");
  const [payment, setPayment] = useState({
    amount: "",
    currency: "ZAR",
    provider: "SWIFT",
    swiftCode: "",
    beneficiaryName: "",
    beneficiaryAccount: "",
  });
  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");
  const [isCheckingBalance, setIsCheckingBalance] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const swiftOptions = [
    { label: "Select a SWIFT code", value: "" },
    { label: "ABSA – ABSAZAJJ", value: "ABSAZAJJ" },
    { label: "FNB – FIRNZAJJ", value: "FIRNZAJJ" },
    { label: "Standard Bank – SBZAZAJJ", value: "SBZAZAJJ" },
    { label: "Nedbank – NEDSZAJJ", value: "NEDSZAJJ" },
    { label: "Capitec – CABLZAJJ", value: "CABLZAJJ" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizePaymentField(name, value);

    setPayment((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
    setSubmitError("");
  };

  const sanitizePaymentField = (name, value) => {
    if (name === "beneficiaryName") return sanitizers.personName(value);
    if (name === "beneficiaryAccount") return sanitizers.digits(value, 10);
    if (name === "amount") return sanitizers.amount(value);
    return value;
  };

  const validateAmount = async (amount, currency) => {
    try {
      //   const res = await api.get("/user/balance", { params: { currency } });
      //   const availableBalance = Number(res.data.convertedBalance);
      //   return { ok: amount <= availableBalance, availableBalance };
    } catch (err) {
      return {
        ok: false,
        // error: getApiErrorMessage(err, "Could not confirm available balance."),
      };
    }
  };

  const handleNext = async (e) => {
    e.preventDefault();
    const newErrors = validatePayment(payment);
    setErrors(newErrors);
    setSubmitError("");

    if (hasErrors(newErrors)) {
      setSubmitError("Please correct the highlighted fields.");
      return;
    }
    setStep("review");
  };

  const amountValue = Number(payment.amount) || 0;
  // const fees = (amountValue * 0.02).toFixed(2);
  // const total = (amountValue + Number(fees)).toFixed(2);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    setSubmitError("");

    try {
      await axios.post("/api/transaction/create", {
        amount: payment.amount,
        currency: payment.currency,
        provider: payment.provider,
        swiftCode: payment.swiftCode,
        payeeName: payment.beneficiaryName,
        payeeAccountNumber: payment.beneficiaryAccount,
      });

      onPaymentCreated();
    } catch (err) {
      setSubmitError(
        err.response?.data?.error ||
          "Failed to create payment. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ position: "relative" }}>
        {/* Close button with absolute positioning */}
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "12px",
            right: "16px",
            background: "none",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
            color: "#666",
          }}
        >
          ×
        </button>

        {/* Heading with top margin to move it down */}
        <h2 style={{ marginTop: "24px", marginBottom: "20px" }}>
          Create International Payment
        </h2>
        {submitError && (
          <div className="form-error" role="alert">
            {submitError}
          </div>
        )}

        {step === "form" ? (
          <form onSubmit={handleNext} noValidate>
            <div className="form-group">
              <label htmlFor="beneficiaryName">Beneficiary Name *</label>
              <input
                id="beneficiaryName"
                name="beneficiaryName"
                value={payment.beneficiaryName}
                onChange={handleChange}
                required
              />
              {errors.beneficiaryName && (
                <span className="error">{errors.beneficiaryName}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="beneficiaryAccount">Beneficiary Account *</label>
              <input
                id="beneficiaryAccount"
                name="beneficiaryAccount"
                type="text"
                inputMode="numeric"
                value={payment.beneficiaryAccount}
                onChange={handleChange}
                required
              />
              {errors.beneficiaryAccount && (
                <span className="error">{errors.beneficiaryAccount}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="amount">Amount *</label>
              <input
                id="amount"
                type="text"
                inputMode="decimal"
                name="amount"
                value={payment.amount}
                onChange={handleChange}
                required
              />
              {errors.amount && <span className="error">{errors.amount}</span>}
            </div>
            <div className="form-group">
              <label htmlFor="currency">Currency *</label>
              <select
                id="currency"
                name="currency"
                value={payment.currency}
                onChange={handleChange}
              >
                <option value="ZAR">ZAR</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
              {errors.currency && (
                <span className="error">{errors.currency}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="provider">Provider *</label>
              <select
                id="provider"
                name="provider"
                value={payment.provider}
                onChange={handleChange}
                disabled
              >
                <option value="SWIFT">SWIFT</option>
              </select>
              {errors.provider && (
                <span className="error">{errors.provider}</span>
              )}
            </div>
            <div className="form-group">
              <label htmlFor="swiftCode">SWIFT / BIC Code *</label>
              <select
                id="swiftCode"
                name="swiftCode"
                value={payment.swiftCode}
                onChange={handleChange}
                required
              >
                {swiftOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              {errors.swiftCode && (
                <span className="error">{errors.swiftCode}</span>
              )}
            </div>
            <div className="form-actions">
              <button type="submit" disabled={isCheckingBalance}>
                {isCheckingBalance ? "Checking..." : "Review Payment"}
              </button>
              <button type="button" onClick={onClose}>
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="review-step">
            <h3>Review Your Payment</h3>
            <table className="review-table">
              <tbody>
                <tr>
                  <td>
                    <strong>Amount:</strong>
                  </td>
                  <td>
                    {payment.amount} {payment.currency}
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong>Provider:</strong>
                  </td>
                  <td>{payment.provider}</td>
                </tr>
                <tr>
                  <td>
                    <strong>SWIFT Code:</strong>
                  </td>
                  <td>{payment.swiftCode}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Beneficiary Name:</strong>
                  </td>
                  <td>{payment.beneficiaryName}</td>
                </tr>
                <tr>
                  <td>
                    <strong>Beneficiary Account:</strong>
                  </td>
                  <td>{payment.beneficiaryAccount}</td>
                </tr>
                {/* <tr>
                  <td>
                    <strong>Fees (2%):</strong>
                  </td>
                  <td>
                    {fees} {payment.currency}
                  </td>
                </tr> */}
                {/* <tr style={{ fontWeight: "bold", color: "red" }}>
                  <td>
                    <strong>Total to debit:</strong>
                  </td>
                  <td>
                    {total} {payment.currency}
                  </td>
                </tr> */}
              </tbody>
            </table>
            <div className="form-actions">
              <button
                type="button"
                onClick={() => setStep("form")}
                disabled={isSubmitting}
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : "Confirm & Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CreatePaymentModal;
