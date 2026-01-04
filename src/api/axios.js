// src/api/axios.js
import axios from "axios";

// Función para obtener y validar la URL base del backend
const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const defaultDevUrl = "http://localhost:5000/api";
  const defaultProdUrl = "https://backend-5zxh.onrender.com/api";
  const baseUrl =
    envUrl ||
    (process.env.NODE_ENV === "development" ? defaultDevUrl : defaultProdUrl);

  console.log("Depuración de URL - Variables de entorno:", {
    REACT_APP_API_URL: envUrl,
    NODE_ENV: process.env.NODE_ENV,
    BaseUrlSeleccionada: baseUrl,
  });

  return baseUrl;
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000, // Timeout de 10 segundos
  headers: {
    "Content-Type": "application/json",
  },
});
console.log("Base URL del API configurada finalmente:", api.defaults.baseURL);

// Interceptor de solicitudes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("Token añadido a la solicitud:", {
        token: token.substring(0, 10) + "...",
        url: `${config.baseURL}${config.url}`,
      });
    } else {
      console.log(
        "No se encontró token en localStorage. Solicitud sin autenticación a:",
        `${config.baseURL}${config.url}`
      );
    }
    console.log("Solicitud enviada a:", {
      url: `${config.baseURL}${config.url}`,
      method: config.method,
      data: config.data,
    });
    return config;
  },
  (error) => {
    console.error("Error en el interceptor de solicitud:", {
      message: error.message,
      code: error.code,
      config: error.config,
    });
    return Promise.reject(error);
  }
);

// Interceptor de respuestas
api.interceptors.response.use(
  (response) => {
    console.log("Respuesta recibida:", {
      status: response.status,
      url: response.config.url,
      data: response.data,
    });
    return response;
  },
  (error) => {
    if (error.code === "ECONNABORTED") {
      console.error("Timeout en la solicitud:", {
        message: error.message,
        url: error.config?.url,
        timeout: error.config?.timeout,
      });
      return Promise.reject(
        new Error("La solicitud tardó demasiado. Verifica tu conexión.")
      );
    }
    if (error.response) {
      console.error("Error en la respuesta:", {
        status: error.response.status,
        url: error.response.config.url,
        data: error.response.data,
        headers: error.response.headers,
      });
      if (error.response.status === 401) {
        console.error(
          "Sesión expirada o no autorizada. Limpiando token y redirigiendo."
        );
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(
          new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
        );
      }
      if (error.response.status === 403) {
        return Promise.reject(
          new Error("No tienes permisos para realizar esta acción.")
        );
      }
      if (error.response.status === 404) {
        return Promise.reject(
          new Error(
            "Recurso no encontrado. Verifica la ruta o los datos enviados."
          )
        );
      }
    } else if (!error.response) {
      console.error("Error de conexión:", {
        message: error.message,
        url: error.config?.url,
      });
      return Promise.reject(
        new Error("Error de conexión. Verifica tu conexión a internet.")
      );
    }
    const errorMessage =
      error.response?.data?.mensaje ||
      error.response?.data?.message ||
      "Error desconocido";
    const statusCode = error.response?.status || "desconocido";
    console.error("Error en la respuesta del servidor:", {
      statusCode,
      errorMessage,
      url: error.response?.config?.url,
      data: error.response?.data,
    });
    return Promise.reject(new Error(`Error ${statusCode}: ${errorMessage}`));
  }
);

/* ============================
   Exported API helper functions
   ============================ */

// Clientes
export const obtenerClientes = (config) => api.get("/clientes", config);
export const consultarClientePorCedula = (
  numeroIdentificacion,
  config
) => api.get(`/clientes/consultar/${numeroIdentificacion}`, config);
export const obtenerClientePorId = (id, config) =>
  api.get(`/clientes/${id}`, config);
export const crearCliente = (data, config) =>
  api.post("/clientes", data, config);
export const editarCliente = (id, data, config) =>
  api.put(`/clientes/${id}`, data, config);
export const eliminarCliente = (id, config) =>
  api.delete(`/clientes/${id}`, config);
export const obtenerClientesActivos = async (config = {}) => {
  try {
    const response = await api.get("/clientes/activos", config);
    return response;
  } catch (error) {
    throw error;
  }
};

// Productos
export const obtenerProductos = (config) => api.get("/productos", config);
export const obtenerProductoPorId = (id, config) =>
  api.get(`/productos/${id}`, config);
export const crearProducto = (data, config) =>
  api.post("/productos", data, config);
export const editarProducto = (id, data, config) =>
  api.put(`/productos/${id}`, data, config);
export const eliminarProducto = (id, config) =>
  api.delete(`/productos/${id}`, config);

// Membresías
export const obtenerMembresias = (config) => api.get("/membresias", config);
export const obtenerMembresiaPorId = (id, config) =>
  api.get(`/membresias/${id}`, config);
