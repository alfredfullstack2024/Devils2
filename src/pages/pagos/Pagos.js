import React, { useState, useEffect, useCallback } from "react";
import { Table, Button, Alert, Form, Row, Col, Card } from "react-bootstrap";
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
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");
  const [especialidades, setEspecialidades] = useState([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Cargar especialidades al iniciar
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await api.get("/entrenadores/especialidades", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEspecialidades(res.data || []);
      } catch (err) {
        console.error("Error cargando especialidades:", err);
      }
    };
    fetchEspecialidades();
  }, []);

  const fetchPagos = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const params = {};

      // Filtro por fecha
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

      if (filtroEspecialidad) {
        params.especialidad = filtroEspecialidad;
      }

      const response = await api.get("/pagos", { params });
      const fetchedPagos = response.data.pagos || [];
      setPagos(fetchedPagos);

      const pagosFiltrados = busquedaNombre
        ? fetchedPagos.filter((pago) => {
            const nombreCliente = pago.cliente
              ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`.toLowerCase()
              : "";
            return nombreCliente.includes(busquedaNombre.toLowerCase());
          })
        : fetchedPagos;
      setPagosFiltrados(pagosFiltrados);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError("Error al cargar los pagos: " + errorMessage);
      setPagos([]);
      setPagosFiltrados([]);
    } finally {
      setIsLoading(false);
    }
  }, [filtroTipo, mes, semana, dia, filtroEspecialidad, busquedaNombre]);

  useEffect(() => {
    fetchPagos();
  }, [fetchPagos]);

  const manejarFiltrar = async (e) => {
    e.preventDefault();
    setPagos([]);
    setPagosFiltrados([]);
    await fetchPagos();
  };

  const limpiarFiltros = async () => {
    setFiltroTipo("mes");
    setMes("");
    setSemana("");
    setDia("");
    setBusquedaNombre("");
    setFiltroEspecialidad("");
    setPagos([]);
    setPagosFiltrados([]);
    await fetchPagos();
  };

  const eliminarPago = async (id) => {
    if (!window.confirm("¿Estás seguro de que deseas eliminar este pago?")) return;
    try {
      setIsLoading(true);
      await api.delete(`/pagos/${id}`);
      setPagos((prevPagos) => {
        const nuevosPagos = prevPagos.filter((pago) => pago._id !== id);
        setPagosFiltrados(nuevosPagos);
        return nuevosPagos;
      });
      setError("");
    } catch (err) {
      setError(
        "Error al eliminar el pago: " + (err.response?.data?.message || err.message)
      );
      await fetchPagos();
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
      <h2>Pagos</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Card className="mb-4">
        <Card.Body>
          <Card.Title>Filtrar y Buscar</Card.Title>
          <Form onSubmit={manejarFiltrar}>
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
                <Form.Group controlId="busquedaNombre">
                  <Form.Label>Buscar por Nombre</Form.Label>
                  <Form.Control
                    type="text"
                    value={busquedaNombre}
                    onChange={(e) => setBusquedaNombre(e.target.value)}
                    placeholder="Nombre completo del cliente"
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <Form.Group controlId="filtroEspecialidad">
                  <Form.Label>Especialidad</Form.Label>
                  <Form.Select
                    value={filtroEspecialidad}
                    onChange={(e) => setFiltroEspecialidad(e.target.value)}
                    disabled={isLoading}
                  >
                    <option value="">Todas</option>
                    {especialidades.map((esp, idx) => (
                      <option key={idx} value={esp}>
                        {esp}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              <Col md={2} className="d-flex align-items-end">
                <Button
                  type="submit"
                  variant="primary"
                  className="me-2"
                  disabled={isLoading}
                >
                  Filtrar
                </Button>
                <Button
                  variant="secondary"
                  onClick={limpiarFiltros}
                  disabled={isLoading}
                >
                  Limpiar
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Button
        variant="primary"
        className="mb-3"
        onClick={() => navigate("/pagos/crear")}
        disabled={isLoading}
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
              <th>Especialidad</th>
              <th>Monto</th>
              <th>Fecha</th>
              <th>Producto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pagosFiltrados.map((pago) => (
              <tr key={pago._id}>
                <td>
                  {pago.cliente
                    ? `${pago.cliente.nombre} ${pago.cliente.apellido || ""}`
                    : "Cliente no encontrado"}
                </td>
                <td>{pago.cliente?.especialidad || "No asignada"}</td>
                <td>${pago.monto.toLocaleString()}</td>
                <td>{formatFecha(pago.fecha)}</td>
                <td>{pago.producto?.nombre || "Producto no especificado"}</td>
                <td>
                  <Button
                    variant="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/pagos/editar/${pago._id}`)}
                    disabled={isLoading}
                  >
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminarPago(pago._id)}
                    disabled={isLoading}
                  >
                    Eliminar
                  </Button>
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
