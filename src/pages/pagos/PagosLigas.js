// src/pages/pagos/PagosLigas.js

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// ==========================================================
// ⭐ BLOQUE 1: FUNCIONES AUXILIARES Y CONFIGURACIÓN
// ==========================================================

/**
 * Determina el nombre del mes y año actual.
 * Se usa para que el sistema cargue por defecto el mes vigente.
 */
const obtenerNombreMesActual = () => {
    const date = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`; // Ejemplo: "Enero 2026"
};

// Definición de estilos constantes para mantener la limpieza en el renderizado
const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

// Opciones globales para tipos de pago
const TIPOS_PAGO = ["TODOS", "Efectivo", "Nequi"];

const PagosLigas = () => {
    // ==========================================================
    // ⭐ BLOQUE 2: ESTADOS DEL COMPONENTE (useState)
    // ==========================================================
    
    // Estados de configuración y datos maestros
    const [meses, setMeses] = useState([]);           // Lista de meses disponibles en BD
    const [mesSeleccionado, setMesSeleccionado] = useState(""); // Mes activo en pantalla
    const [nuevoMes, setNuevoMes] = useState("");     // Texto para crear un nuevo mes
    const [valorDiario, setValorDiario] = useState(8000); // Valor por día de asistencia
    const [clientes, setClientes] = useState([]);     // Lista total de niñas/jugadoras

    // Estados para el registro de nuevos pagos
    const [searchCliente, setSearchCliente] = useState(""); // Buscador de jugadora
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null); // Jugadora elegida
    const [diaSeleccionado, setDiaSeleccionado] = useState(""); // Día del mes a pagar
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");
    const [comentarioPago, setComentarioPago] = useState(""); // Notas adicionales

    // Estados de resultados y totales
    const [pagosDelMes, setPagosDelMes] = useState([]); // Todos los pagos del mes actual
    const [totalRecaudado, setTotalRecaudado] = useState(0); // Suma de dinero del mes

    // Estados para filtros de visualización
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    // ==========================================================
    // ⭐ BLOQUE 3: CÁLCULOS MEMORIZADOS (useMemo)
    // ==========================================================

    // Genera la lista de especialidades únicas para el filtro dropdown
    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    // ==========================================================
    // ⭐ BLOQUE 4: EFECTOS DE CARGA (useEffect)
    // ==========================================================

    // Carga inicial de datos: Meses, Clientes y Precio Diario
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

                // Intenta seleccionar el mes actual automáticamente
                if (mesesData.length > 0) {
                    const mesActualExiste = mesesData.find(m => m.nombre === nombreMesActual);
                    if (mesActualExiste) {
                        setMesSeleccionado(nombreMesActual);
                    } else {
                        setMesSeleccionado(mesesData[0].nombre);
                    }
                }
            } catch (error) {
                console.error("Error inicial:", error);
            }
        };
        cargarInicial();
    }, [backendURL]);

    // Carga los pagos cada vez que el usuario cambia de mes
    useEffect(() => {
        if (!mesSeleccionado) return;
        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const todosPagos = res.data || [];
                const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

                let total = 0;
                // Cruza los datos del pago con la especialidad de la niña
                const pagosEnriquecidos = pagosReales.map(pago => {
                    const cliente = clientes.find(c =>
                        `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                    );

                    const especialidad = cliente?.especialidad || 'Sin Especialidad';
                    const tipoPago = pago.tipoPago || 'N/A';
                    const comentario = pago.comentario || '';

                    if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
                        total += pago.diasPagados.length * valorDiario;
                    }

                    return { ...pago, especialidad, tipoPago, comentario };
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

    // ==========================================================
    // ⭐ BLOQUE 5: FUNCIONES DE ACCIÓN (Backend)
    // ==========================================================

    // Envía el registro de un nuevo pago al servidor
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
                comentario: comentarioPago
            });

            // Refrescar datos tras guardar
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const pagosReales = (res.data || []).filter(p => p.nombre !== "SYSTEM");
            
            const pagosEnriquecidos = pagosReales.map(pago => {
                const c = clientes.find(cli => `${cli.nombre} ${cli.apellido}`.toLowerCase() === pago.nombre.toLowerCase());
                return { ...pago, especialidad: c?.especialidad || 'Sin Especialidad' };
            });

            setPagosDelMes(pagosEnriquecidos);
            alert(`Día ${diaSeleccionado} registrado`);
            // Limpiar formulario
            setSearchCliente(""); setClienteSeleccionado(null); setDiaSeleccionado(""); setComentarioPago("");
        } catch (error) {
            alert("Error al registrar pago");
        }
    };

    // Crea un nuevo mes en la base de datos
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

    // ==========================================================
    // ⭐ BLOQUE 6: MOTOR DE FILTRADO DE LA TABLA
    // ==========================================================

    const pagosFiltrados = useMemo(() => {
        let pagos = pagosDelMes;
        let total = 0;

        // Filtro por nombre (búsqueda parcial)
        if (filtroNombre.trim()) {
            const nom = filtroNombre.trim().toLowerCase();
            pagos = pagos.filter(p => p.nombre.trim().toLowerCase().includes(nom));
        }

        // Filtro por especialidad
        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }

        // Filtro por método de pago
        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        // Lógica de cálculo según el periodo (Día, Semana o Mes)
        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia, 10);
            const jugadorasConDia = new Set();
            pagos.forEach(p => { if (p.diasPagados.includes(diaNum)) jugadorasConDia.add(p.nombre); });
            total = jugadorasConDia.size * valorDiario;
        }
        else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            const sem = parseInt(filtroSemana, 10);
            let diasSem = [];
            if (sem === 1) diasSem = [1, 2, 3, 4, 5, 6, 7];
            else if (sem === 2) diasSem = [8, 9, 10, 11, 12, 13, 14];
            else if (sem === 3) diasSem = [15, 16, 17, 18, 19, 20, 21];
            else if (sem === 4) diasSem = [22, 23, 24, 25, 26, 27, 28];
            else if (sem === 5) diasSem = [29, 30, 31];

            const asistenciasSemana = new Set();
            pagos.forEach(p => p.diasPagados.forEach(d => {
                if (diasSem.includes(d)) asistenciasSemana.add(`${p.nombre}-${d}`);
            }));
            total = asistenciasSemana.size * valorDiario;
        }
        else {
            let totalDias = 0;
            pagos.forEach(p => { totalDias += p.diasPagados?.length || 0; });
            total = totalDias * valorDiario;
        }

        return { pagosFiltradosPorEspecialidad: pagos, totalFiltrado: total };
    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, filtroTipoPago, filtroNombre, valorDiario]);

    // Helpers para la tabla
    const jugadorasFiltradas = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    const getEspecialidadJugadora = (nombre) => {
        return pagosDelMes.find(c => c.nombre.trim() === nombre.trim())?.especialidad || 'N/A';
    };

    const getTipoPagoJugadora = (nombre) => {
        return pagosDelMes.find(c => c.nombre.trim() === nombre.trim())?.tipoPago || 'Efectivo';
    };

    const getComentarioDia = (nombre, dia) => {
        const p = pagosFiltrados.pagosFiltradosPorEspecialidad.find(x => x.nombre.trim() === nombre.trim() && x.diasPagados.includes(dia));
        return p?.comentario || "";
    };

    const getDiasPagadosFiltrados = (nombre) => {
        const lista = pagosFiltrados.pagosFiltradosPorEspecialidad.filter(p => p.nombre.trim() === nombre.trim());
        const dias = new Set();
        lista.forEach(p => p.diasPagados.forEach(d => dias.add(d)));
        return Array.from(dias).sort((a, b) => a - b);
    };

    // ==========================================================
    // ⭐ BLOQUE 7: RENDERIZADO (UI)
    // ==========================================================

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>

                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}> Control de Pagos de Ligas </h2>
                
                {/* Header: Gestión de Meses y Precios */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Ej: Enero 2026" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
                        <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
                        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="">Seleccionar mes</option>
                            {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
                        </select>
                        <input type="number" value={valorDiario} onChange={(e) => setValorDiario(Number(e.target.value))} style={{ ...inputStyle, width: "140px" }} />
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
                        TOTAL MES: ${totalRecaudado.toLocaleString("es-CO")}
                    </div>
                </div>

                {/* Sección de Filtros */}
                <div style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "2px solid #3b82f6" }}>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#1d4ed8", fontSize: "1.4rem" }}> Filtros de Búsqueda </h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Nombre</label>
                            <input type="text" placeholder="Filtrar por nombre..." value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} list="clientes-filtro-list" style={{ ...inputStyle, width: "300px" }} />
                            <datalist id="clientes-filtro-list">{clientes.map(c => <option key={`f-${c._id}`} value={`${c.nombre} ${c.apellido}`} />)}</datalist>
                        </div>
                        <select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)} style={selectStyle}>
                            {especialidades.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <select value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)} style={selectStyle}>
                            {TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select value={filtroPeriodo} onChange={(e) => setFiltroPeriodo(e.target.value)} style={selectStyle}>
                            <option value="MES">Mes Completo</option>
                            <option value="SEMANA">Semana</option>
                            <option value="DIA">Día Específico</option>
                        </select>
                        {filtroPeriodo === "DIA" && <input type="number" min="1" max="31" value={filtroDia} onChange={(e) => setFiltroDia(e.target.value)} style={{ ...inputStyle, width: "100px" }} />}
                        {filtroPeriodo === "SEMANA" && (
                            <select value={filtroSemana} onChange={(e) => setFiltroSemana(e.target.value)} style={selectStyle}>
                                <option value="">Elegir...</option>
                                <option value="1">Semana 1 (1-7)</option><option value="2">Semana 2 (8-14)</option>
                                <option value="3">Semana 3 (15-21)</option><option value="4">Semana 4 (22-28)</option>
                                <option value="5">Semana 5 (29-31)</option>
                            </select>
                        )}
                        <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            FILTRADO: ${pagosFiltrados.totalFiltrado.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>

                {/* Formulario de Registro Rápido */}
                <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#166534", fontSize: "1.6rem" }}>Registrar Pago</h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Buscar niña..." value={searchCliente} onChange={(e) => {
                            setSearchCliente(e.target.value);
                            const encontrada = clientes.find(c => `${c.nombre} ${c.apellido}`.toLowerCase() === e.target.value.toLowerCase().trim());
                            setClienteSeleccionado(encontrada || null);
                        }} list="clientes-list" style={{ ...inputStyle, width: "400px" }} />
                        <datalist id="clientes-list">{clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}</datalist>

                        <select value={tipoPagoSeleccionado} onChange={(e) => setTipoPagoSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Nequi">Nequi</option>
                        </select>

                        <input type="number" min="1" max="31" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
                        <input type="text" placeholder="Comentario opcional..." value={comentarioPago} onChange={(e) => setComentarioPago(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
                        <button onClick={registrarPagoDia} style={btnSuccess}> Marcar Día {diaSeleccionado || "?"} </button>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2550px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "200px" }}>Jugadora</th>
                                    <th style={{ ...thStyle, width: "150px" }}>Especialidad</th>
                                    <th style={{ ...thStyle, width: "150px" }}>Pago</th>
                                    {[...Array(31)].map((_, i) => <th key={i + 1} style={{ ...thStyle, width: "60px" }}>{i + 1}</th>)}
                                    <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Días</th>
                                    <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.length === 0 ? (
                                    <tr><td colSpan="36" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>Sin datos para mostrar.</td></tr>
                                ) : (
                                    jugadorasFiltradas.map(nombre => {
                                        const dias = getDiasPagadosFiltrados(nombre);
                                        const total = dias.length * valorDiario;
                                        const espec = getEspecialidadJugadora(nombre);
                                        const tPago = getTipoPagoJugadora(nombre);
                                        
                                        return (
                                            <tr key={nombre}>
                                                <td style={{ ...tdStyle, fontWeight: "bold", position: "sticky", left: 0, background: "#f8fafc", textAlign: "left" }}> {nombre} </td>
                                                <td style={tdStyle}>{espec}</td>
                                                <td style={{ ...tdStyle, color: tPago === 'Nequi' ? '#8b5cf6' : '#16a34a' }}><strong>{tPago}</strong></td>
                                                {[...Array(31)].map((_, i) => {
                                                    const diaAct = i + 1;
                                                    const pagado = dias.includes(diaAct);
                                                    const p = pagosFiltrados.pagosFiltradosPorEspecialidad.find(x => x.nombre.trim() === nombre.trim() && x.diasPagados.includes(diaAct));
                                                    const colorX = p?.tipoPago === "Nequi" ? "#8b5cf6" : "#22c55e";

                                                    return (
                                                        <td key={diaAct} style={tdStyle}>
                                                            {pagado && <span title={p?.comentario || "OK"} style={{ color: colorX, fontSize: "1.8rem", fontWeight: "bold", cursor: "help" }}>X</span>}
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold" }}>{dias.length}</td>
                                                <td style={{ ...tdStyle, background: "#ecfeff", fontWeight: "bold", color: "#166534" }}>${total.toLocaleString("es-CO")}</td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
                
                {/* Leyenda Final */}
                <div style={{ marginTop: "1rem", display: "flex", gap: "2rem", justifyContent: "center" }}>
                    <span><strong style={{color: "#22c55e"}}>X</strong> = Efectivo</span>
                    <span><strong style={{color: "#8b5cf6"}}>X</strong> = Nequi</span>
                    <small style={{color: "#64748b"}}>(Pasa el mouse por la X para ver notas)</small>
                </div>

            </div>
        </div>
    );
};

export default PagosLigas;
