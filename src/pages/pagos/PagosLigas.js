// src/pages/pagos/PagosLigas.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

const obtenerNombreMesActual = () => {
    const date = new Date();
    const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    const nombreMes = meses[date.getMonth()];
    const anio = date.getFullYear();
    return `${nombreMes} ${anio}`;
};

// --- ESTILOS ---
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
    const [comentario, setComentario] = useState(""); 

    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);
    
    // Filtros que habías definido
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES");
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    const [filtroTipoPago, setFiltroTipoPago] = useState("TODOS");
    const [filtroNombre, setFiltroNombre] = useState("");

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    const especialidades = useMemo(() => {
        const specs = new Set(clientes.map(c => c.especialidad).filter(Boolean));
        return ["TODAS", ...Array.from(specs).sort()];
    }, [clientes]);

    // Función para enriquecer los pagos con la info del cliente (Especialidad)
    const enriquecerDatos = (pagosPlanos, listaClientes) => {
        return pagosPlanos.map(pago => {
            const cliente = listaClientes.find(c => 
                `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
            );
            return { 
                ...pago, 
                especialidad: cliente?.especialidad || 'Sin Especialidad',
                // Aseguramos que diasPagados siempre sea un array para que no falle el .includes
                diasPagados: pago.diasPagados || [] 
            };
        });
    };

    const cargarPagos = async (mes) => {
        if (!mes) return;
        try {
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mes}`);
            const pagosReales = (res.data || []).filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");
            
            const pagosEnriquecidos = enriquecerDatos(pagosReales, clientes);
            
            let total = 0;
            pagosEnriquecidos.forEach(p => {
                total += (p.diasPagados?.length || 0) * valorDiario;
            });

            setTotalRecaudado(total);
            setPagosDelMes(pagosEnriquecidos);
        } catch (error) {
            console.error("Error cargando pagos:", error);
        }
    };

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
            } catch (error) { console.error("Error inicial", error); }
        };
        cargarInicial();
    }, [backendURL]);

    // Cada vez que cambie el mes o los clientes, recargamos
    useEffect(() => {
        if (mesSeleccionado && clientes.length > 0) {
            cargarPagos(mesSeleccionado);
        }
    }, [mesSeleccionado, clientes, valorDiario]);

    const registrarPagoDia = async () => {
        if (!clienteSeleccionado || !diaSeleccionado) return alert("Completa los datos");
        try {
            await axios.post(`${backendURL}/pagos-ligas/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
                mes: mesSeleccionado,
                diasAsistidos: 1,
                total: valorDiario,
                diasPagados: [parseInt(diaSeleccionado)],
                tipoPago: tipoPagoSeleccionado,
                comentario: comentario 
            });
            
            alert("Registrado con éxito");
            setSearchCliente("");
            setDiaSeleccionado("");
            setComentario("");
            
            // Recarga automática de la tabla
            await cargarPagos(mesSeleccionado);
        } catch (error) { 
            console.error(error);
            alert("Error al registrar"); 
        }
    };

    const crearMes = async () => {
        if (!nuevoMes.trim()) return;
        try {
            await axios.post(`${backendURL}/pagos-ligas/crear-mes`, { nombre: nuevoMes });
            setNuevoMes("");
            const res = await axios.get(`${backendURL}/pagos-ligas/meses`);
            setMeses(res.data);
            setMesSeleccionado(nuevoMes);
        } catch (error) { alert("Error al crear mes"); }
    };

    // --- LÓGICA DE FILTRADO COMPLETA ---
    const { pagosFiltradosActuales, totalFiltrado } = useMemo(() => {
        let pagos = [...pagosDelMes];

        if (filtroNombre.trim()) {
            pagos = pagos.filter(p => p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
        }
        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }
        if (filtroTipoPago !== "TODOS") {
            pagos = pagos.filter(p => p.tipoPago === filtroTipoPago);
        }

        let total = 0;
        // Filtro por Día Específico
        if (filtroPeriodo === "DIA" && filtroDia) {
            const diaNum = parseInt(filtroDia);
            pagos.forEach(p => {
                if (p.diasPagados?.includes(diaNum)) total += valorDiario;
            });
        } 
        // Filtro por Semana (Ejemplo: Semana 1 = días 1 al 7)
        else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            const sem = parseInt(filtroSemana);
            const inicio = (sem - 1) * 7 + 1;
            const fin = sem * 7;
            pagos.forEach(p => {
                const diasEnSemana = p.diasPagados?.filter(d => d >= inicio && d <= fin).length || 0;
                total += diasEnSemana * valorDiario;
            });
        }
        else {
            pagos.forEach(p => total += (p.diasPagados?.length || 0) * valorDiario);
        }

        return { pagosFiltradosActuales: pagos, totalFiltrado: total };
    }, [pagosDelMes, filtroNombre, filtroEspecialidad, filtroTipoPago, filtroPeriodo, filtroDia, filtroSemana, valorDiario]);

    const jugadorasUnicas = [...new Set(pagosFiltradosActuales.map(p => p.nombre))];

    return (
        <div style={{ padding: "2rem", background: "#f8fafc", minHeight: "100vh" }}>
            <div style={{ maxWidth: "2200px", margin: "0 auto", background: "white", borderRadius: "1.5rem", padding: "2.5rem", boxShadow: "0 20px 40px rgba(0,0,0,0.1)" }}>
                
                <h2 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "2rem", color: "#1e293b" }}>Control de Pagos de Ligas</h2>
                
                {/* SECCIÓN SUPERIOR: CREACIÓN Y TOTAL */}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1.5rem", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Ej: Noviembre 2025" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} style={inputStyle} />
                        <button onClick={crearMes} style={btnPrimary}>Crear Mes</button>
                        <select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="">Seleccionar mes</option>
                            {meses.map(m => <option key={m._id} value={m.nombre}>{m.nombre}</option>)}
                        </select>
                    </div>
                    <div style={{ background: "#172554", color: "white", padding: "1.5rem 4rem", borderRadius: "1.5rem", fontSize: "2.5rem", fontWeight: "bold" }}>
                        TOTAL MES: ${totalRecaudado.toLocaleString("es-CO")}
                    </div>
                </div>

                {/* FILTROS AVANZADOS */}
                <div style={{ background: "#eff6ff", padding: "1.5rem", borderRadius: "1.5rem", marginBottom: "2rem", border: "2px solid #3b82f6" }}>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input type="text" placeholder="Filtrar por nombre" value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} style={{...inputStyle, width: "300px"}} />
                        
                        <select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)} style={selectStyle}>
                            {especialidades.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>

                        <select value={filtroTipoPago} onChange={(e) => setFiltroTipoPago(e.target.value)} style={selectStyle}>
                            {TIPOS_PAGO.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>

                        <div style={{ background: "#065f46", color: "white", padding: "1rem 2rem", borderRadius: "1rem", fontSize: "1.5rem", fontWeight: "bold", marginLeft: "auto" }}>
                            TOTAL FILTRADO: ${totalFiltrado.toLocaleString("es-CO")}
                        </div>
                    </div>
                </div>

                {/* REGISTRADOR RÁPIDO */}
                <div style={{ background: "#f0fdf4", padding: "2rem", borderRadius: "1.5rem", marginBottom: "3rem", border: "4px solid #22c55e" }}>
                    <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
                        <input list="clientes-list" placeholder="Nombre de la niña..." value={searchCliente} 
                            onChange={(e) => {
                                setSearchCliente(e.target.value);
                                const f = clientes.find(c => `${c.nombre} ${c.apellido}`.toLowerCase() === e.target.value.toLowerCase().trim());
                                setClienteSeleccionado(f);
                            }} style={{...inputStyle, flex: 1}} 
                        />
                        <datalist id="clientes-list">{clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}</datalist>
                        
                        <input type="number" placeholder="Día" value={diaSeleccionado} onChange={(e) => setDiaSeleccionado(e.target.value)} style={{...inputStyle, width: "100px"}} />
                        
                        <input type="text" placeholder="Comentario..." value={comentario} onChange={(e) => setComentario(e.target.value)} style={{...inputStyle, flex: 1}} />

                        <select value={tipoPagoSeleccionado} onChange={(e) => setTipoPagoSeleccionado(e.target.value)} style={selectStyle}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Nequi">Nequi</option>
                        </select>
                        <button onClick={registrarPagoDia} style={btnSuccess}>Marcar Día {diaSeleccionado || "?"}</button>
                    </div>
                </div>

                {/* TABLA PRINCIPAL */}
                <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                    <table style={{ width: "100%", minWidth: "2550px", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#1e293b", color: "white" }}>
                                <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10 }}>Jugadora</th>
                                <th style={thStyle}>Especialidad</th>
                                <th style={thStyle}>Tipo Pago</th>
                                {[...Array(31)].map((_, i) => <th key={i} style={thStyle}>{i + 1}</th>)}
                                <th style={{...thStyle, background: "#0f172a"}}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {jugadorasUnicas.map(nom => {
                                const pgs = pagosFiltradosActuales.filter(p => p.nombre === nom);
                                // Mapeo de días para esta jugadora
                                const diasMap = {};
                                pgs.forEach(p => {
                                    if (p.diasPagados) {
                                        p.diasPagados.forEach(d => diasMap[d] = p);
                                    }
                                });

                                return (
                                    <tr key={nom} style={{ borderBottom: "1px solid #e2e8f0" }}>
                                        <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9 }}>{nom}</td>
                                        <td style={tdStyle}>{pgs[0]?.especialidad || "---"}</td>
                                        <td style={{...tdStyle, color: pgs[0]?.tipoPago === 'Nequi' ? '#f59e0b' : '#10b981', fontWeight: "bold"}}>
                                            {pgs[0]?.tipoPago}
                                        </td>
                                        {[...Array(31)].map((_, i) => {
                                            const d = i + 1;
                                            const info = diasMap[d];
                                            if (!info) return <td key={i} style={{...tdStyle, color: "#cbd5e1"}}>-</td>;

                                            const hoy = new Date().getDate();
                                            const colorEstado = d === hoy ? "#2563eb" : (d > hoy ? "#f59e0b" : "#22c55e");

                                            return (
                                                <td key={i} style={{ 
                                                    ...tdStyle, 
                                                    color: colorEstado, 
                                                    cursor: info.comentario ? "help" : "default",
                                                    fontSize: "1.2rem"
                                                }} title={info.comentario || "Pago registrado"}>
                                                    {info.comentario ? "💬" : "X"}
                                                </td>
                                            );
                                        })}
                                        <td style={{...tdStyle, fontWeight: "bold", background: "#f1f5f9"}}>
                                            ${(pgs.reduce((a, b) => a + (b.diasPagados?.length || 0), 0) * valorDiario).toLocaleString()}
                                        </td>
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
