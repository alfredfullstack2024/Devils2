import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

// Función auxiliar para formatear montos
const formatCurrencySafe = (amount) => {
    const value = parseFloat(amount) || 0; 
    return `$${value.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
};

const Pagos = () => {
    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState("mes");
    const [mes, setMes] = useState("");
    const [semana, setSemana] = useState("");
    const [dia, setDia] = useState("");
    const [busquedaNombre, setBusquedaNombre] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showResumen, setShowResumen] = useState(false);
    const [resumen, setResumen] = useState([]);
    
    const [totalRecaudadoFiltrado, setTotalRecaudadoFiltrado] = useState(0); 
    const [totalRecaudadoGeneral, setTotalRecaudadoGeneral] = useState(0); 
    
    const navigate = useNavigate();

    const fetchPagos = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const params = {};

            if (filtroTipo === "mes" && mes) {
                const [year, month] = mes.split("-");
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = startDate.toISOString();
                params.fechaFin = endDate.toISOString();
            } else if (filtroTipo === "semana" && semana) {
                const [year, week] = semana.split("-W");
                const date = new Date(year, 0, 1);
                const day = date.getDay();
                const dayOffset = (day <= 4) ? -day + 1 : -day + 8;
                date.setDate(date.getDate() + dayOffset + (week - 1) * 7);

                const startDate = new Date(date);
                startDate.setHours(0, 0, 0, 0);

                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6);
                endDate.setHours(23, 59, 59, 999);
                                        
                params.fechaInicio = startDate.toISOString();
                params.fechaFin = endDate.toISOString();
            } else if (filtroTipo === "dia" && dia) {
                const startDate = new Date(dia);
                startDate.setHours(0, 0, 0, 0);
                const endDate = new Date(dia);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = startDate.toISOString();
                params.fechaFin = endDate.toISOString();
            }

            const allResponse = await api.get("/pagos");
            const totalGeneralMonto = (allResponse.data.pagos || [])
                .reduce((sum, pago) => sum + (pago.monto || 0), 0);
            setTotalRecaudadoGeneral(totalGeneralMonto);

            const filteredResponse = await api.get("/pagos", { params });
            const fetchedPagos = filteredResponse.data.pagos || [];
            
            setPagos(fetchedPagos); 
            setPagosFiltrados(fetchedPagos); 
            
        } catch (err) {
            setError("Error al cargar los pagos: " + (err.response?.data?.message || err.message));
            setPagos([]);
            setPagosFiltrados([]);
        } finally {
            setIsLoading(false);
        }
    }, [filtroTipo, mes, semana, dia]);

    useEffect(() => {
        fetchPagos();
    }, [fetchPagos]);

    useEffect(() => {
        let filtrados;
        if (!busquedaNombre) {
            filtrados = pagos;
        } else {
            filtrados = pagos.filter((pago) => {
                const nombreCliente = pago.cliente
                    ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`.toLowerCase()
                    : "";
                return nombreCliente.includes(busquedaNombre.toLowerCase());
            });
        }
        setPagosFiltrados(filtrados);
        const total = filtrados.reduce((sum, pago) => sum + (pago.monto || 0), 0);
        setTotalRecaudadoFiltrado(total);
    }, [busquedaNombre, pagos]);

    const limpiarFiltros = () => {
        setFiltroTipo("mes");
        setMes("");
        setSemana("");
        setDia("");
        setBusquedaNombre("");
    };

    const eliminarPago = async (id) => {
        if (!window.confirm("¿Estás seguro de que deseas eliminar este pago?")) return;
        try {
            setIsLoading(true);
            await api.delete(`/pagos/${id}`);
            await fetchPagos(); 
        } catch (err) {
            setError("Error al eliminar el pago: " + (err.response?.data?.message || err.message));
        } finally {
            setIsLoading(false);
        }
    };

    const formatFecha = (fecha) => new Date(fecha).toLocaleDateString("es-ES");

    const abrirResumen = async () => {
        try {
            setIsLoading(true);
            const params = {};
            if (filtroTipo === "mes" && mes) {
                const [year, month] = mes.split("-");
                const startDate = new Date(year, month - 1, 1);
                const endDate = new Date(year, month, 0);
                endDate.setHours(23, 59, 59, 999);
                params.fechaInicio = startDate.toISOString();
                params.fechaFin = endDate.toISOString();
            }
            const { data } = await api.get("/pagos/resumen-metodo-pago", { params });
            setResumen(data.resumen || []);
            setShowResumen(true);
        } catch (error) {
            setError("Error al obtener el resumen de pagos");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="container mt-4">
            <h2>Gestión de Pagos</h2>
            {error && <Alert variant="danger">{error}</Alert>}

            <Card bg="dark" text="white" className="mb-4 shadow-lg text-center">
                <Card.Body>
                    <Card.Title className="m-0 h4">
                        TOTAL RECAUDADO (GENERAL): {isLoading ? <Spinner animation="border" size="sm" /> : formatCurrencySafe(totalRecaudadoGeneral)}
                    </Card.Title>
                </Card.Body>
            </Card>

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form onSubmit={(e) => { e.preventDefault(); fetchPagos(); }}>
                        <Row className="align-items-end">
                            <Col md={2}>
                                <Form.Group>
                                    <Form.Label>Tipo de Filtro</Form.Label>
                                    <Form.Select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                                        <option value="dia">Día</option>
                                        <option value="semana">Semana</option>
                                        <option value="mes">Mes</option>
                                    </Form.Select>
                                </Form.Group>
                            </Col>
                            {filtroTipo === "mes" && (
                                <Col md={2}><Form.Control type="month" value={mes} onChange={(e) => setMes(e.target.value)} /></Col>
                            )}
                            {filtroTipo === "semana" && (
                                <Col md={2}><Form.Control type="week" value={semana} onChange={(e) => setSemana(e.target.value)} /></Col>
                            )}
                            {filtroTipo === "dia" && (
                                <Col md={2}><Form.Control type="date" value={dia} onChange={(e) => setDia(e.target.value)} /></Col>
                            )}
                            <Col md={3}>
                                <Form.Control type="text" value={busquedaNombre} onChange={(e) => setBusquedaNombre(e.target.value)} placeholder="Buscar cliente..." />
                            </Col>
                            <Col md={5} className="d-flex gap-2">
                                <Button type="submit" variant="primary">Filtrar</Button>
                                <Button variant="secondary" onClick={limpiarFiltros}>Limpiar</Button>
                                <Button variant="warning" onClick={abrirResumen}>Resumen Métodos</Button>
                            </Col>
                        </Row>
                    </Form>
                    <div className="mt-3 p-2 bg-success text-white rounded text-center">
                        <h5 className="m-0">TOTAL FILTRADO: {formatCurrencySafe(totalRecaudadoFiltrado)}</h5>
                    </div>
                </Card.Body>
            </Card>

            <div className="mb-4 d-flex gap-2 flex-wrap">
                <Button variant="primary" onClick={() => navigate("/pagos/crear")}>+ Crear pago</Button>
                <Button variant="success" onClick={() => navigate("/pagos/ligas")}>Pagos Ligas</Button>
                <Button variant="info" className="text-white fw-bold" onClick={() => navigate("/pagos/mensualidades")}>
                    Planilla Mensualidades
                </Button>
            </div>

            {isLoading ? (
                <div className="text-center"><Spinner animation="border" /></div>
            ) : (
                <Table striped bordered hover responsive className="shadow-sm">
                    <thead className="table-dark">
                        <tr>
                            <th>Cliente</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.map((pago) => (
                            <tr key={pago._id}>
                                <td>{pago.cliente ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}` : "N/A"}</td>
                                <td>{formatCurrencySafe(pago.monto)}</td>
                                <td>{formatFecha(pago.fecha)}</td>
                                <td>{pago.producto?.nombre || "Varios"}</td>
                                <td>
                                    <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/pagos/editar/${pago._id}`)}>Editar</Button>
                                    <Button variant="danger" size="sm" onClick={() => eliminarPago(pago._id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

            <Modal show={showResumen} onHide={() => setShowResumen(false)} centered>
                <Modal.Header closeButton><Modal.Title>Resumen por Método</Modal.Title></Modal.Header>
                <Modal.Body>
                    <Table striped bordered>
                        <thead><tr><th>Método</th><th>Total</th></tr></thead>
                        <tbody>
                            {resumen.map((r) => (
                                <tr key={r.metodoPago}><td>{r.metodoPago}</td><td>{formatCurrencySafe(r.total)}</td></tr>
                            ))}
                        </tbody>
                    </Table>
                </Modal.Body>
            </Modal>
        </div>
    );
};

export default Pagos;
