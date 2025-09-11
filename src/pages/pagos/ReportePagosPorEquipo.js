import React, { useEffect, useState } from "react";
import axios from "axios";
import { format } from "date-fns";

const ReportePagosPorEquipo = () => {
  const [equipos, setEquipos] = useState([]);
  const [pagos, setPagos] = useState([]);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState("");
  const [fechaInicio, setFechaInicio] = useState("");
  const [fechaFin, setFechaFin] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState("");

  // Cargar equipos al montar
  useEffect(() => {
    const fetchEquipos = async () => {
      try {
        const token = localStorage.getItem("token");
        const { data } = await axios.get("/api/equipos", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setEquipos(data || []);
      } catch (err) {
        console.error("Error cargando equipos:", err);
        setError("Error cargando equipos");
      }
    };
    fetchEquipos();
  }, []);

  // Consultar pagos
  const consultarPagos = async () => {
    try {
      setCargando(true);
      setError("");

      const token = localStorage.getItem("token");
      const { data } = await axios.get("/api/pagos/reporte", {
        headers: { Authorization: `Bearer ${token}` },
        params: {
          equipo: equipoSeleccionado || undefined,
          fechaInicio: fechaInicio || undefined,
          fechaFin: fechaFin || undefined,
        },
      });

      setPagos(data.pagos || []);
    } catch (err) {
      console.error("Error al consultar pagos:", err);
      setError("No se pudieron obtener los pagos");
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Reporte de Pagos por Equipo</h1>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block mb-1 font-medium">Equipo</label>
          <select
            value={equipoSeleccionado}
            onChange={(e) => setEquipoSeleccionado(e.target.value)}
            className="w-full border rounded p-2"
          >
            <option value="">Todos</option>
            {equipos.map((eq) => (
              <option key={eq._id} value={eq._id}>
                {eq.nombre}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block mb-1 font-medium">Fecha inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div>
          <label className="block mb-1 font-medium">Fecha fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            className="w-full border rounded p-2"
          />
        </div>

        <div className="flex items-end">
          <button
            onClick={consultarPagos}
            className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Generar Reporte
          </button>
        </div>
      </div>

      {/* Estado */}
      {cargando && <p>Cargando pagos...</p>}
      {error && <p className="text-red-600">{error}</p>}

      {/* Tabla */}
      {pagos.length > 0 && (
        <div className="overflow-x-auto">
          <table className="min-w-full border">
            <thead>
              <tr className="bg-gray-200">
                <th className="border px-4 py-2">Cliente</th>
                <th className="border px-4 py-2">Equipo</th>
                <th className="border px-4 py-2">Monto</th>
                <th className="border px-4 py-2">Fecha</th>
                <th className="border px-4 py-2">Método de pago</th>
              </tr>
            </thead>
            <tbody>
              {pagos.map((pago) => (
                <tr key={pago._id}>
                  <td className="border px-4 py-2">
                    {pago.cliente?.nombre} {pago.cliente?.apellido}
                  </td>
                  <td className="border px-4 py-2">
                    {pago.cliente?.equipo?.nombre || "No asignado"}
                  </td>
                  <td className="border px-4 py-2">${pago.monto}</td>
                  <td className="border px-4 py-2">
                    {format(new Date(pago.fecha), "dd/MM/yyyy")}
                  </td>
                  <td className="border px-4 py-2">{pago.metodoPago}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pagos.length === 0 && !cargando && !error && (
        <p>No hay pagos para los filtros seleccionados</p>
      )}
    </div>
  );
};

export default ReportePagosPorEquipo;
