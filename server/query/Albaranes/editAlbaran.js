import express from "express";
import conexion from "../../conexion.js";

const router = express.Router();

const editAlbaran = (io) => {
  router.put("/edit", async (req, res) => {
    const query = "UPDATE Albaranes SET proceso = ? WHERE id = ?";
    const { proceso, id } = req.body;

    try {     

      // Ejecutar la consulta
      const [resultados] = await conexion.query(query, [proceso, id]);

      console.log("Resultados de la consulta:", resultados);

      if (resultados.affectedRows === 0) {
        console.log("Albarán no encontrado");
        res.status(404).json({ error: "Albarán no encontrado" });
        return;
      }

      if (resultados.affectedRows === 1) {
        console.log("Albarán actualizado correctamente");
        // Emitir evento con los datos actualizados
        io.emit("albaranModificado", { id, proceso });
        res.status(200).json({ exito: "Proceso modificado" });
        return;
      }

      // Caso inesperado
      console.log("Caso inesperado:", resultados);
      res.status(500).json({ error: "Error inesperado" });
    } catch (err) {
      console.error("Error al ejecutar la consulta:", err);
      res.status(500).json({ error: "Error al actualizar el albarán" });
    }
  });

  return router;
};

export default editAlbaran;
