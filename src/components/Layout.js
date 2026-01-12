import React, { useContext } from "react";
import { Container } from "react-bootstrap";
import { AuthContext } from "../context/AuthContext";
import Sidebar from "./Sidebar"; 

const Layout = ({ children }) => {
  // Añadimos 'loading' si tu context lo tiene para evitar saltos
  const { user, logout, loading } = useContext(AuthContext);

  if (loading) return null; // O un spinner

  return (
    <div style={{ display: "flex" }}>
      {/* Si 'user' es null por el error 401, el Sidebar no se muestra */}
      {user && <Sidebar handleLogout={logout} />}
      
      <Container 
        fluid 
        className="mt-4" 
        style={{ 
          marginLeft: user ? "250px" : "0", 
          transition: "margin 0.3s" 
        }}
      >
        {children}
      </Container>
    </div>
  );
};

export default Layout;
