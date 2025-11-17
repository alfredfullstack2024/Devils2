// src/pages/pagos/PagosLigas.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

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
        alert("Error al cargar meses o clientes");
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
      alert("Pago registrado correctamente");
      setSearchCliente("");
      setClienteSeleccionado(null);
      setDiasSeleccionados([]);
      cargarPagos(mesSeleccionado);
    } catch (error) {
      alert("Error al registrar pago");
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
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem", fontSize: "1.8rem", color: "#1f2937" }}>
          Control de Pagos de Ligas
        </h2>

        {/* Crear mes + selector */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginBottom: "1.5rem", alignItems: "center" }}>
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
            <label style={{ marginRight: "0.5rem", fontWeight: "bold" }}>Mes:</label>
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
          <label style={{ fontWeight: "bold" }}>Valor diario:</label>
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

        <hr style={{ margin: "2rem 0", borderColor: "#e5e7eb" }} />

        {/* BÚSQUEDA DE CLIENTE - CORREGIDA */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "bold" }}>
            Buscar cliente:
          </label>
          <input
            type="text"
            placeholder="Escribe el nombre completo del cliente..."
            value={searchCliente}
            onChange={(e) => {
              const valor = e.target.value.trim();
              setSearchCliente(valor);

              // BUSCAR COINCIDENCIA EXACTA
              const clienteEncontrado = clientes.find(
                (c) =>
                  `${c.nombre} ${c.apellido}`.toLowerCase() === valor.toLowerCase()
              );

              if (clienteEncontrado) {
                setClienteSeleccionado(clienteEncontrado);
                setDiasSeleccionados([]); // Reinicia selección de días
              } else {
                setClienteSeleccionado(null);
              }
            }}
            style={{ ...inputStyle, width: "100%", maxWidth: "500px", fontSize: "1rem" }}
            list="clientes-datalist"
          />
          <datalist id="clientes-datalist">
            {clientes.map((c) => (
              <option key={c._id} value={`${c.nombre} ${c.apellido}`} />
            ))}
          </datalist>

          {/* Confirmación visual */}
          {clienteSeleccionado && (
            <div style={{
              marginTop: "0.8rem",
              padding: "0.8rem",
              background: "#dcfce7",
              border: "1px solid #22c55e",
              borderRadius: "0.5rem",
              color: "#166534",
              fontWeight: "bold"
            }}>
              Cliente seleccionado: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
            </div>
          )}
        </div>

        {/* MATRIZ DE DÍAS - AHORA SÍ APARECE */}
        {clienteSeleccionado && (
          <div style={{
            marginBottom: "2rem",
            padding: "1.5rem",
            border: "2px solid #22c55e",
            borderRadius: "1rem",
            background: "#f8fff9"
          }}>
            <h4 style={{ margin: "0 0 1rem 0", color: "#166534" }}>
              {clienteSeleccionado.nombre} {clienteSeleccionado.apellido} - {mesSeleccionado}
            </h4>
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: "0.6rem",
              fontSize: "1rem",
              marginBottom: "1rem"
            }}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((dia) => (
                <div
                  key={dia}
                  onClick={() => toggleDia(dia)}
                  style={{
                    padding: "0.8rem",
                    textAlign: "center",
                    border: "2px solid #86efac",
                    borderRadius: "0.5rem",
                    background: diasSeleccionados.includes(dia) ? "#22c55e" : "#fff",
                    color: diasSeleccionados.includes(dia) ? "white" : "#166534",
                    cursor: "pointer",
                    fontWeight: "bold",
                    transition: "all 0.2s"
                  }}
                >
                  {dia}
                </div>
              ))}
            </div>

            <div style={{ textAlign: "center" }}>
              <button
                onClick={handleRegistrarPago}
                style={{
                  ...btnSuccess,
                  padding: "0.8rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: "bold"
                }}
              >
                Registrar Pago ({diasSeleccionados.length} días × ${valorDiario.toLocaleString()} = $
                {(diasSeleccionados.length * valorDiario).toLocaleString("es-CO")})
              </button>
            </div>
          </div>
        )}

        {/* RESUMEN */}
        <div style={{ background: "#f1f5f9", borderRadius: "1rem", padding: "1.5rem" }}>
          <h3 style={{ textAlign: "center", marginBottom: "1rem", color: "#1e293b" }}>
            Resumen del Mes
          </h3>
          <p style={{ fontSize: "1.1rem" }}>
            <strong>Total días pagados:</strong> {totalDias}
          </p>
          <p style={{ fontSize: "1.3rem", fontWeight: "bold", color: "#166534" }}>
            <strong>Total recaudado:</strong> ${totalRecaudado.toLocaleString("es-CO")}
          </p>
          <hr style={{ margin: "1.5rem 0" }} />
          <h4>Pagos registrados:</h4>
          {pagos.length === 0 ? (
            <p style={{ color: "#64748b", fontStyle: "italic", textAlign: "center" }}>
              No hay pagos registrados aún
            </p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                    <th style={thStyle}>Jugador</th>
                    <th style={thStyle}>Equipo</th>
                    <th style={thStyle}>Días</th>
                    <th style={thStyle}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pagos.map((pago) => (
                    <tr key={pago._id} style={{ borderBottom: "1px solid #cbd5e1" }}>
                      <td style={tdStyle}>{pago.nombre}</td>
                      <td style={tdStyle}>{pago.equipo}</td>
                      <td style={tdStyle}>{pago.diasAsistidos}</td>
                      <td style={{ ...tdStyle, fontWeight: "bold", color: "#166534" }}>
                        ${pago.total.toLocaleString("es-CO")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Estilos mejorados
const inputStyle = {
  padding: "0.7rem",
  borderRadius: "0.5rem",
  border: "1px solid #94a3b8",
  marginRight: "0.5rem",
  fontSize: "1rem"
};
const selectStyle = {
  padding: "0.7rem",
  borderRadius: "0.5rem",
  border: "1px solid #94a3b8",
  fontSize: "1rem"
};
const btnPrimary = {
  background: "#4f46e5",
  color: "white",
  padding: "0.7rem 1.2rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold"
};
const btnSuccess = {
  background: "#22c55e",
  color: "white",
  padding: "0.7rem 1.5rem",
  borderRadius: "0.5rem",
  border: "none",
  cursor: "pointer",
  fontWeight: "bold"
};
const thStyle = { padding: "0.8rem 0.5rem", fontWeight: "bold", fontSize: "0.95rem" };
const tdStyle = { padding: "0.8rem 0.5rem" };

export default PagosLigas;
