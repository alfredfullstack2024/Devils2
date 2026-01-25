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
    const [esDiaDiferenteAHoy, setEsDiaDiferenteAHoy] = useState(false);
const [comentarioPago, setComentarioPago] = useState("");
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
                    const tipoPago = pago.tipoPago || 'N/A';

                    if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
                        total += pago.diasPagados.length * valorDiario;
                    }

                    return { ...pago, especialidad, tipoPago };
                });

                // CARGAR PAGOS Y CALCULAR TOTAL (TOTAL GENERAL)
useEffect(() => {
    if (!mesSeleccionado) return;

    const cargarPagos = async () => {
        try {
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(
                p => p.nombre !== "SYSTEM" && p.nombre.trim() !== ""
            );

            let total = 0;

            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );

                const especialidad = cliente?.especialidad || "Sin Especialidad";
                const tipoPago = pago.tipoPago || "N/A";

                if (Array.isArray(pago.diasPagados)) {
                    total += pago.diasPagados.length * valorDiario;
                }

                return { ...pago, especialidad, tipoPago };
            });

            setPagosDelMes(pagosEnriquecidos);
            setTotalRecaudado(total);

        } catch (error) {
            console.error("Error cargando pagos:", error);
            setPagosDelMes([]);
            setTotalRecaudado(0);
        }
    };

    cargarPagos();
}, [mesSeleccionado, valorDiario, clientes]);

    // REGISTRAR PAGO (Lógica actualizada para enviar tipoPago)
    const registrarPagoDia = async () => {
    if (!clienteSeleccionado) return alert("Selecciona una niña");
    if (!diaSeleccionado || diaSeleccionado < 1 || diaSeleccionado > 31) return alert("Día inválido");
    if (!mesSeleccionado) return alert("Selecciona un mes");
    if (!tipoPagoSeleccionado) return alert("Selecciona el tipo de pago");

    const hoy = new Date().getDate();

    if (Number(diaSeleccionado) !== hoy && !comentarioPago.trim()) {
        return alert("Debes agregar un comentario cuando registras pagos de otro día");
    }

    try {
        await axios.post(`${backendURL}/pagos-ligas/pagos`, {
            nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
            mes: mesSeleccionado,
            diasAsistidos: 1,
            total: valorDiario,
            diasPagados: [parseInt(diaSeleccionado)],
            tipoPago: tipoPagoSeleccionado,
            comentario: Number(diaSeleccionado) !== hoy ? comentarioPago.trim() : "",
        });

        alert(`Día ${diaSeleccionado} registrado correctamente`);

        setSearchCliente("");
        setClienteSeleccionado(null);
        setDiaSeleccionado("");
        setComentarioPago("");
        setEsDiaDiferenteAHoy(false);

    } catch (error) {
        console.error(error);
        alert("Error al registrar pago");
    }
};



            // Recargar y recalcular
           
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

    // LÓGICA DE FILTROS Y CÁLCULO DE TOTALES FILTRADOS

    const pagosFiltrados = useMemo(() => {
        let pagos = pagosDelMes;
        let total = 0;

        // ⭐ 1. Filtrar por Nombre
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

        // 4. Filtrar por Período
        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia, 10);

            const jugadoresConDiaPagado = new Set();
            pagos.forEach(pago => {
                if (pago.diasPagados.includes(diaNum)) {
                    jugadoresConDiaPagado.add(pago.nombre.trim());
                }
            });

            // El total es el número de jugadores que pagaron ESE día (considerando todos los filtros anteriores)
            total = jugadoresConDiaPagado.size * valorDiario;
        }
        else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            const semanaNum = parseInt(filtroSemana, 10);

            let diasSemana = [];
            if (semanaNum === 1) diasSemana = [1, 2, 3, 4, 5, 6, 7];
            else if (semanaNum === 2) diasSemana = [8, 9, 10, 11, 12, 13, 14];
            else if (semanaNum === 3) diasSemana = [15, 16, 17, 18, 19, 20, 21];
            else if (semanaNum === 4) diasSemana = [22, 23, 24, 25, 26, 27, 28];
            else if (semanaNum === 5) diasSemana = [29, 30, 31];

            const diasPagadosEnSemana = new Set();
            // Contar la cantidad de pares únicos (jugador-día) que cumplen el filtro
            pagos.forEach(pago => {
                pago.diasPagados.forEach(dia => {
                    if (diasSemana.includes(dia)) {
                        diasPagadosEnSemana.add(`${pago.nombre.trim()}-${dia}`);
                    }
                });
            });

            total = diasPagadosEnSemana.size * valorDiario;
        }
        else { // MES (Por defecto o si no hay filtro de día/semana)
            // Calcular el total de todos los pagos que ya están filtrados por nombre, especialidad y tipoPago
            let totalDias = 0;
            pagos.forEach(pago => {
                totalDias += pago.diasPagados?.length || 0;
            }
            );
            total = totalDias * valorDiario;
        }

        // Devolvemos los pagos (filtrados por nombre, especialidad y tipoPago) y el total calculado.
        return {
            pagosFiltradosPorEspecialidad: pagos,
            totalFiltrado: total
        };

    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, filtroTipoPago, filtroNombre, valorDiario]); // ⭐ Agregamos filtroNombre

    // Lista de jugadoras filtradas (solo por especialidad, tipoPago y nombre)
    const jugadorasFiltradas = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    // Función para obtener la especialidad de un jugador
    const getEspecialidadJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.especialidad || 'N/A';
    };

    // Función para obtener el tipo de pago de un jugador (se usa el primer tipo encontrado, solo si el filtro es TODOS)
    // Cuando hay un filtro de tipo pago, este valor será siempre el valor del filtro.
    const getTipoPagoJugadora = (nombre) => {
        const pago = pagosDelMes.find(c => c.nombre.trim() === nombre.trim());
        return pago?.tipoPago || 'Efectivo'; // Asumir 'Efectivo' si no se encuentra
    };

    // Función para obtener los días pagados, ahora usando solo los pagos filtrados
    const getDiasPagadosFiltrados = (nombre) => {
        // En el caso de que se filtre por Tipo de Pago, solo contamos los días registrados con ESE tipo.
        const pagos = pagosFiltrados.pagosFiltradosPorEspecialidad.filter(p => p.nombre.trim() === nombre.trim());
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

                        <input
  type="number"
  min="1"
  max="31"
  placeholder="Día"
  value={diaSeleccionado}
  onChange={(e) => {
    const dia = e.target.value;
    setDiaSeleccionado(dia);

    const hoy = new Date().getDate();
    setEsDiaDiferenteAHoy(Number(dia) !== hoy);
    if (Number(dia) === hoy) setComentarioPago("");
  }}
  style={{ ...inputStyle, width: "100px" }}
/>
{esDiaDiferenteAHoy && (
  <input
    type="text"
    placeholder="Hoy se registraron pagos de los días: ej 26, 27"
    value={comentarioPago}
    onChange={(e) => setComentarioPago(e.target.value)}
    style={{
      ...inputStyle,
      width: "420px",
      borderColor: "#f97316",
      background: "#fff7ed"
    }}
  />
)}

                        <button onClick={registrarPagoDia} style={btnSuccess}>
                            Marcar Día {diaSeleccionado || "?"} como Pagado
                        </button>
                    </div>
                </div>
                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2550px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "200px" }}>Jugadora</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Especialidad</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Tipo de Pago</th> {/* 🆕 NUEVA COLUMNA */}
                                    {[...Array(31)].map((_, i) => (
                                        <th key={i + 1} style={{ ...thStyle, width: "60px" }}>{i + 1}</th>
                                    ))}
                                    <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Días</th>
                                    <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.length === 0 ? (
                                    <tr><td colSpan="36" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>No hay pagos este mes que coincidan con los filtros.</td></tr>
                                ) : (
                                    jugadorasFiltradas.map(nombre => {
                                        const dias = getDiasPagadosFiltrados(nombre);
                                        const total = dias.length * valorDiario;
                                        const especialidad = getEspecialidadJugadora(nombre);
                                        const tipoPago = getTipoPagoJugadora(nombre);
                                        return (
                                            <tr key={nombre}>
                                                <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9, textAlign: "left" }}>
                                                    {nombre}
                                                </td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9", color: "#475569" }}>
                                                    **{especialidad}** </td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9", color: tipoPago === 'Nequi' ? '#ea580c' : '#16a34a' }}> {/* Color condicional para diferenciar */}
                                                    **{tipoPago}** </td>
                                                {[...Array(31)].map((_, i) => {
                                                    const pagado = dias.includes(i + 1);
                                                    return (
                                                        <td key={i + 1} style={{ textAlign: "center", padding: "0.8rem 0" }}>
                                                            {pagado && (
  <span
    title={pagosDelMes.find(p => p.nombre.trim() === nombre.trim())?.comentario || ""}
    style={{ color: "#22c55e", fontSize: "1.8rem", fontWeight: "bold", cursor: "help" }}
  >
    X
  </span>
)}

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

export default PagosLigas;
