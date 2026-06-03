import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const EmployeeContext = createContext({});

export function EmployeeContextProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 🔽 Add this block to prevent unauthorized API requests on customer pages
    if (!window.location.pathname.includes("employee")) {
      setReady(true); // Mark ready so routing isn't blocked
      return;
    }
    if (!employee) {
      fetchProfile();
    }
  }, [employee]);
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/employee/profile");
      setEmployee(data);
    } catch (error) {
      console.log("Error fetching profile:", error);
      setEmployee(null);
    } finally {
      setReady(true);
    }
  };
  // Logout function to clear the employee state
  const logout = async () => {
    try {
      await axios.get("/api/employee/logout");
      setEmployee(null);
    } catch (error) {
      console.log("Error logging out:", error);
    }
  };
  return (
    <EmployeeContext.Provider
      value={{ employee, setEmployee, ready, logout, fetchProfile }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}
