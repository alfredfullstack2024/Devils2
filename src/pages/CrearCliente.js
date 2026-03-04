// src/pages/CrearCliente.js
import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import { crearCliente, obtenerEquipos } from "../api/axios";
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
    numeroContactoResponsable: "",
    especialidad: "",
  });

  const [especialidades, setEspecialidades] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const tallas = ["S", "M", "L", "XL"];

  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        if (!user || !user.token) return;

        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const response = await obtenerEquipos(config);

        let lista = [];

        if (Array.isArray(response.data)) {
          if (typeof response.data[0] === "string") {
            lista = response.data;
          } else {
            lista = response.data
              .map((item) => item.equipo || item.nombre || item.especialidad)
              .filter((val) => val && val.trim() !== "");
          }
        }

        setEspecialidades(lista);

      } catch (err) {
        console.error("Error al obtener especialidades:", err);
      }
    };

    fetchEspecialidades();

  }, [user]);

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

    if (!formData.numeroIdentificacion.trim()) {
      setError("El número de identificación es obligatorio.");
      return;
    }

    if (!formData.fechaNacimiento) {
      setError("La fecha de nacimiento es obligatoria.");
      return;
    }

    if (!formData.edad || isNaN(formData.edad)) {
      setError("La edad es inválida.");
      return;
    }

    if (!formData.especialidad) {
      setError("La especialidad es obligatoria.");
      return;
    }

    try {

      const config = {
        headers: { Authorization: `Bearer ${user.token}` },
      };

      await crearCliente(formData, config);

      setSuccess("Cliente creado con éxito");

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
        numeroContactoResponsable: "",
        especialidad: "",
      });

      setTimeout(() => navigate("/clientes"), 2000);

    } catch (err) {

      setError(
        "Error al crear el cliente: " +
        (err.response?.data?.message || err.message)
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
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Correo</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Número de Identificación</Form.Label>
          <Form.Control
            type="text"
            name="numeroIdentificacion"
            value={formData.numeroIdentificacion}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha Nacimiento</Form.Label>
          <Form.Control
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Edad</Form.Label>
          <Form.Control
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Tipo Documento</Form.Label>
          <Form.Select
            name="tipoDocumento"
            value={formData.tipoDocumento}
            onChange={handleChange}
          >
            <option value="C.C">C.C</option>
            <option value="T.I">T.I</option>
            <option value="C.E">C.E</option>
            <option value="PPT">PPT</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>RH</Form.Label>
          <Form.Control
            type="text"
            name="rh"
            value={formData.rh}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>EPS</Form.Label>
          <Form.Control
            type="text"
            name="eps"
            value={formData.eps}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Talla Tren Superior</Form.Label>
          <Form.Select
            name="tallaTrenSuperior"
            value={formData.tallaTrenSuperior}
            onChange={handleChange}
          >
            <option value="">Selecciona talla</option>
            {tallas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Talla Tren Inferior</Form.Label>
          <Form.Select
            name="tallaTrenInferior"
            value={formData.tallaTrenInferior}
            onChange={handleChange}
          >
            <option value="">Selecciona talla</option>
            {tallas.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Nombre Responsable</Form.Label>
          <Form.Control
            type="text"
            name="nombreResponsable"
            value={formData.nombreResponsable}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Número Contacto Responsable</Form.Label>
          <Form.Control
            type="text"
            name="numeroContactoResponsable"
            value={formData.numeroContactoResponsable}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Especialidad</Form.Label>
          <Form.Select
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
          >
            <option value="">Selecciona especialidad</option>
            {especialidades.map((esp, idx) => (
              <option key={idx} value={esp}>{esp}</option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Estado</Form.Label>
          <Form.Select
            name="estado"
            value={formData.estado}
            onChange={handleChange}
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
