import React, { useState, useEffect } from "react";
import "./ReviewPedidoData.css";

function ReviewPedidoData({ extractedData, onConfirm, onCancel }) {
  // Normalizar los datos extraídos (pueden venir anidados o no)
  const dataSource = extractedData.data || extractedData;

  const [cliente, setCliente] = useState({
    nombre: dataSource.cliente?.nombre || "",
    Nif: dataSource.cliente?.Nif || "",
    tel: dataSource.cliente?.tel || "",
    dir: dataSource.dir || "",
  });

  const [materiales, setMateriales] = useState(dataSource.materiales || []);
  const [observaciones, setObservaciones] = useState(
    dataSource.observaciones || "",
  );
  const [numAlbaran, setNumAlbaran] = useState(dataSource.numAlbaran || "");

  // Abrir el diálogo automáticamente cuando el componente se monte
  useEffect(() => {
    const dialog = document.getElementById("reviewPedido");
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog && dialog.open) {
        dialog.close();
      }
    };
  }, []);

  const handleClienteChange = (field, value) => {
    setCliente((prev) => ({ ...prev, [field]: value }));
  };

  const handleMaterialChange = (index, field, value) => {
    const newMateriales = [...materiales];
    newMateriales[index] = {
      ...newMateriales[index],
      [field]: value,
    };
    setMateriales(newMateriales);
  };

  const handleDeleteMaterial = (index) => {
    const newMateriales = materiales.filter((_, i) => i !== index);
    setMateriales(newMateriales);
  };

  const handleConfirm = () => {
    onConfirm({
      cliente,
      materiales,
      observaciones,
      numAlbaran,
    });
  };

  return (
    <dialog id="reviewPedido" className="review-dialog">
      <div className="review-content">
        <button className="dialog-close" onClick={onCancel} title="Cerrar">
          ✖
        </button>

        <h2>Revisar datos del pedido</h2>

        <div className="review-section">
          <h3>Datos del Cliente</h3>
          <div className="review-form-group">
            <div className="review-field">
              <label>Número Albarán:</label>
              <input
                type="text"
                value={numAlbaran}
                onChange={(e) => setNumAlbaran(e.target.value)}
                placeholder="Número de albarán"
              />
            </div>
            <div className="review-field">
              <label>Nombre:</label>
              <input
                type="text"
                value={cliente.nombre}
                onChange={(e) => handleClienteChange("nombre", e.target.value)}
                placeholder="Nombre del cliente"
              />
            </div>
            <div className="review-field">
              <label>NIF:</label>
              <input
                type="text"
                value={cliente.Nif}
                onChange={(e) => handleClienteChange("Nif", e.target.value)}
                placeholder="NIF"
              />
            </div>
            <div className="review-field">
              <label>Teléfono:</label>
              <input
                type="text"
                value={cliente.tel}
                onChange={(e) => handleClienteChange("tel", e.target.value)}
                placeholder="Teléfono"
              />
            </div>
            <div className="review-field">
              <label>Dirección:</label>
              <input
                type="text"
                value={cliente.dir}
                onChange={(e) => handleClienteChange("dir", e.target.value)}
                placeholder="Dirección"
              />
            </div>
          </div>
        </div>

        <div className="review-section">
          <h3>Materiales</h3>
          {materiales.length > 0 ? (
            <div className="materials-list">
              {materiales.map((material, index) => (
                <div key={index} className="material-item">
                  <div className="material-fields">
                    <div className="review-field">
                      <label>Referencia:</label>
                      <input
                        type="text"
                        value={material.ref || ""}
                        onChange={(e) =>
                          handleMaterialChange(index, "ref", e.target.value)
                        }
                        placeholder="Ref"
                      />
                    </div>
                    <div className="review-field">
                      <label>Nombre:</label>
                      <input
                        type="text"
                        value={material.mat || ""}
                        onChange={(e) =>
                          handleMaterialChange(index, "mat", e.target.value)
                        }
                        placeholder="Nombre material"
                      />
                    </div>
                    <div className="review-field">
                      <label>Cantidad:</label>
                      <input
                        type="number"
                        value={material.unid || ""}
                        onChange={(e) =>
                          handleMaterialChange(index, "unid", e.target.value)
                        }
                        placeholder="Cantidad"
                      />
                    </div>
                    <div className="review-field">
                      <label>Ref. Obra:</label>
                      <input
                        type="text"
                        value={material.refObra || ""}
                        onChange={(e) =>
                          handleMaterialChange(index, "refObra", e.target.value)
                        }
                        placeholder="Ref. Obra"
                      />
                    </div>
                    <div className="review-field">
                      <label>RAL:</label>
                      <input
                        type="text"
                        value={material.Ral || ""}
                        onChange={(e) =>
                          handleMaterialChange(index, "Ral", e.target.value)
                        }
                        placeholder="RAL"
                      />
                    </div>
                  </div>
                  <button
                    className="btn-delete-material"
                    onClick={() => handleDeleteMaterial(index)}
                    title="Eliminar material"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-data">No hay materiales extraídos</p>
          )}
        </div>

        <div className="review-section">
          <h3>Observaciones</h3>
          <textarea
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
            placeholder="Observaciones adicionales"
            className="review-textarea"
          />
        </div>

        <div className="review-actions">
          <button onClick={onCancel} className="btn-cancel">
            Cancelar
          </button>
          <button onClick={handleConfirm} className="btn-confirm">
            Confirmar y continuar
          </button>
        </div>
      </div>
    </dialog>
  );
}

export default ReviewPedidoData;
