import React, { useEffect, useState } from "react";
import axios from "axios";

const ReportePagosPorEquipo = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [equipo, setEquipo] = useState("Todos");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [pagos, setPagos] = useState([]);
  const [error, setError] = useState("");

  // 🔹 Cargar las especialidades desde la API
  useEffect(() => {
    const fetchEspecialidades = async () => {
      try {
        const { data } = await axios.get(
          `${process.env.REACT_APP_API_URL}/especialidades`
        );
        setEspecialidades(data);
      } catch (err) {
        setError("Error al cargar las especialidades");
      }
    };
    fetchEspecialidades();
  }, []);

  // 🔹 Generar reporte
  const generarReporte = async () => {
    try {
      const params = {};
      if (equipo !== "Todos") params.especialidad = equipo;
      if (fechaInicio) params.fechaInicio = fechaInicio;
      if (fechaFin) params.fechaFin = fechaFin;

      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL}/pagos/reporte`,
        { params }
      );
      setPagos(data);
    } catch (err) {
      setError("Error al generar el informe");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Informe de pagos por equipo</h1>

      {/* Filtros */}
      <div className="flex gap-4 mb-4">
        <div>
          <label className="block">Equipo</label>
          <select
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            className="border p-2 rounded"
          >
            <option value="Todos">Todos</option>
            {especialidades.map((esp) => (
              <option key={esp._id} value={esp.nombre}>
                {esp.nombre}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block">Fecha inicial</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div>
          <label className="block">Fecha final</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="border p-2 rounded"
          />
        </div>
        <div className="flex items-end">
          <button
            onClick={generarReporte}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Generar Informe
          </button>
        </div>
      </div>

      {/* Tabla de resultados */}
      {error && <p className="text-red-600">{error}</p>}
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Cliente</th>
            <th className="border px-4 py-2">Equipo</th>
            <th className="border px-4 py-2">Monto</th>
            <th className="border px-4 py-2">Fecha</th>
          </tr>
        </thead>
        <tbody>
          {pagos.length > 0 ? (
            pagos.map((pago) => (
              <tr key={pago._id}>
                <td className="border px-4 py-2">{pago.cliente?.nombre}</td>
                <td className="border px-4 py-2">{pago.cliente?.especialidad || "No asignado"}</td>
                <td className="border px-4 py-2">${pago.monto}</td>
                <td className="border px-4 py-2">
                  {new Date(pago.fecha).toLocaleDateString()}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center py-4">
                No hay pagos disponibles
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ReportePagosPorEquipo;
