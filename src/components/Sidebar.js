import { NavLink, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";
import "./Sidebar.css";

const Sidebar = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  if (!context) {
    console.error("AuthContext no está disponible en Sidebar.js");
    return null;
  }

  const { user } = context;

  // 🛠️ CORRECCIÓN CLAVE: Unificamos 'rol' y 'role' para evitar que el menú desaparezca
  const userRole = user ? (user.rol || user.role || "public").toLowerCase() : "public";

  console.log("Sidebar - Usuario detectado:", userRole);

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

  // Lógica de filtrado de items según el rol unificado
  const itemsToShow = user
    ? userRole === "user" || userRole === "public"
      ? [...menuItems.public]
      : [...(menuItems[userRole] || menuItems.entrenador), ...menuItems.public]
    : menuItems.public;

  const handleEditarClasesClick = () => {
    navigate("/entrenadores");
  };

  useEffect(() => {
    console.log("Sidebar actualizado para el rol:", userRole);
  }, [user, userRole]);

  return (
    <div className="sidebar p-3 bg-dark text-white vh-100" key={userRole}>
      <div className="text-center mb-4">
        <img src="/logo192.png" alt="Logo Admin Gym" style={{ width: "100px" }} />
        <h6 className="mt-2 text-uppercase" style={{ fontSize: '0.8rem', color: '#aaa' }}>
          {userRole}
        </h6>
      </div>
      <ListGroup variant="flush">
        {itemsToShow.map((item, index) => (
          <ListGroup.Item
            key={`${item.path}-${index}`}
            as={item.label === "✏️ Editar Clases" ? "div" : NavLink}
            to={item.label !== "✏️ Editar Clases" ? item.path : undefined}
            className={({ isActive }) =>
              `sidebar-item ${item.label !== "✏️ Editar Clases" && isActive ? "active" : ""}`
            }
            onClick={
              item.label === "✏️ Editar Clases" ? handleEditarClasesClick : undefined
            }
            style={{ cursor: "pointer" }}
          >
            {item.label}
          </ListGroup.Item>
        ))}
      </ListGroup>
    </div>
  );
};

export default Sidebar;
