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
  const [totalRecaudado, setTotalRecaudado] = useState(0);

  const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

  // Cargar meses y clientes
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [mesesRes, clientesRes] = await Promise.all([
          axios.get(`${backendURL}/pagos-ligas/meses`),
          obtenerClientes(),
        ]);
        setMeses(mesesRes.data);
        setClientes(clientesRes.data);
        if (mesesRes.data.length > 0) {
          setMesSeleccionado(mesesRes.data[0].nombre);
        }
      } catch (error) {
        console.error("Error inicial", error);
      }
    };
    cargarInicial();
  }, []);

  // Cargar pagos cuando cambie el mes
  useEffect(() => {
    if (!mesSeleccionado) return;

    const cargarPagos = async () => {
      try {
        const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
        const pagos = res.data || [];
        setPagosDelMes(pagos);

        // TOTAL RECAUDADO CORRECTO
        const total = pagos.reduce((sum, p) => sum + (p.total || 0), 0);
        setTotalRecaudado(total);
      } catch (error) {
        setPagosDelMes([]);
        setTotalRecaudado(0);
      }
    };
    cargarPagos();
  }, [mesSeleccionado]);

  // REGISTRAR PAGO
  const registrarPagoDia = async () => {
    if (!clienteSeleccionado) return alert("Selecciona una niña");
    if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31)
      return alert("Día inválido (1-31)");
    if (!mesSeleccionado) return alert("Selecciona un mes");

    try {
      await axios.post(`${backendURL}/pagos-ligas/pagos`, {
        nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
        mes: mesSeleccionado,
        diasAsistidos: 1,
        total: valorDiario,
        diasPagados: [parseInt(diaSeleccionado)],
      });

      // Recargar pagos para actualizar todo
      const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
      const pagos = res.data || [];
      setPagosDelMes(pagos);
      const total = pagos.reduce((sum, p) => sum + (p.total || 0), 0);
      setTotalRecaudado(total);

      alert(`Día ${diaSeleccionado} registrado`);
      setSearchCliente("");
      setClienteSeleccionado(null);
      setDiaSeleccionado("");
    } catch (error) {
      alert("Error al registrar pago");
    }
  };

  const crearMes = async () => {
    if (!nuevoMes.trim()) return alert("Escribe el nombre del mes");
    try {
      await axios.post(`${backendURL}/pagos-ligas/crear-mes`, { nombre: nuevoMes });
      alert("Mes creado");
      setNuevoMes("");
      const res = await axios.get(`${backendURL}/pagos-ligas/meses`);
      setMeses(res.data);
    } catch (error) {
      alert("Error al crear mes");
    }
  };

  const getDiasPagados = (nombre) => {
    const pagos = pagosDelMes.filter(p => p.nombre.trim() === nombre.trim());
    const dias = new Set();
    pagos.forEach(p => (p.diasPagados || []).forEach(d => dias.add(d)));
    return Array.from(dias).sort((a, b) => a - b);
  };

  const jugadoras = [...new Set(pagosDelMes.map(p => p.nombre.trim()))];

  return (
    <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "1950px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>
          Control de Pagos de Ligas
        </h2>

        {/* CONTROLES + TOTAL */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
            <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
            <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
              <option value="">Seleccionar mes</option>
              {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
            </select>
            <span style={{ fontWeight: "bold" }}>Valor diario: ${valorDiario.toLocaleString()}</span>
          </div>

          <div style={{ background: "#172554", color: "white", padding: "1.2rem 3rem", borderRadius: "1.5rem", fontSize: "2rem", fontWeight: "bold" }}>
            TOTAL RECAUDADO: ${totalRecaudado.toLocaleString("es-CO")}
          </div>
        </div>

        {/* REGISTRAR PAGO */}
        <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#166534" }}>Registrar Pago Rápido</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Nombre completo de la niña..."
              value={searchCliente}
              onChange={(e) => {
                const val = e.target.value;
                setSearchCliente(val);
                const encontrada = clientes.find(c => `${c.nombre} ${c.apellido}`.toLowerCase() === val.toLowerCase().trim());
                setClienteSeleccionado(encontrada || null);
              }}
              list="clientes-list"
              style={{ ...inputStyle, width: "420px" }}
            />
            <datalist id="clientes-list">
              {clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}
            </datalist>
            <input type="number" min="1" max="31" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{ ...inputStyle, width: "90px" }} />
            <button onClick={registrarPagoDia} style={btnSuccess}>
              Marcar Día {diaSeleccionado || "?"} como Pagado
            </button>
          </div>
          {clienteSeleccionado && (
            <p style={{ marginTop: "1rem", color: "#166534", fontWeight: "bold" }}>
              Seleccionada: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
            </p>
          )}
        </div>

        {/* TABLA ANCHA Y ELEGANTE */}
        {mesSeleccionado && (
          <div style={{ overflowX: "auto", borderRadius: "1rem", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
            <table style={{ width: "100%", minWidth: "1800px", borderCollapse: "collapse", fontSize: "1rem" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "white" }}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "200px" }}>Jugadora</th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i+1} style={{ ...thStyle, width: "50px" }}>{i+1}</th>
                  ))}
                  <th style={{ ...thStyle, background: "#172554", width: "90px" }}>Días</th>
                  <th style={{ ...thStyle, background: "#172554", width: "140px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {jugadoras.length === 0 ? (
                  <tr><td colSpan="34" style={{ textAlign: "center", padding: "3rem", color: "#64748b" }}>No hay pagos este mes</td></tr>
                ) : (
                  jugadoras.map(nombre => {
                    const dias = getDiasPagados(nombre);
                    const total = dias.length * valorDiario;
                    return (
                      <tr key={nombre} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9 }}>
                          {nombre}
                        </td>
                        {Array.from({ length: 31 }, (_, i) => {
                          const dia = i + 1;
                          const pagado = dias.includes(dia);
                          return (
                            <td key={dia} style={{ textAlign: "center", padding: "0.8rem 0" }}>
                              {pagado && <span style={{ color: "#22c55e", fontSize: "1.6rem", fontWeight: "bold" }}>X</span>}
                            </td>
                          );
                        })}
                        <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", fontSize: "1.2rem", color: "#0891b2" }}>
                          {dias.length}
                        </td>
                        <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", fontSize: "1.3rem", color: "#166534" }}>
                          ${total.toLocaleString("es-CO")}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const inputStyle = { padding: "0.9rem", borderRadius: "0.8rem", border: "2px solid #94a3b8" };
const selectStyle = { padding: "0.9rem", borderRadius: "0.8rem", border: "2px solid #94a3b8" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "0.9rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 2.5rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1rem 0.4rem", textAlign: "center", fontWeight: "bold", fontSize: "1rem" };
const tdStyle = { padding: "0.9rem 0.4rem", textAlign: "center" };

export default PagosLigas;
