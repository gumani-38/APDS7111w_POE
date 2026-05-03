import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import CustomerRegister from "./pages/CustomerRegister";
import CustomerLogin from "./pages/CustomerLogin";
import CustomerDashboard from "./pages/CustomerDashboard";
import EmployeeLogin from "./pages/EmployeeLogin";
import EmployeeDashboard from "./pages/EmployeeDashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/customer-register" element={<CustomerRegister />} />
        <Route path="/customer-login" element={<CustomerLogin />} />
        <Route path="/customer-dashboard" element={<CustomerDashboard />} />
        {/* <Route path="/employee-login" element={<EmployeeLogin />} />
                <Route path="/employee-dashboard" element={<EmployeeDashboard />} /> */}
        <Route path="/" element={<CustomerLogin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
