import React, { useState, useEffect } from "react";
import { Form, Button, Alert, Spinner } from "react-bootstrap";
import { useNavigate, useParams } from "react-router-dom";
import axios, { obtenerEquipos } from "../api/axios";

const EditarCliente = () => {
  const { id } = useParams();
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
    especialidad: "", // Campo funcional agregado
  });
  
  const [especialidades, setEspecialidades] = useState([]); // Estado funcional agregado
  const [error, setError] = useState("");
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  // Las tallas ya no se necesitan como array si se usan cajas de texto,
  // pero las mantengo por si acaso.
  // const tallas = ["S", "M", "L", "XL"]; 

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = {
          headers: { Authorization: `Bearer ${token}` },
        };

        // 1. Cargar datos del Cliente
        const clienteResponse = await axios.get(`/clientes/${id}`, config);
        const clienteData = clienteResponse.data;

        setFormData({
          nombre: clienteData.nombre || "",
          apellido: clienteData.apellido || "",
          email: clienteData.email || "",
          telefono: clienteData.telefono || "",
          direccion: clienteData.direccion || "",
          estado: clienteData.estado || "activo",
          numeroIdentificacion: clienteData.numeroIdentificacion || "",
          fechaNacimiento: clienteData.fechaNacimiento
            ? new Date(clienteData.fechaNacimiento).toISOString().split("T")[0]
            : "",
          edad: clienteData.edad || "",
          tipoDocumento: clienteData.tipoDocumento || "C.C",
          rh: clienteData.rh || "",
          eps: clienteData.eps || "",
          tallaTrenSuperior: clienteData.tallaTrenSuperior || "",
          tallaTrenInferior: clienteData.tallaTrenInferior || "",
          nombreResponsable: clienteData.nombreResponsable || "",
          especialidad: clienteData.especialidad || "", // Inicialización de Especialidad
        });
        
        // 2. Cargar Especialidades
        const especialidadesResponse = await obtenerEquipos(config);
        let lista = [];

        if (Array.isArray(especialidadesResponse.data)) {
          if (typeof especialidadesResponse.data[0] === "string") {
            lista = especialidadesResponse.data;
          } else {
            lista = especialidadesResponse.data
              .map((item) => item.equipo || item.nombre || item.especialidad)
              .filter((val) => val && val.trim() !== "");
          }
        }
        setEspecialidades(lista);
        
      } catch (err) {
        setError(`❌ Error al cargar los datos: ${err.message}`);
      } finally {
        setCargando(false);
      }
    };
    fetchDatos();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación de especialidad agregada
    if (!formData.especialidad) {
      setError("La especialidad es obligatoria.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await axios.put(`/clientes/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      navigate("/clientes");
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message;
      setError(`❌ Error al actualizar el cliente: ${errorMessage}`);
      console.error("Detalles del error:", err.response?.data);
    }
  };

  if (cargando) {
    return <Spinner animation="border" variant="primary" />;
  }

  return (
    <div>
      <h2>Editar Cliente</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={handleSubmit}>
        {/* Campos de texto y select existentes */}
        {/* ... (todos los campos anteriores: nombre, apellido, email, etc.) ... */}
        
        <Form.Group className="mb-3" controlId="nombre">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            name="nombre"
            value={formData.nombre}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="apellido">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            name="apellido"
            value={formData.apellido}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Correo electrónico</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="telefono">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            name="telefono"
            value={formData.telefono}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="direccion">
          <Form.Label>Dirección</Form.Label>
          <Form.Control
            type="text"
            name="direccion"
            value={formData.direccion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="estado">
          <Form.Label>Estado</Form.Label>
          <Form.Control
            as="select"
            name="estado"
            value={formData.estado}
            onChange={handleChange}
            required
          >
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </Form.Control>
        </Form.Group>

        <Form.Group className="mb-3" controlId="numeroIdentificacion">
          <Form.Label>Número de Identificación</Form.Label>
          <Form.Control
            type="text"
            name="numeroIdentificacion"
            value={formData.numeroIdentificacion}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="fechaNacimiento">
          <Form.Label>Fecha de Nacimiento</Form.Label>
          <Form.Control
            type="date"
            name="fechaNacimiento"
            value={formData.fechaNacimiento}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="edad">
          <Form.Label>Edad</Form.Label>
          <Form.Control
            type="number"
            name="edad"
            value={formData.edad}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tipoDocumento">
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

        <Form.Group className="mb-3" controlId="rh">
          <Form.Label>RH</Form.Label>
          <Form.Control
            type="text"
            name="rh"
            value={formData.rh}
            onChange={handleChange}
            placeholder="Ej. A+, O-"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="eps">
          <Form.Label>EPS</Form.Label>
          <Form.Control
            type="text"
            name="eps"
            value={formData.eps}
            onChange={handleChange}
            placeholder="Ingresa la EPS"
          />
        </Form.Group>
        
        {/* CAMPOS DE TALLA RESTAURADOS A 'type="text"' (como estaban originalmente) */}
        <Form.Group className="mb-3" controlId="tallaTrenSuperior">
          <Form.Label>Talla Tren Superior</Form.Label>
          <Form.Control
            type="text"
            name="tallaTrenSuperior"
            value={formData.tallaTrenSuperior}
            onChange={handleChange}
            placeholder="Ingresa la talla (ej. S, M, L)"
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="tallaTrenInferior">
          <Form.Label>Talla Tren Inferior</Form.Label>
          <Form.Control
            type="text"
            name="tallaTrenInferior"
            value={formData.tallaTrenInferior}
            onChange={handleChange}
            placeholder="Ingresa la talla (ej. S, M, L)"
          />
        </Form.Group>
        {/* FIN CAMPOS DE TALLA RESTAURADOS */}

        <Form.Group className="mb-3" controlId="nombreResponsable">
          <Form.Label>Nombre Responsable</Form.Label>
          <Form.Control
            type="text"
            name="nombreResponsable"
            value={formData.nombreResponsable}
            onChange={handleChange}
            placeholder="Ingresa el nombre del responsable"
          />
        </Form.Group>

        {/* CAMPO DE ESPECIALIDAD AGREGADO (funcionalidad clave) */}
        <Form.Group className="mb-3" controlId="especialidad">
          <Form.Label>Especialidad</Form.Label>
          <Form.Control
            as="select"
            name="especialidad"
            value={formData.especialidad}
            onChange={handleChange}
            required 
          >
            <option value="">Selecciona una especialidad</option>
            {especialidades.map((esp, idx) => (
              <option key={idx} value={esp}>
                {esp}
              </option>
            ))}
          </Form.Control>
        </Form.Group>
        
        <Button variant="primary" type="submit">
          Guardar Cambios
        </Button>
      </Form>
    </div>
  );
};

export default EditarCliente;
