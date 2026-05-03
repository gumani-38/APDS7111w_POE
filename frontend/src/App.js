import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
// import EmployeeLogin from "./pages/EmployeeLogin";
// import EmployeeDashboard from "./pages/EmployeeDashboard";
import axios from "axios";
import { UserContextProvider } from "./context/UserContext";
import ProtectedRoute from "./components/ProtectedRoute";
// set base URL for all axios requests
axios.defaults.baseURL = process.env.REACT_APP_BACKEND_URL;
// add credentials to all requests
axios.defaults.withCredentials = true;
//detect if your application is being framed and break out of it.
const useFrameBusting = () => {
  useEffect(() => {
    if (window.self !== window.top) {
      window.top.location.href = window.self.location.href;
    }
  }, []);
};
function App() {
  useFrameBusting();
  return (
    <UserContextProvider>
      <BrowserRouter
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
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
          <Route path="/" element={<CustomerLogin />} />
        </Routes>
      </BrowserRouter>
    </UserContextProvider>
  );
}

export default App;
