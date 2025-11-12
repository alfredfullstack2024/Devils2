import React, { useState, useEffect } from "react";
import axios from "axios";
import { format } from "date-fns";

// Si no tienes los componentes UI personalizados, usamos HTML estándar con estilos básicos
const PagosLigas = () => {
  const [meses, setMeses] = useState([]);
  const [mesSeleccionado, setMesSeleccionado] = useState("");
  const [nuevoMes, setNuevoMes] = useState("");
  const [valorDiario, setValorDiario] = useState(8000);
  const [pagos, setPagos] = useState([]);

  // ✅ Variable de backend compatible con Create React App o cualquier entorno no Vite
  const backendURL =
    process.env.REACT_APP_API_URL || "https://backendiconic.vercel.app/api";

  // 🔹 Cargar meses y pagos al iniciar
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

  // 🔹 Actualizar valor diario
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
    <div style={{ padding: "2rem" }}>
      <div
        style={{
          background: "#fff",
          borderRadius: "1rem",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <h2
          style={{
            textAlign: "center",
            fontSize: "1.5rem",
            fontWeight: "bold",
            marginBottom: "1.5rem",
          }}
        >
          🏆 Control de Pagos de Ligas
        </h2>

        {/* Crear mes */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            justifyContent: "space-between",
            marginBottom: "1.5rem",
          }}
        >
          <div>
            <input
              type="text"
              placeholder="Ejemplo: Noviembre 2025"
              value={nuevoMes}
              onChange={(e) => setNuevoMes(e.target.value)}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
                marginRight: "0.5rem",
              }}
            />
            <button
              onClick={crearMes}
              style={{
                background: "#4f46e5",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "0.5rem",
                border: "none",
                cursor: "pointer",
              }}
            >
              Crear Mes
            </button>
          </div>

          {/* Selector de mes */}
          <div>
            <label style={{ marginRight: "0.5rem" }}>Seleccionar mes:</label>
            <select
              value={mesSeleccionado}
              onChange={(e) => {
                setMesSeleccionado(e.target.value);
                cargarPagos(e.target.value);
              }}
              style={{
                padding: "0.5rem",
                borderRadius: "0.5rem",
                border: "1px solid #ccc",
              }}
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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginBottom: "1.5rem",
          }}
        >
          <label>💰 Valor diario:</label>
          <input
            type="number"
            value={valorDiario}
            onChange={(e) => setValorDiario(Number(e.target.value))}
            style={{
              width: "120px",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              border: "1px solid #ccc",
            }}
          />
          <button
            onClick={actualizarValorDiario}
            style={{
              background: "#22c55e",
              color: "white",
              padding: "0.5rem 1rem",
              borderRadius: "0.5rem",
              border: "none",
              cursor: "pointer",
            }}
          >
            Actualizar
          </button>
        </div>

        <hr style={{ margin: "1.5rem 0" }} />

        {/* Registrar pago */}
        <div style={{ textAlign: "center" }}>
          <button
            onClick={registrarPago}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "0.75rem 2rem",
              borderRadius: "0.75rem",
              border: "none",
              cursor: "pointer",
              fontSize: "1rem",
              fontWeight: "bold",
            }}
          >
            Registrar pago de hoy
          </button>
        </div>

        {/* Resumen */}
        <div
          style={{
            marginTop: "2rem",
            background: "#f9fafb",
            borderRadius: "1rem",
            padding: "1.5rem",
          }}
        >
          <h3 style={{ textAlign: "center", marginBottom: "1rem" }}>
            📋 Resumen de Pagos del Mes
          </h3>
          <p>
            <strong>Total días pagados:</strong> {totalPagos}
          </p>
          <p>
            <strong>Total recaudado:</strong>{" "}
            ${totalRecaudado.toLocaleString("es-CO")}
          </p>

          <hr style={{ margin: "1rem 0" }} />

          <h4>🗓️ Detalle de días pagados:</h4>
          <ul style={{ listStyleType: "disc", paddingLeft: "1.5rem" }}>
            {pagos.map((pago) => (
              <li key={pago._id}>
                {format(new Date(pago.fecha), "dd/MM/yyyy")}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PagosLigas;
