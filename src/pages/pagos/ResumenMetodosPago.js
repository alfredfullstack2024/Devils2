// src/pages/pagos/ResumenMetodosPago.js
import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const ResumenMetodosPago = () => {
  const [pagos, setPagos] = useState([]);
  const [filtroTipo, setFiltroTipo] = useState("mes");
  const [mes, setMes] = useState("");
  const [semana, setSemana] = useState("");
  const [dia, setDia] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const fetchPagos = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = {};

      // Filtro de fechas
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

      const response = await api.get("/pagos", { params });
      setPagos(response.data.pagos || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError("Error al cargar los pagos: " + errorMessage);
      setPagos([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroTipo, mes, semana, dia]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  const calcularTotal = (metodo) =>
    pagos
      .filter((p) => p.metodoPago === metodo)
      .reduce((sum, p) => sum + p.monto, 0);

  const totalGeneral = pagos.reduce((sum, p) => sum + p.monto, 0);

  return (
    <div className="container mt-4">
      <h2>Resumen por Método de Pago</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filtrar por Fecha</Card.Title>
          <Form onSubmit={(e) => e.preventDefault()}>
            <Row>
              <Col md={2}>
                <Form.Group>
                  <Form.Label>Tipo de filtro</Form.Label>
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
                <Col md={3}>
                  <Form.Group>
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
                <Col md={3}>
                  <Form.Group>
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
                <Col md={3}>
                  <Form.Group>
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

              <Col md={2} className="d-flex align-items-end">
                <Button
                  variant="primary"
                  onClick={fetchPagos}
                  disabled={isLoading}
                >
                  Filtrar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card>
        <Card.Body>
          <Card.Title>Resumen General</Card.Title>

          {isLoading && <Alert variant="info">Cargando datos...</Alert>}
          {!isLoading && pagos.length === 0 && (
            <Alert variant="info">No hay datos para mostrar.</Alert>
          )}

          {!isLoading && pagos.length > 0 && (
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Método de Pago</th>
                  <th>Total de Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {["Efectivo", "Transferencia", "Tarjeta"].map((metodo) => (
                  <tr key={metodo}>
                    <td>{metodo}</td>
                    <td>${calcularTotal(metodo).toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="fw-bold">
                  <td>Total General</td>
                  <td>${totalGeneral.toLocaleString()}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Card.Body>
      </Card>

      <div className="mt-3">
        <Button variant="secondary" onClick={() => navigate("/pagos")}>
          Volver a Pagos
        </Button>
      </div>
    </div>
  );
};

export default ResumenMetodosPago;
