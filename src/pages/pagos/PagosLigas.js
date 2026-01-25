// src/pages/pagos/PagosLigas.js

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// ===========================================
// ⭐ NUEVA FUNCIÓN AUXILIAR: Obtener mes actual
// ===========================================
const obtenerNombreMesActual = () => {
    const date = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`;
};

// Estilos originales
const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

const TIPOS_PAGO = ["TODOS", "Efectivo", "Nequi"];

const PagosLigas = () => {
    const [meses, setMeses] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [nuevoMes, setNuevoMes] = useState("");
    const [valorDiario, setValorDiario] = useState(8000);
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState("");
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");
    // 🆕 NUEVO: Comentarios
    const [comentarioPago, setComentarioPago] = useState("");

    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);

    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");

    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    useEffect(() => {
        const cargarInicial = async () => {
            try {
                const [mesesRes, clientesRes, configRes] = await Promise.all([
                    axios.get(`${backendURL}/pagos-ligas/meses`),
                    obtenerClientes(),
                    axios.get(`${backendURL}/pagos-ligas/valor-diario`).catch(() => ({ data: { valorDiario: 8000 } })),
                ]);
                
                const mesesData = mesesRes.data;
                const nombreMesActual = obtenerNombreMesActual();

                setMeses(mesesData);
                setClientes(clientesRes.data);
                setValorDiario(configRes.data.valorDiario || 8000);

                if (mesesData.length > 0) {
                    const mesActualExiste = mesesData.find(m => m.nombre === nombreMesActual);
                    if (mesActualExiste) {
                        setMesSeleccionado(nombreMesActual);
                    } else {
                        setMesSeleccionado(mesesData[0].nombre);
                    }
                }
            } catch (error) {
                console.error("Error inicial", error);
            }
        };
        cargarInicial();
    }, [backendURL]);

    useEffect(() => {
        if (!mesSeleccionado) return;
        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const pagosReales = (res.data || []).filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

                let total = 0;
                const pagosEnriquecidos = pagosReales.map(pago => {
                    const cliente = clientes.find(c =>
                        `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                    );
                    const especialidad = cliente?.especialidad || 'Sin Especialidad';
                    if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
                        total += pago.diasPagados.length * valorDiario;
                    }
                    return { ...pago, especialidad };
                });

                setTotalRecaudado(total);
                setPagosDelMes(pagosEnriquecidos);
            } catch (error) {
                console.error("Error cargando pagos:", error);
            }
        };
        cargarPagos();
    }, [mesSeleccionado, valorDiario, clientes, backendURL]);

    const registrarPagoDia = async () => {
        if (!clienteSeleccionado) return alert("Selecciona una niña");
        if (!diaSeleccionado) return alert("Día inválido");

        try {
            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
                mes: mesSeleccionado,
                diasAsistidos: 1,
                total: valorDiario,
                diasPagados: [parseInt(diaSeleccionado)],
                tipoPago: tipoPagoSeleccionado,
                comentario: comentarioPago // 🆕 ENVIAR COMENTARIO
            });

            alert(`Día ${diaSeleccionado} registrado`);
            window.location.reload(); // Recarga simple para asegurar sincronía
        } catch (error) {
            alert("Error al registrar pago");
        }
    };

    const crearMes = async () => {
        if (!nuevoMes.trim()) return alert("Escribe el nombre del mes");
        try {
            await axios.post(`${backendURL}/pagos-ligas/crear-mes`, { nombre: nuevoMes });
            alert("Mes creado");
            window.location.reload();
        } catch (error) {
            alert("Error al crear mes");
        }
    };

    // --- LÓGICA COMPLETA DE FILTROS ---
    const pagosFiltrados = useMemo(() => {
        let pagos = pagosDelMes;
        let total = 0;

        if (filtroNombre.trim()) {
            pagos = pagos.filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
        }
        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }
        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia, 10);
            const filtradosPorDia = pagos.filter(p => p.diasPagados.includes(diaNum));
            total = filtradosPorDia.length * valorDiario;
        } else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            const semanaNum = parseInt(filtroSemana, 10);
            let diasSemana = [];
            if (semanaNum === 1) diasSemana = [1, 2, 3, 4, 5, 6, 7];
            else if (semanaNum === 2) diasSemana = [8, 9, 10, 11, 12, 13, 14];
            else if (semanaNum === 3) diasSemana = [15, 16, 17, 18, 19, 20, 21];
            else if (semanaNum === 4) diasSemana = [22, 23, 24, 25, 26, 27, 28];
            else if (semanaNum === 5) diasSemana = [29, 30, 31];

            let countDiasSemana = 0;
            pagos.forEach(p => {
                p.diasPagados.forEach(d => { if (diasSemana.includes(d)) countDiasSemana++; });
            });
            total = countDiasSemana * valorDiario;
        } else {
            let totalDias = 0;
            pagos.forEach(p => { totalDias += p.diasPagados?.length || 0; });
            total = totalDias * valorDiario;
        }

        return { pagosFiltradosPorEspecialidad: pagos, totalFiltrado: total };
    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, filtroTipoPago, filtroNombre, valorDiario]);

    const jugadorasFiltradas = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>

                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}> Control de Pagos de Ligas </h2>

                {/* --- HEADER Y TOTALES --- */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Nuevo Mes" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
                        <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
                        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
                            {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
                        TOTAL MES: ${totalRecaudado.toLocaleString("es-CO")}
                    </div>
                </div>

                {/* --- FILTROS --- */}
                <div style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "2px solid #3b82f6" }}>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Filtrar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} style={{ ...inputStyle, width: "300px" }} />
                        <select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)} style={selectStyle}>
                            {especialidades.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                        </select>
                        <select value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)} style={selectStyle}>
                            {TIPOS_PAGO.map(tipo => <option key={tipo} value={tipo}>{tipo}</option>)}
                        </select>
                        <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)} style={selectStyle}>
                            <option value="MES">Mes Completo</option>
                            <option value="SEMANA">Semana</option>
                            <option value="DIA">Día</option>
                        </select>
                        <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            TOTAL FILTRADO: ${pagosFiltrados.totalFiltrado.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>

                {/* --- REGISTRO RÁPIDO --- */}
                <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#166534", fontSize: "1.6rem" }}>Registrador Pago Rápido</h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input 
                            list="clientes-list" 
                            placeholder="Nombre de la niña..." 
                            style={{ ...inputStyle, width: "400px" }}
                            onChange={(e) => {
                                setSearchCliente(e.target.value);
                                const encontrada = clientes.find(c => `${c.nombre} ${c.apellido}` === e.target.value);
                                setClienteSeleccionado(encontrada);
                            }}
                        />
                        <datalist id="clientes-list">{clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}</datalist>
                        
                        <select value={tipoPagoSeleccionado} onChange={(e) => setTipoPagoSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Nequi">Nequi</option>
                        </select>

                        <input type="number" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
                        
                        <input 
                            placeholder="Comentario opcional..." 
                            value={comentarioPago} 
                            onChange={(e) => setComentarioPago(e.target.value)} 
                            style={{ ...inputStyle, flex: 1 }} 
                        />

                        <button onClick={registrarPagoDia} style={btnSuccess}>Marcar Día {diaSeleccionado || "?"}</button>
                    </div>
                </div>

                {/* --- TABLA PRINCIPAL --- */}
                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2550px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "250px" }}>Jugadora</th>
                                    <th style={{ ...thStyle, background: "#334155" }}>Especialidad</th>
                                    {[...Array(31)].map((_, i) => <th key={i} style={thStyle}>{i + 1}</th>)}
                                    <th style={{ ...thStyle, background: "#172554" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.map(nombre => {
                                    const registrosNiña = pagosFiltrados.pagosFiltradosPorEspecialidad.filter(p => p.nombre === nombre);
                                    const especialidad = registrosNiña[0]?.especialidad || "S/E";
                                    let diasPagados = 0;

                                    return (
                                        <tr key={nombre}>
                                            <td style={{ ...tdStyle, position: "sticky", left: 0, background: "white", fontWeight: "bold", textAlign: "left" }}>{nombre}</td>
                                            <td style={tdStyle}>{especialidad}</td>
                                            {[...Array(31)].map((_, i) => {
                                                const diaActual = i + 1;
                                                const pagoDia = registrosNiña.find(r => r.diasPagados.includes(diaActual));
                                                if (pagoDia) diasPagados++;

                                                return (
                                                    <td key={diaActual} style={tdStyle}>
                                                        {pagoDia && (
                                                            <span 
                                                                title={pagoDia.comentario || "Pago registrado"}
                                                                style={{ 
                                                                    color: pagoDia.tipoPago === "Nequi" ? "#8b5cf6" : "#22c55e",
                                                                    fontSize: "1.8rem", 
                                                                    fontWeight: "bold",
                                                                    cursor: "help"
                                                                }}
                                                            >X</span>
                                                        )}
                                                    </td>
                                                );
                                            })}
                                            <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", fontSize: "1.4rem" }}>
                                                ${(diasPagados * valorDiario).toLocaleString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
                
                <div style={{ marginTop: "1rem", display: "flex", gap: "2rem" }}>
                    <span><strong style={{color: "#22c55e"}}>X</strong> = Efectivo</span>
                    <span><strong style={{color: "#8b5cf6"}}>X</strong> = Nequi</span>
                    <small style={{color: "#64748b"}}>(Pasa el mouse sobre la X para ver el comentario)</small>
                </div>

            </div>
        </div>
    );
};

export default PagosLigas;
