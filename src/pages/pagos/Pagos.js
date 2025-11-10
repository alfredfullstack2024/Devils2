// src/pages/pagos/Pagos.js
import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card, Modal } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

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
  const [totalGeneral, setTotalGeneral] = useState(0);
  const navigate = useNavigate();

  // --- 1. Cargar pagos normales ---
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
        const startDate = new Date(year, 0, 1);
        startDate.setDate(startDate.getDate() + (week - 1) * 7 - startDate.getDay() + 1);
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
      const fetchedPagos = response.data.pagos || [];
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

  // --- 2. Filtro local por nombre ---
  useEffect(() => {
    if (!busquedaNombre) {
      setPagosFiltrados(pagos);
    } else {
      const filtrados = pagos.filter((pago) => {
        const nombreCliente = pago.cliente
          ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`.toLowerCase()
          : "";
        return nombreCliente.includes(busquedaNombre.toLowerCase());
      });
      setPagosFiltrados(filtrados);
    }
  }, [busquedaNombre, pagos]);

  const limpiarFiltros = async () => {
    setFiltroTipo("mes");
    setMes("");
    setSemana("");
    setDia("");
    setBusquedaNombre("");
    await fetchPagos();
  };

  const eliminarPago = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este pago?")) return;
    try {
      setIsLoading(true);
      await api.delete(`/pagos/${id}`);
      const nuevosPagos = pagos.filter((p) => p._id !== id);
      setPagos(nuevosPagos);
      setPagosFiltrados(nuevosPagos);
    } catch (err) {
      setError("Error al eliminar el pago: " + (err.response?.data?.message || err.message));
    } finally {
      setIsLoading(false);
    }
  };

  const formatFecha = (fecha) => new Date(fecha).toLocaleDateString("es-ES");

  // --- 3. Mostrar modal con resumen ---
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
      } else if (filtroTipo === "semana" && semana) {
        const [year, week] = semana.split("-W");
        const startDate = new Date(year, 0, 1);
        startDate.setDate(startDate.getDate() + (week - 1) * 7 - startDate.getDay() + 1);
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

      const { data } = await api.get("/pagos/resumen-metodo-pago", { params });
      setResumen(data.resumen || []);
      setTotalGeneral(data.totalGeneral || 0);
      setShowResumen(true);
    } catch (error) {
      setError("Error al obtener el resumen de pagos");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mt-4">
      <h2>Pagos</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filtrar y Buscar</Card.Title>
          <Form onSubmit={(e) => { e.preventDefault(); fetchPagos(); }}>
            <Row>
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
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Mes</Form.Label>
                    <Form.Control type="month" value={mes} onChange={(e) => setMes(e.target.value)} />
                  </Form.Group>
                </Col>
              )}

              {filtroTipo === "semana" && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Semana</Form.Label>
                    <Form.Control type="week" value={semana} onChange={(e) => setSemana(e.target.value)} />
                  </Form.Group>
                </Col>
              )}

              {filtroTipo === "dia" && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label>Día</Form.Label>
                    <Form.Control type="date" value={dia} onChange={(e) => setDia(e.target.value)} />
                  </Form.Group>
                </Col>
              )}

              <Col md={3}>
                <Form.Group>
                  <Form.Label>Buscar por Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={busquedaNombre}
                    onChange={(e) => setBusquedaNombre(e.target.value)}
                    placeholder="Nombre del cliente"
                  />
                </Form.Group>
              </Col>

              <Col md={3} className="d-flex align-items-end">
                <Button type="submit" variant="primary" className="me-2">Filtrar</Button>
                <Button variant="secondary" onClick={limpiarFiltros} className="me-2">Limpiar</Button>
                <Button variant="warning" onClick={abrirResumen}>Resumen método de pago</Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => navigate("/pagos/crear")}
      >
        Crear pago
      </Button>

      {isLoading && <Alert variant="info">Cargando pagos...</Alert>}
      {!isLoading && pagosFiltrados.length === 0 && !error && (
        <Alert variant="info">No hay pagos para mostrar.</Alert>
      )}
      {!isLoading && pagosFiltrados.length > 0 && (
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
            {pagosFiltrados.map((pago) => (
              <tr key={pago._id}>
                <td>{pago.cliente ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}` : "Sin cliente"}</td>
                <td>${pago.monto.toLocaleString()}</td>
                <td>{formatFecha(pago.fecha)}</td>
                <td>{pago.producto?.nombre || "No especificado"}</td>
                <td>
                  <Button variant="warning" size="sm" className="me-2" onClick={() => navigate(`/pagos/editar/${pago._id}`)}>
                    Editar
                  </Button>
                  <Button variant="danger" size="sm" onClick={() => eliminarPago(pago._id)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      {/* Modal Resumen */}
      <Modal show={showResumen} onHide={() => setShowResumen(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Resumen por Método de Pago</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {resumen.length === 0 ? (
            <Alert variant="info">No hay datos disponibles.</Alert>
          ) : (
            <Table striped bordered>
              <thead>
                <tr>
                  <th>Método</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {resumen.map((r) => (
                  <tr key={r.metodoPago}>
                    <td>{r.metodoPago}</td>
                    <td>${r.total.toLocaleString()}</td>
                  </tr>
                ))}
                <tr className="fw-bold">
                  <td>Total general</td>
                  <td>${totalGeneral.toLocaleString()}</td>
                </tr>
              </tbody>
            </Table>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResumen(false)}>
            Cerrar
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Pagos;
