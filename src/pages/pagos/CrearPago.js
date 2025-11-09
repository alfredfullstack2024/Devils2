import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { obtenerClientes, obtenerProductos, crearPago } from "../../api/axios";

const CrearPago = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [formData, setFormData] = useState({
    cliente: "",
    producto: "",
    cantidad: 1,
    monto: 0,
    fecha: "",
    metodoPago: "Efectivo",
  });
  const [searchCliente, setSearchCliente] = useState(""); // búsqueda por nombre
  const [error, setError] = useState("");
  const [showTiquete, setShowTiquete] = useState(false);
  const navigate = useNavigate();

  // Configuración del tiquete
  const tiqueteConfig = {
    nombreEstablecimiento: "CLUB DEPORTIVO ICONIC ALL STARS ",
    direccion: "CALLE 2 B No. 69D-58 BOGOTA",
    telefonos: "3176696551",
    nit: "000000000-0",
  };

  // Obtener y actualizar el contador del tiquete desde localStorage
  const [ticketNumber, setTicketNumber] = useState(() => {
    const savedTicketNumber = localStorage.getItem("lastTicketNumber");
    return savedTicketNumber ? parseInt(savedTicketNumber, 10) + 1 : 1;
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesResponse, productosResponse] = await Promise.all([
          obtenerClientes(),
          obtenerProductos(),
        ]);
        setClientes(clientesResponse.data);
        setProductos(productosResponse.data);

        const today = new Date().toISOString().split("T")[0];
        setFormData((prev) => ({ ...prev, fecha: today }));
      } catch (err) {
        setError("Error al cargar los datos: " + err.message);
        if (err.message.includes("Sesión expirada")) {
          navigate("/login");
        }
      }
    };
    fetchData();
  }, [navigate]);

  useEffect(() => {
    const productoSeleccionado = productos.find(
      (p) => p._id === formData.producto
    );
    if (productoSeleccionado) {
      const monto = productoSeleccionado.precio * formData.cantidad;
      setFormData((prev) => ({ ...prev, monto }));
    }
  }, [formData.producto, formData.cantidad, productos]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "cantidad" ? parseInt(value) || 1 : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.cliente) {
      setError("Por favor seleccione un cliente válido.");
      return;
    }

    try {
      await crearPago(formData);
      setShowTiquete(true); // Mostrar tiquete tras registrar
    } catch (err) {
      setError("Error al registrar el pago: " + err.message);
      if (err.message.includes("Sesión expirada")) {
        navigate("/login");
      }
    }
  };

  const imprimirTiquete = () => {
    // Incrementar y guardar el nuevo número de tiquete
    const newTicketNumber = ticketNumber;
    localStorage.setItem("lastTicketNumber", newTicketNumber);
    setTicketNumber(newTicketNumber + 1);

    const printContent = document.getElementById("tiquete").innerHTML;
    const printWindow = window.open("", "", "height=500,width=300");
    printWindow.document.write(`
      <html>
        <head>
          <title>Tiquete de Pago</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 10px; }
            h1 { text-align: center; }
            p { margin: 0; }
            .small-text { font-size: 8px; }
          </style>
        </head>
        <body>${printContent}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
    printWindow.close();
    setShowTiquete(false); // Ocultar tras imprimir
    navigate("/pagos"); // Redirigir después de imprimir
  };

  const fechaFinal = new Date(formData.fecha);
  fechaFinal.setMonth(fechaFinal.getMonth() + 1);

  return (
    <div className="container mt-4">
      <h2>Registrar Pago</h2>

      {error && <Alert variant="danger">{error}</Alert>}

      <Card>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {/* CLIENTE con búsqueda */}
            <Form.Group className="mb-3" controlId="cliente">
              <Form.Label>Cliente</Form.Label>
              <Form.Control
                type="text"
                placeholder="Buscar cliente por nombre o apellido"
                value={searchCliente}
                onChange={(e) => {
                  const valor = e.target.value;
                  setSearchCliente(valor);

                  // Validar coincidencia exacta
                  const seleccionado = clientes.find(
                    (c) =>
                      `${c.nombre} ${c.apellido}`.toLowerCase() ===
                      valor.toLowerCase()
                  );

                  if (seleccionado) {
                    setFormData((prev) => ({
                      ...prev,
                      cliente: seleccionado._id,
                    }));
                  } else {
                    setFormData((prev) => ({ ...prev, cliente: "" }));
                  }
                }}
                list="clientes-list"
              />
              <datalist id="clientes-list">
                {clientes.map((cliente) => (
                  <option
                    key={cliente._id}
                    value={`${cliente.nombre} ${cliente.apellido}`}
                  />
                ))}
              </datalist>
            </Form.Group>

            {/* PRODUCTO */}
            <Form.Group className="mb-3" controlId="producto">
              <Form.Label>Producto (opcional)</Form.Label>
              <Form.Control
                as="select"
                name="producto"
                value={formData.producto}
                onChange={handleChange}
              >
                <option value="">Seleccione un producto</option>
                {productos.map((producto) => (
                  <option key={producto._id} value={producto._id}>
                    {producto.nombre} - ${producto.precio} ({producto.stock} en stock)
                  </option>
                ))}
              </Form.Control>
            </Form.Group>

            {/* CANTIDAD */}
            <Form.Group className="mb-3" controlId="cantidad">
              <Form.Label>Cantidad</Form.Label>
              <Form.Control
                type="number"
                name="cantidad"
                value={formData.cantidad}
                onChange={handleChange}
                min="1"
              />
            </Form.Group>

            {/* MONTO */}
            <Form.Group className="mb-3" controlId="monto">
              <Form.Label>Monto</Form.Label>
              <Form.Control type="number" value={formData.monto} readOnly />
            </Form.Group>

            {/* FECHA */}
            <Form.Group className="mb-3" controlId="fecha">
              <Form.Label>Fecha</Form.Label>
              <Form.Control
                type="date"
                name="fecha"
                value={formData.fecha}
                onChange={handleChange}
                required
              />
            </Form.Group>

            {/* MÉTODO DE PAGO */}
            <Form.Group className="mb-3" controlId="metodoPago">
              <Form.Label>Método de pago</Form.Label>
              <Form.Control
                as="select"
                name="metodoPago"
                value={formData.metodoPago}
                onChange={handleChange}
              >
                <option value="Efectivo">Efectivo</option>
                <option value="Tarjeta">Tarjeta</option>
                <option value="Transferencia">Transferencia</option>
              </Form.Control>
            </Form.Group>

            <Button variant="primary" type="submit">
              Registrar Pago
            </Button>
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => navigate("/pagos")}
            >
              Cancelar
            </Button>
          </Form>

          {showTiquete && (
            <div>
              <div
                id="tiquete"
                style={{
                  width: "300px",
                  fontFamily: "Arial, sans-serif",
                  padding: "10px",
                  border: "1px solid #000",
                  marginTop: "20px",
                }}
              >
                <h1 style={{ textAlign: "center" }}>
                  {tiqueteConfig.nombreEstablecimiento}
                </h1>
                <p style={{ textAlign: "center" }}>{tiqueteConfig.direccion}</p>
                <p style={{ textAlign: "center" }}>
                  Tel: {tiqueteConfig.telefonos} | NIT: {tiqueteConfig.nit}
                </p>
                <p>Fecha: {new Date().toLocaleDateString("es-CO")}</p>
                <p>Recibo #: {ticketNumber}</p>
                <p>
                  Cliente:{" "}
                  {clientes.find((c) => c._id === formData.cliente)?.nombre ||
                    "No especificado"}
                </p>
                <h3>Mensualidad Gym 2025</h3>
                <p>Fecha Inicio: {formData.fecha}</p>
                <p>Fecha Final: {fechaFinal.toLocaleDateString("es-CO")}</p>
                <p>
                  Pago:{" "}
                  {formData.monto.toLocaleString("es-CO", {
                    style: "currency",
                    currency: "COP",
                  })}
                </p>
                <p>Saldo: 0.00</p>
                <p>Forma Pago: {formData.metodoPago}</p>
                <p style={{ fontSize: "8px" }}>
                  Mensualidad Intransferible, No Congelable, No Se Hace
                  Devolución de Dinero
                </p>
              </div>
              <Button
                variant="primary"
                className="mt-2"
                onClick={imprimirTiquete}
              >
                Imprimir Tiquete
              </Button>
              <Button
                variant="secondary"
                className="ms-2 mt-2"
                onClick={() => setShowTiquete(false)}
              >
                Cancelar
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default CrearPago;
