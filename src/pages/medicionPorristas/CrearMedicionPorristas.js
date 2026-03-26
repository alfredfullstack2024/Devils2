import React, { useState, useEffect, useMemo } from "react";
import { crearMedicionPorristas, obtenerMedicionesPorristas, editarMedicionPorristas, obtenerEntrenadores, obtenerClientes } from "../../api/axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Table, Alert, Row, Col } from "react-bootstrap";

const CrearMedicionPorristas = () => {
  const [formData, setFormData] = useState({
    clienteId: "",
    entrenadorId: "",
    equipo: "",
    categoria: "",
    posicion: "",
    ejercicios: [],
    descripcion: "",
  });
  const [clientes, setClientes] = useState([]);
  const [entrenadores, setEntrenadores] = useState([]);
  const [mediciones, setMediciones] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nuevoEjercicio, setNuevoEjercicio] = useState({ nombre: "", calificacion: "" });
  const [busqueda, setBusqueda] = useState("");
  const navigate = useNavigate();

  const categorias = [
    "Tiny 1 Femenino", "Tiny 1 Coed", "Tiny 2 Femenino", "Tiny 2 Coed",
    "Tiny 3 Femenino", "Tiny 3 Coed", "Tiny 4 Femenino", "Tiny 4 Coed",
    "Tiny 5 Femenino", "Tiny 5 Coed", "Tiny 6 Femenino", "Tiny 6 Coed",
    "Tiny 7 Femenino", "Tiny 7 Coed", "Mini 1 Femenino", "Mini 1 Coed",
    "Mini 2 Femenino", "Mini 2 Coed", "Mini 3 Femenino", "Mini 3 Coed",
    "Mini 4 Femenino", "Mini 4 Coed", "Mini 5 Femenino", "Mini 5 Coed",
    "Mini 6 Femenino", "Mini 6 Coed", "Mini 7 Femenino", "Mini 7 Coed",
    "Youth 1 Femenino", "Youth 1 Coed", "Youth 2 Femenino", "Youth 2 Coed",
    "Youth 3 Femenino", "Youth 3 Coed", "Youth 4 Femenino", "Youth 4 Coed",
    "Youth 5 Femenino", "Youth 5 Coed", "Youth 6 Femenino", "Youth 6 Coed",
    "Youth 7 Femenino", "Youth 7 Coed", "Junior 1 Femenino", "Junior 1 Coed",
    "Junior 2 Femenino", "Junior 2 Coed", "Junior 3 Femenino", "Junior 3 Coed",
    "Junior 4 Femenino", "Junior 4 Coed", "Junior 5 Femenino", "Junior 5 Coed",
    "Junior 6 Femenino", "Junior 6 Coed", "Junior 7 Femenino", "Junior 7 Coed",
    "Senior 1 Femenino", "Senior 1 Coed", "Senior 2 Femenino", "Senior 2 Coed",
    "Senior 3 Femenino", "Senior 3 Coed", "Senior 4 Femenino", "Senior 4 Coed",
    "Senior 5 Femenino", "Senior 5 Coed", "Senior 6 Femenino", "Senior 6 Coed",
    "Senior 7 Femenino", "Senior 7 Coed", "Open 1 Femenino", "Open 1 Coed",
    "Open 2 Femenino", "Open 2 Coed", "Open 3 Femenino", "Open 3 Coed",
    "Open 4 Femenino", "Open 4 Coed", "Open 5 Femenino", "Open 5 Coed",
    "Open 6 Femenino", "Open 6 Coed", "Open 7 Femenino", "Open 7 Coed"
  ];

  const posiciones = ["Flyer", "Base", "Spotter", "Backspot", "Frontspot"];

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("Debes iniciar sesión para crear una medición.");
      navigate("/login");
    }
  }, [navigate]);

  // BUSCA ESTA FUNCIÓN Y DÉJALA ASÍ:
