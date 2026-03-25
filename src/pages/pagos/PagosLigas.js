
import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";
// redeploy
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
    const [valorManual, setValorManual] = useState("");
    const [nuevoMes, setNuevoMes] = useState("");
    const [valorDiario, setValorDiario] = useState(8000);
const [valorDiarioTemp, setValorDiarioTemp] = useState(8000);
const [guardandoValor, setGuardandoValor] = useState(false);
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [diaSeleccionado, setDiaSeleccionado] = useState("");
    const [diasSeleccionados, setDiasSeleccionados] = useState([]);
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

    

    // ====== CARGA INICIAL COMPLETA ======
   // ====== PEGA ESTO ======
useEffect(() => {
    const cargarDatosIniciales = async () => {
        try {
            const [mesesRes, clientesRes, configRes] = await Promise.all([
                axios.get(`${backendURL}/pagos-ligas/meses`),
                obtenerClientes(),
                axios.get(`${backendURL}/pagos-ligas/configuracion`).catch(() => ({ data: { valorDiario: 8000 } })),
            ]);

            const mesesData = mesesRes.data;
            setMeses(mesesData);
            setClientes(clientesRes);
            const valorConfig = configRes.data.valorDiario || 8000;
setValorDiario(valorConfig);
setValorDiarioTemp(valorConfig);

            if (mesesData.length > 0) {
                // 1. Obtenemos el nombre exacto del mes actual (ej: "Febrero 2026")
                const nombreMesActual = obtenerNombreMesActual();
                
                // 2. Buscamos si ese mes ya existe en la base de datos
                const mesActualEnBD = mesesData.find(m => 
                    m.nombre.trim().toLowerCase() === nombreMesActual.toLowerCase()
                );

                if (mesActualEnBD) {
                    // Si existe Febrero 2026, lo ponemos de primero
                    setMesSeleccionado(mesActualEnBD.nombre);
                } else {
                    // Si aún no han creado el mes actual, ponemos el ÚLTIMO creado
                    // (que suele ser el más reciente en la lista)
                    setMesSeleccionado(mesesData[mesesData.length - 1].nombre);
                }
            }
        } catch (error) {
            console.error("Error en carga inicial:", error);
        }
    };

    cargarDatosIniciales();
}, []);
   
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

    total += Number(pago.total || 0);

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
if (!mesSeleccionado) return alert("Selecciona un mes");
if (diasSeleccionados.length === 0) return alert("Selecciona al menos un día");

