import axios from "axios";

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const defaultDevUrl = "http://localhost:5000/api";
  const defaultProdUrl = "https://devils2.onrender.com/api";
  return envUrl || (process.env.NODE_ENV === "development" ? defaultDevUrl : defaultProdUrl);
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

/* --- Funciones Exportadas --- */
export const obtenerClientes = (config) => api.get("/clientes", config);
export const consultarClientePorCedula = (n, config) => api.get(`/clientes/consultar/${n}`, config);
export const obtenerClientePorId = (id, config) => api.get(`/clientes/${id}`, config);
export const crearCliente = (data, config) => api.post("/clientes", data, config);
export const editarCliente = (id, data, config) => api.put(`/clientes/${id}`, data, config);
export const eliminarCliente = (id, config) => api.delete(`/clientes/${id}`, config);
export const obtenerClientesActivos = (config) => api.get("/clientes/activos", config);

export const obtenerProductos = (config) => api.get("/productos", config);
export const obtenerProductoPorId = (id, config) => api.get(`/productos/${id}`, config);
export const crearProducto = (data, config) => api.post("/productos", data, config);
export const editarProducto = (id, data, config) => api.put(`/productos/${id}`, data, config);
export const eliminarProducto = (id, config) => api.delete(`/productos/${id}`, config);

export const obtenerMembresias = (config) => api.get("/membresias", config);
export const obtenerMembresiaPorId = (id, config) => api.get(`/membresias/${id}`, config);
export const crearMembresia = (data, config) => api.post("/membresias", data, config);
export const editarMembresia = (id, data, config) => api.put(`/membresias/${id}`, data, config);
export const eliminarMembresia = (id, config) => api.delete(`/membresias/${id}`, config);

export const obtenerPagos = (params, config) => api.get("/pagos", { ...config, params });
export const consultarPagosPorCedula = (n, config) => api.get(`/pagos/consultar/${n}`, config);
export const obtenerPagoPorId = (id, config) => api.get(`/pagos/${id}`, config);
export const crearPago = (data, config) => api.post("/pagos", data, config);
export const editarPago = (id, data, config) => api.put(`/pagos/${id}`, data, config);
export const eliminarPago = (id, config) => api.delete(`/pagos/${id}`, config);

// --- PLANILLA ---
export const obtenerMensualidades = (anio, config) => api.get("/pagos/mensualidades", { params: { anio }, ...config });
export const crearPagoMensualidad = (data, config) => api.post("/pagos/mensualidades", data, config);

export const obtenerTransacciones = (params, config) => api.get("/contabilidad", { ...config, params });
export const obtenerTransaccionPorId = (id, config) => api.get(`/contabilidad/${id}`, config);
export const crearTransaccion = (data, config) => api.post("/contabilidad", data, config);
export const editarTransaccion = (id, data, config) => api.put(`/contabilidad/${id}`, data, config);
export const eliminarTransaccion = (id, config) => api.delete(`/contabilidad/${id}`, config);

export const obtenerEntrenadores = (config) => api.get("/entrenadores", config);
export const obtenerEntrenadorPorId = (id, config) => api.get(`/entrenadores/${id}`, config);
export const crearEntrenador = (data, config) => api.post("/entrenadores", data, config);
export const editarEntrenador = (id, data, config) => api.put(`/entrenadores/${id}`, data, config);
export const eliminarEntrenador = (id, config) => api.delete(`/entrenadores/${id}`, config);
export const obtenerEquipos = (config) => api.get("/entrenadores/equipos", config);

export const obtenerRutinas = (config) => api.get("/rutinas", config);
export const crearRutina = (data, config) => api.post("/rutinas", data, config);
export const editarRutina = (id, data, config) => api.put(`/rutinas/${id}`, data, config);
export const asignarRutina = (data, config) => api.post("/rutinas/asignar", data, config);
export const editarAsignacionRutina = (id, data, config) => api.put(`/rutinas/asignar/${id}`, data, config);
export const eliminarAsignacionRutina = (id, config) => api.delete(`/rutinas/asignar/${id}`, config);
export const consultarRutinaPorNumeroIdentificacion = (n, config) => api.get(`/rutinas/consultarRutinasPorNumeroIdentificacion/${n}`, config);

export const obtenerClasesDisponibles = (config) => api.get("/clases/disponibles", config);
export const registrarClienteEnClase = (data, config) => api.post("/clases/registrar", data, config);
export const consultarClasesPorNumeroIdentificacion = (n, config) => api.get(`/clases/consultar/${n}`, config);

export const obtenerUsuarios = (config) => api.get("/users", config);
export const editarUsuario = (id, data, config) => api.put(`/users/${id}`, data, config);

export const crearComposicionCorporal = (data, config) => api.post("/composicion-corporal", data, config);
export const consultarComposicionPorCliente = (id, config) => api.get(`/composicion-corporal/cliente/${id}`, config);

export const crearMedicionPorristas = (data, config) => api.post("/medicion-porristas", data, config);
export const obtenerMedicionesPorristas = (config) => api.get("/medicion-porristas", config);
export const editarMedicionPorristas = (id, data, config) => api.put(`/medicion-porristas/${id}`, data, config);
export const eliminarMedicionPorristas = (id, config) => api.delete(`/medicion-porristas/${id}`, config);

export const login = (data) => api.post("/auth/login", data);
export const registrarse = (data) => api.post("/auth/register", data);

export default api;



