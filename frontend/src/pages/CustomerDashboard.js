import React, { useState, useEffect, useContext } from "react";
import CurrencySwitcher from "../components/CurrencySwitcher";
import TransactionTimeline from "../components/TransactionTimeline";
import CreatePaymentModal from "../components/CreatePaymentModal";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";
import { UserContext } from "../context/UserContext";
import axios from "axios";
import toast from "react-hot-toast";
import { getApiErrorMessage } from "../utils/validation";

const CustomerDashboard = () => {
  const [payments, setPayments] = useState([]);
  const { logout, user, ready } = useContext(UserContext);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Define fetchPayments first
  const fetchPayments = async () => {
    try {
      setError("");
      const { data } = await axios.get("/api/transaction/my");
      setPayments(data);
    } catch (err) {
      const errMsg = getApiErrorMessage(err, "Failed to fetch payments.");
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  // ✅ Then call it inside useEffect
  useEffect(() => {
    fetchPayments();
  }, []);

  if (!ready) {
    return <div>Loading...</div>;
  }
  if (ready && !user) {
    navigate("/");
    return null;
  }
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case "verified":
        return "#007bff"; // blue
      case "pending":
        return "#ffa500"; // orange
      case "submitted":
        return "#28a745"; // green
      default:
        return "#6c757d"; // gray for unknown
    }
  };

  const handleLogout = async () => {
    try {
      await logout(); // Assuming you have a logout function that clears auth tokens
      navigate("/");
    } catch (err) {
      const errMsg = getApiErrorMessage(
        err,
        "Logout failed. Please try again.",
      );
      setError(errMsg);
      toast.error(errMsg);
    }
  };

  return (
    <div className="dashboard-container">
      <h2>Customer Dashboard</h2>

      <CurrencySwitcher />
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}

      <div className="new-payment-section">
        <button
          onClick={() => setShowPaymentModal(true)}
          className="new-payment-btn"
        >
          + New Payment
        </button>
      </div>

      <h3>Payment History</h3>
      {payments.length === 0 ? (
        <p>No payments yet.</p>
      ) : (
        <table className="payments-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Amount</th>
              <th>Beneficiary</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={index}>
                <td data-label="Date">
                  {new Date(p.createdAt).toLocaleDateString()}
                </td>
                <td data-label="Amount">
                  {p.amount} {p.currency}
                </td>
                <td data-label="Beneficiary">{p.payeeName}</td>
                <td data-label="Status">
                  <span
                    className="status-badge"
                    style={{
                      backgroundColor: getStatusColor(p.status),
                      color: "#fff",
                      padding: "4px 10px",
                      borderRadius: "6px",
                      fontWeight: "600",
                      textTransform: "capitalize",
                      display: "inline-block",
                      minWidth: "80px",
                      textAlign: "center",
                    }}
                  >
                    {p.status}
                  </span>
                </td>
                <td data-label="Action">
                  <button
                    onClick={() => setSelectedPayment(p)}
                    className="details-btn"
                  >
                    Details
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Logout button is now below Payment History */}
      <button
        onClick={handleLogout}
        className="logout-btn"
        style={{ marginTop: "20px" }}
      >
        Logout
      </button>

      {/* Modals */}
      {selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content">
            <button
              className="modal-close"
              onClick={() => setSelectedPayment(null)}
            >
              ×
            </button>
            <h3>Payment Details</h3>
            <p>
              <strong>Amount:</strong> {selectedPayment.amount}{" "}
              {selectedPayment.currency}
            </p>
            <p>
              <strong>Beneficiary:</strong> {selectedPayment.payeeName}
            </p>
            <p>
              <strong>Beneficiary Account:</strong>{" "}
              {selectedPayment.payeeAccountNumber}
            </p>
            <p>
              <strong>SWIFT Code:</strong> {selectedPayment.swiftCode}
            </p>
            <p>
              <strong>Status:</strong> {selectedPayment.status}
            </p>
            <TransactionTimeline currentStatus={selectedPayment.status} />
            <button onClick={() => setSelectedPayment(null)}>Close</button>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <CreatePaymentModal
          onClose={() => setShowPaymentModal(false)}
          onPaymentCreated={() => {
            fetchPayments();
            setShowPaymentModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CustomerDashboard;
