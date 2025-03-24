import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../../context/UserContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { user } = useUser();
  const location = useLocation();

  console.log("ProtectedRoute - User:", user);

  if (!user) {
    console.log("⛔ User is not logged in. Redirecting to signin...");
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // Normalize role comparison
  const userRole = user.role?.toLowerCase();
  const normalizedAllowedRoles = allowedRoles.map(role => role.toLowerCase());

  console.log(`🔍 Checking role - User Role: ${userRole}, Allowed Roles: ${normalizedAllowedRoles}`);

  if (!normalizedAllowedRoles.includes(userRole)) {
    console.log(`⛔ Role mismatch - User Role: ${user.role}`);
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
