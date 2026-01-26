import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

const MESES_ANIO = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const PagaMes = () => {
    const [anios, setAnios] = useState([]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear().toString());
    const [nuevoAnio, setNuevoAnio] = useState("");
    const [clientes, setClientes] = useState([]);
    const [searchCliente, setSearchCliente] = useState("");
    const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [planSeleccionado, setPlanSeleccionado] = useState("Black");
    const [valorManual, setValorManual] = useState("");
    const [tipoPago, setTipoPago] = useState("Efectivo");
    const [pagosDelAnio, setPagosDelAnio] = useState([]);

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                const [aniosRes, clientesRes] = await Promise.all([
                    axios.get(`${backendURL}/paga-mes/anios`),
                    obtenerClientes()
                ]);
                setAnios(aniosRes.data);
                setClientes(clientesRes.data);
            } catch (error) { console.error(error); }
        };
        cargarDatos();
    }, []);

    useEffect(() => {
        if (!anioSeleccionado) return;
        const cargarPagos = async () => {
            const res = await axios.get(`${backendURL}/paga-mes/pagos/${anioSeleccionado}`);
            setPagosDelAnio(res.data.filter(p => p.nombre !== "SYSTEM"));
        };
        cargarPagos();
    }, [anioSeleccionado]);

    const registrarPago = async () => {
        if (!clienteSeleccionado || !mesSeleccionado || !valorManual) return alert("Faltan datos");
        try {
            await axios.post(`${backendURL}/paga-mes/pagos`, {
                nombre: `${clienteSeleccionado.nombre} ${clienteSeleccionado.apellido}`,
                anio: anioSeleccionado,
                plan: planSeleccionado,
                total: Number(valorManual),
                mesesPagados: [mesSeleccionado],
                tipoPago
            });
            alert("Pago registrado");
            window.location.reload();
        } catch (error) { alert("Error al registrar"); }
    };

    const crearAnio = async () => {
        if (!nuevoAnio) return;
        await axios.post(`${backendURL}/paga-mes/crear-anio`, { nombre: nuevoAnio });
        setAnioSeleccionado(nuevoAnio);
        setNuevoAnio("");
    };

    // Estilos basados en la imagen
    const inputStyle = { padding: "0.8rem", borderRadius: "0.5rem", border: "1px solid #ccc" };

    return (
        <div style={{ padding: "2rem", background: "#f1f5f9" }}>
            <div style={{ background: "white", padding: "2rem", borderRadius: "1rem" }}>
                <h2 style={{ textAlign: "center" }}>Control de Pagos Mensuales</h2>

                {/* Cabecera */}
                <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem", alignItems: "center" }}>
                    <input style={inputStyle} placeholder="Nuevo Año (Ej: 2026)" value={nuevoAnio} onChange={e => setNuevoAnio(e.target.value)} />
                    <button onClick={crearAnio} style={{ background: "#4f46e5", color: "white", border: "none", padding: "0.8rem", borderRadius: "0.5rem" }}>Crear Año</button>
                    <select style={inputStyle} value={anioSeleccionado} onChange={e => setAnioSeleccionado(e.target.value)}>
                        {anios.map(a => <option key={a._id} value={a.nombre}>{a.nombre}</option>)}
                    </select>
                </div>

                {/* Registrador Rápido (Basado en imagen 2) */}
                <div style={{ background: "#f0fdf4", padding: "1.5rem", borderRadius: "1rem", border: "2px solid #22c55e", marginBottom: "2rem" }}>
                    <div style={{ display: "flex", gap: "1rem", flexWrap: "wrap" }}>
                        <input list="c-list" style={{ ...inputStyle, width: "300px" }} placeholder="Nombre de la niña..." 
                            onChange={e => {
                                setSearchCliente(e.target.value);
                                setClienteSeleccionado(clientes.find(c => `${c.nombre} ${c.apellido}` === e.target.value));
                            }} 
                        />
                        <datalist id="c-list">{clientes.map(c => <option key={c._id} value={`${c.nombre} ${c.apellido}`} />)}</datalist>
                        
                        <select style={inputStyle} onChange={e => setPlanSeleccionado(e.target.value)}>
                            <option value="Black">Plan Black</option>
                            <option value="White">Plan White</option>
                            <option value="Gold">Plan Gold</option>
                        </select>

                        <input style={inputStyle} type="number" placeholder="Valor $" value={valorManual} onChange={e => setValorManual(e.target.value)} />

                        <select style={inputStyle} value={mesSeleccionado} onChange={e => setMesSeleccionado(e.target.value)}>
                            <option value="">Mes a pagar</option>
                            {MESES_ANIO.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>

                        <select style={inputStyle} onChange={e => setTipoPago(e.target.value)}>
                            <option value="Efectivo">Efectivo</option>
                            <option value="Nequi">Nequi</option>
                        </select>

                        <button onClick={registrarPago} style={{ background: "#22c55e", color: "white", padding: "0.8rem 2rem", borderRadius: "0.5rem", border: "none" }}>Registrar Pago</button>
                    </div>
                </div>

                {/* Tabla (Basada en imagen 3) */}
                <div style={{ overflowX: "auto" }}>
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                        <thead>
                            <tr style={{ background: "#1e293b", color: "white" }}>
                                <th style={{ padding: "1rem" }}>Jugadora</th>
                                <th style={{ padding: "1rem" }}>Plan</th>
                                {MESES_ANIO.map(m => <th key={m}>{m.substring(0, 3)}</th>)}
                                <th style={{ padding: "1rem", background: "#172554" }}>Meses</th>
                                <th style={{ padding: "1rem", background: "#172554" }}>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[...new Set(pagosDelAnio.map(p => p.nombre))].map(nom => {
                                const misPagos = pagosDelAnio.filter(p => p.nombre === nom);
                                const mesesSet = new Set(misPagos.flatMap(p => p.mesesPagados));
                                const totalDinero = misPagos.reduce((acc, p) => acc + p.total, 0);
                                return (
                                    <tr key={nom} style={{ borderBottom: "1px solid #eee", textAlign: "center" }}>
                                        <td style={{ padding: "1rem", fontWeight: "bold", textAlign: "left" }}>{nom}</td>
                                        <td>{misPagos[0]?.plan}</td>
                                        {MESES_ANIO.map(m => (
                                            <td key={m} style={{ color: mesesSet.has(m) ? "#22c55e" : "#ccc", fontSize: "1.2rem" }}>
                                                {mesesSet.has(m) ? "✔" : "○"}
                                            </td>
                                        ))}
                                        <td style={{ fontWeight: "bold" }}>{mesesSet.size}</td>
                                        <td style={{ fontWeight: "bold", color: "#166534" }}>${totalDinero.toLocaleString()}</td>
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

export default PagaMes;
