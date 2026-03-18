import React, { useState } from "react";
import { Form, Button, Alert, Card, Container } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";

const PagoRapido = () => {
  const [formData, setFormData] = useState({
    clienteManual: "",
    productoManual: "",
    monto: "",
    fecha: new Date().toISOString().split("T")[0],
    metodoPago: "Efectivo",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      // Enviamos los datos al backend
      await api.post("/pagos/pago-rapido", formData);
      setSuccess(true);
      // No navegamos de inmediato para que el usuario pueda ver el tiquete aquí mismo
    } catch (err) {
      console.error(err);
      setError("Error al registrar el pago rápido. Revisa el modelo en el backend.");
    }
  };

  const imprimirTiquete = () => {
    window.print(); // Esto imprimirá la página actual. 
    // Si quieres algo más profesional, se puede usar una librería como react-to-print.
  };

  return (
    <Container className="mt-4">
      <h2 className="text-danger fw-bold mb-4">PAGO RÁPIDO</h2>
      
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">¡Pago registrado con éxito!</Alert>}

      <Card className="shadow-sm border-danger mb-5">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Nombre del Cliente (Escribir)</Form.Label>
              <Form.Control 
                name="clienteManual" 
                onChange={handleChange} 
                required 
                placeholder="Nombre completo" 
                disabled={success}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Concepto / Producto</Form.Label>
              <Form.Control 
                name="productoManual" 
                onChange={handleChange} 
                required 
                placeholder="Ej: Mensualidad o Implemento" 
                disabled={success}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Monto ($)</Form.Label>
              <Form.Control 
                type="number" 
                name="monto" 
                onChange={handleChange} 
                required 
                disabled={success}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label className="fw-bold">Método de Pago</Form.Label>
              <Form.Select name="metodoPago" onChange={handleChange} disabled={success}>
                <option value="Efectivo">Efectivo</option>
                <option value="Transferencia">Transferencia</option>
                <option value="Tarjeta">Tarjeta</option>
              </Form.Select>
            </Form.Group>

            {!success ? (
              <Button variant="danger" type="submit" className="w-100 fw-bold">
                Registrar Pago
              </Button>
            ) : (
              <div className="d-flex gap-2">
                <Button variant="primary" onClick={imprimirTiquete} className="flex-grow-1">
                  Imprimir Comprobante
                </Button>
                <Button variant="secondary" onClick={() => navigate("/pagos")}>
                  Volver a Pagos
                </Button>
              </div>
            )}
          </Form>
        </Card.Body>
      </Card>

      {/* Tiquete visual dentro de la aplicación */}
      {success && (
        <div className="d-flex justify-content-center">
          <div id="tiquete-print" style={{
            width: "300px",
            padding: "20px",
            border: "1px dashed #000",
            backgroundColor: "#fff",
            fontFamily: "monospace"
          }}>
            <h5 className="text-center fw-bold">ICONIC ALL STARS</h5>
            <p className="small mb-1 text-center">COMPROBANTE MANUAL</p>
            <hr />
            <p className="mb-1"><strong>Fecha:</strong> {formData.fecha}</p>
            <p className="mb-1"><strong>Cliente:</strong> {formData.clienteManual.toUpperCase()}</p>
            <p className="mb-1"><strong>Concepto:</strong> {formData.productoManual}</p>
            <hr />
            <h5 className="text-end fw-bold">Total: ${Number(formData.monto).toLocaleString()}</h5>
            <p className="small mt-3 text-center">Gracias por su pago</p>
          </div>
        </div>
      )}
    </Container>
  );
};

export default PagoRapido;
