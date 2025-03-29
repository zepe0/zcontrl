import express from "express";
import conexion from "../../conexion.js";

const router = express.Router();

// Endpoint para obtener los pinturas
router.get("",  async (req, res) => {
  const query = "SELECT * FROM Albaranes";
  try {
    const [resultados] = await conexion.query(query);
    res.status(200).json(resultados);
  } catch (err) {
    console.error("Error al ejecutar la consulta:", err);
    res.status(500).json({ error: "Error al obtener los albaranes" });
  }
});

export default router;
