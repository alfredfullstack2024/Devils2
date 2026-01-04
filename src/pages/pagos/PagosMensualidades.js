import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Card, Alert, Row, Col } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { obtenerClientes, obtenerProductos, crearPagoMensualidad, obtenerMensualidades } from "../../api/axios";

const PagosMensualidades = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [datosMensualidades, setDatosMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  // Filtros
  const [filtroAño, setFiltroAño] = useState(new Date().getFullYear());
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroEspecialidad, setFiltroEspecialidad] = useState("");

  const meses = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

  const [formData, setFormData] = useState({
    clienteId: "",
    productoId: "",
    monto: 0,
    mes: meses[new Date().getMonth()],
    año: new Date().getFullYear(),
    metodoPago: "Efectivo",
    cantidad: 1,
    fecha: new Date().toISOString().split("T")[0]
  });

  const tiqueteConfig = {
    nombreEstablecimiento: "CLUB DEPORTIVO ICONIC ALL STARS",
    direccion: "CALLE 2 B No. 69D-58 BOGOTÁ",
    telefonos: "3176696551",
    nit: "000000000-0",
  };

  useEffect(() => {
    fetchData();
  }, [filtroAño]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resClientes, resProductos, resMensualidades] = await Promise.all([
        obtenerClientes(),
        obtenerProductos(),
        obtenerMensualidades(filtroAño)
      ]);
      setClientes(resClientes.data);
      setProductos(resProductos.data);
      setDatosMensualidades(resMensualidades.data);
    } catch (err) {
      setError("Error al cargar los datos de mensualidades.");
    } finally {
      setLoading(false);
    }
  };

  const handleProductoChange = (e) => {
    const pId = e.target.value;
    if (pId === "OTRO") {
      setFormData({ ...formData, productoId: "OTRO", monto: 0 });
    } else {
      const prod = productos.find(p => p._id === pId);
      setFormData({ ...formData, productoId: pId, monto: prod?.precio || 0 });
    }
  };

  const handleRegistrarYImprimir = async () => {
    if (!formData.clienteId || !formData.monto) {
      alert("Por favor complete los campos obligatorios");
      return;
    }

    try {
      const response = await crearPagoMensualidad(formData);
      imprimirTiquete(response.data.pago);
      setShowModal(false);
      fetchData(); // Recargar tabla
    } catch (err) {
      alert("Error al registrar el pago");
    }
  };

  const imprimirTiquete = (pagoInfo) => {
    const cliente = clientes.find(c => c._id === formData.clienteId);
    const printWindow = window.open("", "", "height=500,width=300");
    printWindow.document.write(`
      <html>
        <head>
          <title>Tiquete de Pago</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 10px; font-size: 12px; }
            h1 { text-align: center; font-size: 14px; margin: 5px 0; }
            p { margin: 2px 0; }
            .line { border-bottom: 1px dashed #000; margin: 5px 0; }
          </style>
        </head>
        <body>
          <h1>${tiqueteConfig.nombreEstablecimiento}</h1>
          <p style="text-align:center">${tiqueteConfig.direccion}</p>
          <p style="text-align:center">Tel: ${tiqueteConfig.telefonos}</p>
          <div class="line"></div>
          <p><b>Recibo de Mensualidad</b></p>
          <p>Fecha: ${new Date().toLocaleDateString()}</p>
          <p>Cliente: ${cliente?.nombre} ${cliente?.apellido}</p>
          <p>Mes Pagado: ${formData.mes} ${formData.año}</p>
          <div class="line"></div>
          <p>Concepto: ${formData.productoId === "OTRO" ? "Mensualidad/Otro" : "Mensualidad Gym"}</p>
          <p>Valor: $${Number(formData.monto).toLocaleString()}</p>
          <p>Método: ${formData.metodoPago}</p>
          <div class="line"></div>
          <p style="font-size:8px; text-align:center">Gracias por su pago. Mensualidad no reembolsable.</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
  };

  // Filtrado de la tabla
  const clientesFiltrados = clientes.filter(c => {
    const fullNombre = `${c.nombre} ${c.apellido}`.toLowerCase();
    return fullNombre.includes(filtroNombre.toLowerCase()) && 
           (filtroEspecialidad === "" || c.especialidad === filtroEspecialidad);
  });

  const tienePago = (clienteId, mes) => {
    return datosMensualidades.some(d => d.cliente === clienteId && d.mes === mes);
  };

  const calcularTotalAño = (clienteId) => {
    return datosMensualidades
      .filter(d => d.cliente === clienteId)
      .reduce((acc, curr) => acc + curr.monto, 0);
  };

  return (
    <div className="container-fluid mt-4">
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-center">
            <Col md={4}><h2>Pagos Mensualidades</h2></Col>
            <Col md={8} className="text-end">
              <Button variant="success" onClick={() => setShowModal(true)}>+ Pago Rápido</Button>
              <Button variant="secondary" className="ms-2" onClick={() => navigate("/pagos")}>Volver a Pagos</Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="mb-3">
        <Card.Body>
          <Row>
            <Col md={3}>
              <Form.Label>Año</Form.Label>
              <Form.Select value={filtroAño} onChange={(e) => setFiltroAño(e.target.value)}>
                <option value="2024">2024</option>
                <option value="2025">2025</option>
                <option value="2026">2026</option>
              </Form.Select>
            </Col>
            <Col md={5}>
              <Form.Label>Buscar Estudiante</Form.Label>
              <Form.Control type="text" placeholder="Nombre..." value={filtroNombre} onChange={(e) => setFiltroNombre(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label>Especialidad</Form.Label>
              <Form.Select value={filtroEspecialidad} onChange={(e) => setFiltroEspecialidad(e.target.value)}>
                <option value="">Todas</option>
                <option value="Cheerleading">Cheerleading</option>
                <option value="Danza">Danza</option>
              </Form.Select>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Table responsive bordered hover className="text-center bg-white shadow-sm">
        <thead className="table-dark">
          <tr>
            <th>Estudiante</th>
            <th>Especialidad</th>
            {meses.map(m => <th key={m}>{m.substring(0,3)}</th>)}
            <th>Recaudado</th>
          </tr>
        </thead>
        <tbody>
          {clientesFiltrados.map(cliente => (
            <tr key={cliente._id}>
              <td className="text-start"><b>{cliente.nombre} {cliente.apellido}</b></td>
              <td><small>{cliente.especialidad}</small></td>
              {meses.map(mes => (
                <td key={mes}>
                  {tienePago(cliente._id, mes) ? <b className="text-success">X</b> : <span className="text-muted">-</span>}
                </td>
              ))}
              <td className="table-primary"><b>${calcularTotalAño(cliente._id).toLocaleString()}</b></td>
            </tr>
          ))}
        </tbody>
        <tfoot>
            <tr className="table-secondary">
                <td colSpan={14} className="text-end"><b>TOTAL RECAUDADO AÑO {filtroAño}:</b></td>
                <td><b>${datosMensualidades.reduce((a,b) => a + b.monto, 0).toLocaleString()}</b></td>
            </tr>
        </tfoot>
      </Table>

      {/* MODAL PAGO RÁPIDO */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>Registrar Nueva Mensualidad</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Estudiante</Form.Label>
                  <Form.Select onChange={(e) => setFormData({...formData, clienteId: e.target.value})}>
                    <option value="">Seleccione...</option>
                    {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellido}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Producto</Form.Label>
                  <Form.Select onChange={handleProductoChange}>
                    <option value="">Seleccione...</option>
                    {productos.map(p => <option key={p._id} value={p._id}>{p.nombre} - ${p.precio}</option>)}
                    <option value="OTRO">OTRO (Descuento/Manual)</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
            <Row>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <Form.Control type="number" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Mes a Pagar</Form.Label>
                  <Form.Select value={formData.mes} onChange={(e) => setFormData({...formData, mes: e.target.value})}>
                    {meses.map(m => <option key={m} value={m}>{m}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label>Método</Form.Label>
                  <Form.Select value={formData.metodoPago} onChange={(e) => setFormData({...formData, metodoPago: e.target.value})}>
                    <option value="Efectivo">Efectivo</option>
                    <option value="Nequi">Nequi</option>
                    <option value="Transferencia">Transferencia</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleRegistrarYImprimir}>Registrar e Imprimir Tiquete</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PagosMensualidades;