const fetchData = async () => {
  setLoading(true);
  try {
    const [clientesResponse, entrenadoresResponse, medicionesResponse] = await Promise.all([
      obtenerClientes(),
      obtenerEntrenadores(),
      obtenerMedicionesPorristas()
    ]);

    // CAMBIO: Quitamos el .data en los tres
    setClientes(Array.isArray(clientesResponse) ? clientesResponse : []);
    setEntrenadores(Array.isArray(entrenadoresResponse) ? entrenadoresResponse : []);
    setMediciones(Array.isArray(medicionesResponse) ? medicionesResponse : []);
    
  } catch (err) {
    setError("Error al cargar datos: " + err.message);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (formData.entrenadorId) {
      const entrenador = entrenadores.find(e => e._id === formData.entrenadorId);
      const especialidades = Array.isArray(entrenador?.especialidad) ? entrenador.especialidad : [entrenador?.especialidad || "Sin especialidad"];
      console.log("Entrenador seleccionado:", entrenador?.nombre, "Especialidades:", especialidades);
      setFormData(prev => ({
        ...prev,
        equipo: especialidades.length > 0 ? especialidades[0] : "Sin especialidad",
      }));
    } else {
      setFormData(prev => ({ ...prev, equipo: "" }));
    }
  }, [formData.entrenadorId, entrenadores]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleEjercicioChange = (e) => {
    setNuevoEjercicio({
      ...nuevoEjercicio,
      [e.target.name]: e.target.name === "calificacion" ? Number(e.target.value) : e.target.value,
    });
  };

  const añadirEjercicio = () => {
    if (nuevoEjercicio.nombre && nuevoEjercicio.calificacion >= 1 && nuevoEjercicio.calificacion <= 10) {
      setFormData(prev => ({
        ...prev,
        ejercicios: [...prev.ejercicios, { ...nuevoEjercicio }],
      }));
      setNuevoEjercicio({ nombre: "", calificacion: "" });
    } else {
      setError("El ejercicio debe tener nombre y calificación entre 1 y 10.");
    }
  };

  const eliminarEjercicio = (index) => {
    setFormData(prev => ({
      ...prev,
      ejercicios: prev.ejercicios.filter((_, i) => i !== index),
    }));
  };

  const ponderacion = useMemo(() => {
    if (formData.ejercicios.length === 0) return 0;
    const sum = formData.ejercicios.reduce((acc, ej) => acc + (ej.calificacion || 0), 0);
    return (sum / formData.ejercicios.length).toFixed(2);
  }, [formData.ejercicios]);

  const pasaNivel = Number(ponderacion) >= 7;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    try {
      let response;
      if (editMode) {
        response = await editarMedicionPorristas(editId, formData);
        setSuccess("Medición actualizada con éxito!");
        setEditMode(false);
        setEditId(null);
        const updatedMediciones = await obtenerMedicionesPorristas();
        setMediciones(updatedMediciones.data);
      } else {
        response = await crearMedicionPorristas(formData);
        setSuccess("Medición creada con éxito!");
        fetchData();
      }

      setFormData({
        clienteId: "",
        entrenadorId: "",
        equipo: "",
        categoria: "",
        posicion: "",
        ejercicios: [],
        descripcion: "",
      });
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al procesar la medición.");
    }
  };

  const handleEdit = (medicion) => {
    setEditMode(true);
    setEditId(medicion._id);
    setFormData({
      clienteId: medicion.clienteId._id,
      entrenadorId: medicion.entrenadorId._id,
      equipo: medicion.equipo,
      categoria: medicion.categoria,
      posicion: medicion.posicion,
      ejercicios: medicion.ejercicios || [],
      descripcion: medicion.descripcion || "",
    });
  };

  const especialidadesPorEntrenador = useMemo(() => {
  const entrenadorEncontrado = entrenadores.find(e => e._id === formData.entrenadorId);
  if (!entrenadorEncontrado) return [];

  const esp = entrenadorEncontrado.especialidad;
  return Array.isArray(esp) ? esp : [esp || "Sin especialidad"];
}, [entrenadores, formData.entrenadorId]);
  const clientesFiltrados = useMemo(() => {
    return clientes.filter(cliente =>
      (cliente.nombre + " " + cliente.apellido).toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [clientes, busqueda]);

  const medicionesFiltradas = useMemo(() => {
    return mediciones.filter(medicion =>
      (medicion.clienteId?.nombre + " " + medicion.clienteId?.apellido).toLowerCase().includes(busqueda.toLowerCase())
    );
  }, [mediciones, busqueda]);

  // Función para calcular ponderado con manejo de errores
  const calcularPonderacion = (ejercicios) => {
    if (!Array.isArray(ejercicios) || ejercicios.length === 0) return "0.00";
    const validEjercicios = ejercicios.filter(ej => ej.calificacion && !isNaN(ej.calificacion));
    if (validEjercicios.length === 0) return "0.00";
    const sum = validEjercicios.reduce((acc, ej) => acc + Number(ej.calificacion), 0);
    return (sum / validEjercicios.length).toFixed(2);
  };

  return (
    <Container className="mt-4">
      <h2>{editMode ? "Editar Medición Porristas" : "Crear Medición Porristas"}</h2>
      {loading && <Alert variant="info">Cargando datos...</Alert>}
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {!loading && (
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3">
            <Form.Label>Buscar Deportista</Form.Label>
            <Form.Control
              type="text"
              placeholder="Escribe nombre o apellido..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Deportista (Cliente)</Form.Label>
            <Form.Select
              name="clienteId"
              value={formData.clienteId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un cliente</option>
             {clientesFiltrados.map((cliente) => (
  <option key={cliente._id} value={cliente._id}>
    {(cliente.nombre || "Sin nombre")} {(cliente.apellido || "")}
  </option>
))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Entrenador</Form.Label>
            <Form.Select
              name="entrenadorId"
              value={formData.entrenadorId}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione un entrenador</option>
              {entrenadores.map((entrenador) => (
                <option key={entrenador._id} value={entrenador._id}>
                  {entrenador.nombre + " " + entrenador.apellido}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Especialidad</Form.Label>
            <Form.Select
              name="equipo"
              value={formData.equipo}
              onChange={handleChange}
              required
              disabled={!formData.entrenadorId}
            >
              <option value="">Seleccione una especialidad</option>
              {especialidadesPorEntrenador.length > 0 ? (
                especialidadesPorEntrenador.map((esp, index) => (
                  <option key={index} value={esp}>
                    {esp}
                  </option>
                ))
              ) : (
                <option value="Sin especialidad">Sin especialidad</option>
              )}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Categoría</Form.Label>
            <Form.Select
              name="categoria"
              value={formData.categoria}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una categoría</option>
              {categorias.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Posición</Form.Label>
            <Form.Select
              name="posicion"
              value={formData.posicion}
              onChange={handleChange}
              required
            >
              <option value="">Seleccione una posición</option>
              {posiciones.map((pos) => (
                <option key={pos} value={pos}>
                  {pos}
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Ejercicios</Form.Label>
            <Row>
              <Col md={6}>
                <Form.Control
                  type="text"
                  name="nombre"
                  placeholder="Nombre del ejercicio"
                  value={nuevoEjercicio.nombre}
                  onChange={handleEjercicioChange}
                />
              </Col>
              <Col md={3}>
                <Form.Control
                  type="number"
                  name="calificacion"
                  placeholder="Calificación (1-10)"
                  value={nuevoEjercicio.calificacion}
                  onChange={handleEjercicioChange}
                  min={1}
                  max={10}
                />
              </Col>
              <Col md={3}>
                <Button variant="secondary" onClick={añadirEjercicio}>
                  Añadir Ejercicio
                </Button>
              </Col>
            </Row>
            {formData.ejercicios.length > 0 && (
              <Table striped bordered hover className="mt-3">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Calificación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {formData.ejercicios.map((ej, index) => (
                    <tr key={index}>
                      <td>{ej.nombre}</td>
                      <td>{ej.calificacion}</td>
                      <td>
                        <Button variant="danger" size="sm" onClick={() => eliminarEjercicio(index)}>
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </Form.Group>

          <Alert variant="info">
            Ponderación: {ponderacion} - {pasaNivel ? "Pasa Nivel" : "No Pasa Nivel"}
          </Alert>

          <Form.Group className="mb-3">
            <Form.Label>Descripción (Opcional)</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            {editMode ? "Actualizar Medición" : "Crear Medición"}
          </Button>
          {editMode && (
            <Button
              variant="secondary"
              className="ms-2"
              onClick={() => {
                setEditMode(false);
                setEditId(null);
                setFormData({
                  clienteId: "",
                  entrenadorId: "",
                  equipo: "",
                  categoria: "",
                  posicion: "",
                  ejercicios: [],
                  descripcion: "",
                });
              }}
            >
              Cancelar Edición
            </Button>
          )}
        </Form>
      )}

      <div className="mt-5">
        <h3>Mediciones Creadas</h3>
        {loading && <Alert variant="info">Cargando mediciones...</Alert>}
        {!loading && mediciones.length === 0 && <p>No hay mediciones creadas aún.</p>}
        {!loading && mediciones.length > 0 && (
          <div>
            <Form.Group className="mb-3">
              <Form.Label>Buscar Deportista</Form.Label>
              <Form.Control
                type="text"
                placeholder="Escribe nombre o apellido..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </Form.Group>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>Deportista</th>
                  <th>Entrenador</th>
                  <th>Especialidad</th>
                  <th>Categoría</th>
                  <th>Posición</th>
                  <th>Ponderación</th>
                  <th>Pasa Nivel</th>
                  <th>Descripción</th>
                  <th>Creado Por</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {medicionesFiltradas.map((medicion) => (
                  <tr key={medicion._id}>
                    <td>{medicion.clienteId?.nombre + " " + medicion.clienteId?.apellido || "Desconocido"}</td>
                    <td>{medicion.entrenadorId?.nombre + " " + medicion.entrenadorId?.apellido || "Desconocido"}</td>
                    <td>{medicion.equipo}</td>
                    <td>{medicion.categoria}</td>
                    <td>{medicion.posicion}</td>
                    <td>{calcularPonderacion(medicion.ejercicios)}</td>
                    <td>{Number(calcularPonderacion(medicion.ejercicios)) >= 7 ? "Sí" : "No"}</td>
                    <td>{medicion.descripcion || "N/A"}</td>
                    <td>{medicion.creadoPor?.nombre || "Desconocido"}</td>
                    <td>
                      <Button
                        variant="warning"
                        size="sm"
                        onClick={() => handleEdit(medicion)}
                        className="me-2"
                      >
                        Editar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )}
      </div>
    </Container>
  );
};

export default CrearMedicionPorristas;
