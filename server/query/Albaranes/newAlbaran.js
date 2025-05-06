import express from "express";
import conexion from "../../conexion.js";

const router = express.Router();

router.post("/add", async (req, res) => {
  const {
    numAlbaran,
    cliente,
    Nif,
    tel,
    dir,
    albaran,
    firma,
    observaciones,
    ral,
    estado,
  } = req.body;

  let connection; // Variable para la conexión específica

  try {
    // Obtener una conexión del pool
    connection = await conexion.getConnection();

    // Iniciar la transacción
    await connection.beginTransaction();

    // Insertar en la tabla Albaranes
    const queryAlbaranes =
      "INSERT INTO Albaranes (id, nCliente, proceso,idPedido) VALUES (?, ?, ?,?)";
    await connection.query(queryAlbaranes, [
      numAlbaran,
      cliente,
      estado,
      numAlbaran,
    ]);

    // Insertar en la tabla Clientes
    const queryCliente =
      "INSERT INTO cliente (id,nombre, Nif, tel, dir) VALUES (?, ?, ?, ?,?)";

    const queryCheckUser =
      "SELECT id FROM cliente WHERE nombre = ? AND Nif = ?";
    const [rows] = await connection.query(queryCheckUser, [
      Nif,
      cliente,
      Nif,
      tel,
      dir,
    ]);

    if (rows.length < 0) {
      const { id } = rows[0];
      await connection.query(queryCliente, [id, numAlbaran]);
    } else {
      console.error("Cliente no encontrado en la base de datos");
    }
    // Comprobar e insertar materiales en la tabla Materiales
    const queryCheckMateriales =
      "SELECT nombre FROM productos WHERE nombre = ?";
    const queryInsertMateriales =
      "INSERT INTO productos (id, nombre, uni, refObra) VALUES (?, ?, ?, ?)";
    for (const material of albaran) {
      const { ref, mat, unid, refObra } = material;
      const [rows] = await connection.query(queryCheckMateriales, [mat]);

      if (rows.length === 0) {
        await connection.query(queryInsertMateriales, [
          ref,
          mat,
          unid,
          refObra,
        ]);
      }
    }

    // Insertar materiales en la tabla AlbaranMateriales
    const queryAlbaranMateriales =
      "INSERT INTO AlbaranMateriales (idAlbaran, idMaterial, cantidad,ral,observaciones) VALUES (?, ?, ?,?,?)";
     
    for (const material of albaran) {
      const { ref, unid, Ral } = material;
   
      await connection.query(queryAlbaranMateriales, [
        numAlbaran,
        ref,
        unid,
        Ral,
        observaciones,
      ]);
    }
    if (firma) {
      const queryFirmas = "INSERT INTO Firmas (idAlbaran, firma) VALUES (?, ?)";
      await connection.query(queryFirmas, [numAlbaran, firma]);
    }

    await connection.commit();
    res.status(200).json({ message: "Albarán creado correctamente" });
  } catch (err) {
    console.error("Error durante la transacción:", err);

    // Revertir la transacción si ocurre un error
    if (connection) await connection.rollback();

    res.status(500).json({ error: "Error al crear el albarán" });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
