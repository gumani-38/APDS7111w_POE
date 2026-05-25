import React, { useState, useEffect, useCallback } from "react";
import EmployeePaymentModal from "../components/EmployeePaymentModal";
import { getApiErrorMessage, sanitizers } from "../utils/validation";
import "./Dashboard.css";
import axios from "axios";
import toast from "react-hot-toast";
import { useContext } from "react";
import { EmployeeContext } from "../context/EmployeeContext";
import { Navigate } from "react-router-dom";
const EmployeeDashboard = () => {
  const [payments, setPayments] = useState([]);
  const { employee, ready, logout } = useContext(EmployeeContext);
  const [filter, setFilter] = useState({
    status: "pending",
    search: "",
    currency: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (ready && !employee) {
      toast.error("Unauthorized access. Please log in as an employee.");
      return <Navigate to="/employee-login" replace />;
    }
  }, [ready, employee]);

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.get("/api/employee/pending-payments", {
        params: filter,
      });
      setPayments(data);
    } catch (err) {
      const errMsg = getApiErrorMessage(err, "Failed to fetch payments.");
      setError(errMsg);
      toast.error(errMsg);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAction = async (id, action, reason = "") => {
    try {
      await axios.patch(`/api/employee/verify-payment/${id}`, {
        action,
      });
      fetchPayments();
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
      <h2 className="dashboard-title">Employee Portal –Payments Processing</h2>
      {/* // logout button */}
      <button className="logout-button" onClick={logout}>
        Logout
      </button>

      {error && <div className="form-error">{error}</div>}
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
      <div className="table-container">
        <table className="payments-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Amount</th>
              <th>Currency</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p, index) => (
              <tr key={index}>
                <td data-label="ID">{p.transactionId}</td>
                <td data-label="Customer">
                  {p.firstName} {p.lastName}
                </td>
                <td data-label="Amount">{p.amount}</td>
                <td data-label="Currency">{p.currency}</td>
                <td data-label="Status">{p.status}</td>
                <td data-label="Action">
                  <button onClick={() => setSelectedPayment(p)}>
                    {/* // if status  pending show Verify, if verified show Submit, else show View */}
                    {p.status === "pending"
                      ? "Verify"
                      : p.status === "verified"
                        ? "Submit to SWIFT"
                        : "View"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {selectedPayment && (
        <EmployeePaymentModal
          payment={selectedPayment}
          onClose={() => {
            setSelectedPayment(null);
            fetchPayments();
          }}
          onAction={handleAction}
          s
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
