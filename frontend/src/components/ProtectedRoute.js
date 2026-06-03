import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../context/UserContext";

const ProtectedRoute = ({ children }) => {
  const { user, ready } = useContext(UserContext);

  if (ready && !user) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
