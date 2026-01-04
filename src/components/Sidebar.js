import { NavLink, useNavigate } from "react-router-dom";
import { ListGroup } from "react-bootstrap";
import { useContext, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const Sidebar = () => {
  const context = useContext(AuthContext);
  const navigate = useNavigate();

  // 1. Verificación de Contexto: Si no hay contexto, mostramos un error visual
  if (!context) {
    return (
      <div style={{ color: "white", background: "red", padding: "20px", width: "250px" }}>
        Error: AuthContext no encontrado.
      </div>
    );
  }

  const { user } = context;

  // 2. Normalización de Rol: Detectamos 'rol' o 'role'
  const userRole = user ? (user.rol || user.role || "public").toLowerCase().trim() : "public";

  // 3. Definición de Ítems (Incluyendo la nueva opción de Mensualidades)
  const menuItems = {
    admin: [
      { label: "📊 Panel", path: "/dashboard" },
      { label: "🧍 Clientes", path: "/clientes" },
      { label: "💵 Mensualidades", path: "/pagos/mensualidades" }, // Nueva ruta
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
      { label: "📋 Inscripciones", path: "/admin/inscripciones" },
    ],
    entrenador: [
      { label: "🏋️ Rutinas", path: "/rutinas/crear" },
      { label: "📋 Asignar Rutina", path: "/rutinas/asignar" },
      { label: "📏 Composición Corporal", path: "/composicion-corporal" },
      { label: "🔍 Consultar Composición", path: "/consultar-composicion-corporal" },
      { label: "🎥 Videos Entrenamiento", path: "/videos-entrenamiento" },
    ],
    public: [
      { label: "🔍 Consultar Rutinas", path: "/rutinas/consultar" },
      { label: "🕒 Clases", path: "/clases" },
    ],
  };

  // 4. Lógica de visualización: Si es admin, mostramos admin. Si no, forzamos público para que no quede vacío.
  const itemsToShow = menuItems[userRole] || menuItems.public;

  useEffect(() => {
    console.log("Sidebar Debug - Usuario:", user);
    console.log("Sidebar Debug - Rol procesado:", userRole);
  }, [user, userRole]);

  return (
    <div 
      className="sidebar-container"
      style={{
        width: "260px",
        minHeight: "100vh",
        backgroundColor: "#1a1a1a",
        color: "white",
        position: "fixed",
        left: 0,
        top: 0,
        zIndex: 9999,
        padding: "20px 10px",
        overflowY: "auto",
        borderRight: "1px solid #333"
      }}
    >
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <img src="/logo192.png" alt="Logo" style={{ width: "80px", marginBottom: "10px" }} />
        <div style={{ 
          fontSize: "12px", 
          background: "#333", 
          padding: "5px", 
          borderRadius: "4px",
          textTransform: "uppercase" 
        }}>
          Rol: {userRole}
        </div>
      </div>

      <ListGroup variant="flush" style={{ background: "transparent" }}>
        {itemsToShow.map((item, index) => (
          <NavLink
            key={`${item.path}-${index}`}
            to={item.path}
            style={({ isActive }) => ({
              textDecoration: "none",
              display: "block",
              padding: "12px 15px",
              color: isActive ? "#fff" : "#bbb",
              backgroundColor: isActive ? "#0d6efd" : "transparent",
              borderRadius: "5px",
              marginBottom: "5px",
              fontSize: "14px",
              transition: "0.3s"
            })}
          >
            {item.label}
          </NavLink>
        ))}
      </ListGroup>

      <button 
        onClick={() => { localStorage.clear(); window.location.href = "/login"; }}
        style={{
          marginTop: "20px",
          width: "100%",
          padding: "10px",
          backgroundColor: "#dc3545",
          border: "none",
          color: "white",
          borderRadius: "5px",
          cursor: "pointer"
        }}
      >
        Cerrar Sesión (Limpiar)
      </button>
    </div>
  );
};

export default Sidebar;
