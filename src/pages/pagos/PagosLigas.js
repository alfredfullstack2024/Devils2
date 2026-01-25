import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// --- ESTILOS ---
const estiloEntrada = { padding: "0.8rem", borderRadius: "0.6rem", border: "1px solid #cbd5e1", fontSize: "1rem" };
const estiloSelect = { padding: "0.8rem", borderRadius: "0.6rem", border: "1px solid #cbd5e1", fontSize: "1rem", background: "white" };
const btnExito = { background: "#22c55e", color: "white", padding: "0.8rem 2rem", borderRadius: "0.6rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thEstilo = { padding: "1rem 0.5rem", textAlign: "center", fontWeight: "bold", borderBottom: "2px solid #e2e8f0", background: "#f1f5f9" };
const tdEstilo = { padding: "0.8rem 0.5rem", textAlign: "center", borderBottom: "1px solid #f1f5f9" };

const PagosLigas = () => {
    const [meses, establecerMeses] = useState([]);
    const [mesSeleccionado, establecerMesSeleccionado] = useState("");
    const [valorDiario, establecerValorDiario] = useState(8000);
    const [clientes, establecerClientes] = useState([]);
    const [buscarCliente, establecerBusquedaCliente] = useState("");
    const [clienteSeleccionado, establecerClienteSeleccionado] = useState(null);
    const [diaSeleccionado, establecerDiaSeleccionado] = useState("");
    const [tipoPagoSeleccionado, establecerTipoPagoSeleccionado] = useState("Efectivo");
    const [comentario, establecerComentario] = useState(""); // NUEVO: Estado para el comentario
    const [pagosDelMes, establecerPagosDelMes] = useState([]);
    
    const [filtroNombre, establecerFiltroNombre] = useState("");
    const [filtroEspecialidad, establecerFiltroEspecialidad] = useState("TODAS");
    const [filtroTipoPago, establecerFiltroTipoPago] = useState("TODOS");
    const [filtroPeriodo, establecerFiltroPeriodo] = useState("MES");
    const [filtroDia, establecerFiltroDia] = useState("");

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    useEffect(() => {
        const cargarDatosBase = async () => {
            try {
                const [mRes, cRes] = await Promise.all([
                    axios.get(`${backendURL}/pagos-ligas/meses`),
                    obtenerClientes()
                ]);
                establecerMeses(mRes.data);
                establecerClientes(cRes.data);
                if (mRes.data.length > 0) establecerMesSeleccionado(mRes.data[0].nombre);
            } catch (err) { console.error("Error inicial:", err); }
        };
        cargarDatosBase();
    }, [backendURL]);

    useEffect(() => {
        if (!mesSeleccionado) return;
        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                establecerPagosDelMes(res.data.filter(p => p.nombre !== "SYSTEM"));
            } catch (err) { console.error("Error pagos:", err); }
        };
        cargarPagos();
    }, [mesSeleccionado, backendURL]);

    const manejarRegistro = async () => {
        if (!clienteSeleccionado || !diaSeleccionado) return alert("Selecciona cliente y día");
        try {
            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.toUpperCase(),
                mes: mesSeleccionado,
                diasAsistidos: 1,
                total: valorDiario,
                diasPagados: [parseInt(diaSeleccionado)],
                tipoPago: tipoPagoSeleccionado,
                comentario: comentario // Enviamos el comentario al backend
            });
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            establecerPagosDelMes(res.data.filter(p => p.nombre !== "SYSTEM"));
            establecerBusquedaCliente("");
            establecerDiaSeleccionado("");
            establecerComentario(""); // Limpiar comentario
            alert("Pago exitoso");
        } catch (err) { alert("Error al guardar"); }
    };

    const { datosFiltrados, totalCaja, totalMes } = useMemo(() => {
        let pagos = pagosDelMes.map(p => {
            const c = clientes.find(cli => `${cli.nombre} ${cli.apellido}`.toUpperCase() === p.nombre.toUpperCase());
            return { ...p, especialidad: c?.especialidad || "Sin Especialidad" };
        });
        const tMes = pagos.reduce((acc, p) => acc + (p.diasPagados.length * valorDiario), 0);
        if (filtroNombre) pagos = pagos.filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
        if (filtroEspecialidad !== "TODAS") pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        if (filtroTipoPago !== "TODOS") pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        
        let caja = 0;
        if (filtroPeriodo === "DIA" && filtroDia) {
            const d = parseInt(filtroDia);
            pagosDelMes.forEach(p => {
                const f = new Date(p.createdAt);
                if (f.getDate() === d) caja += (p.diasPagados.length * valorDiario);
            });
        } else {
            caja = pagos.reduce((acc, p) => acc + (p.diasPagados.length * valorDiario), 0);
        }
        return { datosFiltrados: pagos, totalCaja: caja, totalMes: tMes };
    }, [pagosDelMes, clientes, filtroNombre, filtroEspecialidad, filtroTipoPago, filtroPeriodo, filtroDia, valorDiario]);

    const listaSpecs = ["TODAS", ...new Set(clientes.map(c => c.especialidad).filter(Boolean))];

    return (
        <div style={{ padding: "20px", marginLeft: "260px", minHeight: "100vh", background: "#f8fafc" }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "1rem", boxShadow: "0 4px 10px rgba(0,0,0,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "2rem", alignItems: "center" }}>
                    <h2>Control de Pagos Ligas</h2>
                    <div style={{ background: "#1e293b", color: "white", padding: "1rem", borderRadius: "0.5rem" }}>
                        <small>Recaudado Mes:</small>
                        <div style={{ fontSize: "1.4rem", fontWeight: "bold" }}>${totalMes.toLocaleString()}</div>
                    </div>
                </div>

                {/* Formulario con COMENTARIO */}
                <div style={{ display: "flex", gap: "10px", marginBottom: "2rem", flexWrap: "wrap", background: "#f0fdf4", padding: "1.5rem", borderRadius: "0.8rem", border: "1px solid #bbf7d0" }}>
                    <input style={{...estiloEntrada, flex: 1}} placeholder="Nombre de la niña..." list="cli-list" value={buscarCliente}
                        onChange={(e) => {
                            establecerBusquedaCliente(e.target.value);
                            const found = clientes.find(c => `${c.nombre} ${c.apellido}` === e.target.value);
                            establecerClienteSeleccionado(found);
                        }}
                    />
                    <datalist id="cli-list">{clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}</datalist>
                    <input type="number" placeholder="Día" style={{...estiloEntrada, width: "80px"}} value={diaSeleccionado} onChange={(e) => establecerDiaSeleccionado(e.target.value)} />
                    <input style={{...estiloEntrada, flex: 1}} placeholder="Comentario (opcional)..." value={comentario} onChange={(e) => establecerComentario(e.target.value)} />
                    <select style={estiloSelect} value={tipoPagoSeleccionado} onChange={(e) => establecerTipoPagoSeleccionado(e.target.value)}>
                        <option value="Efectivo">Efectivo</option>
                        <option value="Nequi">Nequi</option>
                    </select>
                    <button onClick={manejarRegistro} style={btnExito}>Registrar Pago</button>
                </div>

                {/* Filtros */}
                <div style={{ display: "flex", gap: "15px", marginBottom: "2rem", alignItems: "center", flexWrap: "wrap" }}>
                    <input style={estiloEntrada} placeholder="Filtrar por nombre..." value={filtroNombre} onChange={(e) => establecerFiltroNombre(e.target.value)} />
                    <select style={estiloSelect} value={filtroEspecialidad} onChange={(e) => establecerFiltroEspecialidad(e.target.value)}>
                        {listaSpecs.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <div style={{ marginLeft: "auto", background: "#065f46", color: "white", padding: "0.8rem 1.5rem", borderRadius: "0.5rem", fontWeight: "bold" }}>
                        Caja Actual: ${totalCaja.toLocaleString()}
                    </div>
                </div>

                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1200px" }}>
                        <thead>
                            <tr>
                                <th style={{...thEstilo, textAlign: "left", position: "sticky", left: 0, zIndex: 5}}>Jugadora</th>
                                <th style={thEstilo}>Especialidad</th>
                                {[...Array(31)].map((_, i) => <th key={i} style={thEstilo}>{i + 1}</th>)}
                                <th style={thEstilo}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...new Set(datosFiltrados.map(p => p.nombre))].map(nom => {
                                const mPagos = datosFiltrados.filter(p => p.nombre === nom);
                                const diasDicionario = {};
                                mPagos.forEach(p => p.diasPagados.forEach(d => diasDicionario[d] = p));
                                return (
                                    <tr key={nom}>
                                        <td style={{...tdEstilo, textAlign: "left", fontWeight: "bold", position: "sticky", left: 0, background: "white"}}>{nom}</td>
                                        <td style={tdEstilo}>{mPagos[0]?.especialidad}</td>
                                        {[...Array(31)].map((_, i) => {
                                            const d = i + 1;
                                            const pagoInfo = diasDicionario[d];
                                            if (!pagoInfo) return <td key={i} style={tdEstilo}>-</td>;
                                            
                                            const hoy = new Date().getDate();
                                            const esHoy = d === hoy;
                                            const esAdelantado = d > hoy;

                                            return (
                                                <td key={i} style={{
                                                    ...tdEstilo, 
                                                    color: esHoy ? "#2563eb" : (esAdelantado ? "#f59e0b" : "#22c55e"), 
                                                    fontWeight: "bold",
                                                    cursor: "help"
                                                }} title={pagoInfo.comentario || "Pago registrado"}>
                                                    {esHoy && pagoInfo.comentario ? "💬" : "X"}
                                                </td>
                                            );
                                        })}
                                        <td style={{...tdEstilo, fontWeight: "bold"}}>${mPagos.reduce((a, b) => a + (b.diasPagados.length * valorDiario), 0).toLocaleString()}</td>
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
