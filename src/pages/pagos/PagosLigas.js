// src/pages/pagos/PagosLigas.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// ===========================================
// ⭐ FUNCIÓN AUXILIAR: Nombre del mes actual
// ===========================================
const obtenerNombreMesActual = () => {
    const date = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`;
};

// ===========================================
// ESTILOS (sin cambios)
// ===========================================
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
    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);

    // FILTROS
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

    // CARGAR DATOS INICIALES
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
                    setMesSeleccionado(mesActualExiste ? nombreMesActual : mesesData[0].nombre);
                }
            } catch (error) {
                console.error("Error inicial", error);
            }
        };
        cargarInicial();
    }, []);

    // CARGAR PAGOS Y TOTAL
    useEffect(() => {
        if (!mesSeleccionado) return;

        const cargarPagos = async () => {
            try {
                const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
                const todosPagos = res.data || [];
                const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre?.trim());

                const pagosEnriquecidos = pagosReales.map(pago => {
                    const cliente = clientes.find(c =>
                        `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                    );
                    return {
                        ...pago,
                        especialidad: cliente?.especialidad || "Sin Especialidad",
                        tipoPago: pago.tipoPago || "Efectivo",
                    };
                });

                setPagosDelMes(pagosEnriquecidos);

                let total = 0;
                pagosEnriquecidos.forEach(pago => {
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
    }, [mesSeleccionado, valorDiario, clientes]);

    // REGISTRAR PAGO (PERMITE DOBLE, TRIPLE, ETC.)
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

            // Recargar pagos
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre?.trim());

            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c =>
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );
                return {
                    ...pago,
                    especialidad: cliente?.especialidad || "Sin Especialidad",
                    tipoPago: pago.tipoPago || "Efectivo",
                };
            });

            setPagosDelMes(pagosEnriquecidos);

            let total = 0;
            pagosEnriquecidos.forEach(p => {
                if (p.diasPagados) total += p.diasPagados.length * valorDiario;
            });
            setTotalRecaudado(total);

            alert(`Pago registrado (Día ${diaSeleccionado})`);
            setDiaSeleccionado(""); // Deja la niña seleccionada para poder pagar otro día
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
        } catch (error) {
            alert("Error al crear mes");
        }
    };

    // NUEVA FUNCIÓN: CUENTA CUÁNTAS VECES PAGÓ UN DÍA
    const contarPagosEnDia = (nombre, dia) => {
        return pagosDelMes.filter(p =>
            p.nombre.trim() === nombre.trim() &&
            p.diasPagados?.includes(dia)
        ).length;
    };

    const getDiasPagados = (nombre) => {
        const pagos = pagosDelMes.filter(p => p.nombre.trim() === nombre.trim());
        const dias = new Set();
        pagos.forEach(p => (p.diasPagados || []).forEach(d => dias.add(d)));
        return Array.from(dias).sort((a, b) => a - b);
    };

    const jugadoras = [...new Set(pagosDelMes.map(p => p.nombre.trim()))].filter(Boolean);

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>
                    Control de Pagos de Ligas
                </h2>

                {/* CONTROLES */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
                        <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
                        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="">Seleccionar mes</option>
                            {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
                        </select>
                        <input type="number" value={valorDiario} onChange={(e) => setValorDiario(Number(e.target.value))} style={{ ...inputStyle, width: "140px" }} placeholder="Valor diario" />
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
                        TOTAL RECAUDADO: ${totalRecaudado.toLocaleString("es-CO")}
                    </div>
                </div>

                {/* REGISTRAR PAGO RÁPIDO */}
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
                    {clienteSeleccionado && (
                        <p style={{ marginTop: "1rem", fontSize: "1.3rem", color: "#166534", fontWeight: "bold" }}>
                            Seleccionada: {clienteSeleccionado.nombre} {clienteSeleccionado.apellido}
                        </p>
                    )}
                </div>

                {/* TABLA CON DOBLE PAGO */}
                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2400px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "250px" }}>Jugadora</th>
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
                                                {[...Array(31)].map((_, i) => {
                                                    const dia = i + 1;
                                                    const cantidad = contarPagosEnDia(nombre, dia);
                                                    return (
                                                        <td key={dia} style={{ textAlign: "center", padding: "0.8rem 0" }}>
                                                            {cantidad > 0 && (
                                                                <span style={{ color: "#22c55e", fontSize: "1.8rem", fontWeight: "bold" }}>
                                                                    {"X ".repeat(cantidad)}
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
