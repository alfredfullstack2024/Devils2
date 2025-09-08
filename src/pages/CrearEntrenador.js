import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Form, Button, Container, Row, Col } from "react-bootstrap";
import { crearEntrenador } from "../api/axios";

const CrearEntrenador = () => {
  const navigate = useNavigate();
  const [entrenador, setEntrenador] = useState({
    nombre: "",
    apellido: "",
    correo: "",
    telefono: "",
    especialidad: "",
    clases: [{ nombreClase: "Entrenamiento General", dias: [], capacidadMaxima: 10 }],
  });
  const [error, setError] = useState(null);

  const handleClaseChange = (index, field, value) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[index][field] = value;
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const handleDiaChange = (claseIndex, diaIndex, field, value) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[claseIndex].dias[diaIndex] = { ...nuevasClases[claseIndex].dias[diaIndex], [field]: value };
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const agregarDia = (claseIndex) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[claseIndex].dias.push({ dia: "", horarioInicio: "", horarioFin: "" });
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const eliminarDia = (claseIndex, diaIndex) => {
    const nuevasClases = [...entrenador.clases];
    nuevasClases[claseIndex].dias.splice(diaIndex, 1);
    setEntrenador({ ...entrenador, clases: nuevasClases });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const config = { headers: { Authorization: `Bearer ${token}` } };
      await crearEntrenador(entrenador, config);
      alert("Entrenador creado con éxito");
      navigate("/entrenadores");
    } catch (err) {
      setError(err.response?.data?.mensaje || "Error al crear el entrenador");
    }
  };

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Container>
      <h2>Crear Entrenador</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Nombre</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.nombre}
            onChange={(e) => setEntrenador({ ...entrenador, nombre: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Apellido</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.apellido}
            onChange={(e) => setEntrenador({ ...entrenador, apellido: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Correo</Form.Label>
          <Form.Control
            type="email"
            value={entrenador.correo}
            onChange={(e) => setEntrenador({ ...entrenador, correo: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Teléfono</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.telefono}
            onChange={(e) => setEntrenador({ ...entrenador, telefono: e.target.value })}
            required
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Especialidad</Form.Label>
          <Form.Control
            type="text"
            value={entrenador.especialidad}
            onChange={(e) => setEntrenador({ ...entrenador, especialidad: e.target.value })}
            required
          />
        </Form.Group>

        {entrenador.clases.map((clase, claseIndex) => (
          <div key={claseIndex} className="mb-4">
            <h5>Clase {claseIndex + 1}</h5>
            <Form.Group className="mb-3">
              <Form.Label>Nombre de la Clase</Form.Label>
              <Form.Control
                type="text"
                value={clase.nombreClase}
                onChange={(e) => handleClaseChange(claseIndex, "nombreClase", e.target.value)}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>Capacidad Máxima</Form.Label>
              <Form.Control
                type="number"
                value={clase.capacidadMaxima}
                onChange={(e) => handleClaseChange(claseIndex, "capacidadMaxima", Number(e.target.value))}
              />
            </Form.Group>
            <h6>Días y Horarios</h6>
            {clase.dias.map((dia, diaIndex) => (
              <Row key={diaIndex} className="mb-2">
                <Col>
                  <Form.Control
                    type="text"
                    placeholder="Día"
                    value={dia.dia}
                    onChange={(e) => handleDiaChange(claseIndex, diaIndex, "dia", e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={dia.horarioInicio}
                    onChange={(e) => handleDiaChange(claseIndex, diaIndex, "horarioInicio", e.target.value)}
                  />
                </Col>
                <Col>
                  <Form.Control
                    type="time"
                    value={dia.horarioFin}
                    onChange={(e) => handleDiaChange(claseIndex, diaIndex, "horarioFin", e.target.value)}
                  />
                </Col>
                <Col>
                  <Button variant="danger" onClick={() => eliminarDia(claseIndex, diaIndex)}>
                    Eliminar
                  </Button>
                </Col>
              </Row>
            ))}
            <Button variant="secondary" onClick={() => agregarDia(claseIndex)}>
              Agregar Día
            </Button>
          </div>
        ))}

        <Button variant="primary" type="submit">
          Crear
        </Button>
      </Form>
    </Container>
  );
};

export default CrearEntrenador;


