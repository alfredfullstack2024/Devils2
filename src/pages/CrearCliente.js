import React, { useState } from "react";
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
    equipo: "", // 👈 obligatorio y empieza vacío
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

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
        equipo: "", // 👈 reset también
      });
    } catch (err) {
      console.error("Error al crear cliente:", err);
      if (err.response) {
        setError(
          `Error ${err.response.status}: ${err.response.data.message || "Error al crear cliente"}`
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
        <div className="mb-3">
          <label className="form-label">Número de Identificación</label>
          <input
            type="text"
            className="form-control"
            value={formData.numeroIdentificacion}
            onChange={(e) =>
              setFormData({ ...formData, numeroIdentificacion: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Nombre</label>
          <input
            type="text"
            className="form-control"
            value={formData.nombre}
            onChange={(e) =>
              setFormData({ ...formData, nombre: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Apellido</label>
          <input
            type="text"
            className="form-control"
            value={formData.apellido}
            onChange={(e) =>
              setFormData({ ...formData, apellido: e.target.value })
            }
            required
          />
        </div>

        <div className="mb-3">
          <label className="form-label">Equipo</label>
          <select
            className="form-select"
            value={formData.equipo}
            onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
            required // 👈 hace obligatorio el campo
          >
            <option value="">Seleccione un equipo</option>
            <option value="Porristas">Porristas</option>
            <option value="Fútbol">Fútbol</option>
            <option value="Básquet">Básquet</option>
            <option value="Otro">Otro</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">
          Guardar
        </button>
      </form>
    </div>
  );
};

export default CrearCliente;
