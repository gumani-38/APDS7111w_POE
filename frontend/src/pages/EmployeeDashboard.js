import React, { useState, useEffect, useCallback } from "react";
import EmployeePaymentModal from "../components/EmployeePaymentModal";
import { sanitizers } from "../utils/validation";
import "./Dashboard.css";

const EmployeeDashboard = () => {
  const [payments, setPayments] = useState([]);
  const [filter, setFilter] = useState({
    status: "pending",
    search: "",
    currency: "",
  });
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      // const res = await api.get('/employee/pending-payments', { params: filter });
      //   setPayments(res.data);
    } catch (err) {
      // setError(getApiErrorMessage(err, 'Could not load pending payments.'));
      console.log(err);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleAction = async (id, action, reason = "") => {
    try {
      //   const res = await api.post(`/employee/payments/${id}/${action}`, {
      //     reason,
      //   });
      //   fetchPayments();
      //   if (action === "submit" && res.data.uetr) return { uetr: res.data.uetr };
      //   setSelectedPayment(null);
      return {};
    } catch (err) {
      //   const message = getApiErrorMessage(err, "Action failed.");
      //   setError(message);
      //   return { error: message };
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Employee Portal – Pending Payments</h2>
      {error && (
        <div className="form-error" role="alert">
          {error}
        </div>
      )}
      <div
        style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}
      >
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
        <button onClick={fetchPayments} disabled={loading}>
          {loading ? "Loading..." : "Refresh"}
        </button>
      </div>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
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
          {payments.map((p) => (
            <tr key={p.id}>
              <td>{p.id}</td>
              <td>{p.customerName || p.customerId}</td>
              <td>{p.amount}</td>
              <td>{p.currency}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => setSelectedPayment(p)}>Verify</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
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
