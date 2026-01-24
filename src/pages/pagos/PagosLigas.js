// src/pages/pagos/PagosLigas.js

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// ===========================================
// ⭐ FUNCIÓN AUXILIAR: Obtener mes actual
// ===========================================
const obtenerNombreMesActual = () => {
    const date = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`; // Ej: "Enero 2026"
};

// Estilos
const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

// Opciones para el Tipo de Pago
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

    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);

    // ESTADOS PARA FILTROS
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    // Lista de especialidades únicas para el filtro
    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    // CARGAR VALOR DIARIO + MESES + CLIENTES
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

    // CARGAR PAGOS Y CALCULAR TOTAL
    useEffect(() => {
        if (!mesSeleccionado) return;
        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const todosPagos = res.data || [];
                const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

                let total = 0;
                const pagosEnriquecidos = pagosReales.map(pago => {
                    const cliente = clientes.find(c =>
                        `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                    );

                    const especialidad = cliente?.especialidad || 'Sin Especialidad';
                    const tipoPago = pago.tipoPago || 'N/A';

                    if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
                        total += pago.diasPagados.length * valorDiario;
                    }

                    return { ...pago, especialidad, tipoPago };
                });

                setTotalRecaudado(total);
                setPagosDelMes(pagosEnriquecidos);

            } catch (error) {
                console.error("Error cargando pagos:", error);
                setPagosDelMes([]);
                setTotalRecaudado(0);
            }
        };
        cargarPagos();
    }, [mesSeleccionado, valorDiario, clientes, backendURL]);

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
                tipoPago: tipoPagoSeleccionado,
            });

            // Recargar datos
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

            let nuevoTotalGeneral = 0;
            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );
                const especialidad = cliente?.especialidad || 'Sin Especialidad';
                const tipoPago = pago.tipoPago || 'N/A';
                if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
                    nuevoTotalGeneral += pago.diasPagados.length * valorDiario;
                }
                return { ...pago, especialidad, tipoPago };
            });

            setPagosDelMes(pagosEnriquecidos);
            setTotalRecaudado(nuevoTotalGeneral);

            alert(`Día ${diaSeleccionado} registrado (${tipoPagoSeleccionado})`);
            setSearchCliente("");
            setClienteSeleccionado(null);
            setDiaSeleccionado("");
        } catch (error) {
            console.error(error);
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
            setMesSeleccionado(nuevoMes.trim());
        } catch (error) {
            alert("Error al crear mes");
        }
    };

    // LÓGICA DE FILTROS Y CÁLCULO DE TOTALES FILTRADOS
    const pagosFiltrados = useMemo(() => {
        let pagos = pagosDelMes;
        let total = 0;

        if (filtroNombre.trim()) {
            const nombreFiltrado = filtroNombre.trim().toLowerCase();
            pagos = pagos.filter(p => p.nombre.toLowerCase().includes(nombreFiltrado));
        }

        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }

        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia, 10);
            const nombresEnDia = new Set();
            pagos.forEach(pago => {
                if (pago.diasPagados.includes(diaNum)) {
                    nombresEnDia.add(pago.nombre.trim());
                }
            });
            total = nombresEnDia.size * valorDiario;
        } 
        else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            const semanaNum = parseInt(filtroSemana, 10);
            let diasSemana = [];
            if (semanaNum === 1) diasSemana = [1, 2, 3, 4, 5, 6, 7];
            else if (semanaNum === 2) diasSemana = [8, 9, 10, 11, 12, 13, 14];
            else if (semanaNum === 3) diasSemana = [15, 16, 17, 18, 19, 20, 21];
            else if (semanaNum === 4) diasSemana = [22, 23, 24, 25, 26, 27, 28];
            else if (semanaNum === 5) diasSemana = [29, 30, 31];

            let conteoUnico = 0;
            pagos.forEach(pago => {
                pago.diasPagados.forEach(d => {
                    if (diasSemana.includes(d)) conteoUnico++;
                });
            });
            total = conteoUnico * valorDiario;
        } 
        else {
            let totalDias = 0;
            pagos.forEach(pago => {
                totalDias += pago.diasPagados?.length || 0;
            });
            total = totalDias * valorDiario;
        }

        return {
            pagosFiltradosFinal: pagos,
            totalFiltrado: total
        };
    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, filtroTipoPago, filtroNombre, valorDiario]);

    const jugadorasEnTabla = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosFinal.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosFinal]);

    const getEspecialidadJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.especialidad || 'N/A';
    };

    const getTipoPagoJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.tipoPago || 'Efectivo';
    };

    const getDiasPagadosFiltrados = (nombre) => {
        const pagos = pagosFiltrados.pagosFiltradosFinal.filter(p => p.nombre.trim() === nombre.trim());
        const dias = new Set();
        pagos.forEach(p => (p.diasPagados || []).forEach(d => dias.add(d)));
        return Array.from(dias).sort((a, b) => a - b);
    };

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>

                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>
                    Control de Pagos de Ligas
                </h2>
                
                {/* CABECERA: CREACIÓN Y TOTAL */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Mes y Año" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
                        <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
                        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="">Seleccionar mes</option>
                            {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
                        </select>
                        <input
                            type="number"
                            value={valorDiario}
                            onChange={(e) => setValorDiario(Number(e.target.value))}
                            style={{ ...inputStyle, width: "140px" }}
                        />
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
                        TOTAL RECAUDADO (MES): ${totalRecaudado.toLocaleString("es-CO")}
                    </div>
                </div>

                {/* FILTROS */}
                <div style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "2px solid #3b82f6" }}>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#1d4ed8", fontSize: "1.4rem" }}>Filtros de Pagos</h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Nombre</label>
                            <input
                                type="text"
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                style={{ ...inputStyle, padding: "0.75rem", width: "250px" }}
                                placeholder="Buscar..."
                            />
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Especialidad</label>
                            <select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)} style={{ ...selectStyle, padding: "0.75rem" }}>
                                {especialidades.map(spec => <option key={spec} value={spec}>{spec}</option>)}
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Tipo de Pago</label>
                            <select value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)} style={{ ...selectStyle, padding: "0.75rem" }}>
                                {TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Período</label>
                            <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)} style={{ ...selectStyle, padding: "0.75rem" }}>
                                <option value="MES">Mes Completo</option>
                                <option value="SEMANA">Semana</option>
                                <option value="DIA">Día Específico</option>
                            </select>
                        </div>

                        {filtroPeriodo === "DIA" && (
                            <input type="number" placeholder="Día" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} style={{ ...inputStyle, width: "80px" }} />
                        )}
                        {filtroPeriodo === "SEMANA" && (
                            <select value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)} style={selectStyle}>
                                <option value="">Semana...</option>
                                <option value="1">1 (1-7)</option>
                                <option value="2">2 (8-14)</option>
                                <option value="3">3 (15-21)</option>
                                <option value="4">4 (22-28)</option>
                                <option value="5">5 (29-31)</option>
                            </select>
                        )}

                        <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            TOTAL FILTRADO: ${pagosFiltrados.totalFiltrado.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>

                {/* REGISTRO RÁPIDO */}
                <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#166534", fontSize: "1.6rem" }}>Registrador Pago Rápido</h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="text"
                            placeholder="Nombre de la niña..."
                            value={searchCliente}
                            onChange={(e) => {
                                setSearchCliente(e.target.value);
                                const encontrada = clientes.find(c => `${c.nombre} ${c.apellido}`.toLowerCase() === e.target.value.toLowerCase().trim());
                                setClienteSeleccionado(encontrada || null);
                            }}
                            list="clientes-list"
                            style={{ ...inputStyle, width: "400px" }}
                        />
                        <datalist id="clientes-list">
                            {clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}
                        </datalist>

                        <select value={tipoPagoSeleccionado} onChange={(e) => setTipoPagoSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Nequi">Nequi</option>
                        </select>

                        <input type="number" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
                        
                        <button onClick={registrarPagoDia} style={btnSuccess}>
                            Marcar Día {diaSeleccionado || "?"} como Pagado
                        </button>
                    </div>
                </div>

                {/* TABLA DE RESULTADOS */}
                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2550px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "220px" }}>Jugadora</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Especialidad</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Tipo de Pago</th>
                                    {[...Array(31)].map((_, i) => <th key={i + 1} style={{ ...thStyle, width: "60px" }}>{i + 1}</th>)}
                                    <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Días</th>
                                    <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasEnTabla.length === 0 ? (
                                    <tr><td colSpan="36" style={{ textAlign: "center", padding: "4rem" }}>No se encontraron registros.</td></tr>
                                ) : (
                                    jugadorasEnTabla.map(nombre => {
                                        const dias = getDiasPagadosFiltrados(nombre);
                                        const total = dias.length * valorDiario;
                                        const tipoP = getTipoPagoJugadora(nombre);
                                        return (
                                            <tr key={nombre}>
                                                <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9, textAlign: "left" }}>{nombre}</td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9" }}>{getEspecialidadJugadora(nombre)}</td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9", color: tipoP === 'Nequi' ? '#ea580c' : '#16a34a', fontWeight: "bold" }}>{tipoP}</td>
                                                {[...Array(31)].map((_, i) => (
                                                    <td key={i + 1} style={tdStyle}>
                                                        {dias.includes(i + 1) && <span style={{ color: "#22c55e", fontSize: "1.8rem", fontWeight: "bold" }}>X</span>}
                                                    </td>
                                                ))}
                                                <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", color: "#0891b2" }}>{dias.length}</td>
                                                <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", color: "#166534" }}>${total.toLocaleString("es-CO")}</td>
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

export default PagosLigas;
