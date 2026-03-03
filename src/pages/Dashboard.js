import React from "react";
import { Container, Card } from "react-bootstrap";

const Dashboard = () => {
  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <Card.Title>Bienvenido al Dashboard</Card.Title>
          <Card.Text>
            Este es el panel principal de la aplicación. Desde aquí puedes
            navegar a las diferentes secciones. Este programa está diseñado
            especialmente para la gestión de <strong>escuelas de porrismo</strong>. 
            Aquí podrás administrar alumnas, entrenadores, membresías, rutinas, 
            clases y toda la organización interna de tu escuela, con el fin de 
            optimizar la asignación de entrenamientos y el seguimiento de cada equipo.
            Bienvenido a <strong>Admin-Escuela</strong>, la aplicación que te ayudará 
            a llevar el control total de tu institución de porrismo.
          </Card.Text>

          <div style={{ marginTop: "30px", textAlign: "center" }}>
            <h5 style={{ fontFamily: "cursive", fontWeight: "bold" }}>
              <span style={{ color: "#ff6600", fontSize: "1.2em" }}>
                Alfredfullstack
              </span>{" "}
              les da la bienvenida
            </h5>
            <p>Equipo:</p>
            <img
              src="https://github.com/alfredfullstack2024/alfredfullstack.com/blob/main/images/Devilsgris.jpg"
              alt="Logo Devils"
              style={{ width: "120px", marginTop: "10px", objectFit: "contain" }}
            />
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Dashboard;

