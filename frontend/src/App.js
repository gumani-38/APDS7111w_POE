import React, { useContext } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
// import EmployeeLogin from "./pages/EmployeeLogin";
// import EmployeeDashboard from "./pages/EmployeeDashboard";
import axios from "axios";
import { UserContext, UserContextProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
// set base URL for all axios requests
axios.defaults.baseURL =
  process.env.REACT_APP_BACKEND_URL || "http://localhost:3000";
// add credentials to all requests
axios.defaults.withCredentials = true;
function App() {
  const { user, ready } = useContext(UserContext);
  return (
    <UserContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/customer-register" element={<CustomerRegister />} />
          <Route
            path="/customer-dashboard"
            element={
              <ProtectedRoute>
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          {/* <Route path="/employee-login" element={<EmployeeLogin />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> */}
          <Route
            path="/"
            element={
              ready && !user ? (
                <CustomerLogin />
              ) : (
                <Navigate to="/customer-dashboard" replace />
              )
            }
          />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
