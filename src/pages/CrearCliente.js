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
    equipo: "",
    especialidad: "", // 👈 Nuevo campo
  });

  const [equipos, setEquipos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [mensaje, setMensaje] = useState("");

  // Cargar equipos
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const res = await axios.get("https://backend-xxxxx.onrender.com/api/equipos");
        setEquipos(res.data);
      } catch (error) {
        console.error("Error cargando equipos:", error);
      }
    };
    fetchEquipos();
  }, []);

  // Cargar especialidades
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const res = await axios.get("https://backend-xxxxx.onrender.com/api/especialidades");
        setEspecialidades(res.data);
      } catch (error) {
        console.error("Error cargando especialidades:", error);
      }
    };
    fetchEspecialidades();
  }, []);

  const onChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("https://backend-xxxxx.onrender.com/api/clientes", formData);
      setMensaje("Cliente creado correctamente ✅");
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
        especialidad: "",
      });
    } catch (error) {
      console.error("Error al crear cliente:", error);
      setMensaje("Error al crear cliente ❌");
    }
  };

  return (
    <div className="container mt-4">
      <h2>Crear Cliente</h2>
      {mensaje && <p>{mensaje}</p>}
      <form onSubmit={onSubmit}>
        {/* Nombre y Apellido */}
        <input
          type="text"
          name="nombre"
          placeholder="Nombre"
          value={formData.nombre}
          onChange={onChange}
          required
        />
        <input
          type="text"
          name="apellido"
          placeholder="Apellido"
          value={formData.apellido}
          onChange={onChange}
          required
        />

        {/* Equipo */}
        <select
          name="equipo"
          value={formData.equipo}
          onChange={onChange}
          required
        >
          <option value="">Seleccione un equipo</option>
          {equipos.map((eq) => (
            <option key={eq._id} value={eq.nombre}>
              {eq.nombre}
            </option>
          ))}
        </select>

        {/* Especialidad */}
        <select
          name="especialidad"
          value={formData.especialidad}
          onChange={onChange}
          required
        >
          <option value="">Seleccione una especialidad</option>
          {especialidades.map((esp) => (
            <option key={esp._id} value={esp.nombre}>
              {esp.nombre}
            </option>
          ))}
        </select>

        {/* Teléfono */}
        <input
          type="text"
          name="telefono"
          placeholder="Teléfono"
          value={formData.telefono}
          onChange={onChange}
        />

        <button type="submit">Crear Cliente</button>
      </form>
    </div>
  );
};

export default CrearCliente;
