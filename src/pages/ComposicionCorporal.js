import React, { useState, useEffect } from "react";
import { obtenerClientes, crearComposicionCorporal } from "../api/axios";
import { useNavigate } from "react-router-dom";
import { Container, Form, Button, Alert } from "react-bootstrap";

const ComposicionCorporal = () => {
  const [formData, setFormData] = useState({
    numeroIdentificacion: "", // Cambiado de clienteId para coincidir con el backend
    fecha: "",
    peso: "",
    altura: "", // Añadido para coincidir con el backend
    imc: "",
    porcentajeGrasa: "",
    porcentajeMusculo: "", // Cambiado de masaMuscular para coincidir con el backend
    notas: "", // Añadido para notas adicionales
    medidas: {
      brazoDerecho: "",
      brazoIzquierdo: "",
      pecho: "",
      cintura: "",
      cadera: "",
      piernaDerecha: "",
      piernaIzquierda: "",
    },
    objetivo: "",
    antecedentesMedicos: {
      problemasFisicos: "",
      notasAdicionales: "",
    },
  });
  const [clientes, setClientes] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const response = await obtenerClientes();
        setClientes(Array.isArray(response) ? response : []);
      } catch (err) {
        setError("Error al cargar los clientes: " + err.message);
      }
    };
    fetchClientes();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("medidas.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        medidas: { ...prev.medidas, [field]: Number(value) || "" },
      }));
    } else if (name.startsWith("antecedentesMedicos.")) {
      const field = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        antecedentesMedicos: { ...prev.antecedentesMedicos, [field]: value },
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]:
          name === "peso" ||
          name === "altura" ||
          name === "imc" ||
          name === "porcentajeGrasa" ||
          name === "porcentajeMusculo"
            ? Number(value) || ""
            : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Mapear datos al formato esperado por el backend
    const dataToSend = {
      numeroIdentificacion: formData.numeroIdentificacion,
      fecha: formData.fecha || new Date().toISOString().split("T")[0], // Valor por defecto si no se proporciona
      peso: formData.peso,
      altura: formData.altura,
      imc: formData.imc,
      porcentajeGrasa: formData.porcentajeGrasa,
      porcentajeMusculo: formData.porcentajeMusculo,
      notas:
        `${formData.antecedentesMedicos.problemasFisicos}\n${formData.antecedentesMedicos.notasAdicionales}` ||
        "",
      medidas: formData.medidas, // Incluir medidas como objeto adicional
      objetivo: formData.objetivo,
    };

    try {
      console.log(
        "Enviando datos al backend a /api/composicion-corporal:",
        dataToSend
      ); // Depuración con URL explícita
      const response = await crearComposicionCorporal(dataToSend); // Usar la función corregida
      setSuccess("Composición corporal guardada con éxito!");
      setFormData({
        numeroIdentificacion: "",
        fecha: "",
        peso: "",
        altura: "",
        imc: "",
        porcentajeGrasa: "",
        porcentajeMusculo: "",
        notas: "",
        medidas: {
          brazoDerecho: "",
          brazoIzquierdo: "",
          pecho: "",
          cintura: "",
          cadera: "",
          piernaDerecha: "",
          piernaIzquierda: "",
        },
        objetivo: "",
        antecedentesMedicos: { problemasFisicos: "", notasAdicionales: "" },
      });
    } catch (err) {
      setError(
        err.message ||
          "Error al guardar la composición corporal. Verifica los datos."
      );
      console.error("Error detallado:", err.response?.data || err.message);
    }
  };

  return (
    <Container className="mt-4">
      <h2>Composición Corporal</h2>
      {error && <Alert variant="danger">{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}
      <Form onSubmit={handleSubmit}>
        <Form.Group className="mb-3">
          <Form.Label>Cliente (Número de Identificación)</Form.Label>
          <Form.Select
            name="numeroIdentificacion"
            value={formData.numeroIdentificacion}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un cliente</option>
            {(clientes || []).map((cliente) => (
              <option key={cliente._id} value={cliente.numeroIdentificacion}>
                {cliente.nombre} {cliente.apellido} (
                {cliente.numeroIdentificacion})
              </option>
            ))}
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Fecha</Form.Label>
          <Form.Control
            type="date"
            name="fecha"
            value={formData.fecha}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Peso (kg)</Form.Label>
          <Form.Control
            type="number"
            name="peso"
            value={formData.peso}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Altura (cm)</Form.Label>
          <Form.Control
            type="number"
            name="altura"
            value={formData.altura}
            onChange={handleChange}
            required
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>IMC</Form.Label>
          <Form.Control
            type="number"
            name="imc"
            value={formData.imc}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Porcentaje de Grasa (%)</Form.Label>
          <Form.Control
            type="number"
            name="porcentajeGrasa"
            value={formData.porcentajeGrasa}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Porcentaje de Músculo (%)</Form.Label>
          <Form.Control
            type="number"
            name="porcentajeMusculo"
            value={formData.porcentajeMusculo}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Medidas (cm)</Form.Label>
          {Object.keys(formData.medidas).map((key) => (
            <Form.Control
              key={key}
              type="number"
              name={`medidas.${key}`}
              placeholder={key}
              value={formData.medidas[key]}
              onChange={handleChange}
            />
          ))}
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Objetivo</Form.Label>
          <Form.Select
            name="objetivo"
            value={formData.objetivo}
            onChange={handleChange}
            required
          >
            <option value="">Seleccione un objetivo</option>
            <option value="Cardio">Cardio</option>
            <option value="Pérdida de peso">Pérdida de peso</option>
            <option value="Ganar músculo">Ganar músculo</option>
            <option value="Mejorar resistencia">Mejorar resistencia</option>
            <option value="Rehabilitación">Rehabilitación</option>
          </Form.Select>
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Problemas Físicos</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="antecedentesMedicos.problemasFisicos"
            value={formData.antecedentesMedicos.problemasFisicos}
            onChange={handleChange}
          />
        </Form.Group>

        <Form.Group className="mb-3">
          <Form.Label>Notas Adicionales</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            name="antecedentesMedicos.notasAdicionales"
            value={formData.antecedentesMedicos.notasAdicionales}
            onChange={handleChange}
          />
        </Form.Group>

        <Button variant="primary" type="submit">
          Guardar Composición Corporal
        </Button>
      </Form>
    </Container>
  );
};

export default ComposicionCorporal;
