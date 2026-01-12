import React, { useState, useEffect } from "react";
import { Table, Button, Form, Spinner, Badge, Alert } from "react-bootstrap";
import { obtenerClientes, crearPagoMensualidad, obtenerMensualidades } from "../../api/axios";

const PagosMensualidades = () => {
  const [clientes, setClientes] = useState([]);
  const [datosMensualidades, setDatosMensualidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filtroAnio, setFiltroAnio] = useState(new Date().getFullYear());

  const meses = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

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
      setError("Error al cargar los datos. Verifica la conexión.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [filtroAnio]);

  const handleRegistrarPago = async (clienteId, mesIndex) => {
    const montoStr = window.prompt(`Monto para el mes de ${meses[mesIndex]}:`, "80000");
    if (montoStr === null) return;

    try {
      await crearPagoMensualidad({
        clienteId,
        mes: mesIndex + 1,
        anio: filtroAnio,
        monto: Number(montoStr),
        metodoPago: "Efectivo"
      });
      fetchData(); 
    } catch (err) {
      alert("Error al registrar el pago");
    }
  };

  const getPago = (clienteId, mesIndex) => {
    return datosMensualidades.find(p => p.cliente === clienteId && p.mes === (mesIndex + 1));
  };

  // Función para formatear el dinero de forma compacta (ej: 80k)
  const formatCompact = (monto) => {
    return monto >= 1000 ? `${monto / 1000}k` : monto;
  };

  if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

  return (
    <div className="container-fluid p-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h3>Planilla de Mensualidades {filtroAnio}</h3>
        <Form.Control 
          type="number" 
          value={filtroAnio} 
          onChange={(e) => setFiltroAnio(parseInt(e.target.value))} 
          style={{ width: '120px' }}
        />
      </div>

      <div className="table-responsive shadow rounded">
        <Table striped bordered hover className="text-center align-middle bg-white">
          <thead className="table-dark">
            <tr>
              <th className="text-start">Cliente</th>
              {meses.map(m => <th key={m} style={{ fontSize: '0.85rem' }}>{m}</th>)}
              <th className="bg-primary">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => {
              let acumuladoCliente = 0;
              return (
                <tr key={c._id}>
                  <td className="text-start small fw-bold">{c.nombre} {c.apellido}</td>
                  {meses.map((_, i) => {
                    const pago = getPago(c._id, i);
                    if (pago) acumuladoCliente += (pago.monto || 0);
                    
                    return (
                      <td key={i}>
                        {pago ? (
                          <span className="fw-bold text-success" style={{ fontSize: '0.75rem' }}>
                            {formatCompact(pago.monto)}
                          </span>
                        ) : (
                          <Button 
                            variant="light" 
                            size="sm" 
                            className="text-muted" 
                            style={{ fontSize: '0.6rem', padding: '1px 5px' }}
                            onClick={() => handleRegistrarPago(c._id, i)}
                          >
                            +
                          </Button>
                        )}
                      </td>
                    );
                  })}
                  <td className="fw-bold text-primary">
                    ${acumuladoCliente.toLocaleString()}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
};

export default PagosMensualidades;
