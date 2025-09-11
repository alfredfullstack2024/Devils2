// src/pages/pagos/ReportePagosPorEquipo.js
import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card } from "react-bootstrap";
import api from "../../api/axios";

const ReportePagosPorEquipo = () => {
  const [pagos, setPagos] = useState([]);
  const [equipos, setEquipos] = useState([]);
  const [filtroEquipo, setFiltroEquipo] = useState("");
  const [filtroTipo, setFiltroTipo] = useState("mes");
  const [mes, setMes] = useState("");
  const [semana, setSemana] = useState("");
  const [dia, setDia] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 🔹 Cargar lista de equipos (únicos de clientes)
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/clientes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        const clientes = res.data || [];
        const equiposUnicos = [
          ...new Set(clientes.map((c) => c.especialidad).filter(Boolean)),
        ];
        setEquipos(equiposUnicos);
      } catch (err) {
        console.error("Error cargando equipos:", err);
      }
    };
    fetchEquipos();
  }, []);

  const fetchPagos = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = {};

      // 📅 Filtro de fechas
      if (filtroTipo === "mes" && mes) {
        const [year, month] = mes.split("-");
        const startDate = new Date(year, month - 1, 1);
        const endDate = new Date(year, month, 0);
        endDate.setHours(23, 59, 59, 999);
        params.fechaInicio = startDate.toISOString();
        params.fechaFin = endDate.toISOString();
      } else if (filtroTipo === "semana" && semana) {
        const [year, week] = semana.split("-W");
        const startDate = new Date(year, 0, 1);
        startDate.setDate(
          startDate.getDate() + (week - 1) * 7 - startDate.getDay() + 1
        );
        const endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 6);
        endDate.setHours(23, 59, 59, 999);
        params.fechaInicio = startDate.toISOString();
        params.fechaFin = endDate.toISOString();
      } else if (filtroTipo === "dia" && dia) {
        const startDate = new Date(dia);
        const endDate = new Date(dia);
        endDate.setHours(23, 59, 59, 999);
        params.fechaInicio = startDate.toISOString();
        params.fechaFin = endDate.toISOString();
      }

      if (filtroEquipo) {
        params.especialidad = filtroEquipo;
      }

      const token = localStorage.getItem("token");
      const response = await api.get("/pagos/reporte", {
        headers: { Authorization: `Bearer ${token}` },
        params,
      });

      setPagos(response.data.pagos || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError("Error al cargar el reporte: " + errorMessage);
      setPagos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroTipo, mes, semana, dia, filtroEquipo]);

  const formatFecha = (fecha) => {
    const date = new Date(fecha);
    return date.toLocaleDateString("es-ES");
  };

  return (
    <div className="container mt-4">
      <h2>Reporte de Pagos por Equipos</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filtros</Card.Title>
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              fetchPagos();
            }}
          >
            <Row>
              <Col md={2}>
                <Form.Group controlId="filtroTipo">
                  <Form.Label>Tipo de Filtro</Form.Label>
                  <Form.Select
                    value={filtroTipo}
                    onChange={(e) => setFiltroTipo(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="dia">Día</option>
                    <option value="semana">Semana</option>
                    <option value="mes">Mes</option>
                  </Form.Select>
                </Form.Group>
              </Col>

              {filtroTipo === "mes" && (
                <Col md={2}>
                  <Form.Group controlId="mes">
                    <Form.Label>Mes</Form.Label>
                    <Form.Control
                      type="month"
                      value={mes}
                      onChange={(e) => setMes(e.target.value)}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              {filtroTipo === "semana" && (
                <Col md={2}>
                  <Form.Group controlId="semana">
                    <Form.Label>Semana</Form.Label>
                    <Form.Control
                      type="week"
                      value={semana}
                      onChange={(e) => setSemana(e.target.value)}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              {filtroTipo === "dia" && (
                <Col md={2}>
                  <Form.Group controlId="dia">
                    <Form.Label>Día</Form.Label>
                    <Form.Control
                      type="date"
                      value={dia}
                      onChange={(e) => setDia(e.target.value)}
                      disabled={isLoading}
                    />
                  </Form.Group>
                </Col>
              )}

              <Col md={3}>
                <Form.Group controlId="filtroEquipo">
                  <Form.Label>Equipo</Form.Label>
                  <Form.Select
                    value={filtroEquipo}
                    onChange={(e) => setFiltroEquipo(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Todos</option>
                    {equipos.map((eq, idx) => (
                      <option key={idx} value={eq}>
                        {eq}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex align-items-end">
                <Button type="submit" variant="primary" disabled={isLoading}>
                  Generar Reporte
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {isLoading && <Alert variant="info">Cargando reporte...</Alert>}
      {!isLoading && pagos.length === 0 && !error && (
        <Alert variant="info">No hay pagos para mostrar.</Alert>
      )}
      {!isLoading && pagos.length > 0 && (
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
                <td>{pago.cliente?.especialidad || "No asignado"}</td>
                <td>${pago.monto.toLocaleString()}</td>
                <td>{formatFecha(pago.fecha)}</td>
                <td>{pago.producto?.nombre || "Producto no especificado"}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default ReportePagosPorEquipo;
