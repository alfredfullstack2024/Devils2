import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Card, Row, Col, Spinner, Badge } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { obtenerClientes, obtenerProductos, crearPagoMensualidad, obtenerMensualidades } from "../../api/axios";

const PagosMensualidades = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [datosMensualidades, setDatosMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

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
    fecha: new Date().toISOString().split("T")[0]
  });

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
      setClientes(resClientes.data || []);
      setProductos(resProductos.data || []);
      setDatosMensualidades(resMensualidades.data || []);
    } catch (err) {
      console.error("Error cargando datos:", err);
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
      alert("Por favor seleccione un estudiante y el monto");
      return;
    }

    try {
      const response = await crearPagoMensualidad(formData);
      imprimirTiquete(response.data);
      setShowModal(false);
      fetchData();
    } catch (err) {
      alert("Error al registrar el pago");
    }
  };

  const imprimirTiquete = (pagoInfo) => {
    const cliente = clientes.find(c => c._id === formData.clienteId);
    const printWindow = window.open("", "", "height=600,width=400");
    printWindow.document.write(`
      <html>
        <head><style>body{font-family:Arial;text-align:center;padding:20px;}hr{border:1px dashed #000;}</style></head>
        <body>
          <h3>ICONIC ALL STARS</h3>
          <p>RECIBO DE MENSUALIDAD</p>
          <hr/>
          <p><b>Estudiante:</b> ${cliente?.nombre} ${cliente?.apellido}</p>
          <p><b>Mes Pagado:</b> ${formData.mes} ${formData.año}</p>
          <p><b>Valor:</b> $${Number(formData.monto).toLocaleString()}</p>
          <p><b>Método:</b> ${formData.metodoPago}</p>
          <p><b>Fecha:</b> ${new Date().toLocaleDateString()}</p>
          <hr/>
          <p>¡Gracias por su pago!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const clientesFiltrados = clientes.filter(c => {
    const fullNombre = `${c.nombre} ${c.apellido}`.toLowerCase();
    return fullNombre.includes(filtroNombre.toLowerCase()) && 
           (filtroEspecialidad === "" || c.especialidad === filtroEspecialidad);
  });

  const tienePago = (clienteId, mes) => {
    return datosMensualidades.some(d => d.cliente === clienteId && d.mes === mes);
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant="primary" /></div>;

  return (
    <div className="container-fluid mt-4">
      <Card className="mb-4 shadow-sm border-0">
        <Card.Body className="d-flex justify-content-between align-items-center bg-light">
          <h2 className="mb-0 text-primary">Planilla Mensualidades</h2>
          <div>
            <Button variant="success" className="me-2" onClick={() => setShowModal(true)}>+ Pago Rápido</Button>
            <Button variant="outline-secondary" onClick={() => navigate("/pagos")}>Volver</Button>
          </div>
        </Card.Body>
      </Card>

      <Row className="mb-3">
        <Col md={2}>
          <Form.Select value={filtroAño} onChange={(e) => setFiltroAño(e.target.value)}>
            <option value="2024">2024</option>
            <option value="2025">2025</option>
            <option value="2026">2026</option>
          </Form.Select>
        </Col>
        <Col md={6}>
          <Form.Control type="text" placeholder="Buscar por nombre..." onChange={(e) => setFiltroNombre(e.target.value)} />
        </Col>
        <Col md={4}>
          <Form.Select onChange={(e) => setFiltroEspecialidad(e.target.value)}>
            <option value="">Todas las especialidades</option>
            <option value="Cheerleading">Cheerleading</option>
            <option value="Danza">Danza</option>
          </Form.Select>
        </Col>
      </Row>

      <div className="table-responsive">
        <Table bordered hover className="text-center shadow-sm bg-white">
          <thead className="table-dark">
            <tr>
              <th>Estudiante</th>
              {meses.map(m => <th key={m} style={{fontSize: '11px'}}>{m.substring(0,3)}</th>)}
              <th>Total Año</th>
            </tr>
          </thead>
          <tbody>
            {clientesFiltrados.map(cliente => (
              <tr key={cliente._id}>
                <td className="text-start"><b>{cliente.nombre} {cliente.apellido}</b></td>
                {meses.map(mes => (
                  <td key={mes}>
                    {tienePago(cliente._id, mes) ? <Badge bg="success">X</Badge> : <span className="text-muted">-</span>}
                  </td>
                ))}
                <td className="table-primary">
                  <b>${datosMensualidades.filter(d => d.cliente === cliente._id).reduce((acc, curr) => acc + curr.monto, 0).toLocaleString()}</b>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton><Modal.Title>Registrar Pago</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>Estudiante</Form.Label>
              <Form.Select onChange={(e) => setFormData({...formData, clienteId: e.target.value})}>
                <option value="">Seleccione...</option>
                {clientes.map(c => <option key={c._id} value={c._id}>{c.nombre} {c.apellido}</option>)}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Producto</Form.Label>
              <Form.Select onChange={handleProductoChange}>
                <option value="">Seleccione...</option>
                {productos.map(p => <option key={p._id} value={p._id}>{p.nombre} (${p.precio})</option>)}
                <option value="OTRO">Otro / Manual</option>
              </Form.Select>
            </Form.Group>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Monto</Form.Label>
                  <Form.Control type="number" value={formData.monto} onChange={(e) => setFormData({...formData, monto: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Mes</Form.Label>
                  <Form.Select value={formData.mes} onChange={(e) => setFormData({...formData, mes: e.target.value})}>
                    {meses.map(m => <option key={m} value={m}>{m}</option>)}
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-100" onClick={handleRegistrarYImprimir}>Registrar e Imprimir</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PagosMensualidades;
