import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";

// Páginas Públicas
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ConsultaUsuario from "./pages/ConsultaUsuario";

// Páginas Protegidas
import Dashboard from "./pages/Dashboard";
import Suscripcion from "./pages/Suscripcion";

// Clientes
import ListaClientes from "./pages/ListaClientes";
import CrearCliente from "./pages/CrearCliente";
import EditarCliente from "./pages/EditarCliente";

// Membresías
import Membresias from "./pages/Membresias";
import CrearMembresia from "./pages/CrearMembresia";
import EditarMembresia from "./pages/EditarMembresia";

// Entrenadores
import Entrenadores from "./pages/Entrenadores";
import CrearEntrenador from "./pages/CrearEntrenador";
import EditarEntrenador from "./pages/EditarEntrenador";

// Productos
import Productos from "./pages/Productos";
import CrearProducto from "./pages/CrearProducto";
import EditarProducto from "./pages/EditarProducto";

// Pagos
import Pagos from "./pages/pagos/Pagos";
import CrearPago from "./pages/pagos/CrearPago";
import EditarPago from "./pages/pagos/EditarPago";
import ReportePagosPorEquipo from "./pages/pagos/ReportePagosPorEquipo";
import PagosLigas from "./pages/pagos/PagosLigas"; // ✅ Nuevo componente agregado

// Contabilidad
import Contabilidad from "./pages/contabilidad/Contabilidad";
import CrearTransaccion from "./pages/contabilidad/CrearTransaccion";
import EditarTransaccion from "./pages/contabilidad/EditarTransaccion";

// Clases
import ListaClases from "./pages/sesiones/ListaClases";

// Usuarios
import Usuarios from "./pages/Usuarios";
import CrearUsuario from "./pages/usuarios/CrearUsuario";
import EditarUsuario from "./pages/usuarios/EditarUsuario";

// Asistencias
import Asistencias from "./pages/asistencias/Asistencias";
import RegistrarAsistencia from "./pages/asistencias/RegistrarAsistencia";

// Rutinas
import ConsultarRutina from "./pages/ConsultarRutina";
import CrearRutina from "./pages/rutinas/CrearRutina";
import AsignarRutina from "./pages/rutinas/AsignarRutina";
import EditarAsignacionRutina from "./pages/rutinas/EditarAsignacionRutina";

// Composición Corporal
import ConsultarComposicionCorporal from "./pages/ConsultarComposicionCorporal";
import ComposicionCorporal from "./pages/ComposicionCorporal";

// Indicadores
import Indicadores from "./pages/Indicadores";

// Videos
import VideosEntrenamiento from "./pages/videos/VideosEntrenamiento";

// Nueva página
import AdminInscripciones from "./pages/admin/AdminInscripciones";

// Medición Porristas
import CrearMedicionPorristas from "./pages/medicionPorristas/CrearMedicionPorristas";

// 🔹 Componente para proteger rutas basadas en roles
const RoleBasedRoute = ({ element, allowedRoles }) => {
  const { user } = useAuth();
  if (!user || !user.rol) {
    return <Navigate to="/login" replace />;
  }
  if (allowedRoles.includes("admin") && user.rol === "admin") {
    return element;
  }
  if (!allowedRoles.includes(user.rol)) {
    return <Navigate to="/dashboard" replace />;
  }
  return element;
};

