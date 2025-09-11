import React, { useState, useEffect } from "react";
import axios from "axios";

const ReportePagosPorEquipo = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [equipo, setEquipo] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [reporte, setReporte] = useState([]);
  const [error, setError] = useState(null);

  // 🔹 Cargar especialidades (equipos)
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/especialidades`
        );

        // Normalizar respuesta para que siempre sea array
        if (Array.isArray(data)) {
          setEspecialidades(data);
        } else if (Array.isArray(data.data)) {
          setEspecialidades(data.data);
        } else {
          setEspecialidades([]);
        }
      } catch (err) {
        setError("Error al cargar las especialidades");
      }
    };

    fetchEspecialidades();
  }, []);

  // 🔹 Generar reporte
  const generarReporte = async () => {
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/pagos/reporte-por-equipo`,
        {
          params: {
            equipo: equipo !== "Todos" ? equipo : undefined,
            fechaInicio: fechaInicio || undefined,
            fechaFin: fechaFin || undefined,
          },
        }
      );

      // Normalizar respuesta
      if (Array.isArray(data)) {
        setReporte(data);
      } else if (Array.isArray(data.data)) {
        setReporte(data.data);
      } else {
        setReporte([]);
      }
      setError(null);
    } catch (err) {
      setError("Error al generar el reporte");
      setReporte([]);
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Informe de pagos por equipo</h2>

      {/* Filtros */}
      <div style={{ marginBottom: "15px" }}>
        <label>Equipo: </label>
        <select value={equipo} onChange={(e) => setEquipo(e.target.value)}>
          <option value="Todos">Todos</option>
          {especialidades.map((esp) => (
            <option key={esp._id} value={esp.nombre}>
              {esp.nombre}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Fecha inicial: </label>
        <input
          type="date"
          value={fechaInicio}
          onChange={(e) => setFechaInicio(e.target.value)}
        />
      </div>

      <div style={{ marginBottom: "15px" }}>
        <label>Fecha final: </label>
        <input
          type="date"
          value={fechaFin}
          onChange={(e) => setFechaFin(e.target.value)}
        />
      </div>

      <button onClick={generarReporte}>Generar Informe</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {/* Tabla de resultados */}
      {reporte.length > 0 && (
        <table border="1" cellPadding="8" style={{ marginTop: "20px" }}>
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Equipo</th>
              <th>Monto</th>
              <th>Fecha de Pago</th>
            </tr>
          </thead>
          <tbody>
            {reporte.map((pago, index) => (
              <tr key={index}>
                <td>{pago.cliente?.nombre}</td>
                <td>{pago.cliente?.especialidad || "No asignado"}</td>
                <td>{pago.monto}</td>
                <td>{new Date(pago.fechaPago).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {reporte.length === 0 && !error && (
        <p style={{ marginTop: "20px" }}>No hay pagos para mostrar.</p>
      )}
    </div>
  );
};

export default ReportePagosPorEquipo;
