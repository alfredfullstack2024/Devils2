import React, { useState, useEffect } from "react";
import { Card, Row, Col, Form, Button, Spinner, Alert } from "react-bootstrap";
import api from "../../api/axios";

const ResumenGeneral = () => {
  const mesActual = new Date().toISOString().slice(0, 7);

  const [mes, setMes] = useState(mesActual);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [data, setData] = useState({
    ligas: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    mensualidades: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    productos: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    totalGeneral: 0,
  });

  const [fechaCierre, setFechaCierre] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [cierre, setCierre] = useState({
    ligas: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    mensualidades: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    productos: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    totalDia: 0,
  });

  const [loadingCierre, setLoadingCierre] = useState(false);

  // 🔹 Función para calcular totales
  const calcular = (lista) => ({
    total: lista.reduce((acc, p) => acc + (p.monto || 0), 0),
    efectivo: lista
      .filter((p) => p.metodoPago === "Efectivo")
      .reduce((acc, p) => acc + (p.monto || 0), 0),
    transferencia: lista
      .filter((p) => p.metodoPago === "Transferencia")
      .reduce((acc, p) => acc + (p.monto || 0), 0),
    tarjeta: lista
      .filter((p) => p.metodoPago === "Tarjeta")
      .reduce((acc, p) => acc + (p.monto || 0), 0),
  });

  // 🔹 Clasificador inteligente
  const clasificar = (p) => {
    const texto = (p.productoManual || "").toLowerCase();

    if (texto.includes("liga")) return "ligas";

    if (
      texto.includes("mensual") ||
      texto.includes("mensualidad") ||
      texto.includes("mes") ||
      texto.includes("cuota")
    ) {
      return "mensualidades";
    }

    return "productos";
  };

  // 🔹 RESUMEN GENERAL
  const cargarResumen = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await api.get("/pagos");
      let pagos = res.data.pagos || [];

      const [year, month] = mes.split("-");

      const pagosMes = pagos.filter((p) => {
        const fecha = new Date(p.fecha);
        return (
          fecha.getFullYear() === Number(year) &&
          fecha.getMonth() + 1 === Number(month)
        );
      });

      const ligas = pagosMes.filter((p) => clasificar(p) === "ligas");
      const mensualidades = pagosMes.filter(
        (p) => clasificar(p) === "mensualidades"
      );
      const productos = pagosMes.filter(
        (p) => clasificar(p) === "productos"
      );

      setData({
        ligas: calcular(ligas),
        mensualidades: calcular(mensualidades),
        productos: calcular(productos),
        totalGeneral: pagosMes.reduce((acc, p) => acc + (p.monto || 0), 0),
      });
    } catch (err) {
      console.error(err);
      setError("Error al calcular resumen");
    } finally {
      setLoading(false);
    }
  };

  // 🔹 CIERRE DIARIO
  const cargarCierre = async () => {
    try {
      setLoadingCierre(true);

      const res = await api.get("/pagos");
      let pagos = res.data.pagos || [];

      const pagosDia = pagos.filter((p) => {
        const fecha = new Date(p.fecha).toISOString().split("T")[0];
        return fecha === fechaCierre;
      });

      const ligas = pagosDia.filter((p) => clasificar(p) === "ligas");
      const mensualidades = pagosDia.filter(
        (p) => clasificar(p) === "mensualidades"
      );
      const productos = pagosDia.filter(
        (p) => clasificar(p) === "productos"
      );

      setCierre({
        ligas: calcular(ligas),
        mensualidades: calcular(mensualidades),
        productos: calcular(productos),
        totalDia: pagosDia.reduce((acc, p) => acc + (p.monto || 0), 0),
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCierre(false);
    }
  };

  useEffect(() => {
    cargarResumen();
  }, []);

  const StatCard = ({ title, stats }) => (
    <Card className="p-3 shadow-sm h-100">
      <h5 className="text-center">{title}</h5>
      <hr />
      <div className="d-flex justify-content-between mb-2">
        <strong>Total:</strong>
        <strong>${(stats.total || 0).toLocaleString("es-CO")}</strong>
      </div>
      <div className="d-flex justify-content-between">
        <span>Efectivo:</span>
        <span>${(stats.efectivo || 0).toLocaleString("es-CO")}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span>Transferencia:</span>
        <span>${(stats.transferencia || 0).toLocaleString("es-CO")}</span>
      </div>
      <div className="d-flex justify-content-between">
        <span>Tarjeta:</span>
        <span>${(stats.tarjeta || 0).toLocaleString("es-CO")}</span>
      </div>
    </Card>
  );

  return (
    <div className="container mt-4">
      <h2 className="mb-4">Resumen General de Recaudo</h2>
      {error && <Alert variant="danger">{error}</Alert>}

      <Card className="mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Control
                type="month"
                value={mes}
                onChange={(e) => setMes(e.target.value)}
              />
            </Col>
            <Col md={3}>
              <Button onClick={cargarResumen}>
                {loading ? <Spinner size="sm" /> : "Consultar"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Row className="mb-4">
        <Col md={4}><StatCard title="Ligas" stats={data.ligas} /></Col>
        <Col md={4}><StatCard title="Mensualidades" stats={data.mensualidades} /></Col>
        <Col md={4}><StatCard title="Productos" stats={data.productos} /></Col>
      </Row>

      <Card className="p-4 text-center mb-4">
        <h4>TOTAL GENERAL</h4>
        <h2>${data.totalGeneral.toLocaleString("es-CO")}</h2>
      </Card>

      <hr />

      <h3 className="text-center">Cierre Diario</h3>

      <Row className="mb-3">
        <Col md={3}>
          <Form.Control
            type="date"
            value={fechaCierre}
            onChange={(e) => setFechaCierre(e.target.value)}
          />
        </Col>
        <Col md={3}>
          <Button onClick={cargarCierre}>
            {loadingCierre ? <Spinner size="sm" /> : "Calcular"}
          </Button>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col md={4}><StatCard title="Ligas" stats={cierre.ligas} /></Col>
        <Col md={4}><StatCard title="Mensualidades" stats={cierre.mensualidades} /></Col>
        <Col md={4}><StatCard title="Productos" stats={cierre.productos} /></Col>
      </Row>

      <Card className="p-4 text-center">
        <h4>TOTAL DEL DIA</h4>
        <h2>${cierre.totalDia.toLocaleString("es-CO")}</h2>
      </Card>
    </div>
  );
};

export default ResumenGeneral;