export const crearMembresia = (data, config) =>
  api.post("/membresias", data, config);
export const editarMembresia = (id, data, config) =>
  api.put(`/membresias/${id}`, data, config);
export const eliminarMembresia = (id, config) =>
  api.delete(`/membresias/${id}`, config);

// Pagos
export const obtenerPagos = (params, config) =>
  api.get("/pagos", { ...config, params });
export const consultarPagosPorCedula = (
  numeroIdentificacion,
  config
) => api.get(`/pagos/consultar/${numeroIdentificacion}`, config);
export const obtenerPagoPorId = (id, config) =>
  api.get(`/pagos/${id}`, config);
export const crearPago = (data, config) =>
  api.post("/pagos", data, config);
export const editarPago = (id, data, config) =>
  api.put(`/pagos/${id}`, data, config);
export const eliminarPago = (id, config) =>
  api.delete(`/pagos/${id}`, config);

// ✅ FUNCIONES AGREGADAS PARA LA PLANILLA DE MENSUALIDADES
export const obtenerMensualidades = (anio, config) => 
  api.get("/pagos/mensualidades", { ...config, params: { anio } });

export const crearPagoMensualidad = (data, config) => 
  api.post("/pagos/mensualidades", data, config);
// --------------------------------------------------------

// Contabilidad
export const obtenerTransacciones = (params, config) =>
  api.get("/contabilidad", { ...config, params });
export const obtenerTransaccionPorId = (id, config) =>
  api.get(`/contabilidad/${id}`, config);
export const crearTransaccion = (data, config) =>
  api.post("/contabilidad", data, config);
export const editarTransaccion = (id, data, config) =>
  api.put(`/contabilidad/${id}`, data, config);
export const eliminarTransaccion = (id, config) =>
  api.delete(`/contabilidad/${id}`, config);

// Entrenadores
export const obtenerEntrenadores = (config) =>
  api.get("/entrenadores", config);
export const obtenerEntrenadorPorId = (id, config) =>
  api.get(`/entrenadores/${id}`, config);
export const crearEntrenador = (data, config) =>
  api.post("/entrenadores", data, config);
export const editarEntrenador = (id, data, config) =>
  api.put(`/entrenadores/${id}`, data, config);
export const eliminarEntrenador = (id, config) =>
  api.delete(`/entrenadores/${id}`, config);
export const obtenerEquipos = (config) =>
  api.get("/entrenadores/equipos", config);

// Rutinas
export const obtenerRutinas = (config) => api.get("/rutinas", config);
export const crearRutina = (data, config) =>
  api.post("/rutinas", data, config);
export const editarRutina = (id, data, config) =>
  api.put(`/rutinas/${id}`, data, config);
export const asignarRutina = (data, config) =>
  api.post("/rutinas/asignar", data, config);
export const editarAsignacionRutina = (id, data, config) =>
  api.put(`/rutinas/asignar/${id}`, data, config);
export const eliminarAsignacionRutina = (id, config) =>
  api.delete(`/rutinas/asignar/${id}`, config);
export const consultarRutinaPorNumeroIdentificacion = (
  numeroIdentificacion,
  config
) =>
  api.get(
    `/rutinas/consultarRutinasPorNumeroIdentificacion/${numeroIdentificacion}`,
    config
  );

// Clases
export const obtenerClasesDisponibles = (config) =>
  api.get("/clases/disponibles", config);
export const registrarClienteEnClase = (data, config) =>
  api.post("/clases/registrar", data, config);
export const consultarClasesPorNumeroIdentificacion = (
  numeroIdentificacion,
  config
) => api.get(`/clases/consultar/${numeroIdentificacion}`, config);

// Usuarios
export const obtenerUsuarios = (config) => api.get("/users", config);
export const editarUsuario = (id, data, config) =>
  api.put(`/users/${id}`, data, config);

// Composición corporal
export const crearComposicionCorporal = (data, config) =>
  api.post("/composicion-corporal", data, config);
export const consultarComposicionPorCliente = (
  identificacion,
  config
) => api.get(`/composicion-corporal/cliente/${identificacion}`, config);

// Medición porristas
export const crearMedicionPorristas = (data, config) =>
  api.post("/medicion-porristas", data, config);
export const obtenerMedicionesPorristas = (config) =>
  api.get("/medicion-porristas", config);
export const editarMedicionPorristas = (id, data, config) =>
  api.put(`/medicion-porristas/${id}`, data, config);
export const eliminarMedicionPorristas = (id, config) =>
  api.delete(`/medicion-porristas/${id}`, config);

// Autenticación
export const login = (data) => api.post("/auth/login", data);
export const registrarse = (data) => api.post("/auth/register", data);

export default api;
