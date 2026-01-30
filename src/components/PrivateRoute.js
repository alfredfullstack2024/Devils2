import { Navigate, Outlet, useLocation, useSearchParams } from "react-router-dom";

const PrivateRoute = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isPublic = searchParams.get("public") === "true";

  const publicRoutes = [
    "/login",
    "/register",
    "/consulta-usuario",
  ];

  if (isPublic || publicRoutes.includes(location.pathname)) {
    return <Outlet />;
  }

  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};

export default PrivateRoute;
