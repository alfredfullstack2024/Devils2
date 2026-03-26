import React, { useState, useEffect, useContext, useCallback } from "react";
import {
  obtenerClientes,
  obtenerRutinas,
  asignarRutina,
  consultarRutinaPorNumeroIdentificacion,
} from "../../api/axios";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Form,
  Button,
  Table,
  Alert,
  Row,
  Col,
  Spinner,
} from "react-bootstrap";
import { AuthContext } from "../../context/AuthContext";

const AsignarRutina = () => {
  const [clientes, setClientes] = useState([]);
  const [rutinas, setRutinas] = useState([]);
  const [asignaciones, setAsignaciones] = useState([]);
  const [formData, setFormData] = useState({
    clienteId: "",
    rutinaId: "",
    diasEntrenamiento: [],
    diasDescanso: [],
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (!user || !user.token) {
      setError("Debes iniciar sesión para asignar una rutina.");
      navigate("/login");
    }
  }, [user, navigate]);

useEffect(() => {
  if (!user || !user.token) return;

  const fetchData = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const [clientesRes, rutinasRes] = await Promise.all([
        obtenerClientes(config),
        obtenerRutinas(config),
      ]);
console.log("RESPUESTA CLIENTES:", clientesRes);
      setClientes(clientesRes.data);;
      setRutinas(rutinasRes.data || []);
    } catch (err) {
      console.error("Error al cargar datos:", err);
      setError(
        "Error al cargar datos: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  fetchData();
}, [user]);

  const fetchAsignaciones = useCallback(async () => {
  // 🔥 ESTA LÍNEA VA AQUÍ
  if (!user || !user.token) return;

  try {
    setLoading(true);

    const cliente = clientes.find((c) => c._id === formData.clienteId);

    if (cliente && cliente.numeroIdentificacion) {
      const numeroIdentificacion = cliente.numeroIdentificacion
        .toString()
        .trim();

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const response = await consultarRutinaPorNumeroIdentificacion(
        numeroIdentificacion,
        config
      );

      const asignacionesData = Array.isArray(response.data)
        ? response.data
        : [];

      setAsignaciones(asignacionesData);
    } else {
      setAsignaciones([]);
      setError(
        "El cliente seleccionado no tiene un número de identificación válido."
      );
    }
  } catch (err) {
    console.error("Error al cargar asignaciones:", err);
    setError(
      "Error al cargar asignaciones: " +
        (err.response?.data?.message || err.message)
    );
    setAsignaciones([]);
  } finally {
    setLoading(false);
  }
}, [clientes, formData.clienteId, user]);
  useEffect(() => {
    if (formData.clienteId) fetchAsignaciones();
    else setAsignaciones([]);
  }, [formData.clienteId, fetchAsignaciones]); // Incluimos fetchAsignaciones en las dependencias

  useEffect(() => {
    if (error || success) {
      const timer = setTimeout(() => {
        setError("");
        setSuccess("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error, success]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleDiasEntrenamiento = (e) => {
    const dias = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, diasEntrenamiento: dias });
  };

  const handleDiasDescanso = (e) => {
    const dias = Array.from(e.target.selectedOptions, (option) => option.value);
    setFormData({ ...formData, diasDescanso: dias });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (
      !formData.clienteId ||
      !formData.rutinaId ||
      formData.diasEntrenamiento.length === 0 ||
      formData.diasDescanso.length === 0
    ) {
      setError(
        "Todos los campos son obligatorios, incluyendo días de entrenamiento y descanso."
      );
      return;
    }
    try {
      setLoading(true);
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await asignarRutina(formData, config);
      setSuccess("Rutina asignada con éxito!");
      setFormData({
        clienteId: formData.clienteId,
        rutinaId: "",
        diasEntrenamiento: [],
        diasDescanso: [],
      });
      if (formData.clienteId) fetchAsignaciones();
    } catch (err) {
      console.error("Error al procesar asignación:", err);
      setError(
        "Error al procesar asignación: " +
          (err.response?.data?.message || err.message)
      );
    } finally {
      setLoading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      clienteId: "",
      rutinaId: "",
      diasEntrenamiento: [],
      diasDescanso: [],
    });
    setAsignaciones([]);
  };

  return (
    <Container className="mt-4">
      <h2>Asignar Rutina</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      {loading && (
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Cargando...</span>
          </Spinner>
        </div>
      )}
      <Form onSubmit={handleSubmit}>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Cliente</Form.Label>
              <Form.Select
                name="clienteId"
                value={formData.clienteId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione un cliente</option>
                {(clientes || []).map((cliente) => (
                 <option key={cliente._id} value={cliente._id}>
  {cliente.nombre} {cliente.apellido || ""} - {cliente.numeroIdentificacion}
</option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Rutina</Form.Label>
              <Form.Select
                name="rutinaId"
                value={formData.rutinaId}
                onChange={handleChange}
                required
                disabled={loading}
              >
                <option value="">Seleccione una rutina</option>
                {rutinas.map((rutina) => (
                  <option key={rutina._id} value={rutina._id}>
                    {rutina.nombreEjercicio} ({rutina.grupoMuscular})
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Row>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Días de Entrenamiento</Form.Label>
              <Form.Select
                multiple
                name="diasEntrenamiento"
                value={formData.diasEntrenamiento}
                onChange={handleDiasEntrenamiento}
                required
                disabled={loading}
              >
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group className="mb-3">
              <Form.Label>Días de Descanso</Form.Label>
              <Form.Select
                multiple
                name="diasDescanso"
                value={formData.diasDescanso}
                onChange={handleDiasDescanso}
                required
                disabled={loading}
              >
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miércoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sábado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>
        <Button variant="primary" type="submit" disabled={loading}>
          Asignar Rutina
        </Button>
        <Button
          variant="outline-secondary"
          className="ms-2"
          onClick={handleClearForm}
          disabled={loading}
        >
          Limpiar Formulario
        </Button>
      </Form>

      <div className="mt-5">
        <h3>Asignaciones del Cliente</h3>
        {asignaciones.length === 0 ? (
          <p>No hay asignaciones para este cliente.</p>
        ) : (
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>Rutina</th>
                <th>Días de Entrenamiento</th>
                <th>Días de Descanso</th>
              </tr>
            </thead>
            <tbody>
              {asignaciones.map((asignacion) => (
                <tr key={asignacion._id || asignacion.fechaAsignacion}>
                  <td>
                    {asignacion.rutinaId?.nombreEjercicio || "Desconocido"} (
                    {asignacion.rutinaId?.grupoMuscular || ""})
                  </td>
                  <td>{asignacion.diasEntrenamiento.join(", ") || "N/A"}</td>
                  <td>{asignacion.diasDescanso.join(", ") || "N/A"}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>
    </Container>
  );
};

export default AsignarRutina;