const App = () => {
  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/consulta-usuario" element={<ConsultaUsuario />} />
      <Route
        path="/"
        element={
          <Navigate
            to={localStorage.getItem("token") ? "/dashboard" : "/login"}
            replace
          />
        }
      />

      {/* Rutas Protegidas */}
      <Route element={<PrivateRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/suscripcion" element={<Suscripcion />} />

          {/* Clientes */}
          <Route
            path="/clientes"
            element={<RoleBasedRoute element={<ListaClientes />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/clientes/crear"
            element={<RoleBasedRoute element={<CrearCliente />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/clientes/editar/:id"
            element={<RoleBasedRoute element={<EditarCliente />} allowedRoles={["recepcionista", "admin"]} />}
          />

          {/* Membresías */}
          <Route
            path="/membresias"
            element={<RoleBasedRoute element={<Membresias />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/membresias/crear"
            element={<RoleBasedRoute element={<CrearMembresia />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/membresias/editar/:id"
            element={<RoleBasedRoute element={<EditarMembresia />} allowedRoles={["recepcionista", "admin"]} />}
          />

          {/* Entrenadores */}
          <Route
            path="/entrenadores"
            element={<RoleBasedRoute element={<Entrenadores />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/entrenadores/crear"
            element={<RoleBasedRoute element={<CrearEntrenador />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/entrenadores/editar/:id"
            element={<RoleBasedRoute element={<EditarEntrenador />} allowedRoles={["recepcionista", "admin"]} />}
          />

          {/* Productos */}
          <Route
            path="/productos"
            element={<RoleBasedRoute element={<Productos />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/productos/crear"
            element={<RoleBasedRoute element={<CrearProducto />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/productos/editar/:id"
            element={<RoleBasedRoute element={<EditarProducto />} allowedRoles={["recepcionista", "admin"]} />}
          />

          {/* Pagos */}
          <Route
            path="/pagos"
            element={<RoleBasedRoute element={<Pagos />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/pagos/crear"
            element={<RoleBasedRoute element={<CrearPago />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/pagos/editar/:id"
            element={<RoleBasedRoute element={<EditarPago />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/pagos/reporte"
            element={<RoleBasedRoute element={<ReportePagosPorEquipo />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/pagos/ligas"
            element={<RoleBasedRoute element={<PagosLigas />} allowedRoles={["recepcionista", "admin"]} />}
          /> {/* ✅ Nueva ruta protegida */}

          {/* Clases */}
          <Route
            path="/clases"
            element={<RoleBasedRoute element={<ListaClases />} allowedRoles={["recepcionista", "admin"]} />}
          />

          {/* Asistencias */}
          <Route
            path="/asistencias"
            element={<RoleBasedRoute element={<Asistencias />} allowedRoles={["recepcionista", "admin"]} />}
          />
          <Route
            path="/asistencias/registrar"
            element={<RoleBasedRoute element={<RegistrarAsistencia />} allowedRoles={["recepcionista", "admin"]} />}
          />

          {/* Rutinas */}
          <Route
            path="/rutinas/crear"
            element={<RoleBasedRoute element={<CrearRutina />} allowedRoles={["entrenador", "admin"]} />}
          />
          <Route
            path="/rutinas/asignar"
            element={<RoleBasedRoute element={<AsignarRutina />} allowedRoles={["entrenador", "admin"]} />}
          />
          <Route
            path="/rutinas/editar-asignacion"
            element={<RoleBasedRoute element={<EditarAsignacionRutina />} allowedRoles={["entrenador", "admin"]} />}
          />

          {/* Composición Corporal */}
          <Route
            path="/composicion-corporal"
            element={<RoleBasedRoute element={<ComposicionCorporal />} allowedRoles={["entrenador", "admin"]} />}
          />
          <Route
            path="/medicion-porristas"
            element={<RoleBasedRoute element={<CrearMedicionPorristas />} allowedRoles={["entrenador", "admin"]} />}
          />

          {/* Usuarios */}
          <Route
            path="/rutinas/consultar"
            element={<RoleBasedRoute element={<ConsultarRutina />} allowedRoles={["user"]} />}
          />
          <Route
            path="/consultar-composicion-corporal"
            element={<RoleBasedRoute element={<ConsultarComposicionCorporal />} allowedRoles={["user"]} />}
          />
          <Route
            path="/videos-entrenamiento"
            element={<RoleBasedRoute element={<VideosEntrenamiento />} allowedRoles={["user"]} />}
          />

          {/* Solo Admins */}
          <Route
            path="/contabilidad"
            element={<RoleBasedRoute element={<Contabilidad />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/contabilidad/crear-transaccion"
            element={<RoleBasedRoute element={<CrearTransaccion />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/contabilidad/editar-transaccion/:id"
            element={<RoleBasedRoute element={<EditarTransaccion />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/usuarios"
            element={<RoleBasedRoute element={<Usuarios />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/usuarios/crear"
            element={<RoleBasedRoute element={<CrearUsuario />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/usuarios/editar/:id"
            element={<RoleBasedRoute element={<EditarUsuario />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/indicadores"
            element={<RoleBasedRoute element={<Indicadores />} allowedRoles={["admin"]} />}
          />
          <Route
            path="/admin/inscripciones"
            element={<RoleBasedRoute element={<AdminInscripciones />} allowedRoles={["admin"]} />}
          />
        </Route>
      </Route>

      {/* Ruta 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default App;
