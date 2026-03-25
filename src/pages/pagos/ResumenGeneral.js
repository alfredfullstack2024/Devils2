import React, { useState } from "react";
import { Button, Card, Row, Col, Form, Spinner } from "react-bootstrap";
import api from "../../api/axios";

const ResumenGeneral = () => {
  const [fechaCierre, setFechaCierre] = useState("");
  const [loadingCierre, setLoadingCierre] = useState(false);

  const [cierre, setCierre] = useState({
    ligas: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    mensualidades: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    productos: { total: 0, efectivo: 0, transferencia: 0, tarjeta: 0 },
    totalDia: 0,
  });

  const cargarCierre = async () => {
    try {
      setLoadingCierre(true);

      // 🔹 PAGOS
      const resPagos = await api.get("/pagos");
      const pagos = resPagos.data.pagos || [];

      const pagosDia = pagos.filter((p) => {
        const fecha = new Date(p.fecha);
        if (isNaN(fecha)) return false;

        const fechaLocal =
          fecha.getFullYear() + "-" +
          String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
          String(fecha.getDate()).padStart(2, "0");

        return fechaLocal === fechaCierre;
      });

      // 🔹 MENSUALIDADES
      const year = fechaCierre.split("-")[0];
      const resMensualidades = await api.get(`/paga-mes/pagos/${year}`);
      const mensualidadesData =
        resMensualidades.data.pagos || resMensualidades.data || [];

      const mensualidadesDia = mensualidadesData.filter((m) => {
        if (!m.fecha && !m.createdAt) return false;

        const fecha = new Date(m.fecha || m.createdAt);
        if (isNaN(fecha)) return false;

        const fechaLocal =
          fecha.getFullYear() + "-" +
          String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
          String(fecha.getDate()).padStart(2, "0");

        return fechaLocal === fechaCierre;
      });

      // 🔹 LIGAS
      let ligasDia = [];
      try {
        const resLigas = await api.get("/pagos-ligas");
        const ligasData = resLigas.data || [];

        ligasDia = ligasData.filter((l) => {
          const fecha = new Date(l.createdAt || l._id);
          if (isNaN(fecha)) return false;

          const fechaLocal =
            fecha.getFullYear() + "-" +
            String(fecha.getMonth() + 1).padStart(2, "0") + "-" +
            String(fecha.getDate()).padStart(2, "0");

          return fechaLocal === fechaCierre;
        });
      } catch (err) {
        console.log("Error ligas:", err.message);
      }

      // 🔹 PRODUCTOS
      const productos = pagosDia.filter((p) => {
        const nombre = (
          p.productoManual ||
          p.producto?.nombre ||
          ""
        ).toLowerCase();

        return !nombre.includes("liga");
      });

      // 🔹 FUNCIONES
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

      const calcularMensualidades = (lista) => ({
        total: lista.reduce((acc, m) => acc + (m.total || 0), 0),
        efectivo: lista
          .filter((m) => m.metodoPago === "Efectivo")
          .reduce((acc, m) => acc + (m.total || 0), 0),
        transferencia: lista
          .filter((m) => m.metodoPago === "Transferencia")
          .reduce((acc, m) => acc + (m.total || 0), 0),
        tarjeta: lista
          .filter((m) => m.metodoPago === "Tarjeta")
          .reduce((acc, m) => acc + (m.total || 0), 0),
      });

      // 🔹 LIGAS CALCULADAS
      const ligasCalculadas = {
        total: ligasDia.reduce((acc, l) => acc + (l.total || 0), 0),
        efectivo: ligasDia
          .filter((l) => l.tipoPago === "Efectivo")
          .reduce((acc, l) => acc + (l.total || 0), 0),
        transferencia: ligasDia
          .filter((l) => l.tipoPago === "Nequi")
          .reduce((acc, l) => acc + (l.total || 0), 0),
        tarjeta: 0,
      };

      const totalPagos = pagosDia.reduce((acc, p) => acc + (p.monto || 0), 0);

      // 🔹 SET FINAL
      setCierre({
        ligas: ligasCalculadas,
        mensualidades: calcularMensualidades(mensualidadesDia),
        productos: calcular(productos),
        totalDia:
          totalPagos +
          calcularMensualidades(mensualidadesDia).total +
          ligasCalculadas.total,
      });

    } catch (err) {
      console.error(err);
    } finally {
      setLoadingCierre(false);
    }
  };

  return (
    <div className="p-3">
      <h4>Cierre Diario</h4>

      <Row className="mb-3">
        <Col md={4}>
          <Form.Control
            type="date"
            value={fechaCierre}
            onChange={(e) => setFechaCierre(e.target.value)}
          />
        </Col>
        <Col md={2}>
          <Button onClick={cargarCierre}>
            {loadingCierre ? <Spinner size="sm" /> : "Calcular"}
          </Button>
        </Col>
      </Row>

      <Row>
        <Col>
          <Card body>
            <h5>Ligas</h5>
            <p>Total: ${cierre.ligas.total}</p>
          </Card>
        </Col>

        <Col>
          <Card body>
            <h5>Mensualidades</h5>
            <p>Total: ${cierre.mensualidades.total}</p>
          </Card>
        </Col>

        <Col>
          <Card body>
            <h5>Productos</h5>
            <p>Total: ${cierre.productos.total}</p>
          </Card>
        </Col>
      </Row>

      <Card className="mt-3" body>
        <h4>Total del día: ${cierre.totalDia}</h4>
      </Card>
    </div>
  );
};

export default ResumenGeneral;
