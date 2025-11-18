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

  // CARGAR MESES Y CLIENTES
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

  // CARGAR PAGOS Y RECALCULAR TOTAL
  useEffect(() => {
    if (!mesSeleccionado) return;

    const cargarPagos = async () => {
      try {
        const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
        const pagos = res.data || [];
        setPagosDelMes(pagos);

        // CÁLCULO CORRECTO DEL TOTAL RECAUDADO
        let total = 0;
        pagos.forEach(pago => {
          if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
            total += pago.diasPagados.length * valorDiario;
          }
        });
        setTotalRecaudado(total);
      } catch (error) {
        console.error("Error cargando pagos:", error);
        setPagosDelMes([]);
        setTotalRecaudado(0);
      }
    };
    cargarPagos();
  }, [mesSeleccionado, valorDiario]);

  // REGISTRAR PAGO
  const registrarPagoDia = async () => {
    if (!clienteSeleccionado) return alert("Selecciona una niña");
    if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31) return alert("Día inválido");
    if (!mesSeleccionado) return alert("Selecciona un mes");

    try {
      await axios.post(`${backendURL}/pagos-ligas/pagos`, {
        nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
        mes: mesSeleccionado,
        diasAsistidos: 1,
        total: valorDiario,
        diasPagados: [parseInt(diaSeleccionado)],
      });

      // RECARGAR Y RECALCULAR
      const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
      const pagos = res.data || [];
      setPagosDelMes(pagos);

      let nuevoTotal = 0;
      pagos.forEach(p => {
        if (p.diasPagados) nuevoTotal += p.diasPagados.length * valorDiario;
      });
      setTotalRecaudado(nuevoTotal);

      alert(`Día ${diaSeleccionado} registrado`);
      setSearchCliente("");
      setClienteSeleccionado(null);
      setDiaSeleccionado("");
    } catch (error) {
      console.error(error);
      alert("Error al registrar");
    }
  };

  const crearMes = async () => {
    if (!nuevoMes.trim()) return alert("Escribe el nombre");
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
      <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>
          Control de Pagos de Ligas
        </h2>

        <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
            <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
            <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
              <option value="">Seleccionar mes</option>
              {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
            </select>
            <span style={{ fontWeight: "bold" }}>Valor diario: ${valorDiario.toLocaleString()}</span>
          </div>

          {/* TOTAL RECAUDADO GRANDE */}
          <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
            TOTAL RECAUDADO: ${totalRecaudado.toLocaleString("es-CO")}
          </div>
        </div>

        <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
          <h3 style={{ margin: "0 0 1.5rem 0", color: "#166534", fontSize: "1.6rem" }}>Registrar Pago Rápido</h3>
          <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Nombre completo de la niña..."
              value={searchCliente}
              onChange={(e) => {
                setSearchCliente(e.target.value);
                const encontrada = clientes.find(c => `${c.nombre} ${c.apellido}`.toLowerCase() === e.target.value.toLowerCase().trim());
                setClienteSeleccionado(encontrada || null);
              }}
              list="clientes-list"
              style={{ ...inputStyle, width: "500px", fontSize: "1.2rem" }}
            />
            <datalist id="clientes-list">
              {clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}
            </datalist>
            <input type="number" min="1" max="31" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
            <button onClick={registrarPagoDia} style={btnSuccess}>
              Marcar Día {diaSeleccionado || "?"} como Pagado
            </button>
          </div>
        </div>

        {/* TABLA COMPLETA CON TODOS LOS DÍAS */}
        {mesSeleccionado && (
          <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
            <table style={{ width: "100%", minWidth: "2400px", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "white" }}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "250px" }}>Jugadora</th>
                  {/* TODOS LOS 31 DÍAS */}
                  {[...Array(31)].map((_, i) => (
                    <th key={i+1} style={{ ...thStyle, width: "60px" }}>{i+1}</th>
                  ))}
                  <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Días</th>
                  <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {jugadoras.length === 0 ? (
                  <tr><td colSpan="34" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>No hay pagos este mes</td></tr>
                ) : (
                  jugadoras.map(nombre => {
                    const dias = getDiasPagados(nombre);
                    const total = dias.length * valorDiario;
                    return (
                      <tr key={nombre}>
                        <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9 }}>
                          {nombre}
                        </td>
                        {/* TODOS LOS 31 DÍAS */}
                        {[...Array(31)].map((_, i) => {
                          const dia = i + 1;
                          const pagado = dias.includes(dia);
                          return (
                            <td key={dia} style={{ textAlign: "center", padding: "0.8rem 0" }}>
                              {pagado && <span style={{ color: "#22c55e", fontSize: "1.8rem", fontWeight: "bold" }}>X</span>}
                            </td>
                          );
                        })}
                        <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", fontSize: "1.3rem", color: "#0891b2" }}>
                          {dias.length}
                        </td>
                        <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", fontSize: "1.4rem", color: "#166534" }}>
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

const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

export default PagosLigas;
