import axios from "axios";
import { createContext, useEffect, useState } from "react";

export const UserContext = createContext({});

export function UserContextProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!user) {
      fetchProfile();
    }
  }, []);
  const fetchProfile = async () => {
    try {
      console.log("Fetching user profile...");
      const { data } = await axios.get("/api/user/profile");
      console.log("Fetched user profile:", data);
      setUser(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setUser(null);
    } finally {
      setReady(true);
    }
  };
  // Logout function to clear the user state
  const logout = async () => {
    try {
      await axios.get("/api/user/logout");
      setUser(null);
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };
  return (
    <UserContext.Provider
      value={{ user, setUser, ready, logout, fetchProfile }}
    >
      {children}
    </UserContext.Provider>
  );
}
