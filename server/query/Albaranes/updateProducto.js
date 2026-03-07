import express from "express";
import conexion from "../../conexion.js";

const router = express.Router();

// actualizar producto dentro de un albarán
router.put("/producto", async (req, res) => {
  const { idALbaran, idMaterial, cantidad, ral, nombreMaterial, refObra } =
    req.body;

  try {
    const updates = [];
    const params = [];

    if (typeof cantidad !== "undefined") {
      updates.push("cantidad = ?");
      params.push(cantidad);
    }
    if (typeof ral !== "undefined") {
      updates.push("ral = ?");
      params.push(ral);
    }

    if (updates.length > 0) {
      const query = `UPDATE AlbaranMateriales SET ${updates.join(", ")} WHERE idALbaran = ? AND idMaterial = ?`;
      params.push(idALbaran, idMaterial);
      const [result] = await conexion.query(query, params);
      if (result.affectedRows === 0) {
        return res
          .status(404)
          .json({ error: "Producto en albarán no encontrado" });
      }
    }

    // si se editan campos de la tabla productos
    if (nombreMaterial || refObra) {
      const prodUpdates = [];
      const prodParams = [];
      if (nombreMaterial) {
        prodUpdates.push("nombre = ?");
        prodParams.push(nombreMaterial);
      }
      if (refObra) {
        prodUpdates.push("refObra = ?");
        prodParams.push(refObra);
      }
      if (prodUpdates.length > 0) {
        prodParams.push(idMaterial);
        const prodQuery = `UPDATE productos SET ${prodUpdates.join(", ")} WHERE id = ?`;
        await conexion.query(prodQuery, prodParams);
      }
    }

    res.status(200).json({ exito: "Producto actualizado" });
  } catch (err) {
    console.error("Error al actualizar producto del albarán:", err);
    res.status(500).json({ error: "Error interno" });
  }
});

export default router;
