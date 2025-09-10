import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { crearCliente } from "../api/axios";
import { AuthContext } from "../context/AuthContext";

const CrearCliente = () => {
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    estado: "activo",
    numeroIdentificacion: "",
    fechaNacimiento: "",
    edad: "",
    tipoDocumento: "C.C",
    rh: "",
    eps: "",
    tallaTrenSuperior: "",
    tallaTrenInferior: "",
    nombreResponsable: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.nombre.trim()) {
      setError("El nombre es obligatorio.");
      return;
    }
    if (!formData.apellido.trim()) {
      setError("El apellido es obligatorio.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError("Correo electrónico inválido.");
      return;
    }
    if (!/^\d{10}$/.test(formData.telefono)) {
      setError("El teléfono debe tener 10 dígitos numéricos.");
      return;
    }
    if (!formData.direccion.trim()) {
      setError("La dirección es obligatoria.");
      return;
    }
    if (!formData.numeroIdentificacion.trim()) {
      setError("El número de identificación es obligatorio.");
      return;
    }
    if (!formData.fechaNacimiento) {
      setError("La fecha de nacimiento es obligatoria.");
      return;
    }
    if (!formData.edad || isNaN(formData.edad) || formData.edad <= 0) {
      setError("La edad debe ser un número positivo.");
      return;
    }

    if (!user || !user.token) {
      setError("Debes iniciar sesión para crear un cliente.");
      return;
    }

    try {
      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };
      console.log("Datos enviados:", formData);
      const response = await crearCliente(formData, config);
      console.log("Respuesta del backend:", response.data);
      setSuccess("Cliente creado con éxito!");
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        estado: "activo",
        numeroIdentificacion: "",
        fechaNacimiento: "",
        edad: "",
        tipoDocumento: "C.C",
        rh: "",
        eps: "",
        tallaTrenSuperior: "",
        tallaTrenInferior: "",
        nombreResponsable: "",
      });
      setTimeout(() => navigate("/clientes"), 2000);
    } catch (err) {
      console.error("Error al crear cliente:", err);
      setError(
        "Error al crear el cliente: " +
          (err.response?.data?.message || "Error desconocido")
      );
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Cliente</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            placeholder="Ingresa el nombre"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
            placeholder="Ingresa el apellido"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Ingresa el correo"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="tel"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
            placeholder="Ingresa el teléfono (10 dígitos)"
            required
            pattern="\d{10}"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            placeholder="Ingresa la dirección"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Número de Identificación</Form.Label>
          <Form.Control
            type="text"
            name="numeroIdentificacion"
            value={formData.numeroIdentificacion}
            onChange={handleChange}
            placeholder="Ingresa el número de identificación"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Fecha de Nacimiento</Form.Label>
          <Form.Control
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Edad</Form.Label>
          <Form.Control
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            placeholder="Ingresa la edad"
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Tipo de Documento</Form.Label>
          <Form.Control
            as="select"
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
            required
          >
            <option value="C.C">C.C</option>
            <option value="T.I">T.I</option>
            <option value="RC">RC</option>
            <option value="PPT">PPT</option>
          </Form.Control>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>RH</Form.Label>
          <Form.Control
            type="text"
            name="rh"
            value={formData.rh}
            onChange={handleChange}
            placeholder="Ingresa el RH (ej. A+, O-)"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>EPS</Form.Label>
          <Form.Control
            type="text"
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            placeholder="Ingresa la EPS"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Talla Tren Superior</Form.Label>
          <Form.Control
            type="text"
            name="tallaTrenSuperior"
            value={formData.tallaTrenSuperior}
            onChange={handleChange}
            placeholder="Ingresa la talla (ej. S, M, L)"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Talla Tren Inferior</Form.Label>
          <Form.Control
            type="text"
            name="tallaTrenInferior"
            value={formData.tallaTrenInferior}
            onChange={handleChange}
            placeholder="Ingresa la talla (ej. S, M, L)"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Nombre Responsable</Form.Label>
          <Form.Control
            type="text"
            name="nombreResponsable"
            value={formData.nombreResponsable}
            onChange={handleChange}
            placeholder="Ingresa el nombre del responsable"
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Estado</Form.Label>
          <Form.Select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Form.Select>
        </Form.Group>
        <Button variant="primary" type="submit">
          Crear Cliente
        </Button>
      </Form>
    </div>
  );
};

export default CrearCliente;
