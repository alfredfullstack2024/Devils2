// src/pages/pagos/PagosLigas.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

const PagosLigas = () => {
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [nuevoMes, setNuevoMes] = useState("");
  const [valorDiario, setValorDiario] = useState(8000);
  const [pagos, setPagos] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nombre: "", equipo: "", diasAsistidos: 1 });

  const backendURL =
    process.env.REACT_APP_API_URL || "https://backendiconic.onrender.com/api";  // Cambia a tu URL de Render

  const token = localStorage.getItem("token");

  // Cargar meses al iniciar
  useEffect(() => {
    const fetchMeses = async () => {
      try {
        const res = await axios.get(`${backendURL}/pagos-ligas/meses`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setMeses(res.data);
        if (res.data.length > 0) {
          setMesSeleccionado(res.data[0].nombre);
          cargarPagos(res.data[0].nombre);
        }
      } catch (error) {
        console.error("Error al cargar meses:", error);
        alert("Error al cargar meses: " + (error.response?.data?.message || error.message));
      }
    };
    fetchMeses();
  }, [token]);

  // Cargar pagos del mes seleccionado
  const cargarPagos = async (mes) => {
    try {
      const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mes}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPagos(res.data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
      alert("Error al cargar pagos: " + (error.response?.data?.message || error.message));
    }
  };

  // Crear mes
  const crearMes = async () => {
    if (!nuevoMes.trim()) return alert("Ingresa un nombre para el mes");
    try {
      await axios.post(
        `${backendURL}/pagos-ligas/crear-mes`,
        { nombre: nuevoMes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Mes creado correctamente");
      setNuevoMes("");
      const res = await axios.get(`${backendURL}/pagos-ligas/meses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeses(res.data);
    } catch (error) {
      console.error("Error al crear mes:", error);
      alert("Error al crear mes: " + (error.response?.data?.message || error.message));
    }
  };

  // Actualizar valor diario
  const actualizarValorDiario = async () => {
    try {
      await axios.put(
        `${backendURL}/pagos-ligas/valor-diario`,
        { valor: valorDiario },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Valor diario actualizado");
    } catch (error) {
      console.error("Error al actualizar valor diario:", error);
      alert("Error al actualizar valor diario: " + (error.response?.data?.message || error.message));
    }
  };

  // Registrar pago
  const handleSubmitPago = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.equipo || form.diasAsistidos < 1) {
      return alert("Completa todos los campos");
    }
    try {
      await axios.post(
        `${backendURL}/pagos-ligas/pagos`,
        { ...form, mes: mesSeleccionado },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pago registrado");
      setForm({ nombre: "", equipo: "", diasAsistidos: 1 });
      setShowForm(false);
      cargarPagos(mesSeleccionado);
    } catch (error) {
      console.error("Error al registrar pago:", error);
      alert("Error al registrar pago: " + (error.response?.data?.message || error.message));
    }
  };

  // Eliminar pago
  const eliminarPago = async (id) => {
    if (!window.confirm("¿Eliminar este pago?")) return;
    try {
      await axios.delete(`${backendURL}/pagos-ligas/pagos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Pago eliminado");
      cargarPagos(mesSeleccionado);
    } catch (error) {
      console.error("Error al eliminar pago:", error);
      alert("Error al eliminar pago: " + (error.response?.data?.message || error.message));
    }
  };

  // Cálculos
  const totalDias = pagos.reduce((sum, p) => sum + p.diasAsistidos, 0);
  const totalRecaudado = pagos.reduce((sum, p) => sum + p.total, 0);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "2rem",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.6rem" }}>
          Control de Pagos de Ligas
        </h2>

        {/* Crear mes + selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem" }}>
          <div>
            <input
              type="text"
              placeholder="Noviembre 2025"
              value={nuevoMes}
              onChange={(e) => setNuevoMes(e.target.value)}
              style={inputStyle}
            />
            <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
          </div>
          <div>
            <label style={{ marginRight: "0.5rem" }}>Mes:</label>
            <select
              value={mesSeleccionado}
              onChange={(e) => {
                setMesSeleccionado(e.target.value);
                cargarPagos(e.target.value);
              }}
              style={selectStyle}
            >
              {meses.map((m) => (
                <option key={m._id} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Valor diario */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <label>Valor diario:</label>
          <input
            type="number"
            value={valorDiario}
            onChange={(e) => setValorDiario(Number(e.target.value))}
            style={{ ...inputStyle, width: "120px" }}
          />
          <button onClick={actualizarValorDiario} style={btnSuccess}>
            Actualizar
          </button>
        </div>

        <hr style={{ margin: "1.5rem 0" }} />

        {/* Botón registrar pago */}
        <div style={{ textAlign: "center", marginBottom: "1.5rem" }}>
          <button onClick={() => setShowForm(true)} style={btnLarge}>
            + Registrar Pago
          </button>
        </div>

        {/* Formulario de registro */}
        {showForm && (
          <div style={{ border: "1px solid #ddd", borderRadius: "0.5rem", padding: "1rem", marginBottom: "1.5rem" }}>
            <h4>Registrar Pago - {mesSeleccionado}</h4>
            <form onSubmit={handleSubmitPago} style={{ display: "grid", gap: "0.75rem" }}>
              <input
                type="text"
                placeholder="Nombre del jugador"
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                style={inputStyle}
                required
              />
              <input
                type="text"
                placeholder="Equipo"
                value={form.equipo}
                onChange={(e) => setForm({ ...form, equipo: e.target.value })}
                style={inputStyle}
                required
              />
              <input
                type="number"
                placeholder="Días asistidos"
                value={form.diasAsistidos}
                onChange={(e) => setForm({ ...form, diasAsistidos: Number(e.target.value) })}
                style={inputStyle}
                min="1"
                required
              />
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <button type="submit" style={btnSuccess}>Guardar</button>
                <button type="button" onClick={() => setShowForm(false)} style={btnDanger}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Resumen */}
        <div style={{ background: "#f9fafb", borderRadius: "1rem", padding: "1.5rem" }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>Resumen del Mes</h3>
          <p><strong>Total días pagados:</strong> {totalDias}</p>
          <p><strong>Total recaudado:</strong> ${totalRecaudado.toLocaleString("es-CO")}</p>
          <hr style={{ margin: "1rem 0" }} />
          <h4>Pagos registrados:</h4>
          {pagos.length === 0 ? (
            <p style={{ color: "#666", fontStyle: "italic" }}>No hay pagos registrados</p>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #ddd" }}>
                  <th style={thStyle}>Jugador</th>
                  <th style={thStyle}>Equipo</th>
                  <th style={thStyle}>Días</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Acción</th>
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>{pago.nombre}</td>
                    <td style={tdStyle}>{pago.equipo}</td>
                    <td style={tdStyle}>{pago.diasAsistidos}</td>
                    <td style={tdStyle}>${pago.total.toLocaleString("es-CO")}</td>
                    <td style={tdStyle}>
                      <button
                        onClick={() => eliminarPago(pago._id)}
                        style={{ ...btnDanger, fontSize: "0.8rem", padding: "0.25rem 0.5rem" }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

// Estilos
const inputStyle = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid #ccc",
  marginRight: "0.5rem",
};
const selectStyle = {
  padding: "0.5rem",
  borderRadius: "0.5rem",
  border: "1px solid #ccc",
};
const btnPrimary = {
  background: "#4f46e5",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
};
const btnSuccess = {
  background: "#22c55e",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
};
const btnDanger = {
  background: "#ef4444",
  color: "white",
  padding: "0.5rem 1rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
};
const btnLarge = {
  background: "#2563eb",
  color: "white",
  padding: "0.75rem 2rem",
  borderRadius: "0.75rem",
  border: "none",
  cursor: "pointer",
  fontSize: "1rem",
  fontWeight: "bold",
};
const thStyle = { textAlign: "left", padding: "0.5rem 0", fontWeight: "bold" };
const tdStyle = { padding: "0.5rem 0" };

export default PagosLigas;
