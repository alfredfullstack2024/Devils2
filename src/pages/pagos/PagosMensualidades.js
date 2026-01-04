import React, { useState, useEffect } from "react";
import { Table, Button, Form, Modal, Spinner, Badge } from "react-bootstrap";
import { obtenerClientes, obtenerProductos, crearPagoMensualidad, obtenerMensualidades } from "../../api/axios";

const PagosMensualidades = () => {
  const [clientes, setClientes] = useState([]);
  const [datosMensualidades, setDatosMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resClientes, resMensualidades] = await Promise.all([
          obtenerClientes(),
          obtenerMensualidades(filtroAnio)
        ]);
        setClientes(resClientes.data || []);
        setDatosMensualidades(resMensualidades.data || []);
      } catch (err) {
        console.error("Error cargando planilla:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [filtroAnio]);

  if (loading) return <Spinner animation="border" />;

  return (
    <div className="p-4">
      <h3>Planilla de Mensualidades {filtroAnio}</h3>
      <Table striped bordered hover responsive className="mt-3">
        <thead>
          <tr>
            <th>Cliente</th>
            <th>Ene</th><th>Feb</th><th>Mar</th><th>Abr</th><th>May</th><th>Jun</th>
            <th>Jul</th><th>Ago</th><th>Sep</th><th>Oct</th><th>Nov</th><th>Dic</th>
          </tr>
        </thead>
        <tbody>
          {clientes.map(c => (
            <tr key={c._id}>
              <td>{c.nombre} {c.apellido}</td>
              {[...Array(12)].map((_, i) => (
                <td key={i} className="text-center">-</td>
              ))}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default PagosMensualidades;
