import React from "react";
import { Row, Col, Card } from "react-bootstrap";

const DashboardLeads = ({ data }) => {
  const contar = (estado) => data.filter((d) => d.estado === estado).length;

  return (
    <Row>
      <Col>
        <Card className="p-2 text-center">Nuevos: {contar("Nuevo")}</Card>
      </Col>

      <Col>
        <Card className="p-2 text-center">
          Seguimiento: {contar("Seguimiento")}
        </Card>
      </Col>

      <Col>
        <Card className="p-2 text-center">Inscritos: {contar("Inscrito")}</Card>
      </Col>

      <Col>
        <Card className="p-2 text-center">Perdidos: {contar("Perdido")}</Card>
      </Col>
    </Row>
  );
};

export default DashboardLeads;
