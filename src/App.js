import React from "react";
import { Routes as Rutas, Route as Ruta, Navigate as Navegar } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import DashboardLayout from "./layouts/DashboardLayout";
import PrivateRoute from "./components/PrivateRoute";

// Páginas Públicas
import Login from "./pages/Login";
import Registro from "./pages/Register";
import NotFound from "./pages/NotFound";
import ConsultaUsuario from "./pages/ConsultaUsuario";

// Páginas protegidas
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
import PagosLigas from "./pages/pagos/PagosLigas";
import PagosMensualidades from "./pages/pagos/PagosMensualidades"; // ✅ Importación agregada

// Contabilidad
import Contabilidad from "./pages/contabilidad/Contabilidad";
import CrearTransaccion from "./pages/contabilidad/CrearTransaccion";
import EditarTransaccion from "./pages/contabilidad/EditarTransaccion";

// Clases
import ListaClases from "./pages/sesiones/ListaClases";

const App = () => {
  return (
    <Rutas>
      {/* Rutas Públicas */}
      <Ruta path="/login" element={<Login />} />
      <Ruta path="/registro" element={<Registro />} />
      <Ruta path="/consulta/:id" element={<ConsultaUsuario />} />

      {/* Rutas Protegidas bajo DashboardLayout */}
      <Ruta element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
        <Ruta path="/" element={<Navegar to="/dashboard" replace />} />
        <Ruta path="/dashboard" element={<div>TEST DASHBOARD</div>} />

        <Ruta path="/suscripcion" element={<Suscripcion />} />

        {/* Clientes */}
        <Ruta path="/clientes" element={<ListaClientes />} />
        <Ruta path="/clientes/crear" element={<CrearCliente />} />
        <Ruta path="/clientes/editar/:id" element={<EditarCliente />} />

        {/* Membresías */}
        <Ruta path="/membresias" element={<Membresias />} />
        <Ruta path="/membresias/crear" element={<CrearMembresia />} />
        <Ruta path="/membresias/editar/:id" element={<EditarMembresia />} />

        {/* Entrenadores */}
        <Ruta path="/entrenadores" element={<Entrenadores />} />
        <Ruta path="/entrenadores/crear" element={<CrearEntrenador />} />
        <Ruta path="/entrenadores/editar/:id" element={<EditarEntrenador />} />

        {/* Productos */}
        <Ruta path="/productos" element={<Productos />} />
        <Ruta path="/productos/crear" element={<CrearProducto />} />
        <Ruta path="/productos/editar/:id" element={<EditarProducto />} />

        {/* Pagos */}
        <Ruta path="/pagos" element={<Pagos />} />
        <Ruta path="/pagos/crear" element={<CrearPago />} />
        <Ruta path="/pagos/editar/:id" element={<EditarPago />} />
        <Ruta path="/pagos/reporte-equipos" element={<ReportePagosPorEquipo />} />
        <Ruta path="/pagos/ligas" element={<PagosLigas />} />
        <Ruta path="/pagos/mensualidades" element={<PagosMensualidades />} /> {/* ✅ Ruta registrada */}

        {/* Contabilidad */}
        <Ruta path="/contabilidad" element={<Contabilidad />} />
        <Ruta path="/contabilidad/crear-transaccion" element={<CrearTransaccion />} />
        <Ruta path="/contabilidad/editar-transaccion/:id" element={<EditarTransaccion />} />

        {/* Clases */}
        <Ruta path="/clases" element={<ListaClases />} />
      </Ruta>

      {/* Ruta 404 */}
      <Ruta path="*" element={<NotFound />} />
    </Rutas>
  );
};

export default App;
