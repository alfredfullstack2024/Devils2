// src/pages/pagos/CrearPago.js
import React, { useState, useEffect } from "react";
import axios from "axios";
import moment from "moment";
import "bootstrap/dist/css/bootstrap.min.css";

const CrearPago = () => {
  const [clientes, setClientes] = useState([]);
  const [productos, setProductos] = useState([]);
  const [pago, setPago] = useState({
    cliente: "",
    producto: "",
    cantidad: 1,
    monto: "",
    fecha: moment().format("YYYY-MM-DD"),
    metodoPago: "",
  });
  const [ticket, setTicket] = useState(null);
  const [mensaje, setMensaje] = useState("");

  const API_URL = "https://backendiconic.onrender.com";

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [clientesRes, productosRes] = await Promise.all([
          axios.get(`${API_URL}/clientes`),
          axios.get(`${API_URL}/productos`),
        ]);
        setClientes(clientesRes.data);
        setProductos(productosRes.data);
      } catch (error) {
        console.error("Error cargando datos:", error);
      }
    };
    fetchData();
  }, []);

  const handleChange = (e) => {
    setPago({ ...pago, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/pagos`, pago);
      setTicket(response.data);
      setMensaje("✅ Pago registrado correctamente");
      setTimeout(() => setMensaje(""), 3000);
      // limpiar formulario
      setPago({
        cliente: "",
        producto: "",
        cantidad: 1,
        monto: "",
        fecha: moment().format("YYYY-MM-DD"),
        metodoPago: "",
      });
    } catch (error) {
      console.error("Error registrando pago:", error);
      setMensaje("❌ Error registrando pago");
      setTimeout(() => setMensaje(""), 3000);
    }
  };

  const handlePrint = () => {
    const contenido = document.getElementById("ticket");
    const ventana = window.open("", "", "width=400,height=600");
    ventana.document.write("<html><head><title>Recibo</title></head><body>");
    ventana.document.write(contenido.innerHTML);
    ventana.document.write("</body></html>");
    ventana.document.close();
    ventana.print();
  };

  return (
    <div className="container mt-3 mb-5">
      <h6>Registrar Pago</h6>

      {mensaje && (
        <div
          className={`alert ${
            mensaje.includes("✅") ? "alert-success" : "alert-danger"
          }`}
          role="alert"
        >
          {mensaje}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label className="form-label">Cliente</label>
          <select
            className="form-select"
            name="cliente"
            value={pago.cliente}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione cliente</option>
            {clientes.map((c) => (
              <option key={c._id} value={c.nombre}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2">
          <label className="form-label">Producto</label>
          <select
            className="form-select"
            name="producto"
            value={pago.producto}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione producto</option>
            {productos.map((p) => (
              <option key={p._id} value={p.nombre}>
                {p.nombre} - ${p.precio}
              </option>
            ))}
          </select>
        </div>

        <div className="row">
          <div className="col-md-4 mb-2">
            <label className="form-label">Cantidad</label>
            <input
              type="number"
              className="form-control"
              name="cantidad"
              value={pago.cantidad}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-2">
            <label className="form-label">Monto</label>
            <input
              type="number"
              className="form-control"
              name="monto"
              value={pago.monto}
              onChange={handleChange}
              required
            />
          </div>

          <div className="col-md-4 mb-2">
            <label className="form-label">Fecha</label>
            <input
              type="date"
              className="form-control"
              name="fecha"
              value={pago.fecha}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="mb-2">
          <label className="form-label">Método de pago</label>
          <select
            className="form-select"
            name="metodoPago"
            value={pago.metodoPago}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione método</option>
            <option value="Efectivo">Efectivo</option>
            <option value="Transferencia">Transferencia</option>
            <option value="Tarjeta">Tarjeta</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary me-2">
          Registrar Pago
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            setPago({
              cliente: "",
              producto: "",
              cantidad: 1,
              monto: "",
              fecha: moment().format("YYYY-MM-DD"),
              metodoPago: "",
            })
          }
        >
          Cancelar
        </button>
      </form>

      {ticket && (
        <div
          className="card mt-4 shadow-sm"
          style={{ maxWidth: "300px", margin: "0 auto" }}
        >
          <div className="card-body" id="ticket">
            <h6 className="text-center fw-bold">CLUB DEPORTIVO ICONIC ALL STARS</h6>
            <p className="text-center small mb-1">
              CALLE F 25 No. 68D-60 BOGOTÁ<br />
              Tel: 3108886661 | NIT: 800000000-0
            </p>
            <hr />
            <p className="small mb-1">Fecha: {moment().format("DD/MM/YYYY")}</p>
            <p className="small mb-1">Cliente: {ticket.cliente}</p>
            <p className="small mb-1">Producto: {ticket.producto}</p>
            <p className="small mb-1">Cantidad: {ticket.cantidad}</p>
            <p className="small mb-1">Monto: ${ticket.monto}</p>
            <p className="small mb-1">Método: {ticket.metodoPago}</p>
            <hr />
            <p className="text-center small mb-0">
              ¡Gracias por su pago! 💪
            </p>
          </div>
          <div className="card-footer text-center">
            <button onClick={handlePrint} className="btn btn-sm btn-primary">
              Imprimir Ticket
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearPago;
