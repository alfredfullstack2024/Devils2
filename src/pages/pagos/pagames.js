import React, { useState, useEffect } from "react";
import { Form, Button, Table, Card, Row, Col, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// Asumiendo que usas Firebase o una API similar a PagosLigas
// import { collection, getDocs, addDoc, query, where } from "firebase/firestore"; 
// import { db } from "../../firebase"; 

const Pagames = () => {
    const [mesesDisponibles, setMesesDisponibles] = useState(["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"]);
    const [anioSeleccionado, setAnioSeleccionado] = useState(new Date().getFullYear());
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [clientes, setClientes] = useState([]); // Para el autocomplete
    const [filtroNombre, setFiltroNombre] = useState("");
    const [sugerencias, setSugerencias] = useState([]);
    
    // Formulario de nuevo pago
    const [nuevoPago, setNuevoPago] = useState({
        cliente: "",
        monto: "",
        tipo: "Efectivo",
        plan: "Black", // Nuevo campo Planes
        comentario: ""
    });

    const [pagos, setPagos] = useState([]);
    const [error, setError] = useState(null);

    // 1. Cargar Clientes para el Autocomplete (Igual que en PagosLigas)
    useEffect(() => {
        // Aquí iría tu lógica de cargar clientes desde la DB
        const cargarClientes = async () => {
            // Ejemplo: const querySnapshot = await getDocs(collection(db, "clientes"));
            // setClientes(querySnapshot.docs.map(doc => doc.data().nombre));
            setClientes(["MARIANA FIERRO LOPEZ", "MELISSA VICTORIA VERA", "SHIRLY VALENTINA"]); 
        };
        cargarClientes();
    }, []);

    // Manejar escritura en Nombre Cliente
    const handleNombreChange = (e) => {
        const value = e.target.value;
        setNuevoPago({...nuevoPago, cliente: value});
        if (value.length > 1) {
            const filtrados = clientes.filter(c => c.toLowerCase().includes(value.toLowerCase()));
            setSugerencias(filtrados);
        } else {
            setSugerencias([]);
        }
    };

    const seleccionarCliente = (nombre) => {
        setNuevoPago({...nuevoPago, cliente: nombre});
        setSugerencias([]);
    };

    return (
        <div className="container mt-4">
            <h2 className="mb-4">Gestión Mensualidades (Paga Mes)</h2>

            {/* Bloque Superior: Selección de Año/Mes (Estilo PagosLigas) */}
            <Card className="mb-4 shadow-sm border-0">
                <Card.Body className="bg-light">
                    <Row className="align-items-end">
                        <Col md={3}>
                            <Form.Label>Año</Form.Label>
                            <Form.Control 
                                type="number" 
                                value={anioSeleccionado} 
                                onChange={(e) => setAnioSeleccionado(e.target.value)}
                            />
                        </Col>
                        <Col md={3}>
                            <Form.Label>Seleccionar Mes</Form.Label>
                            <Form.Select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
                                <option value="">Seleccione...</option>
                                {mesesDisponibles.map(m => <option key={m} value={m}>{m}</option>)}
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="primary" className="w-100">Crear Año</Button>
                        </Col>
                        <Col md={4}>
                            <div className="bg-dark text-white p-3 rounded text-center">
                                <h5 className="mb-0">TOTAL RECAUDADO (MES): $0</h5>
                            </div>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Bloque Registrador Rápido (Igual a la imagen 10) */}
            <Card className="mb-4 border-success">
                <Card.Header className="bg-success text-white">Registrador Pago Rápido</Card.Header>
                <Card.Body>
                    <Row>
                        <Col md={4} className="position-relative">
                            <Form.Control 
                                placeholder="Nombre completo de la niña..." 
                                value={nuevoPago.cliente}
                                onChange={handleNombreChange}
                            />
                            {sugerencias.length > 0 && (
                                <ul className="list-group position-absolute w-100 shadow" style={{zIndex: 1000}}>
                                    {sugerencias.map(s => (
                                        <li key={s} className="list-group-item list-group-item-action" onClick={() => seleccionarCliente(s)}>
                                            {s}
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </Col>
                        <Col md={2}>
                            <Form.Select value={nuevoPago.plan} onChange={(e) => setNuevoPago({...nuevoPago, plan: e.target.value})}>
                                <option value="Black">PLAN: Black</option>
                                <option value="White">PLAN: White</option>
                                <option value="Gold">PLAN: Gold</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Form.Control placeholder="Monto $" type="number" />
                        </Col>
                        <Col md={2}>
                            <Form.Select>
                                <option>Efectivo</option>
                                <option>Transferencia</option>
                            </Form.Select>
                        </Col>
                        <Col md={2}>
                            <Button variant="success" className="w-100">Registrar</Button>
                        </Col>
                    </Row>
                </Card.Body>
            </Card>

            {/* Tabla de Resultados (Estilo Imagen 1 y 2) */}
            <Table striped bordered hover responsive className="text-center">
                <thead className="table-dark">
                    <tr>
                        <th>Jugadora</th>
                        <th>Plan</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Monto</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {/* Aquí mapearías tus pagos */}
                    <tr>
                        <td colSpan="6" className="text-muted">No hay pagos registrados para este mes</td>
                    </tr>
                </tbody>
            </Table>
        </div>
    );
};

export default Pagames;
