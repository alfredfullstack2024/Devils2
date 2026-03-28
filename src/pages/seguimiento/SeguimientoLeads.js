import React, { useState, useEffect } from "react";
import { Table, Button, Card } from "react-bootstrap";
import FilaLead from "./components/FilaLead";
import DashboardLeads from "./components/DashboardLeads";

const columnas = [
  { key: "nombre", label: "Nombre", tipo: "text" },
  { key: "telefono", label: "Teléfono", tipo: "text" },
  { key: "edad", label: "Edad", tipo: "number" },
  { key: "interes", label: "Interés", tipo: "select" },
  { key: "medio", label: "Llegó por", tipo: "select" },
  { key: "estado", label: "Estado", tipo: "select" },
  { key: "fecha", label: "Fecha", tipo: "date" },
  { key: "observaciones", label: "Observaciones", tipo: "text" },
];

const SeguimientoLeads = () => {
  const [data, setData] = useState([]);

  const agregarFila = () => {
    setData([
      ...data,
      {
        id: Date.now(),
        nombre: "",
        telefono: "",
        edad: "",
        interes: "",
        medio: "",
        estado: "Nuevo",
        fecha: new Date().toISOString().split("T")[0],
        observaciones: "",
      },
    ]);
  };

  const handleChange = (id, campo, valor) => {
    setData((prev) =>
      prev.map((row) => (row.id === id ? { ...row, [campo]: valor } : row)),
    );
  };

  // Guardar en localStorage
  useEffect(() => {
    const saved = localStorage.getItem("leads");
    if (saved) setData(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("leads", JSON.stringify(data));
  }, [data]);

  return (
    <div className="container-fluid p-4">
      <h3 className="mb-3">Seguimiento de Leads</h3>

      <Card className="p-3 mb-3">
        <Button onClick={agregarFila}>➕ Nuevo Lead</Button>
      </Card>

      <div className="table-responsive bg-white shadow-sm rounded">
        <Table bordered hover className="text-center align-middle">
          <thead className="table-dark">
            <tr>
              {columnas.map((col) => (
                <th key={col.key}>{col.label}</th>
              ))}
            </tr>
          </thead>

          <tbody>
            {data.map((row) => (
              <FilaLead
                key={row.id}
                row={row}
                columnas={columnas}
                onChange={handleChange}
              />
            ))}
          </tbody>
        </Table>
      </div>

      <Card className="mt-4 p-3">
        <DashboardLeads data={data} />
      </Card>
    </div>
  );
};

export default SeguimientoLeads;
