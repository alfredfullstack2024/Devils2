import React, { useState, useEffect } from "react";
import { format } from "date-fns";
import axios from "axios";

const PagosLigas = () => {
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [nuevoMes, setNuevoMes] = useState("");
  const [valorDiario, setValorDiario] = useState(8000);
  const [pagos, setPagos] = useState([]);

  const backendURL =
    import.meta.env.VITE_API_URL || "https://backendiconic.vercel.app/api";

  // 🔹 Cargar meses y pagos al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        const mesesRes = await axios.get(`${backendURL}/pagos-ligas/meses`, {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });
        setMeses(mesesRes.data);

        if (mesesRes.data.length > 0) {
          setMesSeleccionado(mesesRes.data[0].nombre);
          cargarPagos(mesesRes.data[0].nombre);
        }
      } catch (error) {
        console.error("Error al cargar los meses:", error);
      }
    };
    fetchData();
  }, []);

  // 🔹 Cargar pagos de un mes
  const cargarPagos = async (mes) => {
    try {
      const pagosRes = await axios.get(`${backendURL}/pagos-ligas/${mes}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setPagos(pagosRes.data);
    } catch (error) {
      console.error("Error al cargar pagos:", error);
    }
  };

  // 🔹 Crear nuevo mes
  const crearMes = async () => {
    if (!nuevoMes.trim()) return alert("Ingresa un nombre para el mes");
    try {
      await axios.post(
        `${backendURL}/pagos-ligas/crear-mes`,
        { nombre: nuevoMes },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Mes creado correctamente");
      setNuevoMes("");
      const mesesRes = await axios.get(`${backendURL}/pagos-ligas/meses`);
      setMeses(mesesRes.data);
    } catch (error) {
      console.error("Error al crear mes:", error);
    }
  };

  // 🔹 Actualizar valor diario global
  const actualizarValorDiario = async () => {
    try {
      await axios.put(
        `${backendURL}/pagos-ligas/valor-diario`,
        { valor: valorDiario },
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Valor diario actualizado correctamente");
    } catch (error) {
      console.error("Error al actualizar valor diario:", error);
    }
  };

  // 🔹 Registrar pago diario
  const registrarPago = async () => {
    if (!mesSeleccionado) return alert("Selecciona un mes");
    try {
      await axios.post(
        `${backendURL}/pagos-ligas/${mesSeleccionado}/pago`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } }
      );
      alert("Pago registrado correctamente");
      cargarPagos(mesSeleccionado);
    } catch (error) {
      console.error("Error al registrar pago:", error);
    }
  };

  // 🔹 Calcular totales
  const totalPagos = pagos.length;
  const totalRecaudado = totalPagos * valorDiario;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-white shadow-md rounded-xl p-6">
        <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">
          🏆 Control de Pagos de Ligas
        </h2>

        {/* Crear nuevo mes */}
        <div className="flex flex-wrap items-center gap-3 justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Ejemplo: Noviembre 2025"
              value={nuevoMes}
              onChange={(e) => setNuevoMes(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2"
            />
            <button
              onClick={crearMes}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Crear Mes
            </button>
          </div>

          <div className="flex items-center gap-2">
            <label className="font-medium">Seleccionar mes:</label>
            <select
              value={mesSeleccionado}
              onChange={(e) => {
                setMesSeleccionado(e.target.value);
                cargarPagos(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-2"
            >
              {meses.map((m) => (
                <option key={m._id} value={m.nombre}>
                  {m.nombre}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Valor diario */}
        <div className="flex items-center gap-3 mb-6">
          <label className="font-medium">💰 Valor diario:</label>
          <input
            type="number"
            value={valorDiario}
            onChange={(e) => setValorDiario(Number(e.target.value))}
            className="border border-gray-300 rounded-lg px-3 py-2 w-32"
          />
          <button
            onClick={actualizarValorDiario}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition"
          >
            Actualizar
          </button>
        </div>

        <hr className="my-4" />

        {/* Botón de registrar pago */}
        <div className="flex flex-col items-center gap-3">
          <button
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition w-full md:w-1/2"
            onClick={registrarPago}
          >
            Registrar pago de hoy
          </button>

          {/* Resumen de pagos */}
          <div className="bg-gray-50 border rounded-xl p-4 w-full md:w-2/3 mt-4 shadow-sm">
            <h3 className="text-lg font-semibold text-center mb-3 text-gray-800">
              Resumen de Pagos del Mes
            </h3>
            <p>
              <strong>Total días pagados:</strong> {totalPagos}
            </p>
            <p>
              <strong>Total recaudado:</strong> ${totalRecaudado.toLocaleString()}
            </p>

            <hr className="my-3" />
            <h4 className="font-semibold mb-2">Detalle de pagos:</h4>
            <ul className="list-disc pl-5 text-gray-700">
              {pagos.map((pago) => (
                <li key={pago._id}>
                  {format(new Date(pago.fecha), "dd/MM/yyyy")}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PagosLigas;
