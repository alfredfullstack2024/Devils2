import { Navigate, useLocation, useSearchParams } from "react-router-dom";

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPublic = searchParams.get("public") === "true";

  const publicRoutes = [
    "/login",
    "/register",
    "/consulta-usuario",
  ];

  if (isPublic || publicRoutes.includes(location.pathname)) {
    return children;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default PrivateRoute;
