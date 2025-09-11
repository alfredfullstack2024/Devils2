// src/pages/pagos/ReportePagosPorEquipo.js
import React, { useState, useEffect } from "react";
import { Table, Button, Alert, Form, Row, Col, Card } from "react-bootstrap";
import api from "../../api/axios";

const ReportePagosPorEquipo = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagos, setPagos] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Cargar especialidades desde el backend
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const response = await api.get("/especialidades");
        setEspecialidades(response.data || []);
      } catch (err) {
        setError("Error al cargar las especialidades");
      }
    };
    fetchEspecialidades();
  }, []);

  // Generar el reporte
  const generarReporte = async () => {
    setIsLoading(true);
    setError("");
    try {
      const params = {};
      if (fechaInicio) params.fechaInicio = new Date(fechaInicio).toISOString();
      if (fechaFin) {
        const endDate = new Date(fechaFin);
        endDate.setHours(23, 59, 59, 999);
        params.fechaFin = endDate.toISOString();
      }
      if (equipoSeleccionado !== "todos") {
        params.especialidad = equipoSeleccionado;
      }

      const response = await api.get("/pagos/reporte", { params });
      setPagos(response.data || []);
    } catch (err) {
      setError("Error al generar el informe: " + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="container mt-4">
      <h2>Informe de pagos por equipo</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Form>
            <Row>
              <Col md={3}>
                <Form.Group controlId="equipoSeleccionado">
                  <Form.Label>Equipo</Form.Label>
                  <Form.Select
                    value={equipoSeleccionado}
                    onChange={(e) => setEquipoSeleccionado(e.target.value)}
                  >
                    <option value="todos">Todos</option>
                    {especialidades.map((esp) => (
                      <option key={esp._id} value={esp._id}>
                        {esp.nombre}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="fechaInicio">
                  <Form.Label>Fecha inicial</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="fechaFin">
                  <Form.Label>Fecha final</Form.Label>
                  <Form.Control
                    type="date"
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.target.value)}
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={generarReporte}
                  disabled={isLoading}
                >
                  {isLoading ? "Generando..." : "Generar Informe"}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {!isLoading && pagos.length === 0 && (
        <Alert variant="info">No hay pagos para mostrar.</Alert>
      )}

      {pagos.length > 0 && (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Producto</th>
            </tr>
          </thead>
          <tbody>
            {pagos.map((pago) => (
              <tr key={pago._id}>
                <td>
                  {pago.cliente
                    ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`
                    : "Cliente no encontrado"}
                </td>
                <td>{pago.especialidad?.nombre || "No asignado"}</td>
                <td>${pago.monto.toLocaleString()}</td>
                <td>{formatFecha(pago.fecha)}</td>
                <td>{pago.producto?.nombre || "No especificado"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ReportePagosPorEquipo;
