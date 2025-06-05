import express from "express";
import conexion from "../../conexion.js";

export default function newAlbaran(io) {
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
    let error;
    let connection; // Variable para la conexión específica

    try {
      // Obtener una conexión del pool
      connection = await conexion.getConnection();

      // Iniciar la transacción
      await connection.beginTransaction();

      const queryAlbaranes =
        "INSERT INTO Albaranes (id, nCliente, proceso,idPedido) VALUES (?, ?, ?,?)";
      await connection.query(queryAlbaranes, [
        numAlbaran,
        cliente,
        estado,
        numAlbaran,
      ]);

      const queryCliente =
        "INSERT INTO cliente (id,nombre, Nif, tel, dir) VALUES (?, ?, ?, ?,?)";

      const queryCheckUser =
        "SELECT id FROM cliente WHERE nombre = ? AND Nif = ?";
      const [rows] = await connection.query(queryCheckUser, [cliente, Nif]);

      if (rows.length <= 0) {
        const idcliente =
          Date.now().toString(36) + Math.random().toString(36).substring(2);
        await connection.query(queryCliente, [
          idcliente,
          cliente,
          Nif,
          tel,
          dir,
        ]);
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
        const { ref, unid, Ral, consumo } = material;

        await connection.query(queryAlbaranMateriales, [
          numAlbaran,
          ref,
          unid,
          Ral,
          observaciones,
          consumo,
        ]);

        if (Ral) {
          // Consulta el stock y el consumo
          const [rows] = await connection.query(
            "SELECT stock FROM pintura WHERE ral = ?",
            [Ral]
          );
          if (rows.length > 0) {
            const stockActual = parseFloat(rows[0].stock) || 0;

            const cantidadARestar = consumo * unid;
            const stockRestante = stockActual - cantidadARestar;

            // Actualiza el stock aunque quede negativo
            await connection.query(
              "UPDATE pintura SET stock = ? WHERE ral = ?",
              [stockRestante, Ral]
            );

            // Si el stock es negativo, notifica al usuario
            if (stockRestante < 0) {
              error = `¡Atención! El stock para RAL ${Ral} es negativo: ${stockRestante} Kg`;
            }
          } else {
            const id =
              Date.now().toString(36) + Math.random().toString(36).substring(2);
            await connection.query(
              "INSERT INTO pintura (id,ral, stock,marca) VALUES (?,?,?, ?)",
              [id, Ral, -consumo * unid, "-"]
            );
            error = `RAL ${Ral} no encontrado, se ha creado con un stock negativo de ${
              -consumo * unid
            } Kg`;
          }
        }
      }
      if (firma) {
        const queryFirmas =
          "INSERT INTO Firmas (idAlbaran, firma) VALUES (?, ?)";
        await connection.query(queryFirmas, [numAlbaran, firma]);
      }

      await connection.commit();
      res.status(200).json({ message: "Albarán creado correctamente", error });
      const [pinturas] = await connection.query(
        "SELECT * FROM pintura order by stock ASC"
      );
      io.emit("Actualizar_pintura", pinturas);
    } catch (err) {
      console.error("Error durante la transacción:", err);

      // Revertir la transacción si ocurre un error
      if (connection) await connection.rollback();

      res.status(500).json({ error: "Error al crear el albarán" });
    } finally {
      if (connection) connection.release();
    }
  });
  return router;
}
