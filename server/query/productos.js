import express from "express";
import conexion from "../conexion.js";

const router = express.Router();

// Endpoint para obtener los productos
router.get("", async (req, res) => {
  const query = "SELECT * FROM productos";
  try {
    const [resultados] = await conexion.query(query);
    res.status(200).json(resultados);
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ error: "Error al obtener los productos" });
  }
});

export default router;
