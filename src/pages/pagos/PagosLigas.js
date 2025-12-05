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
    return `${nombreMes} ${anio}`; // Ej: "Diciembre 2025"
};

// Estilos (dejados igual para no alterar la apariencia)
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
    // 🆕 NUEVO: Estado para el registro rápido
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");

    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);

    // NUEVOS ESTADOS PARA FILTROS
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    // 🆕 NUEVO: Estado para el filtro de Tipo de Pago
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    // ⭐ NUEVO ESTADO PARA EL FILTRO POR NOMBRE
    const [filtroNombre, setFiltroNombre] = useState("");

    // Estado para el scroll superior (solo visual)
    const [scrollPosition, setScrollPosition] = useState(0);

    // Lista de especialidades únicas para el filtro
    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

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
                const nombreMesActual = obtenerNombreMesActual(); // Obtener el nombre del mes actual

                setMeses(mesesData);
                setClientes(clientesRes.data);
                setValorDiario(configRes.data.valorDiario || 8000);

                // ===========================================
                // ⭐ LÓGICA MODIFICADA
                // ===========================================
                if (mesesData.length > 0) {
                    const mesActualExiste = mesesData.find(m => m.nombre === nombreMesActual);
                    
                    if (mesActualExiste) {
                        // 1. Si existe un mes con el nombre actual (ej: "Diciembre 2025"), SELECCIONARLO.
                        setMesSeleccionado(nombreMesActual);
                    } else if (mesesData.length > 0) {
                        // 2. Si no existe, seleccionar el ÚLTIMO creado (o el primero de la lista si no hay un orden claro del backend), como estaba antes, como fallback.
                        // Asumo que mesesData[0] es el último/más reciente si no se encuentra el mes actual.
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
        if (!mesSeleccionado) return;
        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const todosPagos = res.data || [];
                // Se filtra el registro "SYSTEM" aquí
                const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

                // CÁLCULO DEL TOTAL GENERAL
                let total = 0;
                // Enriquecer los pagos con especialidad y tipoPago
                const pagosEnriquecidos = pagosReales.map(pago => {
                    const cliente = clientes.find(c =>
                        `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                    );

                    const especialidad = cliente?.especialidad || 'Sin Especialidad';
                    // 🆕 AJUSTE: Leer el campo tipoPago que el backend debe proveer
                    const tipoPago = pago.tipoPago || 'Efectivo'; // Ajustado a 'Efectivo' por defecto

                    // El total de cada documento es por un solo pago de valorDiario.
                    // Sumamos el total pagado en CADA documento.
                    total += pago.total || 0; 
                    
                    return { ...pago, especialidad, tipoPago };
                });

                setTotalRecaudado(total);
                // Actualizar pagosDelMes con la especialidad y tipoPago
                setPagosDelMes(pagosEnriquecidos);

            } catch (error) {
                console.error("Error cargando pagos:", error);
                setPagosDelMes([]);
                setTotalRecaudado(0);
            }
        };
        cargarPagos();
    }, [mesSeleccionado, valorDiario, clientes]);


    // ===========================================
    // ⭐ LÓGICA DE REGISTRO RÁPIDO Y RECARGA
    // ===========================================

    // REGISTRAR PAGO (Lógica actualizada para enviar tipoPago)
    const registrarPagoDia = async () => {
        if (!clienteSeleccionado) return alert("Selecciona una niña");
        if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31) return alert("Día inválido");
        if (!mesSeleccionado) return alert("Selecciona un mes");
        if (!tipoPagoSeleccionado) return alert("Selecciona el tipo de pago"); // 🆕 Validación de tipoPago

        try {
            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
                mes: mesSeleccionado,
                diasAsistidos: 1,
                total: valorDiario,
                diasPagados: [parseInt(diaSeleccionado)],
                tipoPago: tipoPagoSeleccionado, // 🆕 ENVIAR TIPO DE PAGO AL BACKEND
            });

            // --- RECARGAR Y RECALCULAR (Lógica de recarga optimizada y adaptada) ---
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

            let nuevoTotalGeneral = 0;
            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );
                const especialidad = cliente?.especialidad || 'Sin Especialidad';
                const tipoPago = pago.tipoPago || 'Efectivo';
                
                // Sumar el total de CADA documento de pago
                nuevoTotalGeneral += pago.total || 0;
                
                return { ...pago, especialidad, tipoPago }; // Incluir tipoPago
            });

            setPagosDelMes(pagosEnriquecidos);
            setTotalRecaudado(nuevoTotalGeneral);
            // ----------------------------------------------------------------------

            alert(`Día ${diaSeleccionado} registrado como pago (${tipoPagoSeleccionado})`);
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
            const mesesData = res.data;
            setMeses(mesesData);

            // Al crear un nuevo mes, lo seleccionamos automáticamente
            if (mesesData.find(m => m.nombre === nuevoMes.trim())) {
                    setMesSeleccionado(nuevoMes.trim());
            }

        } catch (error) {
            alert("Error al crear mes");
        }
    };

    // ===========================================
    // ⭐ LÓGICA DE FILTROS Y CÁLCULO DE TOTALES FILTRADOS
    // ===========================================

    const pagosFiltrados = useMemo(() => {
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

        // 3. Filtrar por Tipo de Pago 🆕
        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        // 4. Calcular Total basado en el Período y los filtros anteriores
        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia, 10);
            
            // Contar SÓLO los documentos que tienen este día pagado
            const pagosDiaFiltrado = pagos.filter(p => p.diasPagados.includes(diaNum));
            
            // El total es la suma de los totales de cada documento (cada documento es 8000)
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

            // Contar SÓLO los documentos que tienen AL MENOS un día en la semana pagado
            const pagosSemanaFiltrado = pagos.filter(p => 
                p.diasPagados.some(dia => diasSemana.includes(dia))
            );
            
            // La suma de los totales de los documentos, donde cada documento representa un pago de valorDiario.
            total = pagosSemanaFiltrado.reduce((sum, pago) => sum + (pago.total || 0), 0);
        }
        else { // MES (Por defecto o si no hay filtro de día/semana)
            // Calcular el total de todos los pagos que ya están filtrados por nombre, especialidad y tipoPago
            total = pagos.reduce((sum, pago) => sum + (pago.total || 0), 0);
        }

        // Devolvemos los pagos (filtrados por nombre, especialidad y tipoPago) y el total calculado.
        return {
            pagosFiltradosPorEspecialidad: pagos,
            totalFiltrado: total
        };

    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, filtroTipoPago, filtroNombre, valorDiario]); // ⭐ Agregamos filtroNombre

    // Lista de jugadoras filtradas (solo por especialidad, tipoPago y nombre)
    const jugadorasFiltradas = useMemo(() => {
        // Obtenemos los nombres únicos de las jugadoras que tienen pagos en la lista 'pagosFiltradosPorEspecialidad'
        // NOTA: Esta lista ya tiene aplicados los filtros de Nombre, Especialidad y Tipo de Pago.
        // NO tiene aplicados los filtros de Período (Día/Semana) si miramos la dependencia de 'pagosFiltrados' arriba.
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    // Función para obtener la especialidad de un jugador
    const getEspecialidadJugadora = (nombre) => {
        // Buscamos en la lista completa para no depender de filtros
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.especialidad || 'N/A';
    };

    // Función para obtener el tipo de pago de un jugador (se usa el tipo del PRIMER pago encontrado, para la columna "Tipo de Pago")
    const getTipoPagoJugadora = (nombre) => {
        // Buscamos en la lista completa para no depender de filtros
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.tipoPago || 'Efectivo'; 
    };

    // ===========================================
    // ⭐ FUNCIÓN CLAVE CORREGIDA: Contar pagos por día
    // Usa la lista de pagos ya filtrada por Nombre/Especialidad/TipoPago
    // ===========================================
    const getConteoPagosPorDia = (nombreJugadora) => {
        // Usamos la lista de pagos que ya tiene aplicados los filtros de Nombre, Especialidad y Tipo de Pago.
        // (pagosFiltradosPorEspecialidad es el nombre de la lista que no tiene el filtro de PERIODO)
        const pagosBase = pagosFiltrados.pagosFiltradosPorEspecialidad;
        
        // 1. Filtrar solo por el nombre de la JUGADORA (ya que los demás filtros fijos ya están aplicados en pagosBase)
        const pagosJugadora = pagosBase.filter(p => p.nombre.trim() === nombreJugadora.trim());
        
        // 2. Acumular el conteo de pagos por cada día (ej: { 10: 2, 12: 1 })
        const conteoPorDia = {};
        
        pagosJugadora.forEach(pago => {
            // Asumiendo que cada documento solo tiene UN día en diasPagados: [Día]
            const dia = pago.diasPagados?.[0]; 
            if (dia) {
                // CONTEO REAL: Sumar 1 por cada documento de pago encontrado para ese día
                conteoPorDia[dia] = (conteoPorDia[dia] || 0) + 1;
            }
        });

        // Retorna un objeto con el conteo: { 1: 1, 5: 2, 10: 1 }
        return conteoPorDia;
    };

    // Función para obtener el TOTAL de días pagados (documentos) por una jugadora, respetando filtros
    const getNumeroTotalPagos = (nombre) => {
        const conteoPorDia = getConteoPagosPorDia(nombre);
        // El número total de pagos es la suma de los valores en el objeto de conteo
        return Object.values(conteoPorDia).reduce((sum, count) => sum + count, 0);
    };

    // ===========================================
    // ⭐ FUNCIONES DE SCROLL SINCRONIZADO
    // ===========================================

    // Función para sincronizar el scroll superior con el inferior
    const syncScroll = (event) => {
        const scrollContainer = document.getElementById('scroll-table-bottom');
        if (scrollContainer) {
            scrollContainer.scrollLeft = event.target.scrollLeft;
            setScrollPosition(event.target.scrollLeft); // Solo para mantener el estado
        }
    };

    // useEffect para sincronizar el scroll inferior con el superior al manipular el superior
    useEffect(() => {
        const scrollContainer = document.getElementById('scroll-table-bottom');
        if (scrollContainer && scrollContainer.scrollLeft !== scrollPosition) {
            scrollContainer.scrollLeft = scrollPosition;
        }
    }, [scrollPosition]);


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

                        {/* ⭐ Filtro por Nombre */}
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

                        {/* Filtro por Especialidad */}
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

                        {/* Filtro por Tipo de Pago 🆕 */}
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

                        {/* Filtro por Período */}
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

                        {/* Input de Día o Semana, condicional */}
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

                        {/* Total Recaudado Filtrado */}
                        <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            TOTAL FILTRADO: ${pagosFiltrados.totalFiltrado.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>
                {/* --- FIN SECCIÓN DE FILTROS --- */}

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

                        {/* Selector de Tipo de Pago 🆕 */}
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
                {/* ⭐ SCROLL HORIZONTAL SUPERIOR (Nuevo) */}
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
                
                {/* =========================================== */}
                {/* ⭐ TABLA CON SCROLL HORIZONTAL INFERIOR (Modificado) */}
                {/* =========================================== */}
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
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Tipo de Pago</th> {/* 🆕 NUEVA COLUMNA */}
                                    {[...Array(31)].map((_, i) => (
                                        <th key={i + 1} style={{ ...thStyle, width: "60px" }}>{i + 1}</th>
                                    ))}
                                    <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Pagos</th> {/* Cambiado de 'Días' a 'Pagos' */}
                                    <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.length === 0 ? (
                                    <tr><td colSpan="36" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>No hay pagos este mes que coincidan con los filtros.</td></tr>
                                ) : (
                                    jugadorasFiltradas.map(nombre => {
                                        // ⭐ FUNCIÓN MODIFICADA: Ahora trae el conteo de pagos por día: { 10: 2, 12: 1 }
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
