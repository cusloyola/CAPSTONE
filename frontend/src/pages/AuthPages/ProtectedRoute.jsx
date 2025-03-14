import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();
  const location = useLocation();

  console.log("ProtectedRoute - User:", user); // Log user for debugging

  if (!user) {
    console.log("User is not logged in. Redirecting to signin...");
    return <Navigate to="/signin" state={{ from: location }} />;
  }

  // Ensure role is compared correctly
  console.log("Role mismatch - User Role:", user.role); // Log the user's role for debugging

  if (!allowedRoles.includes(user.role?.toLowerCase())) {
    console.log("Role mismatch - User Role:", user.role);
    return <Navigate to="/unauthorized" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
