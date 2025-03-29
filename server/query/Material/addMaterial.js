import express from "express";
import conexion from "../../conexion.js";
import { randomUUID } from "crypto";

const router = express.Router();

const addMaterial = (io) => {
  router.post("/add", async (req, res) => {
    const id = randomUUID();
    const query =
      "INSERT INTO productos (id,nombre, uni, precio, refObra, consumo) VALUES (?,?, ?, ?, ?, ?)";
    const { nombre, stock, precio, obra, consumo } = req.body;
    try {
      const [resultado] = await conexion.query(query, [
        id,
        nombre,
        stock,
        precio,
        obra,
        consumo,
      ]);

      if (resultado.affectedRows > 0) {
        io.emit("materialAñadido", { nombre, stock, precio, obra, consumo });
        res.status(200).json({ message: "Material añadido correctamente" });
      }
      res.status(400).json({ error: "No se pudo añadir el material" });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY") {
        res.status(200).json({ error: "Material ya existe" });
        return;
      }
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).json({ error: "Error al añadir el material" });
    }
  });
  return router;
};

export default addMaterial;
