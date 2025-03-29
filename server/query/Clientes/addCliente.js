import express from "express";
import conexion from "../../conexion.js";
import { randomUUID } from "crypto";

const router = express.Router();

const addCliente = (io) => {
  router.post("/add", async (req, res) => {
    const id = randomUUID();
    const query =
      "INSERT INTO cliente (id, nombre, tel, dir, Nif) VALUES (?, ?, ?, ?, ?)";
    const { nombre, tel, dir, Nif } = req.body;

    try {
      // Ejecutar la consulta
      const [resultados] = await conexion.query(query, [
        id,
        nombre,
        tel,
        dir,
        Nif,
      ]);

      if (resultados.affectedRows === 1) {
        // Emitir evento de cliente añadido
        io.emit("ClienteAñadido", { id, nombre, tel, dir, Nif });
        res.status(200).json({ exito: "Cliente añadido" });
        return;
      }

      // Caso inesperado
      res.status(500).json({ error: "No se pudo añadir el cliente" });
    } catch (err) {
      // Manejar errores específicos
      if (err.code === "ER_DUP_ENTRY") {
        res.status(400).json({ error: "Cliente ya existe" });
        return;
      }

      // Manejar otros errores
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).json({ error: "Error al añadir el cliente" });
    }
  });

  return router;
};

export default addCliente;