try {

    const totalFinal = valorManual !== "" ? Number(valorManual) : (diasSeleccionados.length * valorDiario);
const hoy = new Date().getDate();

const diasConTipo = diasSeleccionados.map(dia => {
  let tipo = "HOY";

  if (dia < hoy) tipo = "ATRASADO";
  if (dia > hoy) tipo = "ADELANTADO";

  return {
    dia: dia,
    tipo: tipo
  };
});
    await axios.post(`${backendURL}/pagos-ligas/pagos`, {
        nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim(),
        mes: mesSeleccionado,
        diasAsistidos: diasSeleccionados.length,
        total: totalFinal,
       diasPagados: diasConTipo.map(d => ({
  dia: d.dia,
  tipo: d.tipo
})),
tipoPago: tipoPagoSeleccionado,
        comentario: ""
    });

    alert(`Pago registrado correctamente`);

    const res = await axios.get(`${backendURL}/pagos-ligas/pagos/${mesSeleccionado}`);
    const todosPagos = res.data || [];
    const pagosReales = todosPagos.filter(p => p.nombre !== "SYSTEM" && p.nombre.trim() !== "");

    const pagosEnriquecidos = pagosReales.map(pago => {
        const cliente = clientes.find(c =>
            `${c.nombre} ${c.apellido}`.trim().toLowerCase() === pago.nombre.trim().toLowerCase()
        );

        return {
            ...pago,
            especialidad: cliente?.especialidad || "Sin Especialidad",
            tipoPago: pago.tipoPago || "N/A"
        };
    });

    setPagosDelMes(pagosEnriquecidos);

    setSearchCliente("");
    setClienteSeleccionado(null);
    setDiasSeleccionados([]);

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
        // si aún no hay datos cargados
if (pagos.length === 0) {
    return {
        pagosFiltradosPorEspecialidad: [],
        totalFiltrado: 0
    };
}

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

(pago.diasPagados || []).forEach(d => {

const dia = typeof d === "number" ? d : d.dia;

if (dia === diaNum) {
jugadoresConDiaPagado.add(pago.nombre.trim());
}

});

});
            // El total es el número de jugadores que pagaron ESE día (considerando todos los filtros anteriores)
            total = jugadoresConDiaPagado.size * valorDiario;
        }
       else if (filtroPeriodo === "SEMANA" && filtroSemana) {

const semanaNum = parseInt(filtroSemana, 10);

let diasSemana = [];

if (semanaNum === 1) diasSemana = [1,2,3,4,5,6,7];
else if (semanaNum === 2) diasSemana = [8,9,10,11,12,13,14];
else if (semanaNum === 3) diasSemana = [15,16,17,18,19,20,21];
else if (semanaNum === 4) diasSemana = [22,23,24,25,26,27,28];
else if (semanaNum === 5) diasSemana = [29,30,31];

let totalDiasSemana = 0;

pagos.forEach(pago => {

(pago.diasPagados || []).forEach(d => {

let dia = null;

if (typeof d === "number") dia = d;
else if (typeof d === "object") dia = d.dia;

if (diasSemana.includes(dia)) {
totalDiasSemana++;
}

});

});

total = totalDiasSemana * valorDiario;

}
else { // MES
total = pagos.reduce((acc, pago) => {
return acc + (Number(pago.total) || 0);
},0);
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

const pagos = pagosDelMes.filter(
p => p.nombre.trim() === nombre.trim()
);

const dias = [];

pagos.forEach(p => {

(p.diasPagados || []).forEach(d => {

let dia = null;

if (typeof d === "number") {
dia = d;
}

else if (typeof d === "object") {
dia = d.dia;
}

if (dia !== null) {
dias.push(dia);
}

});

});

return dias;

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
    value={valorDiarioTemp}
    onChange={(e) => setValorDiarioTemp(Number(e.target.value))}
    style={{ ...inputStyle, width: "140px" }}
    placeholder="Valor diario"
/>

<button
    onClick={async () => {
        if (valorDiarioTemp <= 0) {
            alert("Valor inválido");
            return;
        }

        const confirmar = window.confirm(
            `¿Estás seguro de cambiar el valor diario de $${valorDiario.toLocaleString("es-CO")} a $${valorDiarioTemp.toLocaleString("es-CO")}?\n\nEste cambio afectará solo los nuevos registros.`
        );

        if (!confirmar) return;

        try {
            setGuardandoValor(true);

            await axios.put(`${backendURL}/pagos-ligas/configuracion`, {
                valorDiario: valorDiarioTemp,
            });

            setValorDiario(valorDiarioTemp);

            alert("Valor diario actualizado correctamente");
        } catch (error) {
            alert("Error al actualizar valor diario");
        } finally {
            setGuardandoValor(false);
        }
    }}
    style={{
        ...btnPrimary,
        opacity: guardandoValor ? 0.6 : 1,
        cursor: guardandoValor ? "not-allowed" : "pointer",
    }}
    disabled={guardandoValor}
>
    Guardar Valor
</button>
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

                       <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
  <label style={{ fontWeight: "bold" }}>Seleccionar Días</label>
  <div style={{
    display: "grid",
    gridTemplateColumns: "repeat(7, 40px)",
    gap: "6px"
  }}>
    {[...Array(31)].map((_, i) => {

const dia = i + 1;

const cantidad = diasSeleccionados.filter(d => d === dia).length;

return (
<div
key={dia}
onClick={() => {

setDiasSeleccionados([...diasSeleccionados, dia]);

}}
style={{
width: "40px",
height: "40px",
display: "flex",
alignItems: "center",
justifyContent: "center",
borderRadius: "6px",
cursor: "pointer",
fontWeight: "bold",
background: cantidad > 0 ? "#22c55e" : "#e2e8f0",
color: cantidad > 0 ? "white" : "#1e293b"
}}
>

{cantidad > 1 ? `${dia}(${cantidad})` : dia}

</div>
);
})}  </div>

  <div style={{ marginTop: "0.5rem", fontWeight: "bold" }}>
    Clases seleccionadas: {diasSeleccionados.length}
  </div>

 <div style={{ marginTop: "10px" }}>
  <label style={{ fontSize: "12px", fontWeight: "bold", display: "block", color: "#333" }}>Valor manual (Opcional):</label>
  <input 
    type="number" 
    value={valorManual} 
    onChange={(e) => setValorManual(e.target.value)}
    placeholder="Ej: 5000"
    style={{ border: "2px solid #000", borderRadius: "4px", padding: "8px", width: "120px", marginTop: "5px" }}
  />
</div>
<div style={{ fontWeight: "bold", marginTop: "10px" }}>
  Total a pagar: ${valorManual !== "" ? Number(valorManual).toLocaleString("es-CO") : (diasSeleccionados.length * valorDiario).toLocaleString("es-CO")}
</div>
</div>


                        <button onClick={registrarPagoDia} style={btnSuccess}>
                            Marcar Día {diaSeleccionado || "?"} como Pagado
                        </button>
                    </div>
                </div>
                {mesSeleccionado && (
<>
    <div 
        id="scroll-superior"
        style={{ overflowX: 'auto', overflowY: 'hidden', width: '100%' }}
        onScroll={(e) => {
            const abajo = document.getElementById('contenedor-tabla');
            if (abajo) abajo.scrollLeft = e.target.scrollLeft;
        }}
    >
        <div style={{ width: "2800px", height: "1px" }}></div>
    </div>

    <div 
        id="contenedor-tabla"
        style={{ overflowX: "auto", borderRadius: "1.5rem", boxShadow: "0 15px 35px rgba(0,0,0,0.15)" }}
        onScroll={(e) => {
            const arriba = document.getElementById('scroll-superior');
            if (arriba) arriba.scrollLeft = e.target.scrollLeft;
        }}
    >
                  
                       <table style={{ width: "100%", minWidth: "2800px", borderCollapse: "collapse" }}>
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
                                    <tr>
                                        <td colSpan="36" style={{ textAlign: "center", padding: "4rem", color: "#64748b" }}>
                                            No hay pagos este mes que coincidan con los filtros.
                                        </td>
                                    </tr>
                                ) : (
                                    jugadorasFiltradas.map(nombre => {
                                        const dias = getDiasPagadosFiltrados(nombre);
                                        const pagoReal = pagosDelMes.find(p => p.nombre.trim() === nombre.trim());
const total = pagosDelMes
    .filter(p => p.nombre.trim() === nombre.trim())
    .reduce((acc, p) => acc + (Number(p.total) || 0), 0);

const especialidad = getEspecialidadJugadora(nombre);
const tipoPago = getTipoPagoJugadora(nombre);
                                        return (
                                            <tr key={nombre}>
                                                <td style={{ ...tdStyle, fontWeight: "bold", background: "#f8fafc", position: "sticky", left: 0, zIndex: 9, textAlign: "left" }}>
                                                    {nombre}
                                                </td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9", color: "#475569" }}>
                                                    {especialidad}
                                                </td>
                                                <td style={{ ...tdStyle, background: "#f1f5f9", color: tipoPago === 'Nequi' ? '#ea580c' : '#16a34a' }}>
                                                    {tipoPago}
                                                </td>
                                              {[...Array(31)].map((_, i) => {

const diaActual = i + 1;

const pagosJugador = pagosDelMes.filter(
p => p.nombre.trim() === nombre.trim()
);

let iconos = [];

pagosJugador.forEach(p => {

(p.diasPagados || []).forEach(d => {

const dia = typeof d === "number" ? d : d.dia;
const tipo = typeof d === "object" ? d.tipo : "ATRASADO";

if (dia === diaActual) {
iconos.push({ tipo });
}

});

});

return (
<td
key={diaActual}
style={{
textAlign: "center",
padding: "0.5rem 0",
minWidth: "60px",
border: "1px solid #e2e8f0"
}}
>

{iconos.map((infoDia, index) => (

<div
key={index}
style={{
fontSize: "1.4rem",
fontWeight: "bold",
lineHeight: "1",
color:
infoDia.tipo === "HOY"
? "#22c55e"
: infoDia.tipo === "ATRASADO"
? "#ef4444"
: "#3b82f6"
}}
>
{infoDia.tipo === "HOY" ? "X" : "●"}
</div>

))}

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
</>
)}

            </div>
        </div>
    );
};

export default PagosLigas;
