import React, { useState, useEffect } from "react";
import { Table, Button, Form, Spinner, Alert } from "react-bootstrap";
import { obtenerClientes, crearPagoMensualidad, obtenerMensualidades } from "../../api/axios";

const PagosMensualidades = () => {
    const [clientes, setClientes] = useState([]);
    const [datosMensualidades, setDatosMensualidades] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());

    const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resClientes, resMensualidades] = await Promise.all([
                obtenerClientes(),
                obtenerMensualidades(filtroAnio)
            ]);
            setClientes(resClientes.data || []);
            setDatosMensualidades(resMensualidades.data || []);
        } catch (err) {
            setError("Error al cargar datos de la planilla. Revisa la conexión con el servidor.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [filtroAnio]);

    const handleRegistrarPago = async (clienteId, mesIndex) => {
        const montoStr = window.prompt(`Monto para el mes de ${meses[mesIndex]}:`, "80000");
        if (montoStr === null) return;

        try {
            await crearPagoMensualidad({
                clienteId,
                mes: mesIndex + 1,
                anio: filtroAnio,
                monto: Number(montoStr),
                metodoPago: "Efectivo"
            });
            fetchData(); 
        } catch (err) {
            alert("Error al registrar el pago");
        }
    };

    const getPago = (clienteId, mesIndex) => {
        return datosMensualidades.find(p => p.cliente === clienteId && p.mes === (mesIndex + 1));
    };

    const formatCompact = (monto) => {
        return monto >= 1000 ? `${Math.floor(monto / 1000)}k` : monto;
    };

    if (loading) return (
        <div className="text-center mt-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2">Cargando Planilla de Mensualidades...</p>
        </div>
    );

    return (
        <div className="container-fluid p-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h3>Planilla Anual {filtroAnio}</h3>
                <Form.Group className="d-flex align-items-center">
                    <Form.Label className="me-2 mb-0 fw-bold">Año:</Form.Label>
                    <Form.Control 
                        type="number" 
                        value={filtroAnio} 
                        onChange={(e) => setFiltroAnio(parseInt(e.target.value))} 
                        style={{ width: '110px' }}
                    />
                </Form.Group>
            </div>

            {error && <Alert variant="danger">{error}</Alert>}

            <div className="table-responsive shadow-sm rounded bg-white">
                <Table striped bordered hover className="text-center align-middle mb-0">
                    <thead className="table-dark">
                        <tr>
                            <th className="text-start" style={{ minWidth: '180px' }}>Cliente</th>
                            {meses.map(m => <th key={m} style={{ fontSize: '0.85rem' }}>{m}</th>)}
                            <th className="table-primary text-dark fw-bold">TOTAL</th>
                        </tr>
                    </thead>
                    <tbody>
                        {clientes.length === 0 ? (
                            <tr><td colSpan="14">No hay clientes registrados.</td></tr>
                        ) : (
                            clientes.map(c => {
                                let totalAnual = 0;
                                return (
                                    <tr key={c._id}>
                                        <td className="text-start fw-bold" style={{ fontSize: '0.9rem' }}>
                                            {c.nombre} {c.apellido}
                                        </td>
                                        {meses.map((_, i) => {
                                            const pago = getPago(c._id, i);
                                            if (pago) totalAnual += (pago.monto || 0);
                                            return (
                                                <td key={i} style={{ minWidth: '60px' }}>
                                                    {pago ? (
                                                        <span className="text-success fw-bold" style={{ fontSize: '0.8rem' }}>
                                                            {formatCompact(pago.monto)}
                                                        </span>
                                                    ) : (
                                                        <Button 
                                                            variant="link" 
                                                            size="sm" 
                                                            className="text-decoration-none text-muted p-0" 
                                                            style={{ fontSize: '1rem' }}
                                                            onClick={() => handleRegistrarPago(c._id, i)}
                                                        >
                                                            +
                                                        </Button>
                                                    )}
                                                </td>
                                            );
                                        })}
                                        <td className="fw-bold table-primary text-dark">
                                            ${totalAnual.toLocaleString("es-CO")}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </Table>
            </div>
        </div>
    );
};

export default PagosMensualidades;
