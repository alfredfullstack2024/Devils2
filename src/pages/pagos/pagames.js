import React, { useState, useEffect, useMemo } from "react";
import { Form, Button, Table, Card, Row, Col } from "react-bootstrap";
import axios from "axios";
import { obtenerClientes } from "../../api/axios";

const Pagames = () => {
    // --- ESTADOS ---
    const [mesesDisponibles] = useState(["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [clientes, setClientes] = useState([]);
    const [sugerencias, setSugerencias] = useState([]);
    const [pagos, setPagos] = useState([]);
    const [filtroNombre, setFiltroNombre] = useState("");

    // Formulario de nuevo pago
    const [nuevoPago, setNuevoPago] = useState({
        cliente: "",
        monto: "",
        tipo: "Efectivo",
        plan: "Black",
        comentario: ""
    });

    const backendURL = process.env.REACT_APP_API_URL || "https://backend-5zxh.onrender.com/api";

    // --- EFECTOS ---

    // 1. Carga Inicial: Clientes y Mes Actual
    useEffect(() => {
        const inicializar = async () => {
            try {
                const res = await obtenerClientes();
                setClientes(res.data);
                
                // Seleccionar mes actual por defecto
                const mesActual = mesesDisponibles[new Date().getMonth()];
                setMesSeleccionado(mesActual);
            } catch (error) {
                console.error("Error al cargar clientes", error);
            }
        };
        inicializar();
    }, [mesesDisponibles]);

    // 2. Cargar Pagos cuando cambie mes o año
    useEffect(() => {
        if (!mesSeleccionado || !anioSeleccionado) return;

        const cargarPagos = async () => {
            try {
                // Ajusta esta ruta según tu backend (ej: /pagos-mensualidades)
                const res = await axios.get(`${backendURL}/pagos-mensualidades/${anioSeleccionado}/${mesSeleccionado}`);
                setPagos(res.data || []);
            } catch (error) {
                console.error("Error cargando pagos", error);
                setPagos([]);
            }
        };
        cargarPagos();
    }, [mesSeleccionado, anioSeleccionado, backendURL]);

    // --- LÓGICA DE FILTROS Y TOTALES ---
    const { pagosFiltrados, totalRecaudado } = useMemo(() => {
        const filtrados = pagos.filter(p => 
            p.cliente.toLowerCase().includes(filtroNombre.toLowerCase())
        );
        const total = filtrados.reduce((acc, curr) => acc + Number(curr.monto || 0), 0);
        return { pagosFiltrados: filtrados, totalRecaudado: total };
    }, [pagos, filtroNombre]);

    // --- ACCIONES ---
    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNuevoPago({ ...nuevoPago, cliente: value });
        if (value.length > 1) {
            const filtrados = clientes.filter(c => 
                `${c.nombre} ${c.apellido}`.toLowerCase().includes(value.toLowerCase())
            );
            setSugerencias(filtrados);
        } else {
            setSugerencias([]);
        }
    };

    const registrarPago = async () => {
        if (!nuevoPago.cliente || !nuevoPago.monto) return alert("Completa cliente y monto");

        try {
            const dataEnvio = {
                ...nuevoPago,
                mes: mesSeleccionado,
                anio: anioSeleccionado,
                fechaRegistro: new Date()
            };
            await axios.post(`${backendURL}/pagos-mensualidades`, dataEnvio);
            alert("Pago registrado con éxito");
            
            // Refrescar lista
            setPagos([...pagos, dataEnvio]);
            setNuevoPago({ cliente: "", monto: "", tipo: "Efectivo", plan: "Black", comentario: "" });
        } catch (error) {
            alert("Error al registrar el pago");
        }
    };

    return (
        <div className="container mt-4" style={{ maxWidth: "1200px" }}>
            <h2 className="mb-4 fw-bold text-dark">Gestión Mensualidades (Paga Mes)</h2>

            {/* Bloque Superior: Selección y Totales */}
            <Card className="mb-4 shadow-sm border-0 bg-white">
                <Card.Body>
                    <Row className="align-items-end">
                        <Col md={2}>
                            <Form.Label className="fw-bold">Año</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={anioSeleccionado} 
                                onChange={(e) => setAnioSeleccionado(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label className="fw-bold">Seleccionar Mes</Form.Label>
                            <Form.Select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
                                {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={3}>
                            <Form.Label className="fw-bold">Filtrar por Nombre</Form.Label>
                            <Form.Control 
                                placeholder="Buscar en tabla..." 
                                value={filtroNombre}
                                onChange={(e) => setFiltroNombre(e.target.value)}
                            />
                        </Col>
                        <Col md={4}>
                            <div className="bg-dark text-white p-3 rounded text-center shadow">
                                <small>RECAUDADO EN {mesSeleccionado.toUpperCase()}</small>
                                <h4 className="mb-0 text-success">${totalRecaudado.toLocaleString("es-CO")}</h4>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Bloque Registrador Rápido */}
            <Card className="mb-4 border-success shadow-sm">
                <Card.Header className="bg-success text-white fw-bold">Registrador Pago Rápido</Card.Header>
                <Card.Body className="bg-light">
                    <Row className="g-2">
                        <Col md={4} className="position-relative">
                            <Form.Control 
                                placeholder="Nombre completo de la niña..." 
                                value={nuevoPago.cliente}
                                onChange={handleNombreChange}
                            />
                            {sugerencias.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow" style={{ zIndex: 1000 }}>
                                    {sugerencias.map(s => (
                                        <li 
                                            key={s._id} 
                                            className="list-group-item list-group-item-action cursor-pointer" 
                                            onClick={() => {
                                                setNuevoPago({ ...nuevoPago, cliente: `${s.nombre} ${s.apellido}` });
                                                setSugerencias([]);
                                            }}
                                        >
                                            {s.nombre} {s.apellido}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Col>
                        <Col md={2}>
                            <Form.Select value={nuevoPago.plan} onChange={(e) => setNuevoPago({ ...nuevoPago, plan: e.target.value })}>
                                <option value="Black">PLAN: Black</option>
                                <option value="White">PLAN: White</option>
                                <option value="Gold">PLAN: Gold</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Control 
                                placeholder="Monto $" 
                                type="number" 
                                value={nuevoPago.monto}
                                onChange={(e) => setNuevoPago({ ...nuevoPago, monto: e.target.value })}
                            />
                        </Col>
                        <Col md={2}>
                            <Form.Select value={nuevoPago.tipo} onChange={(e) => setNuevoPago({ ...nuevoPago, tipo: e.target.value })}>
                                <option value="Efectivo">Efectivo</option>
                                <option value="Transferencia">Transferencia</option>
                                <option value="Nequi">Nequi</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="success" className="w-100 fw-bold" onClick={registrarPago}>
                                Registrar
                            </Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabla de Resultados */}
            <Card className="shadow-sm border-0">
                <Table striped borderless hover responsive className="text-center mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th>Jugadora</th>
                            <th>Plan</th>
                            <th>Tipo</th>
                            <th>Monto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.length === 0 ? (
                            <tr>
                                <td colSpan="5" className="text-muted py-4">No hay pagos registrados para este criterio</td>
                            </tr>
                        ) : (
                            pagosFiltrados.map((p, index) => (
                                <tr key={index}>
                                    <td className="fw-bold">{p.cliente}</td>
                                    <td><span className={`badge ${p.plan === 'Black' ? 'bg-dark' : 'bg-warning text-dark'}`}>{p.plan}</span></td>
                                    <td>{p.tipo}</td>
                                    <td className="text-success fw-bold">${Number(p.monto).toLocaleString("es-CO")}</td>
                                    <td>
                                        <Button variant="outline-danger" size="sm">Eliminar</Button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </Table>
            </Card>
        </div>
    );
};

export default Pagames;
