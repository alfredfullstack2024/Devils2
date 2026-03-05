import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// Configuración de Meses y Estilos base
const MESES_ANIO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const TIPOS_PAGO = ["TODOS", "Efectivo", "Nequi"];

const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

const Pagames = () => {
    // Estados principales
    const [anios, setAnios] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString());
    const [nuevoAnio, setNuevoAnio] = useState("");
    const [clientes, setClientes] = useState([]);
    const [pagosDelAnio, setPagosDelAnio] = useState([]);

    // Estados Registro Rápido
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [planSeleccionado, setPlanSeleccionado] = useState("Plan Black");
    const [valorManual, setValorManual] = useState("");
    const [mesAPagar, setMesAPagar] = useState("");
    const [tipoPagoSeleccionado, setTipoPagoSeleccionado] = useState("Efectivo");

    // Estados Filtros
    const [filtroNombre, setFiltroNombre] = useState("");
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("TODO EL AÑO");

    const backendURL = "https://backend-5zxh.onrender.com/api";

    const cargarDatosIniciales = async () => {
        try {
            const [aniosRes, clientesRes] = await Promise.all([
                axios.get(`${backendURL}/paga-mes/anios`),
                obtenerClientes()
            ]);
            setAnios(aniosRes.data);
            setClientes(clientesRes.data);
            if (aniosRes.data.length > 0 && !anioSeleccionado) {
                setAnioSeleccionado(aniosRes.data[0].nombre);
            }
        } catch (error) { console.error("Error inicial:", error); }
    };

    const cargarPagos = async () => {
        if (!anioSeleccionado) return;
        try {
            const res = await axios.get(`${backendURL}/paga-mes/pagos/${anioSeleccionado}`);
            const pagosReales = res.data.filter(p => p.nombre !== "SYSTEM");
            
            // Enriquecer cada pago con la especialidad real del cliente desde la BD
            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c => 
                    `${c.nombre} ${c.apellido}`.trim().toUpperCase() === pago.nombre.toUpperCase()
                );
                return { ...pago, especialidad: cliente?.especialidad || "Sin Especialidad" };
            });
            setPagosDelAnio(pagosEnriquecidos);
        } catch (error) { console.error("Error cargando pagos:", error); }
    };

    useEffect(() => { cargarDatosIniciales(); }, []);
    useEffect(() => { cargarPagos(); }, [anioSeleccionado, clientes]);

    const crearAnio = async () => {
        if (!nuevoAnio.trim()) return alert("Escribe un año");
        try {
            await axios.post(`${backendURL}/paga-mes/crear-anio`, { nombre: nuevoAnio.trim() });
            alert("Año creado");
            setNuevoAnio("");
            cargarDatosIniciales();
        } catch (error) { alert("Error al crear año"); }
    };

    const registrarPago = async () => {
        if (!clienteSeleccionado || !mesAPagar || !valorManual) return alert("Completa todos los campos");
        try {
            await axios.post(`${backendURL}/paga-mes/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim().toUpperCase(),
                anio: anioSeleccionado,
                plan: planSeleccionado,
                total: Number(valorManual),
                mesesPagados: [mesAPagar],
                tipoPago: tipoPagoSeleccionado
            });
            alert("Pago registrado correctamente");
            setSearchCliente("");
            setValorManual("");
            setMesAPagar("");
            cargarPagos();
        } catch (error) { alert("Error al registrar pago"); }
    };

    // Lógica de Filtros Dinámicos
    const especialidadesDisponibles = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    const datosFiltrados = useMemo(() => {
        let pagos = pagosDelAnio;

        if (filtroNombre.trim()) {
            pagos = pagos.filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
        }
        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }
        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }
        
        // Filtro de periodo
        if (filtroPeriodo !== "TODO EL AÑO") {
            pagos = pagos.filter(p => p.mesesPagados.includes(filtroPeriodo));
        }

        const total = pagos.reduce((acc, p) => acc + p.total, 0);
        return { pagos, total };
        
        // AQUÍ ESTABA EL ERROR: faltaba agregar filtroPeriodo al final
    }, [pagosDelAnio, filtroNombre, filtroEspecialidad, filtroTipoPago, filtroPeriodo]);
    const nombresUnicosFiltrados = useMemo(() => {
        return [...new Set(datosFiltrados.pagos.map(p => p.nombre))];
    }, [datosFiltrados.pagos]);

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                
                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>Control de Pagos Mensuales</h2>

                {/* --- SECCIÓN CABECERA --- */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        <input type="text" placeholder="2026" value={nuevoAnio} onChange={(e) => setNuevoAnio(e.target.value)} style={{ ...inputStyle, width: "150px" }} />
                        <button onClick={crearAnio} style={btnPrimary}>Crear Año</button>
                        <select value={anioSeleccionado} onChange={(e) => setAnioSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="">Seleccionar año</option>
                            {anios.map(a => <option key={a._id} value={a.nombre}>{a.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1rem 3rem", borderRadius: "1.5rem", fontSize: "2rem", fontWeight: "bold" }}>
                        RECAUDADO AÑO: ${pagosDelAnio.reduce((acc, p) => acc + p.total, 0).toLocaleString("es-CO")}
                    </div>
                </div>

                {/* --- REGISTRADOR PAGO RÁPIDO (Verde) --- */}
                <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "4px solid #22c55e" }}>
                    <h4 style={{ color: "#166534", marginBottom: "1rem" }}>Nuevo Registro de Pago</h4>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input
                            type="text" placeholder="Nombre de la niña..." value={searchCliente}
                            onChange={(e) => {
                                setSearchCliente(e.target.value);
                                const encontrada = clientes.find(c => `${c.nombre} ${c.apellido}`.toLowerCase() === e.target.value.toLowerCase().trim());
                                setClienteSeleccionado(encontrada || null);
                            }}
                            list="clientes-list" style={{ ...inputStyle, width: "350px" }}
                        />
                        <datalist id="clientes-list">
                            {clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}
                        </datalist>

                        <select style={selectStyle} value={planSeleccionado} onChange={e => setPlanSeleccionado(e.target.value)}>
                            <option value="Plan Black">Plan Black</option>
                            <option value="Plan White">Plan White</option>
                            <option value="Plan Gold">Plan Gold</option>
                        </select>

                        <input type="number" placeholder="Valor $" style={{ ...inputStyle, width: "180px" }} value={valorManual} onChange={e => setValorManual(e.target.value)} />

                        <select style={selectStyle} value={mesAPagar} onChange={e => setMesAPagar(e.target.value)}>
                            <option value="">Mes a pagar</option>
                            {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <select style={selectStyle} value={tipoPagoSeleccionado} onChange={e => setTipoPagoSeleccionado(e.target.value)}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Nequi">Nequi</option>
                        </select>

                        <button onClick={registrarPago} style={btnSuccess}>Registrar Pago</button>
                    </div>
                </div>

                {/* --- SECCIÓN FILTROS (Azul) --- */}
                <div style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "2px solid #3b82f6" }}>
                    <h3 style={{ margin: "0 0 1rem 0", color: "#1d4ed8", fontSize: "1.4rem" }}>Filtros de Pagos</h3>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Nombre</label>
                            <input type="text" placeholder="Filtrar por nombre" value={filtroNombre} onChange={e => setFiltroNombre(e.target.value)} style={{ ...inputStyle, padding: "0.6rem", width: "250px" }} />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Especialidad</label>
                            <select value={filtroEspecialidad} onChange={e => setFiltroEspecialidad(e.target.value)} style={{ ...selectStyle, padding: "0.6rem" }}>
                                {especialidadesDisponibles.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column" }}>
                            <label style={{ fontSize: "0.9rem", color: "#475569" }}>Tipo de Pago</label>
                            <select value={filtroTipoPago} onChange={e => setFiltroTipoPago(e.target.value)} style={{ ...selectStyle, padding: "0.6rem" }}>
                                {TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                       <div style={{ display: "flex", flexDirection: "column" }}>
    <label style={{ fontSize: "0.9rem", color: "#475569" }}>Periodo</label>
    <select value={filtroPeriodo} onChange={e => setFiltroPeriodo(e.target.value)} style={{ ...selectStyle, padding: "0.6rem" }}>
        <option value="TODO EL AÑO">Todo el año</option>
        {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
    </select>
</div>
                        <div style={{ background: "#064e3b", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            TOTAL FILTRADO: ${datosFiltrados.total.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>

                {/* --- TABLA DE DATOS --- */}
                <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1600px" }}>
                        <thead>
                            <tr style={{ background: "#1e293b", color: "white" }}>
                                <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10 }}>Jugadora</th>
                                <th style={{ ...thStyle, background: "#334155" }}>Especialidad</th>
                                <th style={{ ...thStyle, background: "#334155" }}>Plan</th>
                                {MESES_ANIO.map(m => <th key={m} style={thStyle}>{m.substring(0, 3)}</th>)}
                                <th style={{ ...thStyle, background: "#172554" }}>Meses</th>
                                <th style={{ ...thStyle, background: "#172554" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {nombresUnicosFiltrados.map(nombre => {
                                const pagosPersona = datosFiltrados.pagos.filter(p => p.nombre === nombre);
                                const mesesPagados = new Set(pagosPersona.flatMap(p => p.mesesPagados));
                                const totalDinero = pagosPersona.reduce((acc, p) => acc + p.total, 0);
                                const especialidad = pagosPersona[0]?.especialidad || "N/A";
                                
                                return (
                                    <tr key={nombre} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                        <td style={{ ...tdStyle, fontWeight: "bold", textAlign: "left", position: "sticky", left: 0, background: "white" }}>{nombre}</td>
                                        <td style={tdStyle}>{especialidad}</td>
                                        <td style={tdStyle}>{pagosPersona[0]?.plan}</td>
                                        {MESES_ANIO.map(m => (
                                            <td key={m} style={{ ...tdStyle, color: mesesPagados.has(m) ? "#22c55e" : "#e2e8f0", fontSize: "1.5rem" }}>
                                                {mesesPagados.has(m) ? "✔" : "○"}
                                            </td>
                                        ))}
                                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#0891b2" }}>{mesesPagados.size}</td>
                                        <td style={{ ...tdStyle, fontWeight: "bold", color: "#166534" }}>${totalDinero.toLocaleString("es-CO")}</td>
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

export default Pagames;
