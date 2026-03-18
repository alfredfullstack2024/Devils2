import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card, Modal, Spinner } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const formatCurrencySafe = (amount) => {
    const value = parseFloat(amount) || 0;
    return `$${value.toLocaleString("es-CO")}`;
};

const formatLocalDateTime = (date) => {
    return date.toLocaleString("sv-SE", { timeZone: "America/Bogota" }).replace(" ", "T");
};

const Pagos = () => {
    const todayISO = new Date().toLocaleDateString("sv-SE", {
        timeZone: "America/Bogota"
    });

    const currentYear = new Date().getFullYear();

    const [pagos, setPagos] = useState([]);
    const [pagosFiltrados, setPagosFiltrados] = useState([]);
    const [filtroTipo, setFiltroTipo] = useState("mes");
    const [mes, setMes] = useState("");
    const [dia, setDia] = useState(todayISO);
    const [anio, setAnio] = useState(currentYear.toString());
    const [busquedaNombre, setBusquedaNombre] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const fetchPagos = useCallback(async () => {
        setIsLoading(true);
        setError("");

        try {
            const params = {};

            if (filtroTipo === "anio" && anio) {
                const start = new Date(anio, 0, 1);
                const end = new Date(anio, 11, 31);
                end.setHours(23,59,59,999);
                params.fechaInicio = formatLocalDateTime(start);
                params.fechaFin = formatLocalDateTime(end);
            }

            if (filtroTipo === "mes" && mes) {
                const [year, month] = mes.split("-");
                params.fechaInicio = `${year}-${month}-01T00:00:00`;
                const lastDay = new Date(year, month, 0).getDate();
                params.fechaFin = `${year}-${month}-${lastDay}T23:59:59`;
            }

            if (filtroTipo === "dia" && dia) {
                params.fechaInicio = `${dia}T00:00:00`;
                params.fechaFin = `${dia}T23:59:59`;
            }

            const res = await api.get("/pagos", { params });

            const lista = res.data.pagos || [];

            setPagos(lista);
            setPagosFiltrados(lista);

        } catch (err) {
            setError("Error cargando pagos");
        } finally {
            setIsLoading(false);
        }

    }, [filtroTipo, mes, dia, anio]);

    useEffect(() => {
        fetchPagos();
    }, []);

    useEffect(() => {
        if (!busquedaNombre) {
            setPagosFiltrados(pagos);
            return;
        }

        const filtrados = pagos.filter(p => {
            const nombre = p.cliente
                ? `${p.cliente.nombre} ${p.cliente.apellido || ""}`.toLowerCase()
                : (p.clienteManual || "").toLowerCase();

            return nombre.includes(busquedaNombre.toLowerCase());
        });

        setPagosFiltrados(filtrados);

    }, [busquedaNombre, pagos]);

    const limpiarFiltros = () => {
        setFiltroTipo("mes");
        setMes("");
        setDia(todayISO);
        setAnio(currentYear.toString());
        setBusquedaNombre("");
    };

    const eliminarPago = async (id) => {
        if (!window.confirm("Eliminar pago?")) return;

        await api.delete(`/pagos/${id}`);
        fetchPagos();
    };

    const formatFecha = (f) => {
        return new Date(f).toLocaleDateString("es-CO", {
            timeZone: "America/Bogota"
        });
    };

    return (
        <div className="container mt-4">

            <h2>Pagos</h2>

            {error && <Alert variant="danger">{error}</Alert>}

            {/* FILTROS */}
            <Card className="mb-4">
                <Card.Body>
                    <Card.Title>Filtros por Fecha y Nombre</Card.Title>

                    <Row className="align-items-end">

                        <Col md={2}>
                            <Form.Label>Tipo</Form.Label>
                            <Form.Select value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
                                <option value="dia">Día</option>
                                <option value="mes">Mes</option>
                                <option value="anio">Año</option>
                            </Form.Select>
                        </Col>

                        {filtroTipo === "mes" && (
                            <Col md={2}>
                                <Form.Label>Mes</Form.Label>
                                <Form.Control type="month" value={mes} onChange={e => setMes(e.target.value)} />
                            </Col>
                        )}

                        {filtroTipo === "dia" && (
                            <Col md={2}>
                                <Form.Label>Día</Form.Label>
                                <Form.Control type="date" value={dia} onChange={e => setDia(e.target.value)} />
                            </Col>
                        )}

                        {filtroTipo === "anio" && (
                            <Col md={2}>
                                <Form.Label>Año</Form.Label>
                                <Form.Control type="number" value={anio} onChange={e => setAnio(e.target.value)} />
                            </Col>
                        )}

                        <Col md={3}>
                            <Form.Label>Buscar</Form.Label>
                            <Form.Control value={busquedaNombre} onChange={e => setBusquedaNombre(e.target.value)} />
                        </Col>

                        <Col md={3}>
                            <Button className="w-100 mb-2" onClick={fetchPagos}>Filtrar</Button>
                            <Button variant="secondary" className="w-100" onClick={limpiarFiltros}>Limpiar</Button>
                        </Col>

                    </Row>
                </Card.Body>
            </Card>

            {/* BOTONES */}
            <div className="mb-3 d-flex gap-2">
                <Button onClick={() => navigate("/pagos/crear")}>Crear pago</Button>
                <Button variant="success" onClick={() => navigate("/pagos/ligas")}>Pagos Ligas</Button>
                <Button variant="info" onClick={() => navigate("/pagos/pagames")}>Pagos Mes</Button>
                <Button variant="danger" onClick={() => navigate("/pagos/pago-rapido")}>Pago Rápido</Button>
                <Button variant="dark" onClick={() => navigate("/pagos/resumen-general")}>Resumen</Button>
            </div>

            {/* TABLA */}
            {isLoading ? (
                <Spinner />
            ) : (
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Cliente</th>
                            <th>Monto</th>
                            <th>Fecha</th>
                            <th>Producto</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {pagosFiltrados.map(p => (
                            <tr key={p._id}>
                                <td>{p.cliente?.nombre || p.clienteManual}</td>
                                <td>{formatCurrencySafe(p.monto)}</td>
                                <td>{formatFecha(p.fecha)}</td>
                                <td>{p.producto?.nombre || p.productoManual}</td>
                                <td>
                                    <Button size="sm" onClick={() => navigate(`/pagos/editar/${p._id}`)}>Editar</Button>{" "}
                                    <Button size="sm" variant="danger" onClick={() => eliminarPago(p._id)}>Eliminar</Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            )}

        </div>
    );
};

export default Pagos;
