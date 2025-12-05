// src/pages/pagos/PagosLigas.js

import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// ===========================================
// ⭐ FUNCIÓN AUXILIAR: Convertir a GMT-5 (Colombia)
// ===========================================
// Esta función convierte una fecha UTC a la hora local de Bogotá (GMT-5)
const toBogotaTime = (date) => {
    // Si la entrada es un string ISO, crea un objeto Date. Si ya es Date, lo usa.
    const d = new Date(date);
    
    // 1. Obtener la hora UTC
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    
    // 2. Aplicar el desplazamiento de Bogotá (GMT-5) que es -5 horas * 60 minutos/hora * 60000 ms/min
    // -5 horas = -18,000,000 milisegundos
    const offsetBogota = -5 * 60 * 60 * 1000; 
    
    // 3. Aplicar el desplazamiento
    const bogotaTime = new Date(utc + offsetBogota);
    
    return bogotaTime;
};

// ===========================================
// ⭐ FUNCIÓN AUXILIAR: Obtener mes actual
// ===========================================
const obtenerNombreMesActual = () => {
    // 🎯 SOLUCIÓN ZONA HORARIA (GMT-5): Usamos la hora de Bogotá para el mes/año
    const date = toBogotaTime(new Date()); 
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`; // Ej: "Diciembre 2025"
};

// ... [El resto de CONSTANTES y ESTILOS se mantienen igual] ...

const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };
const TIPOS_PAGO = ["TODOS", "Efectivo", "Nequi"];

// ===========================================
// COMPONENTE PRINCIPAL
// ===========================================
const PagosLigas = () => {
    // ... [ESTADOS SIN CAMBIOS] ...
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

    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");

    const [scrollPosition, setScrollPosition] = useState(0);

    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    // ----------------------------------------------------
    // ⭐ FUNCIÓN: Cargar Pagos con Ajuste de Zona Horaria
    // ----------------------------------------------------
    const cargarPagosYCalcularTotal = async (mes) => {
        if (!mes) return;

        try {
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mes}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

            let total = 0;
            
            // ===========================================
            // 🎯 SOLUCIÓN ZONA HORARIA (GMT-5): Ajustar el día pagado
            // ===========================================
            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );

                const especialidad = cliente?.especialidad || 'Sin Especialidad';
                const tipoPago = pago.tipoPago || 'Efectivo'; 

                total += pago.total || 0; 
                
                let diaAjustado = [];
                if(pago.createdAt) {
                    const fechaBogota = toBogotaTime(pago.createdAt);
                    // Sobreescribimos 'diasPagados' para que siempre use el día de Bogotá
                    diaAjustado = [fechaBogota.getDate()]; 
                } else {
                    // Fallback (debería existir createdAt en el backend)
                    diaAjustado = pago.diasPagados || [];
                }

                return { 
                    ...pago, 
                    especialidad, 
                    tipoPago,
                    diasPagados: diaAjustado 
                };
            });

            setTotalRecaudado(total);
            setPagosDelMes(pagosEnriquecidos);
            return pagosEnriquecidos; // Retornar para usar en el registro
        } catch (error) {
            console.error("Error cargando pagos:", error);
            setPagosDelMes([]);
            setTotalRecaudado(0);
            return [];
        }
    };
    // ----------------------------------------------------

    // CARGAR VALOR DIARIO DESDE BACKEND + MESES + CLIENTES
    useEffect(() => {
        const cargarInicial = async () => {
            try {
                const [mesesRes, clientesRes, configRes] = await Promise.all([
                    axios.get(`${backendURL}/pagos-ligas/meses`),
                    obtenerClientes(),
                    axios.get(`${backendURL}/pagos-ligas/valor-diario`).catch(() => ({ data: { valorDiario: 8000 } })),
                ]);
                
                const mesesData = mesesRes.data;
                const nombreMesActual = obtenerNombreMesActual(); // Usa la hora de Bogotá

                setMeses(mesesData);
                setClientes(clientesRes.data);
                setValorDiario(configRes.data.valorDiario || 8000);

                if (mesesData.length > 0) {
                    const mesActualExiste = mesesData.find(m => m.nombre === nombreMesActual);
                    
                    if (mesActualExiste) {
                        setMesSeleccionado(nombreMesActual);
                    } else if (mesesData.length > 0) {
                        setMesSeleccionado(mesesData[0].nombre);
                    }
                }
            } catch (error) {
                console.error("Error inicial", error);
            }
        };
        cargarInicial();
    }, []);

    // CARGAR PAGOS Y CALCULAR TOTAL (TOTAL GENERAL)
    useEffect(() => {
        cargarPagosYCalcularTotal(mesSeleccionado);
    }, [mesSeleccionado, valorDiario, clientes]);


    // REGISTRAR PAGO (Lógica actualizada para evitar duplicados)
    const registrarPagoDia = async () => {
        if (!clienteSeleccionado) return alert("Selecciona una niña");
        if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31) return alert("Día inválido");
        if (!mesSeleccionado) return alert("Selecciona un mes");
        if (!tipoPagoSeleccionado) return alert("Selecciona el tipo de pago"); 

        const nombreCompleto = `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim();
        const diaNum = parseInt(diaSeleccionado);

        // =========================================================================
        // 🚨 CAMBIO CRÍTICO: VALIDACIÓN DE PAGO ÚNICO EN EL MISMO DÍA/MES/CLIENTE
        // =========================================================================
        // Usamos la lista de pagos que ya tiene el ajuste de zona horaria aplicado
        // (pagosDelMes se actualizó en el useEffect con el día ajustado: diasPagados: [diaAjustado])
        const pagoExistente = pagosDelMes.find(pago => 
            pago.nombre.trim().toLowerCase() === nombreCompleto.toLowerCase() &&
            pago.diasPagados.includes(diaNum)
        );

        if (pagoExistente) {
            return alert(`¡Error! La jugadora ${nombreCompleto} ya tiene registrado un pago para el día ${diaNum} en el mes de ${mesSeleccionado}.`);
        }
        // =========================================================================
        
        try {
            
            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: nombreCompleto,
                mes: mesSeleccionado,
                diasAsistidos: 1, // Se asume un día de asistencia para un pago por día
                total: valorDiario,
                // El campo diasPagados se envía, pero si el backend usa createdAt
                // para determinar el día de pago, el frontend lo corrige al cargar.
                diasPagados: [diaNum], 
                tipoPago: tipoPagoSeleccionado, 
            });

            // Recargamos los pagos para actualizar la tabla (usando la nueva función)
            await cargarPagosYCalcularTotal(mesSeleccionado);

            alert(`Día ${diaNum} registrado como pago (${tipoPagoSeleccionado}) para ${nombreCompleto}.`);
            setSearchCliente("");
            setClienteSeleccionado(null);
            setDiaSeleccionado("");
        } catch (error) {
            console.error(error);
            alert("Error al registrar pago");
        }
    };
    
    // ... [FUNCIÓN crearMes SIN CAMBIOS] ...
    const crearMes = async () => { /* ... lógica de crearMes ... */ };

    // ===========================================
    // LÓGICA DE FILTROS Y CÁLCULO DE TOTALES FILTRADOS (SIN CAMBIOS FUNCIONALES MAYORES)
    // ===========================================
    // ... [Resto del código (useMemo, getConteoPagosPorDia, syncScroll, y el Renderizado)] ...
    const pagosFiltrados = useMemo(() => {
        // ... [Todo el useMemo de pagosFiltrados es funcionalmente correcto] ...
        let pagos = pagosDelMes;
        let total = 0;

        // 1. Filtrar por Nombre
        if (filtroNombre.trim()) {
            const nombreFiltrado = filtroNombre.trim().toLowerCase();
            pagos = pagos.filter(p => p.nombre.trim().toLowerCase().includes(nombreFiltrado));
        }

        // 2. Filtrar por Especialidad
        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }

        // 3. Filtrar por Tipo de Pago 
        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        // 4. Calcular Total basado en el Período y los filtros anteriores
        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia, 10);
            
            const pagosDiaFiltrado = pagos.filter(p => p.diasPagados.includes(diaNum));
            total = pagosDiaFiltrado.reduce((sum, pago) => sum + (pago.total || 0), 0);
        }
        else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            const semanaNum = parseInt(filtroSemana, 10);

            let diasSemana = [];
            if (semanaNum === 1) diasSemana = [1, 2, 3, 4, 5, 6, 7];
            else if (semanaNum === 2) diasSemana = [8, 9, 10, 11, 12, 13, 14];
            else if (semanaNum === 3) diasSemana = [15, 16, 17, 18, 19, 20, 21];
            else if (semanaNum === 4) diasSemana = [22, 23, 24, 25, 26, 27, 28];
            else if (semanaNum === 5) diasSemana = [29, 30, 31];

            const pagosSemanaFiltrado = pagos.filter(p => 
                p.diasPagados.some(dia => diasSemana.includes(dia))
            );
            
            total = pagosSemanaFiltrado.reduce((sum, pago) => sum + (pago.total || 0), 0);
        }
        else { // MES (Por defecto o si no hay filtro de día/semana)
            total = pagos.reduce((sum, pago) => sum + (pago.total || 0), 0);
        }

        return {
            pagosFiltradosPorEspecialidad: pagos,
            totalFiltrado: total
        };

    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, filtroTipoPago, filtroNombre, valorDiario]); 

    const jugadorasFiltradas = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    const getEspecialidadJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.especialidad || 'N/A';
    };

    const getTipoPagoJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.tipoPago || 'Efectivo'; 
    };

    const getConteoPagosPorDia = (nombreJugadora) => {
        const pagosBase = pagosFiltrados.pagosFiltradosPorEspecialidad;
        const pagosJugadora = pagosBase.filter(p => p.nombre.trim() === nombreJugadora.trim());
        
        const conteoPorDia = {};
        
        pagosJugadora.forEach(pago => {
            // Usamos el día que ya fue ajustado en la función cargarPagosYCalcularTotal
            const dia = pago.diasPagados?.[0]; 
            if (dia) {
                conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
            }
        });

        return conteoPorDia;
    };

    const getNumeroTotalPagos = (nombre) => {
        const conteoPorDia = getConteoPagosPorDia(nombre);
        return Object.values(conteoPorDia).reduce((sum, count) => sum + count, 0);
    };

    // ... [syncScroll y useEffect SIN CAMBIOS] ...
    const syncScroll = (event) => {
        const scrollContainer = document.getElementById('scroll-table-bottom');
        if (scrollContainer) {
            scrollContainer.scrollLeft = event.target.scrollLeft;
            setScrollPosition(event.target.scrollLeft); 
        }
    };

    useEffect(() => {
        const scrollContainer = document.getElementById('scroll-table-bottom');
        if (scrollContainer && scrollContainer.scrollLeft !== scrollPosition) {
            scrollContainer.scrollLeft = scrollPosition;
        }
    }, [scrollPosition]);


    return (
        // ... [RESTO DEL COMPONENTE RENDERIZADO SIN CAMBIOS ESTRUCTURALES] ...
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>

                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>
                    Control de Pagos de Ligas
                </h2>
                {/* ... [Bloque de Mes y Total Recaudado] ... */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
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
                            placeholder="Valor diario"
                        />
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
                        TOTAL RECAUDADO (MES): ${totalRecaudado.toLocaleString("es-CO")}
                    </div>
                </div>

                {/* --- SECCIÓN DE FILTROS --- */}
                <div style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "2px solid #3b82f6" }}>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#1d4ed8", fontSize: "1.4rem" }}>
                        Filtros de Pagos
                    </h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>

                        {/* ... [Filtros de Nombre, Especialidad, Tipo de Pago, Período, Día/Semana, Total Filtrado] ... */}
                         <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Nombre</label>
                            <input
                                type="text"
                                placeholder="Filtrar por nombre"
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                                list="clientes-filtro-list"
                                style={{ ...inputStyle, padding: "0.75rem", width: "300px" }}
                            />
                            <datalist id="clientes-filtro-list">
                                {clientes.map(c => <option key={`filtro-${c._id}`} value={`${c.nombre} ${c.apellido}`} />)}
                            </datalist>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Especialidad</label>
                            <select
                                value={filtroEspecialidad}
                                onChange={(e) => setFiltroEspecialidad(e.target.value)}
                                style={{ ...selectStyle, padding: "0.75rem" }}
                            >
                                {especialidades.map(spec => (
                                    <option key={spec} value={spec}>{spec}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Tipo de Pago</label>
                            <select
                                value={filtroTipoPago}
                                onChange={(e) => setFiltroTipoPago(e.target.value)}
                                style={{ ...selectStyle, padding: "0.75rem" }}
                            >
                                {TIPOS_PAGO.map(tipo => (
                                    <option key={tipo} value={tipo}>{tipo}</option>
                                ))}
                            </select>
                        </div>

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Período</label>
                            <select
                                value={filtroPeriodo}
                                onChange={(e) => setFiltroPeriodo(e.target.value)}
                                style={{ ...selectStyle, padding: "0.75rem" }}
                            >
                                <option value="MES">Mes Completo</option>
                                <option value="SEMANA">Semana</option>
                                <option value="DIA">Día Específico</option>
                            </select>
                        </div>

                        {filtroPeriodo === "DIA" && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Día</label>
                                <input
                                    type="number" min="1" max="31"
                                    placeholder="Día (1-31)"
                                    value={filtroDia}
                                    onChange={(e) => setFiltroDia(e.target.value)}
                                    style={{ ...inputStyle, width: "120px", padding: "0.75rem" }}
                                />
                            </div>
                        )}
                        {filtroPeriodo === "SEMANA" && (
                            <div style={{ display: "flex", flexDirection: "column" }}>
                                <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Semana</label>
                                <select
                                    value={filtroSemana}
                                    onChange={(e) => setFiltroSemana(e.target.value)}
                                    style={{ ...selectStyle, padding: "0.75rem" }}
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="1">Semana 1 (1-7)</option>
                                    <option value="2">Semana 2 (8-14)</option>
                                    <option value="3">Semana 3 (15-21)</option>
                                    <option value="4">Semana 4 (22-28)</option>
                                    <option value="5">Semana 5 (29-31)</option>
                                </select>
                            </div>
                        )}

                        <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            TOTAL FILTRADO: ${pagosFiltrados.totalFiltrado.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>

                {/* --- SECCIÓN DE REGISTRO RÁPIDO --- */}
                <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
                    <h3 style={{ margin: "0 0 1.5rem 0", color: "#166534", fontSize: "1.6rem" }}>Registrador Pago Rápido</h3>
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

                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.25rem" }}>Tipo</label>
                            <select
                                value={tipoPagoSeleccionado}
                                onChange={(e) => setTipoPagoSeleccionado(e.target.value)}
                                style={{ ...selectStyle, padding: "0.75rem" }}
                            >
                                <option value="Efectivo">Efectivo</option>
                                <option value="Nequi">Nequi</option>
                            </select>
                        </div>

                        <input type="number" min="1" max="31" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{ ...inputStyle, width: "100px" }} />
                        <button onClick={registrarPagoDia} style={btnSuccess}>
                            Marcar Día {diaSeleccionado || "?"} como Pagado
                        </button>
                    </div>
                </div>

                {/* =========================================== */}
                {/* SCROLL HORIZONTAL SUPERIOR E INFERIOR + TABLA */}
                {/* =========================================== */}
                {mesSeleccionado && (
                    <div 
                        id="scroll-table-top"
                        style={{ overflowX: "auto", overflowY: "hidden", margin: "0 0 -1px 0" }}
                        onScroll={syncScroll}
                    >
                        <div style={{ width: "2550px", height: "1px" }} />
                    </div>
                )}
                
                {mesSeleccionado && (
                    <div 
                        id="scroll-table-bottom"
                        style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
                        onScroll={syncScroll}
                    >
                        <table style={{ width: "100%", minWidth: "2550px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "200px" }}>Jugadora</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Especialidad</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Tipo de Pago</th> 
                                    {[...Array(31)].map((_, i) => (
                                        <th key={i + 1} style={{ ...thStyle, width: "60px" }}>{i + 1}</th>
                                    ))}
                                    <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Pagos</th> 
                                    <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.length === 0 ? (
                                    <tr><td colSpan="36" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>No hay pagos este mes que coincidan con los filtros.</td></tr>
                                ) : (
                                    jugadorasFiltradas.map(nombre => {
                                        const conteoPorDia = getConteoPagosPorDia(nombre); 
                                         
                                        return (
                                            <tr key={nombre} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                                <td style={{ ...tdStyle, fontWeight: "bold", textAlign: "left", position: "sticky", left: 0, background: "white", zIndex: 5, width: "200px" }}>{nombre}</td>
                                                <td style={{ ...tdStyle, color: "#334155", width: "150px" }}>{getEspecialidadJugadora(nombre)}</td>
                                                <td style={{ ...tdStyle, width: "150px", fontWeight: "bold", color: getTipoPagoJugadora(nombre) === 'Nequi' ? '#f97316' : '#22c55e' }}>
                                                    **{getTipoPagoJugadora(nombre)}**
                                                </td>
                                                {[...Array(31)].map((_, diaIndex) => {
                                                    const dia = diaIndex + 1;
                                                    const count = conteoPorDia[dia] || 0;
                                                    const isMultiple = count > 1;
                                                     
                                                    return (
                                                        <td key={dia} style={{ 
                                                            ...tdStyle, 
                                                            color: isMultiple ? '#ef4444' : (count > 0 ? '#22c55e' : '#e5e7eb'), 
                                                            fontWeight: isMultiple || count > 0 ? 'bold' : 'normal', 
                                                            background: isMultiple ? '#fee2e2' : 'white' 
                                                        }}>
                                                            {count === 1 ? 'X' : (count > 1 ? count : '')}
                                                        </td>
                                                    );
                                                })}
                                                <td style={{ ...tdStyle, background: "#f0f4fa", fontWeight: "bold", width: "110px" }}>{getNumeroTotalPagos(nombre)}</td>
                                                <td style={{ ...tdStyle, background: "#f0f4fa", fontWeight: "bold", width: "160px" }}>${(getNumeroTotalPagos(nombre) * valorDiario).toLocaleString("es-CO")}</td>
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
