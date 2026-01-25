import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// --- ESTILOS REUTILIZABLES ---
const inputStyle = { padding: "0.8rem", borderRadius: "0.6rem", border: "1px solid #cbd5e1", fontSize: "1rem" };
const selectStyle = { padding: "0.8rem", borderRadius: "0.6rem", border: "1px solid #cbd5e1", fontSize: "1rem", background: "white" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "0.8rem 1.5rem", borderRadius: "0.6rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "0.8rem 2rem", borderRadius: "0.6rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1rem 0.5rem", textAlign: "center", fontWeight: "bold", borderBottom: "2px solid #e2e8f0", background: "#f1f5f9" };
const tdStyle = { padding: "0.8rem 0.5rem", textAlign: "center", borderBottom: "1px solid #f1f5f9" };

const PagosLigas = () => {
    // ESTADOS
    const [meses, setMeses] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [nuevoMes, setNuevoMes] = useState("");
    const [valorDiario, setValorDiario] = useState(8000);
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState("");
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");
    const [pagosDelMes, setPagosDelMes] = useState([]);
    
    // FILTROS
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    // CARGA INICIAL
    useEffect(() => {
        const fetchBaseData = async () => {
            try {
                const [mRes, cRes, configRes] = await Promise.all([
                    axios.get(`${backendURL}/pagos-ligas/meses`),
                    obtenerClientes(),
                    axios.get(`${backendURL}/pagos-ligas/configuracion`).catch(() => ({ data: { valorDiario: 8000 } }))
                ]);
                setMeses(mRes.data);
                setClientes(cRes.data);
                setValorDiario(configRes.data.valorDiario || 8000);
                if (mRes.data.length > 0) setMesSeleccionado(mRes.data[0].nombre);
            } catch (err) { console.error("Error inicial:", err); }
        };
        fetchBaseData();
    }, [backendURL]);

    // CARGAR PAGOS CUANDO CAMBIA EL MES
    useEffect(() => {
        if (!mesSeleccionado) return;
        const fetchPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const filtrados = res.data.filter(p => p.nombre !== "SYSTEM");
                setPagosDelMes(filtrados);
            } catch (err) { console.error("Error pagos:", err); }
        };
        fetchPagos();
    }, [mesSeleccionado, backendURL]);

    // REGISTRAR PAGO
    const handleRegistrar = async () => {
        if (!clienteSeleccionado || !diaSeleccionado) return alert("Selecciona cliente y día");
        try {
            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.toUpperCase(),
                mes: mesSeleccionado,
                diasAsistidos: 1,
                total: valorDiario,
                diasPagados: [parseInt(diaSeleccionado)],
                tipoPago: tipoPagoSeleccionado
            });
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            setPagosDelMes(res.data.filter(p => p.nombre !== "SYSTEM"));
            setSearchCliente("");
            setDiaSeleccionado("");
            alert("Pago exitoso");
        } catch (err) { alert("Error al guardar"); }
    };

    // LÓGICA DE FILTRADO Y CAJA
    const { datosFiltrados, totalCaja, totalMes } = useMemo(() => {
        let pagos = pagosDelMes.map(p => {
            const c = clientes.find(cli => `${cli.nombre} ${cli.apellido}`.toUpperCase() === p.nombre.toUpperCase());
            return { ...p, especialidad: c?.especialidad || "Sin Especialidad" };
        });

        // Total del Mes (Sin filtros de caja)
        const tMes = pagos.reduce((acc, p) => acc + (p.diasPagados.length * (p.valorDiarioUsado || valorDiario)), 0);

        // Aplicar filtros de búsqueda
        if (filtroNombre) pagos = pagos.filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
        if (filtroEspecialidad !== "TODAS") pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        if (filtroTipoPago !== "TODOS") pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);

        // Cálculo de Caja Física (Cuándo entró el dinero)
        let caja = 0;
        if (filtroPeriodo === "DIA" && filtroDia) {
            const d = parseInt(filtroDia);
            pagosDelMes.forEach(p => {
                const f = new Date(p.createdAt);
                if (f.getDate() === d) caja += (p.diasPagados.length * (p.valorDiarioUsado || valorDiario));
            });
        } else {
            caja = pagos.reduce((acc, p) => acc + (p.diasPagados.length * (p.valorDiarioUsado || valorDiario)), 0);
        }

        return { datosFiltrados: pagos, totalCaja: caja, totalMes: tMes };
    }, [pagosDelMes, clientes, filtroNombre, filtroEspecialidad, filtroTipoPago, filtroPeriodo, filtroDia, valorDiario]);

    // ESPECIALIDADES PARA EL SELECT
    const listaSpecs = ["TODAS", ...new Set(clientes.map(c => c.especialidad).filter(Boolean))];

    return (
        <div style={{ 
            padding: "20px", 
            marginLeft: "260px", // 🚨 ESTO ASEGURA QUE NO SE TAPE CON EL SIDEBAR
            minHeight: "100vh", 
            background: "#f8fafc" 
        }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                
                {/* HEADER */}
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", alignItems: "center" }}>
                    <h2>Control de Pagos Ligas</h2>
                    <div style={{ background: "#1e293b", color: "white", padding: "1rem", borderRadius: "0.5rem" }}>
                        <small>Recaudado Mes:</small>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>${totalMes.toLocaleString()}</div>
                    </div>
                </div>

                {/* REGISTRO RÁPIDO */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", flexWrap: "wrap", background: "#f0fdf4", padding: "1.5rem", borderRadius: "0.8rem", border: "1px solid #bbf7d0" }}>
                    <input 
                        style={{...inputStyle, flex: 1}} 
                        placeholder="Nombre de la niña..." 
                        list="cli-list" 
                        value={searchCliente}
                        onChange={(e) => {
                            setSearchCliente(e.target.value);
                            const found = clientes.find(c => `${c.nombre} ${c.apellido}` === e.target.value);
                            setClienteSeleccionado(found);
                        }}
                    />
                    <datalist id="cli-list">{clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}</datalist>
                    
                    <input type="number" placeholder="Día" style={{...inputStyle, width: "80px"}} value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} />
                    
                    <select style={selectStyle} value={tipoPagoSeleccionado} onChange={(e) => setTipoPagoSeleccionado(e.target.value)}>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Nequi">Nequi</option>
                    </select>

                    <button onClick={handleRegistrar} style={btnSuccess}>Registrar Pago</button>
                </div>

                {/* FILTROS Y CUADRE */}
                <div style={{ display: "flex", gap: "15px", marginBottom: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                    <input style={inputStyle} placeholder="Filtrar por nombre..." value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
                    
                    <select style={selectStyle} value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
                        {listaSpecs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>

                    <div style={{ height: "30px", width: "2px", background: "#cbd5e1" }}></div>

                    <select style={selectStyle} value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)}>
                        <option value="MES">Ver Total Acumulado</option>
                        <option value="DIA">Ver Caja por Día Físico</option>
                    </select>
                    {filtroPeriodo === "DIA" && <input type="number" placeholder="Día" style={{...inputStyle, width: "70px"}} value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} />}

                    <div style={{ marginLeft: "auto", background: "#065f46", color: "white", padding: "0.8rem 1.5rem", borderRadius: "0.5rem", fontWeight: "bold" }}>
                        Caja Actual: ${totalCaja.toLocaleString()}
                    </div>
                </div>

                {/* TABLA */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
                        <thead>
                            <tr>
                                <th style={{...thStyle, textAlign: "left", position: "sticky", left: 0, zIndex: 5}}>Jugadora</th>
                                <th style={thStyle}>Especialidad</th>
                                {[...Array(31)].map((_, i) => <th key={i} style={thStyle}>{i + 1}</th>)}
                                <th style={thStyle}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...new Set(datosFiltrados.map(p => p.nombre))].map(nom => {
                                const mPagos = datosFiltrados.filter(p => p.nombre === nom);
                                const diasDicionario = {};
                                mPagos.forEach(p => p.diasPagados.forEach(d => diasDicionario[d] = p));

                                return (
                                    <tr key={nom}>
                                        <td style={{...tdStyle, textAlign: "left", fontWeight: "bold", position: "sticky", left: 0, background: "white"}}>{nom}</td>
                                        <td style={tdStyle}>{mPagos[0]?.especialidad}</td>
                                        {[...Array(31)].map((_, i) => {
                                            const d = i + 1;
                                            const pagoInfo = diasDicionario[d];
                                            if (!pagoInfo) return <td key={i} style={tdStyle}>-</td>;

                                            const diaReal = new Date(pagoInfo.createdAt).getDate();
                                            const esAdelantado = diaReal < d;

                                            return (
                                                <td key={i} style={{...tdStyle, color: esAdelantado ? "#f97316" : "#22c55e", fontWeight: "bold"}} title={`Entró el día ${diaReal}`}>
                                                    X
                                                </td>
                                            );
                                        })}
                                        <td style={{...tdStyle, fontWeight: "bold"}}>${mPagos.reduce((a, b) => a + (b.diasPagados.length * valorDiario), 0).toLocaleString()}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default PagosLigas;
