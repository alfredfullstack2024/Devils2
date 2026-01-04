import axios from "axios";

const getBaseUrl = () => {
  const envUrl = process.env.REACT_APP_API_URL;
  const defaultDevUrl = "http://localhost:5000/api";
  const defaultProdUrl = "https://backend-5zxh.onrender.com/api";
  return envUrl || (process.env.NODE_ENV === "development" ? defaultDevUrl : defaultProdUrl);
};

const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 15000,
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

/* --- Clientes --- */
export const obtenerClientes = (config) => api.get("/clientes", config);
export const consultarClientePorCedula = (id, config) => api.get(`/clientes/consultar/${id}`, config);
export const obtenerClientePorId = (id, config) => api.get(`/clientes/${id}`, config);
export const crearCliente = (data, config) => api.post("/clientes", data, config);
export const editarCliente = (id, data, config) => api.put(`/clientes/${id}`, data, config);
export const eliminarCliente = (id, config) => api.delete(`/clientes/${id}`, config);
export const obtenerClientesActivos = (config) => api.get("/clientes/activos", config);

/* --- Productos --- */
export const obtenerProductos = (config) => api.get("/productos", config);
export const obtenerProductoPorId = (id, config) => api.get(`/productos/${id}`, config);
export const crearProducto = (data, config) => api.post("/productos", data, config);
export const editarProducto = (id, data, config) => api.put(`/productos/${id}`, data, config);
export const eliminarProducto = (id, config) => api.delete(`/productos/${id}`, config);

/* --- Membresías --- */
export const obtenerMembresias = (config) => api.get("/membresias", config);
export const obtenerMembresiaPorId = (id, config) => api.get(`/membresias/${id}`, config);
export const crearMembresia = (data, config) => api.post("/membresias", data, config);
export const editarMembresia = (id, data, config) => api.put(`/membresias/${id}`, data, config);
export const eliminarMembresia = (id, config) => api.delete(`/membresias/${id}`, config);

/* --- Pagos y Mensualidades --- */
export const obtenerPagos = (params, config) => api.get("/pagos", { ...config, params });
export const consultarPagosPorCedula = (id, config) => api.get(`/pagos/consultar/${id}`, config);
export const obtenerPagoPorId = (id, config) => api.get(`/pagos/${id}`, config);
export const crearPago = (data, config) => api.post("/pagos", data, config);
export const editarPago = (id, data, config) => api.put(`/pagos/${id}`, data, config);
export const eliminarPago = (id, config) => api.delete(`/pagos/${id}`, config);
export const obtenerMensualidades = (anio, config) => api.get("/pagos/mensualidades", { params: { anio }, ...config });
export const crearPagoMensualidad = (data, config) => api.post("/pagos/mensualidades", data, config);

/* --- Otros --- */
export const obtenerTransacciones = (params, config) => api.get("/contabilidad", { ...config, params });
export const obtenerEntrenadores = (config) => api.get("/entrenadores", config);
export const obtenerEquipos = (config) => api.get("/entrenadores/equipos", config);
export const obtenerRutinas = (config) => api.get("/rutinas", config);
export const login = (data) => api.post("/auth/login", data);
export const registrarse = (data) => api.post("/auth/register", data);

export default api;
