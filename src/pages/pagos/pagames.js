import React, { useState, useEffect, useMemo } from "react";
import api, { obtenerClientes } from "../../api/axios";

const MESES_ANIO = [
"Enero","Febrero","Marzo","Abril","Mayo","Junio",
"Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"
];

const TIPOS_PAGO = ["TODOS","Efectivo","Nequi"];

const inputStyle = { padding:"1rem", borderRadius:"0.8rem", border:"2px solid #94a3b8", fontSize:"1.1rem" };
const selectStyle = { padding:"1rem", borderRadius:"0.8rem", border:"2px solid #94a3b8", fontSize:"1.1rem" };
const btnPrimary = { background:"#4f46e5", color:"white", padding:"1rem 2rem", borderRadius:"0.8rem", border:"none", cursor:"pointer", fontWeight:"bold" };
const btnSuccess = { background:"#22c55e", color:"white", padding:"1rem 3rem", borderRadius:"0.8rem", border:"none", cursor:"pointer", fontWeight:"bold" };
const thStyle = { padding:"1.2rem 0.5rem", textAlign:"center", fontWeight:"bold" };
const tdStyle = { padding:"1rem 0.5rem", textAlign:"center" };

const Pagames = () => {

const [anios,setAnios] = useState([]);
const [anioSeleccionado,setAnioSeleccionado] = useState(new Date().getFullYear().toString());
const [nuevoAnio,setNuevoAnio] = useState("");
const [clientes,setClientes] = useState([]);
const [pagosDelAnio,setPagosDelAnio] = useState([]);

const [searchCliente,setSearchCliente] = useState("");
const [clienteSeleccionado,setClienteSeleccionado] = useState(null);
const [planSeleccionado,setPlanSeleccionado] = useState("Plan Black");
const [valorManual,setValorManual] = useState("");
const [mesAPagar,setMesAPagar] = useState("");
const [tipoPagoSeleccionado,setTipoPagoSeleccionado] = useState("Efectivo");

const [filtroNombre,setFiltroNombre] = useState("");
const [filtroEspecialidad,setFiltroEspecialidad] = useState("TODAS");
const [filtroTipoPago,setFiltroTipoPago] = useState("TODOS");

const cargarDatosIniciales = async () => {
try {

const [aniosRes,clientesRes] = await Promise.all([
api.get("/paga-mes/anios"),
obtenerClientes()
]);

setAnios(aniosRes.data);
setClientes(clientesRes.data);

if(aniosRes.data.length>0 && !anioSeleccionado){
setAnioSeleccionado(aniosRes.data[0].nombre);
}

}catch(error){
console.error("Error inicial:",error);
}
};

const cargarPagos = async () => {

if(!anioSeleccionado) return;

try{

const res = await api.get(`/paga-mes/pagos/${anioSeleccionado}`);

const pagosReales = res.data.filter(p=>p.nombre !== "SYSTEM");

const pagosEnriquecidos = pagosReales.map(pago=>{

const cliente = clientes.find(c =>
`${c.nombre} ${c.apellido}`.trim().toUpperCase() === pago.nombre.toUpperCase()
);

return {
...pago,
especialidad: cliente?.especialidad || "Sin Especialidad"
};

});

setPagosDelAnio(pagosEnriquecidos);

}catch(error){
console.error("Error cargando pagos:",error);
}

};

useEffect(()=>{ cargarDatosIniciales(); },[]);
useEffect(()=>{ cargarPagos(); },[anioSeleccionado,clientes]);

const crearAnio = async ()=>{

if(!nuevoAnio.trim()) return alert("Escribe un año");

try{

await api.post("/paga-mes/crear-anio",{ nombre:nuevoAnio.trim() });

alert("Año creado");

setNuevoAnio("");

cargarDatosIniciales();

}catch(error){
alert("Error al crear año");
}

};

const registrarPago = async ()=>{

if(!clienteSeleccionado || !mesAPagar || !valorManual)
return alert("Completa todos los campos");

try{

await api.post("/paga-mes/pagos",{

nombre:`${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`.trim().toUpperCase(),
anio:anioSeleccionado,
plan:planSeleccionado,
total:Number(valorManual),
mesesPagados:[mesAPagar],
tipoPago:tipoPagoSeleccionado

});

alert("Pago registrado correctamente");

setSearchCliente("");
setValorManual("");
setMesAPagar("");

cargarPagos();

}catch(error){
alert("Error al registrar pago");
}

};

const especialidadesDisponibles = useMemo(()=>{

const specs = new Set(clientes.map(c=>c.especialidad).filter(Boolean));

return ["TODAS",...Array.from(specs).sort()];

},[clientes]);

const datosFiltrados = useMemo(()=>{

let pagos = pagosDelAnio;

if(filtroNombre.trim()){
pagos = pagos.filter(p=>p.nombre.toLowerCase().includes(filtroNombre.toLowerCase()));
}

if(filtroEspecialidad !== "TODAS"){
pagos = pagos.filter(p=>p.especialidad === filtroEspecialidad);
}

if(filtroTipoPago !== "TODOS"){
pagos = pagos.filter(p=>p.tipoPago === filtroTipoPago);
}

const total = pagos.reduce((acc,p)=>acc + p.total,0);

return { pagos,total };

},[pagosDelAnio,filtroNombre,filtroEspecialidad,filtroTipoPago]);

const nombresUnicosFiltrados = useMemo(()=>{

return [...new Set(datosFiltrados.pagos.map(p=>p.nombre))];

},[datosFiltrados.pagos]);

return (

<div style={{padding:"2rem",background:"#f8fafc",minHeight:"100vh"}}>

<div style={{maxWidth:"2200px",margin:"0 auto",background:"white",borderRadius:"1.5rem",padding:"2.5rem",boxShadow:"0 20px 40px rgba(0,0,0,0.1)"}}>

<h2 style={{textAlign:"center",fontSize:"2.5rem",marginBottom:"2rem",color:"#1e293b"}}>

Control de Pagos Mensuales

</h2>

<div style={{display:"flex",gap:"1rem",alignItems:"center",marginBottom:"2rem"}}>

<input
type="text"
placeholder="2026"
value={nuevoAnio}
onChange={(e)=>setNuevoAnio(e.target.value)}
style={{...inputStyle,width:"150px"}}
/>

<button onClick={crearAnio} style={btnPrimary}>
Crear Año
</button>

<select
value={anioSeleccionado}
onChange={(e)=>setAnioSeleccionado(e.target.value)}
style={selectStyle}
>

<option value="">Seleccionar año</option>

{anios.map(a=>(
<option key={a._id} value={a.nombre}>
{a.nombre}
</option>
))}

</select>

</div>

</div>

</div>

);

};

export default Pagames;
