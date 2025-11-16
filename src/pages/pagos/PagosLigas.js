// src/pages/pagos/PagosLigas.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios"; // Reutilizamos la API

const PagosLigas = () => {
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [nuevoMes, setNuevoMes] = useState("");
  const [valorDiario, setValorDiario] = useState(8000);
  const [clientes, setClientes] = useState([]);
  const [searchCliente, setSearchCliente] = useState("");
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [diasSeleccionados, setDiasSeleccionados] = useState([]);
  const [pagos, setPagos] = useState([]);

  const backendURL =
    process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";
  const token = localStorage.getItem("token");

  // Cargar meses y clientes
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [mesesRes, clientesRes] = await Promise.all([
          axios.get(`${backendURL}/pagos-ligas/meses`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          obtenerClientes(),
        ]);
        setMeses(mesesRes.data);
        setClientes(clientesRes.data);
        if (mesesRes.data.length > 0) {
          setMesSeleccionado(mesesRes.data[0].nombre);
          cargarPagos(mesesRes.data[0].nombre);
        }
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };
    fetchData();
  }, [token]);

  // Cargar pagos del mes
  const cargarPagos = async (mes) => {
    try {
      const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mes}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPagos(res.data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
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
      alert("Mes creado");
      setNuevoMes("");
      const res = await axios.get(`${backendURL}/pagos-ligas/meses`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMeses(res.data);
    } catch (error) {
      alert("Error al crear mes");
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
      alert("Error al actualizar valor diario");
    }
  };

  // Toggle día
  const toggleDia = (dia) => {
    setDiasSeleccionados((prev) =>
      prev.includes(dia) ? prev.filter((d) => d !== dia) : [...prev, dia]
    );
  };

  // Registrar pago
  const handleRegistrarPago = async () => {
    if (!clienteSeleccionado) return alert("Selecciona un cliente");
    if (diasSeleccionados.length === 0) return alert("Selecciona al menos un día");

    const total = diasSeleccionados.length * valorDiario;

    try {
      await axios.post(
        `${backendURL}/pagos-ligas/pagos`,
        {
          nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
          equipo: clienteSeleccionado.equipo || "Ligas",
          mes: mesSeleccionado,
          diasAsistidos: diasSeleccionados.length,
          total,
          valorDiarioUsado: valorDiario,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert("Pago registrado");
      setSearchCliente("");
      setClienteSeleccionado(null);
      setDiasSeleccionados([]);
      cargarPagos(mesSeleccionado);
    } catch (error) {
      alert("Error al registrar pago");
    }
  };

  // Filtrar clientes
  const clientesFiltrados = clientes.filter((c) =>
    `${c.nombre} ${c.apellido}`.toLowerCase().includes(searchCliente.toLowerCase())
  );

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
          maxWidth: "1100px",
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
                <option key={m._id} value={m.nombre}>{m.nombre}</option>
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

        {/* Búsqueda de cliente */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label>Buscar cliente:</label>
          <input
            type="text"
            placeholder="Escribe nombre o apellido..."
            value={searchCliente}
            onChange={(e) => {
              setSearchCliente(e.target.value);
              setClienteSeleccionado(null);
              setDiasSeleccionados([]);
            }}
            style={inputStyle}
            list="clientes-datalist"
          />
          <datalist id="clientes-datalist">
            {clientesFiltrados.map((c) => (
              <option
                key={c._id}
                value={`${c.nombre} ${c.apellido}`}
              />
            ))}
          </datalist>
        </div>

        {/* Matriz de días */}
        {clienteSeleccionado && (
          <div style={{ marginBottom: "1.5rem", padding: "1rem", border: "1px solid #ddd", borderRadius: "0.5rem" }}>
            <h4>
              {clienteSeleccionado.nombre} {clienteSeleccionado.apellido} - {mesSeleccionado}
            </h4>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "0.5rem", fontSize: "0.9rem" }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                <div
                  key={dia}
                  onClick={() => toggleDia(dia)}
                  style={{
                    padding: "0.5rem",
                    textAlign: "center",
                    border: "1px solid #ccc",
                    borderRadius: "0.25rem",
                    background: diasSeleccionados.includes(dia) ? "#22c55e" : "#fff",
                    color: diasSeleccionados.includes(dia) ? "white" : "black",
                    cursor: "pointer",
                  }}
                >
                  {dia}
                </div>
              ))}
            </div>
            <div style={{ marginTop: "1rem", textAlign: "center" }}>
              <button onClick={handleRegistrarPago} style={btnSuccess}>
                Registrar Pago ({diasSeleccionados.length} días × ${valorDiario} = $
                {diasSeleccionados.length * valorDiario})
              </button>
            </div>
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
                </tr>
              </thead>
              <tbody>
                {pagos.map((pago) => (
                  <tr key={pago._id} style={{ borderBottom: "1px solid #eee" }}>
                    <td style={tdStyle}>{pago.nombre}</td>
                    <td style={tdStyle}>{pago.equipo}</td>
                    <td style={tdStyle}>{pago.diasAsistidos}</td>
                    <td style={tdStyle}>${pago.total.toLocaleString("es-CO")}</td>
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
const thStyle = { textAlign: "left", padding: "0.5rem 0", fontWeight: "bold" };
const tdStyle = { padding: "0.5rem 0" };

export default PagosLigas;
