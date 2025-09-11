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
    <div className="max-w-5xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Informe de Pagos por Equipo
      </h2>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-gray-700 font-medium mb-1">Equipo</label>
          <select
            value={equipo}
            onChange={(e) => setEquipo(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
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
          <label className="block text-gray-700 font-medium mb-1">
            Fecha inicial
          </label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Fecha final
          </label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      <div className="text-center mb-6">
        <button
          onClick={generarReporte}
          className="bg-blue-600 text-white px-6 py-2 rounded-md shadow hover:bg-blue-700 transition"
        >
          Generar Informe
        </button>
      </div>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      {/* Tabla */}
      {reporte.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-md shadow-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 text-left border-b">Cliente</th>
                <th className="p-3 text-left border-b">Equipo</th>
                <th className="p-3 text-left border-b">Monto</th>
                <th className="p-3 text-left border-b">Fecha de Pago</th>
              </tr>
            </thead>
            <tbody>
              {reporte.map((pago, index) => (
                <tr
                  key={index}
                  className="hover:bg-gray-50 transition duration-200"
                >
                  <td className="p-3 border-b">
                    {pago.cliente?.nombre || "Sin nombre"}
                  </td>
                  <td className="p-3 border-b">
                    {pago.cliente?.especialidad || "No asignado"}
                  </td>
                  <td className="p-3 border-b">${pago.monto}</td>
                  <td className="p-3 border-b">
                    {new Date(pago.fechaPago).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        !error && (
          <p className="text-gray-600 text-center mt-6">
            No hay pagos para mostrar.
          </p>
        )
      )}
    </div>
  );
};

export default ReportePagosPorEquipo;
