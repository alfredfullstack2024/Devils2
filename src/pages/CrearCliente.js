// src/pages/CrearCliente.js
import React, { useState, useEffect } from "react";
import axios from "axios";

const CrearCliente = () => {
  const [formData, setFormData] = useState({
    numeroIdentificacion: "",
    nombre: "",
    apellido: "",
    telefono: "",
    email: "",
    fechaNacimiento: "",
    edad: "",
    tipoDocumento: "C.C",
    rh: "",
    eps: "",
    tallaTrenSuperior: "",
    tallaTrenInferior: "",
    nombreResponsable: "",
    direccion: "",
    equipo: "", // aquí se guarda la especialidad seleccionada
  });

  const [equipos, setEquipos] = useState([]); // 👈 lista dinámica desde backend
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Cargar lista de especialidades desde backend
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const response = await axios.get(
          "https://backend-5zxh.onrender.com/api/entrenadores/equipos",
          config
        );
        setEquipos(response.data); // lista de especialidades únicas
      } catch (err) {
        console.error("Error al cargar equipos:", err);
        setError("No se pudieron cargar los equipos.");
      }
    };
    fetchEquipos();
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post(
        "https://backend-5zxh.onrender.com/api/clientes",
        formData
      );
      setSuccess("Cliente creado exitosamente ✅");
      console.log("Cliente creado:", response.data);

      // limpiar formulario
      setFormData({
        numeroIdentificacion: "",
        nombre: "",
        apellido: "",
        telefono: "",
        email: "",
        fechaNacimiento: "",
        edad: "",
        tipoDocumento: "C.C",
        rh: "",
        eps: "",
        tallaTrenSuperior: "",
        tallaTrenInferior: "",
        nombreResponsable: "",
        direccion: "",
        equipo: "",
      });
    } catch (err) {
      console.error("Error al crear cliente:", err);
      if (err.response) {
        setError(
          `Error ${err.response.status}: ${
            err.response.data.message || "Error al crear cliente"
          }`
        );
      } else {
        setError("Error al conectar con el servidor");
      }
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Cliente</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <form onSubmit={onSubmit}>
        <div className="row">
          {/* ... todos los otros campos que ya tenía ... */}

          <div className="col-md-12 mb-3">
            <label className="form-label">Equipo (Especialidad)</label>
            <select
              className="form-select"
              value={formData.equipo}
              onChange={(e) =>
                setFormData({ ...formData, equipo: e.target.value })
              }
              required
            >
              <option value="">Seleccione un equipo</option>
              {equipos.map((eq, index) => (
                <option key={index} value={eq}>
                  {eq}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default CrearCliente;
