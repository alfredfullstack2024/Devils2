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
  const [diaSeleccionado, setDiaSeleccionado] = useState("");
  const [pagosDelMes, setPagosDelMes] = useState([]);

  const backendURL =
    process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";
  const token = localStorage.getItem("token");

  // Cargar meses y clientes (solo una vez)
  useEffect(() => {
    const cargarInicial = async () => {
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
        }
      } catch (error) {
        console.error("Error cargando datos iniciales", error);
      }
    };
    cargarInicial();
  }, [token]);

  // Cargar pagos cuando cambie el mes seleccionado
  useEffect(() => {
    if (!mesSeleccionado) return;

    const cargarPagos = async () => {
      try {
        const res = await axios.get(
          `${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setPagosDelMes(res.data || []);
      } catch (error) {
        console.error("Error cargando pagos", error);
        setPagosDelMes([]);
      }
    };

    cargarPagos();
  }, [mesSeleccionado, token]);

  // Crear mes
  const crearMes = async () => {
    if (!nuevoMes.trim()) return alert("Ingresa nombre del mes");
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
      alert("Error");
    }
  };

  // Registrar pago del día
  const registrarPagoDia = async () => {
    if (!clienteSeleccionado) return alert("Selecciona un cliente");
    if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31)
      return alert("Ingresa un día válido (1-31)");

    try {
      await axios.post(
        `${backendURL}/pagos-ligas/pagos`,
        {
          nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
          equipo: "Ligas",
          mes: mesSeleccionado,
          diasAsistidos: 1,
          total: valorDiario,
          diasPagados: [parseInt(diaSeleccionado)],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Día ${diaSeleccionado} marcado como pagado`);
      setSearchCliente("");
      setClienteSeleccionado(null);
      setDiaSeleccionado("");

      // Recargar pagos
      const res = await axios.get(
        `${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPagosDelMes(res.data || []);
    } catch (error) {
      console.error(error);
      alert("Error al registrar pago");
    }
  };

  // Obtener días pagados por jugador
  const getDiasPagados = (nombreCompleto) => {
    const pagos = pagosDelMes.filter(
      (p) => p.nombre.toLowerCase() === nombreCompleto.toLowerCase()
    );
    const dias = new Set();
    pagos.forEach((p) => {
      (p.diasPagados || []).forEach((d) => dias.add(d));
    });
    return Array.from(dias).sort((a, b) => a - b);
  };

  const totalRecaudado = pagosDelMes.reduce((sum, p) => sum + p.total, 0);

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", background: "white", borderRadius: "1rem", padding: "2rem", boxShadow: "0 10px 25px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ textAlign: "center", fontSize: "2rem", marginBottom: "2rem", color: "#1e293b" }}>
          Control de Pagos de Ligas
        </h2>

        {/* Controles superiores */}
        <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap", alignItems: "center" }}>
          <div>
            <input type="text" placeholder="Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
            <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
          </div>
          <div>
            <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Mes:</label>
            <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
              <option value="">Seleccione...</option>
              {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
            </select>
          </div>
          <div>
            <label style={{ fontWeight: "bold", marginRight: "0.5rem" }}>Valor diario:</label>
            <input type="number" value={valorDiario} onChange={(e) => setValorDiario(Number(e.target.value))} style={{ ...inputStyle, width: "100px" }} />
            <button onClick={actualizarValorDiario} style={btnSuccess}>Actualizar</button>
          </div>
        </div>

        {/* Registrar Pago Rápido */}
        <div style={{ background: "#f0fdf4", padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem", border: "2px solid #22c55e" }}>
          <h4 style={{ margin: "0 0 1rem 0" }}>Registrar Pago Rápido</h4>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Nombre completo del cliente..."
              value={searchCliente}
              onChange={(e) => {
                const valor = e.target.value;
                setSearchCliente(valor);
                const encontrado = clientes.find(c => 
                  `${c.nombre} ${c.apellido}`.toLowerCase() === valor.toLowerCase().trim()
                );
                setClienteSeleccionado(encontrado || null);
              }}
              list="clientes-list"
              style={{ ...inputStyle, width: "350px" }}
            />
            <datalist id="clientes-list">
              {clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}
            </datalist>

            <input
              type="number"
              min="1"
              max="31"
              placeholder="Día"
              value={diaSeleccionado}
              onChange={(e) => setDiaSeleccionado(e.target.value)}
              style={{ ...inputStyle, width: "80px" }}
            />

            <button onClick={registrarPagoDia} style={{ ...btnSuccess, padding: "0.8rem 1.5rem", fontSize: "1rem" }}>
              Marcar Día {diaSeleccionado || "?"} como Pagado
            </button>
          </div>
          {clienteSeleccionado && (
            <p style={{ margin: "0.5rem 0 0 0", color: "#166534", fontWeight: "bold" }}>
              Cliente: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
            </p>
          )}
        </div>

        {/* Tabla visual */}
        {mesSeleccionado && (
          <div style={{ overflowX: "auto", border: "2px solid #e2e8f0", borderRadius: "1rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "white" }}>
                  <th style={thStyle}>Jugador</th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i + 1} style={{ ...thStyle, width: "35px", padding: "0.8rem 0.4rem" }}>{i + 1}</th>
                  ))}
                  <th style={thStyle}>Días pagados</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pagosDelMes.length === 0 ? (
                  <tr>
                    <td colSpan="34" style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontStyle: "italic" }}>
                      No hay pagos registrados este mes
                    </td>
                  </tr>
                ) : (
                  (() => {
                    const jugadoresUnicos = [...new Set(pagosDelMes.map(p => p.nombre))];
                    return jugadoresUnicos.map(nombre => {
                      const diasPagados = getDiasPagados(nombre);
                      const total = diasPagados.length * valorDiario;
                      return (
                        <tr key={nombre} style={{ borderBottom: "1px solid #e2e8f0" }}>
                          <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc" }}>{nombre}</td>
                          {Array.from({ length: 31 }, (_, i) => {
                            const dia = i + 1;
                            const pagado = diasPagados.includes(dia);
                            return (
                              <td key={dia} style={{ textAlign: "center", padding: "0.6rem 0.4rem" }}>
                                {pagado ? <strong style={{ color: "#22c55e", fontSize: "1.4rem" }}>X</strong> : ""}
                              </td>
                            );
                          })}
                          <td style={{ ...tdStyle, fontWeight: "bold", background: "#ecfeff" }}>{diasPagados.length}</td>
                          <td style={{ ...tdStyle, fontWeight: "bold", background: "#ecfeff", color: "#166534" }}>
                            ${total.toLocaleString("es-CO")}
                          </td>
                        </tr>
                      );
                    });
                  })()
                )}
                <tr style={{ background: "#172554", color: "white", fontWeight: "bold" }}>
                  <td style={{ ...tdStyle, textAlign: "right" }}>TOTAL LIGAS MES</td>
                  <td colSpan="31"></td>
                  <td style={tdStyle}></td>
                  <td style={{ ...tdStyle, fontSize: "1.4rem", textAlign: "center" }}>
                    ${totalRecaudado.toLocaleString("es-CO")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = { padding: "0.7rem", borderRadius: "0.5rem", border: "1px solid #94a3b8", fontSize: "1rem" };
const selectStyle = { padding: "0.7rem", borderRadius: "0.5rem", border: "1px solid #94a3b8", fontSize: "1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "0.7rem 1.2rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "0.7rem 1.5rem", borderRadius: "0.5rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "0.8rem 0.5rem", textAlign: "center" };

export default PagosLigas;
