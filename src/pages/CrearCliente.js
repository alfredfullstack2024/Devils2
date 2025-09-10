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
    equipo: "", // 👈 obligatorio
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
        equipo: "",
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
        <div className="row">
          <div className="col-md-6 mb-3">
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

          <div className="col-md-6 mb-3">
            <label className="form-label">Tipo de Documento</label>
            <select
              className="form-select"
              value={formData.tipoDocumento}
              onChange={(e) =>
                setFormData({ ...formData, tipoDocumento: e.target.value })
              }
              required
            >
              <option value="C.C">C.C</option>
              <option value="T.I">T.I</option>
              <option value="C.E">C.E</option>
              <option value="Otro">Otro</option>
            </select>
          </div>

          <div className="col-md-6 mb-3">
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

          <div className="col-md-6 mb-3">
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

          <div className="col-md-6 mb-3">
            <label className="form-label">Teléfono</label>
            <input
              type="text"
              className="form-control"
              value={formData.telefono}
              onChange={(e) =>
                setFormData({ ...formData, telefono: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Email</label>
            <input
              type="email"
              className="form-control"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Fecha de Nacimiento</label>
            <input
              type="date"
              className="form-control"
              value={formData.fechaNacimiento}
              onChange={(e) =>
                setFormData({ ...formData, fechaNacimiento: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Edad</label>
            <input
              type="number"
              className="form-control"
              value={formData.edad}
              onChange={(e) =>
                setFormData({ ...formData, edad: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">RH</label>
            <input
              type="text"
              className="form-control"
              value={formData.rh}
              onChange={(e) =>
                setFormData({ ...formData, rh: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">EPS</label>
            <input
              type="text"
              className="form-control"
              value={formData.eps}
              onChange={(e) =>
                setFormData({ ...formData, eps: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Talla Tren Superior</label>
            <input
              type="text"
              className="form-control"
              value={formData.tallaTrenSuperior}
              onChange={(e) =>
                setFormData({ ...formData, tallaTrenSuperior: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Talla Tren Inferior</label>
            <input
              type="text"
              className="form-control"
              value={formData.tallaTrenInferior}
              onChange={(e) =>
                setFormData({ ...formData, tallaTrenInferior: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Nombre Responsable</label>
            <input
              type="text"
              className="form-control"
              value={formData.nombreResponsable}
              onChange={(e) =>
                setFormData({ ...formData, nombreResponsable: e.target.value })
              }
            />
          </div>

          <div className="col-md-6 mb-3">
            <label className="form-label">Dirección</label>
            <input
              type="text"
              className="form-control"
              value={formData.direccion}
              onChange={(e) =>
                setFormData({ ...formData, direccion: e.target.value })
              }
            />
          </div>

          <div className="col-md-12 mb-3">
            <label className="form-label">Equipo</label>
            <select
              className="form-select"
              value={formData.equipo}
              onChange={(e) => setFormData({ ...formData, equipo: e.target.value })}
              required
            >
              <option value="">Seleccione un equipo</option>
              <option value="Porristas">Porristas</option>
              <option value="Fútbol">Fútbol</option>
              <option value="Básquet">Básquet</option>
              <option value="Otro">Otro</option>
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
