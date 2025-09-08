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
    equipo: "", // 👈 nuevo campo
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [equipos, setEquipos] = useState([]); // 👈 lista de equipos
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Cargar equipos desde backend
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        if (!user || !user.token) return;
        const config = {
          headers: { Authorization: `Bearer ${user.token}` },
        };
        const response = await obtenerEquipos(config);
        setEquipos(response.data || []);
      } catch (err) {
        console.error("Error al cargar equipos:", err);
      }
    };
    fetchEquipos();
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
        equipo: "",
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
        {/* Campos anteriores... */}

        <Form.Group className="mb-3">
          <Form.Label>Equipo</Form.Label>
          <Form.Select
            name="equipo"
            value={formData.equipo}
            onChange={handleChange}
            required
          >
            <option value="">Selecciona un equipo</option>
            {equipos.map((eq, index) => (
              <option key={index} value={eq}>
                {eq}
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        {/* Estado */}
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
