import React from "react";
import { Form } from "react-bootstrap";

const opciones = {
  interes: ["Clases", "Personalizado", "Ambos"],
  medio: ["Instagram", "Facebook", "Referido", "WhatsApp"],
  estado: ["Nuevo", "Contactado", "Seguimiento", "Inscrito", "Perdido"],
};

const FilaLead = ({ row, columnas, onChange }) => {
  return (
    <tr>
      {columnas.map((col) => (
        <td key={col.key}>
          {col.tipo === "select" ? (
            <Form.Select
              value={row[col.key]}
              onChange={(e) => onChange(row.id, col.key, e.target.value)}
            >
              <option value="">-</option>
              {opciones[col.key].map((op) => (
                <option key={op}>{op}</option>
              ))}
            </Form.Select>
          ) : (
            <Form.Control
              type={col.tipo}
              value={row[col.key]}
              onChange={(e) => onChange(row.id, col.key, e.target.value)}
            />
          )}
        </td>
      ))}
    </tr>
  );
};

export default FilaLead;
