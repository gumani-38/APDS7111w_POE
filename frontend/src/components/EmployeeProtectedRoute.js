import React from "react";
import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { EmployeeContext } from "../context/EmployeeContext";

const EmployeeProtectedRoute = ({ children }) => {
  const { employee, ready } = useContext(EmployeeContext);

  if (ready && !employee) {
    return <Navigate to="/employee-login" replace />;
  }
  return children;
};

export default EmployeeProtectedRoute;
