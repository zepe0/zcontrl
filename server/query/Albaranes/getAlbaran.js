import express from "express";
import conexion from "../../conexion.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Consulta para obtener los datos del cliente asociado al albarán
    const queryCliente = `
      SELECT c.*,a.proceso
      FROM Albaranes a
      JOIN cliente c ON a.nCliente = c.nombre
      WHERE a.id = ?
    `;
    const [clienteData] = await conexion.query(queryCliente, [id]);
    if (clienteData.length === 0) {
      return res.status(404).json({ error: "Albarán o cliente no encontrado" });
    }

    // Consulta para obtener los productos asociados al albarán
    const queryProductos = `
      SELECT am.idALbaran, am.idMaterial, am.cantidad,am.ral, am.observaciones,
             p.nombre AS nombreMaterial,  p.refObra
      FROM AlbaranMateriales am
      JOIN productos p ON am.idMaterial = p.id
      WHERE am.idALbaran = ?
    `;
    const [productosData] = await conexion.query(queryProductos, [id]);

    // Combinar la información en un solo objeto
    const response = {
      cliente: clienteData[0],
      productos: productosData,
    };

    res.status(200).json(response);
  } catch (err) {
    console.error("Error al ejecutar la consulta:", err);
    res.status(500).json({ error: "Error al obtener el albarán" });
  }
});

export default router;
