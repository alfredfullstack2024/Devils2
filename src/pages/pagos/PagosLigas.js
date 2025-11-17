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

  // Cargar meses y clientes
  useEffect(() => {
    const cargarInicial = async () => {
      try {
        const [mesesRes, clientesRes] = await Promise.all([
          axios.get(`${backendURL}/pagos-ligas/meses`, { headers: { Authorization: `Bearer ${token}` } }),
          obtenerClientes(),
        ]);
        setMeses(mesesRes.data);
        setClientes(clientesRes.data);
        if (mesesRes.data.length > 0) {
          setMesSeleccionado(mesesRes.data[0].nombre);
        }
      } catch (error) {
        console.error(error);
      }
    };
    cargarInicial();
  }, [token]);

  // Cargar pagos cuando cambie el mes
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
        setPagosDelMes([]);
      }
    };
    cargarPagos();
  }, [mesSeleccionado, token]);

  // Crear mes
  const crearMes = async () => {
    if (!nuevoMes.trim()) return alert("Ingresa nombre del mes");
    try {
      await axios.post(`${backendURL}/pagos-ligas/crear-mes`, { nombre: nuevoMes }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Mes creado");
      setNuevoMes("");
      const res = await axios.get(`${backendURL}/pagos-ligas/meses`, { headers: { Authorization: `Bearer ${token}` } });
      setMeses(res.data);
    } catch (error) {
      alert("Error");
    }
  };

  // Actualizar valor diario
  const actualizarValorDiario = async () => {
    try {
      await axios.put(`${backendURL}/pagos-ligas/valor-diario`, { valor: valorDiario }, { headers: { Authorization: `Bearer ${token}` } });
      alert("Valor diario actualizado");
    } catch (error) {
      alert("Error");
    }
  };

  // Registrar pago
  const registrarPagoDia = async () => {
    if (!clienteSeleccionado) return alert("Selecciona una niña");
    if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31)
      return alert("Día inválido (1-31)");

    try {
      await axios.post(
        `${backendURL}/pagos-ligas/pagos`,
        {
          nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
          equipo: "Ligas",
          mes: mesSeleccionado,
          diasAsistidos: 1,
          total: valorDiario,
          diasPagados: [parseInt(diaSeleccionado)],
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert(`Día ${diaSeleccionado} marcado para ${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`);
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
      alert("Error al registrar");
    }
  };

  // Obtener días pagados por jugadora
  const getDiasPagados = (nombreCompleto) => {
    const pagos = pagosDelMes.filter(p => p.nombre.trim() === nombreCompleto.trim());
    const dias = new Set();
    pagos.forEach(p => (p.diasPagados || []).forEach(d => dias.add(d)));
    return Array.from(dias).sort((a, b) => a - b);
  };

  // Total recaudado
  const totalRecaudado = pagosDelMes.reduce((sum, p) => sum + p.total, 0);

  // Jugadoras únicas
  const jugadorasUnicas = [...new Set(pagosDelMes.map(p => p.nombre.trim()))];

  return (
    <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: "1500px", margin: "0 auto", background: "white", borderRadius: "1rem", padding: "2rem", boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}>
        
        <h2 style={{ textAlign: "center", fontSize: "2.2rem", marginBottom: "1.5rem", color: "#1e293b" }}>
          Control de Pagos de Ligas
        </h2>

        {/* CONTROLES + TOTAL ARRIBA */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", alignItems: "center", marginBottom: "2rem", justifyContent: "space-between" }}>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input type="text" placeholder="Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
            <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
            
            <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
              <option value="">Seleccione mes</option>
              {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
            </select>

            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ fontWeight: "bold" }}>Valor diario:</span>
              <input type="number" value={valorDiario} onChange={(e) => setValorDiario(Number(e.target.value))} style={{ ...inputStyle, width: "100px" }} />
              <button onClick={actualizarValorDiario} style={btnSuccess}>Actualizar</button>
            </div>
          </div>

          {/* TOTAL RECAUDADO ARRIBA */}
          <div style={{ background: "#172554", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.4rem", fontWeight: "bold" }}>
            TOTAL RECAUDADO: ${totalRecaudado.toLocaleString("es-CO")}
          </div>
        </div>

        {/* REGISTRAR PAGO RÁPIDO */}
        <div style={{ background: "#f0fdf4", padding: "1.5rem", borderRadius: "1rem", marginBottom: "2rem", border: "3px solid #22c55e" }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#166534" }}>Registrar Pago Rápido</h3>
          <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
            <input
              type="text"
              placeholder="Nombre completo de la niña..."
              value={searchCliente}
              onChange={(e) => {
                const val = e.target.value;
                setSearchCliente(val);
                const encontrada = clientes.find(c => 
                  `${c.nombre} ${c.apellido}`.toLowerCase() === val.toLowerCase().trim()
                );
                setClienteSeleccionado(encontrada || null);
              }}
              list="clientes-list"
              style={{ ...inputStyle, width: "380px", fontSize: "1.1rem" }}
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

            <button onClick={registrarPagoDia} style={{ ...btnSuccess, padding: "0.9rem 1.8rem", fontSize: "1.1rem" }}>
              Marcar Día {diaSeleccionado || "?"} como Pagado
            </button>
          </div>
          {clienteSeleccionado && (
            <p style={{ marginTop: "0.8rem", fontSize: "1.1rem", color: "#166534", fontWeight: "bold" }}>
              Niña seleccionada: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
            </p>
          )}
        </div>

        {/* TABLA CON X VISIBLES */}
        {mesSeleccionado && (
          <div style={{ overflowX: "auto", borderRadius: "1rem", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.95rem" }}>
              <thead>
                <tr style={{ background: "#1e293b", color: "white" }}>
                  <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10 }}>Jugadora</th>
                  {Array.from({ length: 31 }, (_, i) => (
                    <th key={i+1} style={{ ...thStyle, minWidth: "40px" }}>{i+1}</th>
                  ))}
                  <th style={thStyle}>Días pagados</th>
                  <th style={thStyle}>Total</th>
                </tr>
              </thead>
              <tbody>
                {jugadorasUnicas.length === 0 ? (
                  <tr>
                    <td colSpan="34" style={{ textAlign: "center", padding: "3rem", color: "#64748b", fontStyle: "italic" }}>
                      No hay pagos registrados este mes
                    </td>
                  </tr>
                ) : (
                  jugadorasUnicas.map(nombre => {
                    const diasPagados = getDiasPagados(nombre);
                    const total = diasPagados.length * valorDiario;
                    return (
                      <tr key={nombre} style={{ borderBottom: "1px solid #e2e8f0" }}>
                        <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9 }}>
                          {nombre}
                        </td>
                        {Array.from({ length: 31 }, (_, i) => {
                          const dia = i + 1;
                          const pagado = diasPagados.includes(dia);
                          return (
                            <td key={dia} style={{ textAlign: "center", padding: "0.8rem 0.4rem" }}>
                              {pagado && <span style={{ color: "#22c55e", fontSize: "1.8rem", fontWeight: "bold" }}>X</span>}
                            </td>
                          );
                        })}
                        <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", fontSize: "1.1rem" }}>
                          {diasPagados.length}
                        </td>
                        <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", color: "#166534", fontSize: "1.2rem" }}>
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

const inputStyle = { padding: "0.8rem", borderRadius: "0.6rem", border: "1px solid #94a3b8", fontSize: "1rem" };
const selectStyle = { padding: "0.8rem", borderRadius: "0.6rem", border: "1px solid #94a3b8", fontSize: "1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "0.8rem 1.5rem", borderRadius: "0.6rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "0.9rem 1.8rem", borderRadius: "0.6rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "0.8rem 0.5rem", textAlign: "center" };

export default PagosLigas;
