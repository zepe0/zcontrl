import express from "express";
import conexion from "../../conexion.js";

const router = express.Router();

// Endpoint para obtener los pinturas
router.get("", async (req, res) => {
  const query = "SELECT * FROM pintura";
  try {
    const [resultado] = await conexion.query(query);
    if (resultado.length > 0) {
      res.status(200).json(resultado);
    } else {
      res.status(404).json({ error: "No se encontraron pinturas" });
    }
  } catch (error) {
    console.error("Error al ejecutar la consulta:", error);
    res.status(500).json({ error: "Error al obtener las pinturas" });
  }
});

export default router;
