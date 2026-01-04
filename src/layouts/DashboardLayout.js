import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { Nav, Container, Button } from "react-bootstrap";
import { useAuth } from "../context/AuthContext";
import {
  FaTachometerAlt,
  FaUsers,
  FaIdCard,
  FaShoppingCart,
  FaMoneyBillWave,
  FaChartBar,
  FaDumbbell,
  FaUsersCog,
  FaPlus,
  FaSearch,
  FaUser,
  FaVideo,
  FaEdit,
} from "react-icons/fa";

const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 🛠️ UNIFICACIÓN DE ROLES: Previene que el menú desaparezca por errores de nombre
  const userRole = user ? (user.rol || user.role || "user").toLowerCase().trim() : "user";

  // Menú dinámico actualizado con la nueva ruta de Mensualidades
  const menuItems = {
    admin: [
      { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { path: "/clientes", icon: <FaUsers />, label: "Clientes" },
      { path: "/pagos/mensualidades", icon: <FaMoneyBillWave />, label: "Mensualidades" }, // ✅ Nueva Ruta
      { path: "/membresias", icon: <FaIdCard />, label: "Membresías" },
      { path: "/entrenadores", icon: <FaUsersCog />, label: "Entrenadores" },
      { path: "/productos", icon: <FaShoppingCart />, label: "Productos" },
      { path: "/pagos", icon: <FaMoneyBillWave />, label: "Pagos" },
      { path: "/contabilidad", icon: <FaChartBar />, label: "Contabilidad" },
      { path: "/clases", icon: <FaDumbbell />, label: "Clases" },
      { path: "/rutinas/crear", icon: <FaDumbbell />, label: "Crear rutina" },
      { path: "/rutinas/asignar", icon: <FaPlus />, label: "Asignar rutina" },
      { path: "/rutinas/editar-asignacion", icon: <FaEdit />, label: "Editar Asignación" },
      { path: "/composicion-corporal", icon: <FaUser />, label: "Comp. Corporal" },
      { path: "/usuarios", icon: <FaUsersCog />, label: "Usuarios" },
      { path: "/indicadores", icon: <FaChartBar />, label: "Indicadores" },
      { path: "/videos-entrenamiento", icon: <FaVideo />, label: "Asesoramiento" },
      { path: "/medicion-porristas", icon: <FaDumbbell />, label: "Medición Porristas" },
    ],
    recepcionista: [
      { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { path: "/clientes", icon: <FaUsers />, label: "Clientes" },
      { path: "/pagos/mensualidades", icon: <FaMoneyBillWave />, label: "Mensualidades" },
      { path: "/membresias", icon: <FaIdCard />, label: "Membresías" },
      { path: "/entrenadores", icon: <FaUsersCog />, label: "Entrenadores" },
      { path: "/productos", icon: <FaShoppingCart />, label: "Productos" },
      { path: "/pagos", icon: <FaMoneyBillWave />, label: "Pagos" },
      { path: "/clases", icon: <FaDumbbell />, label: "Clases" },
    ],
    entrenador: [
      { path: "/dashboard", icon: <FaTachometerAlt />, label: "Dashboard" },
      { path: "/rutinas/crear", icon: <FaDumbbell />, label: "Crear rutina" },
      { path: "/rutinas/asignar", icon: <FaPlus />, label: "Asignar rutina" },
      { path: "/rutinas/editar-asignacion", icon: <FaEdit />, label: "Editar Asignación" },
      { path: "/composicion-corporal", icon: <FaUser />, label: "Comp. Corporal" },
      { path: "/medicion-porristas", icon: <FaDumbbell />, label: "Medición Porristas" },
    ],
    user: [
      { path: "/rutinas/consultar", icon: <FaSearch />, label: "Consultar Rutina" },
      { path: "/consultar-composicion-corporal", icon: <FaSearch />, label: "Consultar Comp. Corp." },
      { path: "/videos-entrenamiento", icon: <FaVideo />, label: "Asesoramiento" },
    ],
  };

  const userMenu = menuItems[userRole] || menuItems["user"];

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Menú Lateral */}
      <div
        style={{
          width: "250px",
          backgroundColor: "#343a40",
          color: "white",
          paddingTop: "20px",
          position: "fixed",
          height: "100%",
          overflowY: "auto",
          zIndex: 1000
        }}
      >
        <div className="text-center mb-4">
          <img
            src="https://raw.githubusercontent.com/alfredfullstack2024/alfredfullstack.com/main/images/LOGOICONIC.jpg"
            alt="Logo Iconic"
            style={{ width: "150px", marginBottom: "10px", objectFit: "contain" }}
          />
          <h5>Admin Escuela</h5>
          <div className="badge bg-secondary text-uppercase">{userRole}</div>
        </div>
        <Nav className="flex-column">
          {userMenu.map((item, index) => (
            <Nav.Link 
              key={index} 
              as={NavLink} 
              to={item.path} 
              className={({ isActive }) => 
                `text-white px-3 py-2 d-flex align-items-center ${isActive ? "bg-primary" : ""}`
              }
            >
              <span style={{ width: "25px" }}>{item.icon}</span>
              <span className="ms-2">{item.label}</span>
            </Nav.Link>
          ))}
          <Button
            variant="danger"
            className="mt-4 w-75 mx-auto"
            onClick={handleLogout}
          >
            Cerrar Sesión
          </Button>
        </Nav>
      </div>

      {/* Contenido Principal */}
      <div style={{ marginLeft: "250px", width: "calc(100% - 250px)", backgroundColor: "#f8f9fa" }}>
        <Container className="py-4">
          <Outlet />
        </Container>
      </div>
    </div>
  );
};

export default DashboardLayout;
