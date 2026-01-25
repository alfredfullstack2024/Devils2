import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Form, Row, Col, Card, Alert, Spinner } from "react-bootstrap";
import api from "../../api/axios";

const PagaMes = () => {
    const [meses, setMeses] = useState([]);
    const [mesSeleccionado, setMesSeleccionado] = useState("");
    const [pagos, setPagos] = useState([]);
    const [nuevoMes, setNuevoMes] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        nombre: "", monto: "", tipoPago: "Efectivo", comentario: ""
    });

    const fetchMeses = useCallback(async () => {
        try {
            const { data } = await api.get("/paga-mes/meses");
            setMeses(data);
            if (data.length > 0 && !mesSeleccionado) setMesSeleccionado(data[0]._id);
        } catch (err) { setError("Error al cargar meses"); }
    }, [mesSeleccionado]);

    const fetchPagos = useCallback(async () => {
        if (!mesSeleccionado) return;
        setLoading(true);
        try {
            const { data } = await api.get(`/paga-mes/pagos/${mesSeleccionado}`);
            setPagos(data);
        } catch (err) { setError("Error al cargar pagos"); }
        finally { setLoading(false); }
    }, [mesSeleccionado]);

    useEffect(() => { fetchMeses(); }, [fetchMeses]);
    useEffect(() => { fetchPagos(); }, [fetchPagos]);

    const handleCrearMes = async () => {
        if (!nuevoMes) return;
        try {
            await api.post("/paga-mes/crear-mes", { nombre: nuevoMes });
            setNuevoMes("");
            fetchMeses();
        } catch (err) { setError("El mes ya existe o error de red"); }
    };

    const handleRegistrarPago = async (e) => {
        e.preventDefault();
        try {
            await api.post("/paga-mes/pagos", { ...form, mes: mesSeleccionado });
            setForm({ nombre: "", monto: "", tipoPago: "Efectivo", comentario: "" });
            fetchPagos();
        } catch (err) { setError("Error al registrar pago"); }
    };

    const eliminarPago = async (id) => {
        if (!window.confirm("¿Eliminar registro?")) return;
        await api.delete(`/paga-mes/pagos/${id}`);
        fetchPagos();
    };

    const totalMes = pagos.reduce((acc, p) => acc + (p.tipoPago !== 'SYSTEM' ? p.monto : 0), 0);

    return (
        <div className="container mt-4">
            <h3>Gestión Mensualidades (Paga Mes)</h3>
            {error && <Alert variant="danger" onClose={() => setError("")} dismissible>{error}</Alert>}

            <Row className="mb-4">
                <Col md={6}>
                    <Card>
                        <Card.Body>
                            <Form.Label>Seleccionar Mes</Form.Label>
                            <div className="d-flex gap-2">
                                <Form.Select value={mesSeleccionado} onChange={(e) => setMesSeleccionado(e.target.value)}>
                                    {meses.map(m => <option key={m._id} value={m._id}>{m.nombre}</option>)}
                                </Form.Select>
                                <Form.Control type="text" placeholder="Nuevo Mes (Ej: Mayo 2026)" value={nuevoMes} onChange={(e) => setNuevoMes(e.target.value)} />
                                <Button onClick={handleCrearMes}>Crear</Button>
                            </div>
                        </Card.Body>
                    </Card>
                </Col>
                <Col md={6}>
                    <Card className="bg-success text-white text-center">
                        <Card.Body>
                            <h5>Total Recaudado en {mesSeleccionado}:</h5>
                            <h3>${totalMes.toLocaleString()}</h3>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>

            <Card className="mb-4 shadow-sm">
                <Card.Body>
                    <Form onSubmit={handleRegistrarPago}>
                        <Row>
                            <Col md={4}><Form.Control placeholder="Nombre Cliente" required value={form.nombre} onChange={e => setForm({...form, nombre: e.target.value})} /></Col>
                            <Col md={2}><Form.Control type="number" placeholder="Monto $" required value={form.monto} onChange={e => setForm({...form, monto: e.target.value})} /></Col>
                            <Col md={2}>
                                <Form.Select value={form.tipoPago} onChange={e => setForm({...form, tipoPago: e.target.value})}>
                                    <option value="Efectivo">Efectivo</option>
                                    <option value="Nequi">Nequi</option>
                                </Form.Select>
                            </Col>
                            <Col md={3}><Form.Control placeholder="Comentario" value={form.comentario} onChange={e => setForm({...form, comentario: e.target.value})} /></Col>
                            <Col md={1}><Button type="submit" variant="primary">Add</Button></Col>
                        </Row>
                    </Form>
                </Card.Body>
            </Card>

            <Table striped bordered hover responsive>
                <thead className="table-dark">
                    <tr>
                        <th>Cliente</th>
                        <th>Monto</th>
                        <th>Tipo</th>
                        <th>Fecha</th>
                        <th>Acción</th>
                    </tr>
                </thead>
                <tbody>
                    {loading ? <tr><td colSpan="5" className="text-center"><Spinner animation="border" /></td></tr> :
                        pagos.filter(p => p.tipoPago !== 'SYSTEM').map(p => (
                            <tr key={p._id}>
                                <td>{p.nombre}</td>
                                <td>${p.monto.toLocaleString()}</td>
                                <td><span className={`badge ${p.tipoPago === 'Nequi' ? 'bg-info' : 'bg-success'}`}>{p.tipoPago}</span></td>
                                <td>{new Date(p.createdAt).toLocaleDateString()}</td>
                                <td><Button variant="outline-danger" size="sm" onClick={() => eliminarPago(p._id)}>X</Button></td>
                            </tr>
                        ))
                    }
                </tbody>
            </Table>
        </div>
    );
};

export default PagaMes;
