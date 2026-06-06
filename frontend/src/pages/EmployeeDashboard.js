import React, { useState, useEffect, useContext } from "react";
import EmployeePaymentModal from "../components/EmployeePaymentModal";
import { getApiErrorMessage, sanitizers } from "../utils/validation";
import "./Dashboard.css";
import axios from "axios";
import toast from "react-hot-toast";
import { EmployeeContext } from "../context/EmployeeContext";
import { Navigate } from "react-router-dom";

const EmployeeDashboard = () => {
  const { employee, ready, logout } = useContext(EmployeeContext);

  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState({
    status: "pending",
    search: "",
    currency: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ✅ Plain function (no useCallback)
  const fetchPayments = async () => {
    if (!ready || !employee) return; // guard against premature calls
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/api/employee/pending-payments", {
        params: filter,
      });
      setPayments(data);
    } catch (err) {
      console.error("Fetch error:", err);
      const errMsg = getApiErrorMessage(err, "Failed to fetch payments.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Trigger fetch when ready or filter changes
  useEffect(() => {
    fetchPayments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, employee, filter]);

  // ✅ Redirect if unauthorized
  if (ready && !employee) {
    return <Navigate to="/employee-login" replace />;
  }

  // ✅ Loading state
  if (loading) {
    return (
      <div className="employee-dashboard">
        <h2 className="dashboard-title">Loading payments...</h2>
      </div>
    );
  }

  // ✅ Handle payment actions
  const handleAction = async (id, action, reason = "") => {
    try {
      await axios.patch(`/api/employee/verify-payment/${id}`, {
        action,
        reason,
      });
      toast.success("Payment status updated.");
      await fetchPayments();
      return {};
    } catch (err) {
      const errMsg = getApiErrorMessage(
        err,
        "Failed to update payment status.",
      );
      toast.error(errMsg);
      return { error: errMsg };
    }
  };

  return (
    <div className="employee-dashboard">
      <h2 className="dashboard-title">Employee Portal – Payments Processing</h2>

      {/* ✅ Logout button with safety guard */}
      <button
        className="logout-button"
        onClick={() => typeof logout === "function" && logout()}
      >
        Logout
      </button>

      {error && <div className="form-error">{error}</div>}

      {/* ✅ Filters */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search by ID or customer"
          onChange={(e) =>
            setFilter({ ...filter, search: sanitizers.search(e.target.value) })
          }
        />
        <select
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          value={filter.status}
        >
          <option value="pending">Pending</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
          <option value="submitted">Submitted</option>
        </select>
        <select
          onChange={(e) => setFilter({ ...filter, currency: e.target.value })}
          value={filter.currency}
        >
          <option value="">All</option>
          <option>USD</option>
          <option>EUR</option>
          <option>ZAR</option>
        </select>
      </div>

      {/* ✅ Payments table */}
      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Beneficiary</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.length > 0 ? (
              payments.map((p, index) => (
                <tr key={index}>
                  <td data-label="ID">{p.transactionId}</td>
                  <td data-label="Customer">
                    {p.firstName} {p.lastName}
                  </td>
                  <td data-label="Beneficiary">{p.payeeName}</td>
                  <td data-label="Amount">{p.amount}</td>
                  <td data-label="Currency">{p.currency}</td>
                  <td data-label="Status">{p.status}</td>
                  <td data-label="Reason">{p.rejectedReason}</td>
                  <td data-label="Action">
                    <button onClick={() => setSelectedPayment(p)}>
                      {p.status === "pending"
                        ? "Verify"
                        : p.status === "verified"
                          ? "Submit to SWIFT"
                          : "View"}
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="7" style={{ textAlign: "center" }}>
                  No payments found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ✅ Modal */}
      {selectedPayment && (
        <EmployeePaymentModal
          payment={selectedPayment}
          onClose={() => {
            setSelectedPayment(null);
            fetchPayments();
          }}
          onAction={handleAction}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
