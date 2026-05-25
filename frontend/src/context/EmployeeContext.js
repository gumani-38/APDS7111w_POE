import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const EmployeeContext = createContext({});

export function EmployeeContextProvider({ children }) {
  const [employee, setEmployee] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!employee) {
      fetchProfile();
    }
  }, [employee]);
  const fetchProfile = async () => {
    try {
      const { data } = await axios.get("/api/employee/profile");
      setEmployee(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
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
      console.error("Error logging out:", error);
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
