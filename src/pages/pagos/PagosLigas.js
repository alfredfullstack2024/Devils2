// src/pages/pagos/PagosLigas.js
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

// Estilos (dejados igual para no alterar la apariencia)
const inputStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const selectStyle = { padding: "1rem", borderRadius: "0.8rem", border: "2px solid #94a3b8", fontSize: "1.1rem" };
const btnPrimary = { background: "#4f46e5", color: "white", padding: "1rem 2rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const btnSuccess = { background: "#22c55e", color: "white", padding: "1rem 3rem", borderRadius: "0.8rem", border: "none", cursor: "pointer", fontWeight: "bold" };
const thStyle = { padding: "1.2rem 0.5rem", textAlign: "center", fontWeight: "bold" };
const tdStyle = { padding: "1rem 0.5rem", textAlign: "center" };

const PagosLigas = () => {
    const [meses, setMeses] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [nuevoMes, setNuevoMes] = useState("");
    const [valorDiario, setValorDiario] = useState(8000); // ← editable
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState("");
    const [pagosDelMes, setPagosDelMes] = useState([]);
    const [totalRecaudado, setTotalRecaudado] = useState(0);

    // NUEVOS ESTADOS PARA FILTROS
    const [filtroEspecialidad, setFiltroEspecialidad] = useState("TODAS");
    const [filtroPeriodo, setFiltroPeriodo] = useState("MES"); // Puede ser 'DIA', 'SEMANA', 'MES'
    const [filtroDia, setFiltroDia] = useState("");
    const [filtroSemana, setFiltroSemana] = useState("");
    
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
                setMeses(mesesRes.data);
                // Asegurar que especialidad es cargada
                setClientes(clientesRes.data);
                setValorDiario(configRes.data.valorDiario || 8000);
                if (mesesRes.data.length > 0) {
                    setMesSeleccionado(mesesRes.data[0].nombre);
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
                // FILTRAR "SYSTEM" AQUÍ EN EL FRONTEND
                const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");
                setPagosDelMes(pagosReales);
                
                // CÁLCULO DEL TOTAL GENERAL
                let total = 0;
                // Enriquecer los pagos con la especialidad para el cálculo correcto y la tabla
                const pagosEnriquecidos = pagosReales.map(pago => {
                    // Buscar el cliente por nombre completo, asumiendo que es único
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
                // Actualizar pagosDelMes con la especialidad
                setPagosDelMes(pagosEnriquecidos);

            } catch (error) {
                console.error("Error cargando pagos:", error);
                setPagosDelMes([]);
                setTotalRecaudado(0);
            }
        };
        cargarPagos();
    }, [mesSeleccionado, valorDiario, clientes]); // Agregar 'clientes' como dependencia

    // REGISTRAR PAGO (Lógica sin cambios, solo se actualiza la recarga para usar el total enriquecido)
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
            });
            // Recargar
            const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
            const todosPagos = res.data || [];
            const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");
            
            // Enriquecer y calcular de nuevo (duplicado de lógica para recarga)
            let nuevoTotalGeneral = 0;
            const pagosEnriquecidos = pagosReales.map(pago => {
                const cliente = clientes.find(c => 
                    `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
                );
                const especialidad = cliente?.especialidad || 'Sin Especialidad';
                if (pago.diasPagados && Array.isArray(pago.diasPagados)) {
                    nuevoTotalGeneral += pago.diasPagados.length * valorDiario;
                }
                return { ...pago, especialidad };
            });

            setPagosDelMes(pagosEnriquecidos);
            setTotalRecaudado(nuevoTotalGeneral);

            alert(`Día ${diaSeleccionado} registrado`);
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
        } catch (error) {
            alert("Error al crear mes");
        }
    };

    const getDiasPagados = (nombre) => {
        const pagos = pagosDelMes.filter(p => p.nombre.trim() === nombre.trim());
        const dias = new Set();
        pagos.forEach(p => (p.diasPagados || []).forEach(d => dias.add(d)));
        return Array.from(dias).sort((a, b) => a - b);
    };

    const jugadoras = [...new Set(pagosDelMes.map(p => p.nombre.trim()))].filter(Boolean);


    // LÓGICA DE FILTROS Y CÁLCULO DE TOTALES FILTRADOS

    // Filtrar los pagos según los filtros seleccionados
    const pagosFiltrados = useMemo(() => {
        let pagos = pagosDelMes;
        let total = 0;
        let diasPagadosFiltrados = [];

        // 1. Filtrar por Especialidad
        if (filtroEspecialidad !== "TODAS") {
            pagos = pagos.filter(p => p.especialidad === filtroEspecialidad);
        }

        // 2. Filtrar por Período
        if (filtroPeriodo === "DIA" && filtroDia) {
            // Obtener el día a filtrar (número)
            const diaNum = parseInt(filtroDia, 10);
            
            // Un solo pago por jugador puede tener varios días.
            // Creamos una lista única de jugadores que han pagado el día y calculamos el total
            const jugadoresConDiaPagado = new Set();
            pagos.forEach(pago => {
                if (pago.diasPagados.includes(diaNum)) {
                    jugadoresConDiaPagado.add(pago.nombre.trim());
                }
            });
            
            // Para el cálculo del total filtrado, cada jugador cuenta como 1 día pagado si pagó ESE día.
            total = jugadoresConDiaPagado.size * valorDiario;
            
            // Para la tabla, filtramos solo los jugadores que pagaron ese día
            const nombresFiltrados = Array.from(jugadoresConDiaPagado);
            // Creamos un subconjunto de `pagosDelMes` solo con los jugadores filtrados
            // y con el día filtrado. Esto es complejo para la tabla, la tabla MUESTRA TODOS los días
            // para todos los jugadores. Pero los totales deben ser correctos.
            
            // Dado que la tabla es de DÍAS (1-31), el filtro de DÍA solo afecta el total.
            // Si quieres que la tabla solo muestre el pago de ESE día, necesitarías reescribir `getDiasPagados`.
            
            // Simplificamos: Si el filtro es por DÍA, solo mostramos el TOTAL FILTRADO.
            // La tabla de 31 días se mantiene mostrando todos los días pagados por cada jugador
            // PERO solo para las especialidades filtradas.

            // Por la complejidad de re-renderizar la tabla de 31 días, solo aplicaremos el filtro de especialidad
            // a la tabla y usaremos los cálculos de totales para el total general filtrado.

            // El total filtrado ya fue calculado. `pagos` se mantiene filtrado solo por especialidad.
        } 
        else if (filtroPeriodo === "SEMANA" && filtroSemana) {
            // Suponemos que el filtro semana es el número de semana (1, 2, 3, 4, 5) del mes
            const semanaNum = parseInt(filtroSemana, 10);
            
            // Rango de días para la semana (aproximado)
            let diasSemana = [];
            if (semanaNum === 1) diasSemana = [1, 2, 3, 4, 5, 6, 7];
            else if (semanaNum === 2) diasSemana = [8, 9, 10, 11, 12, 13, 14];
            else if (semanaNum === 3) diasSemana = [15, 16, 17, 18, 19, 20, 21];
            else if (semanaNum === 4) diasSemana = [22, 23, 24, 25, 26, 27, 28];
            else if (semanaNum === 5) diasSemana = [29, 30, 31]; // Días restantes

            const diasPagadosEnSemana = new Set(); // Días únicos pagados en esa semana
            pagos.forEach(pago => {
                pago.diasPagados.forEach(dia => {
                    if (diasSemana.includes(dia)) {
                        diasPagadosEnSemana.add(`${pago.nombre.trim()}-${dia}`);
                    }
                });
            });
            
            // El total es el número de instancias de pago (jugador-día)
            total = diasPagadosEnSemana.size * valorDiario;
        } 
        else { // MES (o si los otros filtros están vacíos)
            // Calcular el total de todos los pagos que ya están filtrados por especialidad
            let totalDias = 0;
            pagos.forEach(pago => {
                totalDias += pago.diasPagados?.length || 0;
            });
            total = totalDias * valorDiario;
        }

        // Devolvemos los pagos (filtrados solo por especialidad) y el total calculado con ambos filtros.
        return {
            pagosFiltradosPorEspecialidad: pagos,
            totalFiltrado: total
        };

    }, [pagosDelMes, filtroEspecialidad, filtroPeriodo, filtroDia, filtroSemana, valorDiario]);

    // Usamos useMemo para la lista de jugadoras filtradas (solo por especialidad, el nombre completo es la clave)
    const jugadorasFiltradas = useMemo(() => {
        return [...new Set(pagosFiltrados.pagosFiltradosPorEspecialidad.map(p => p.nombre.trim()))].filter(Boolean);
    }, [pagosFiltrados.pagosFiltradosPorEspecialidad]);

    // Función para obtener la especialidad de un jugador
    const getEspecialidadJugadora = (nombre) => {
        const pago = pagosFiltrados.pagosFiltradosPorEspecialidad.find(p => p.nombre.trim() === nombre.trim());
        return pago?.especialidad || 'N/A';
    };

    // Función para obtener los días pagados, ahora usando solo los pagos filtrados
    const getDiasPagadosFiltrados = (nombre) => {
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
                </div>
                {mesSeleccionado && (
                    <div style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}>
                        <table style={{ width: "100%", minWidth: "2400px", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ background: "#1e293b", color: "white" }}>
                                    <th style={{ ...thStyle, position: "sticky", left: 0, background: "#1e293b", zIndex: 10, width: "200px" }}>Jugadora</th>
                                    <th style={{ ...thStyle, background: "#334155", width: "150px" }}>Especialidad</th> {/* NUEVO CAMPO */}
                                    {[...Array(31)].map((_, i) => (
                                        <th key={i+1} style={{ ...thStyle, width: "60px" }}>{i+1}</th>
                                    ))}
                                    <th style={{ ...thStyle, background: "#172554", width: "110px" }}>Días</th>
                                    <th style={{ ...thStyle, background: "#172554", width: "160px" }}>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {jugadorasFiltradas.length === 0 ? (
                                    <tr><td colSpan="35" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>No hay pagos este mes {filtroEspecialidad !== "TODAS" && `para la especialidad "${filtroEspecialidad}"`}</td></tr>
                                ) : (
                                    jugadorasFiltradas.map(nombre => {
                                        const dias = getDiasPagadosFiltrados(nombre);
                                        const total = dias.length * valorDiario;
                                        const especialidad = getEspecialidadJugadora(nombre); // Obtener la especialidad
                                        return (
                                            <tr key={nombre}>
                                                <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9, textAlign: "left" }}>
                                                    {nombre}
                                                </td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9", color: "#475569" }}>
                                                    **{especialidad}** {/* MOSTRAR ESPECIALIDAD */}
                                                </td>
                                                {[...Array(31)].map((_, i) => {
                                                    const pagado = dias.includes(i + 1);
                                                    return (
                                                        <td key={i+1} style={{ textAlign: "center", padding: "0.8rem 0" }}>
                                                            {pagado && <span style={{ color: "#22c55e", fontSize: "1.8rem", fontWeight: "bold" }}>X</span>}
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
