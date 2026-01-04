import { NavLink, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  // Si el contexto no carga, no matamos la app, solo retornamos vacío temporalmente
  if (!context) return null;

  const { user } = context;

  // Forzamos la detección del rol sin importar si viene como 'rol' o 'role'
  const rawRole = user?.rol || user?.role || "public";
  const userRole = String(rawRole).toLowerCase().trim();

  const menuItems = {
    admin: [
      { label: "📊 Panel", path: "/dashboard" },
      { label: "🧍 Clientes", path: "/clientes" },
      { label: "📦 Productos", path: "/productos" },
      { label: "🎟️ Membresías", path: "/membresias" },
      { label: "💵 Pagos", path: "/pagos" },
      { label: "📊 Contabilidad", path: "/contabilidad" },
      { label: "👥 Usuarios", path: "/usuarios" },
      { label: "🏋️‍♂️ Entrenadores", path: "/entrenadores" },
      { label: "🕒 Clases", path: "/clases" },
      { label: "📝 Suscripción", path: "/suscripcion" },
      { label: "📈 Indicadores", path: "/indicadores" },
      { label: "🏋️ Rutinas", path: "/rutinas/crear" },
      { label: "📋 Asignar Rutina", path: "/rutinas/asignar" },
      { label: "📏 Composición Corporal", path: "/composicion-corporal" },
      { label: "🔍 Consultar Composición", path: "/consultar-composicion-corporal" },
      { label: "🎥 Videos Entrenamiento", path: "/videos-entrenamiento" },
      { label: "✏️ Editar Clases", path: "/entrenadores/editar-clases" },
      { label: "📋 Inscripciones", path: "/admin/inscripciones" },
    ],
    entrenador: [
      { label: "🏋️ Rutinas", path: "/rutinas/crear" },
      { label: "📋 Asignar Rutina", path: "/rutinas/asignar" },
      { label: "📏 Composición Corporal", path: "/composicion-corporal" },
      { label: "🔍 Consultar Composición", path: "/consultar-composicion-corporal" },
      { label: "🎥 Videos Entrenamiento", path: "/videos-entrenamiento" },
      { label: "✏️ Editar Clases", path: "/entrenadores/editar-clases" },
    ],
    public: [
      { label: "🔍 Consultar Rutinas", path: "/rutinas/consultar" },
      { label: "📏 Consultar Composición Corporal", path: "/consultar-composicion-corporal" },
      { label: "🎥 Asesoramiento de Ejercicios", path: "/videos-entrenamiento" },
      { label: "🕒 Clases", path: "/clases" },
    ],
  };

  // Determinamos qué mostrar. Si no reconoce el rol, por defecto muestra 'entrenador' + 'public'
  const itemsToShow = (menuItems[userRole] || [...menuItems.entrenador, ...menuItems.public]);

  const handleEditarClasesClick = () => navigate("/entrenadores");

  return (
    <div className="sidebar p-3 bg-dark text-white vh-100" style={{ minWidth: '250px' }}>
      <div className="text-center mb-4">
        <img src="/logo192.png" alt="Logo" style={{ width: "80px" }} />
        <small className="d-block text-muted mt-2">MODO: {userRole}</small>
      </div>
      <ListGroup variant="flush">
        {itemsToShow.map((item, index) => (
          <ListGroup.Item
            key={`${item.path}-${index}`}
            as={item.label === "✏️ Editar Clases" ? "div" : NavLink}
            to={item.label !== "✏️ Editar Clases" ? item.path : undefined}
            className={({ isActive }) => `sidebar-item ${isActive ? "active" : ""}`}
            onClick={item.label === "✏️ Editar Clases" ? handleEditarClasesClick : undefined}
            style={{ cursor: "pointer", background: 'transparent', color: 'white', border: 'none' }}
          >
            {item.label}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
