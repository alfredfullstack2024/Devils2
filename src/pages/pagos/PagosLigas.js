import React, { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "../../components/ui/card";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Select } from "../../components/ui/select";
import { format } from "date-fns";
import axios from "axios";

const PagosLigas = () => {
  const [meses, setMeses] = useState([]); // lista de meses creados
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [nuevoMes, setNuevoMes] = useState("");
  const [valorDiario, setValorDiario] = useState(8000);
  const [pagos, setPagos] = useState([]);

  const backendURL =
    import.meta.env.VITE_API_URL || "https://backendiconic.vercel.app/api";

  // 🔹 Cargar meses y pagos
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

  // 🔹 Crear un nuevo mes
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

  // 🔹 Guardar nuevo valor diario
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
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold text-center">
            🏆 Control de Pagos de Ligas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-4 justify-between">
            <div className="flex items-center gap-2">
              <Input
                placeholder="Ejemplo: Noviembre 2025"
                value={nuevoMes}
                onChange={(e) => setNuevoMes(e.target.value)}
              />
              <Button onClick={crearMes}>Crear Mes</Button>
            </div>

            <div className="flex items-center gap-2">
              <label>Seleccionar mes:</label>
              <select
                value={mesSeleccionado}
                onChange={(e) => {
                  setMesSeleccionado(e.target.value);
                  cargarPagos(e.target.value);
                }}
                className="border rounded p-2"
              >
                {meses.map((m) => (
                  <option key={m._id} value={m.nombre}>
                    {m.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-4">
            <label>💰 Valor diario:</label>
            <Input
              type="number"
              value={valorDiario}
              onChange={(e) => setValorDiario(Number(e.target.value))}
              className="w-32"
            />
            <Button onClick={actualizarValorDiario}>Actualizar</Button>
          </div>

          <hr className="my-4" />

          <div className="flex flex-col items-center gap-3">
            <Button className="w-full md:w-1/3" onClick={registrarPago}>
              Registrar pago de hoy
            </Button>

            <Card className="w-full md:w-2/3 mt-4 p-4">
              <h3 className="text-lg font-semibold text-center mb-3">
                Resumen de Pagos del Mes
              </h3>
              <p>
                <strong>Total días pagados:</strong> {totalPagos}
              </p>
              <p>
                <strong>Total recaudado:</strong> $
                {totalRecaudado.toLocaleString()}
              </p>
              <hr className="my-3" />
              <h4 className="font-semibold">Detalle:</h4>
              <ul className="list-disc pl-5">
                {pagos.map((pago) => (
                  <li key={pago._id}>
                    {format(new Date(pago.fecha), "dd/MM/yyyy")}
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PagosLigas;
