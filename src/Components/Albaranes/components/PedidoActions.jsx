import {
  FiCheck,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiPrinter,
  FiSave,
  FiSliders,
  FiX,
} from "react-icons/fi";
import UploadPedidoFile from "../UploadPedidoFile";

function PedidoActions({
  isViewingPedido,
  isEditMode,
  isValued,
  showPricePanel,
  priceDefaults,
  onToggleValued,
  onPrintTrabajo,
  onPrintValorado,
  onDataExtracted,
  onTogglePricePanel,
  onPriceDefaultChange,
  onResetPriceDefaults,
  onClosePricePanel,
  onSave,
  onCancelEdit,
  onStartEdit,
  onClose,
}) {
  return (
    <div className="dialog-buttons-container">
      <div className="dialog-toolbar-group">
        <button
          type="button"
          className={`icon-action-btn valued-toggle ${isValued ? "is-active" : ""}`}
          onClick={onToggleValued}
          aria-pressed={isValued}
          title={isValued ? "Ocultar precios" : "Mostrar precios"}
        >
          {isValued ? <FiEye /> : <FiEyeOff />}
        </button>
        <button
          type="button"
          className="icon-action-btn btn-print"
          onClick={onPrintTrabajo}
          title="Imprimir trabajo"
          aria-label="Imprimir trabajo"
        >
          <FiFileText />
        </button>
        <button
          type="button"
          className="icon-action-btn btn-print"
          onClick={onPrintValorado}
          title="Imprimir valorado"
          aria-label="Imprimir valorado"
        >
          <FiPrinter />
        </button>
        <UploadPedidoFile onDataExtracted={onDataExtracted} />
        <div className="price-presets-wrap">
          <button
            type="button"
            className={`icon-action-btn btn-print ${showPricePanel ? "is-active" : ""}`}
            onClick={onTogglePricePanel}
            title="Configurar precios rápidos"
            aria-label="Configurar precios rápidos"
          >
            <FiSliders />
          </button>
          {showPricePanel && (
            <div className="price-presets-panel">
              <p>Precios rápidos por unidad</p>
              <label>
                € / Ud
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceDefaults.ud}
                  onChange={(event) =>
                    onPriceDefaultChange("ud", event.target.value)
                  }
                />
              </label>
              <label>
                € / ml
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceDefaults.ml}
                  onChange={(event) =>
                    onPriceDefaultChange("ml", event.target.value)
                  }
                />
              </label>
              <label>
                € / m²
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={priceDefaults.m2}
                  onChange={(event) =>
                    onPriceDefaultChange("m2", event.target.value)
                  }
                />
              </label>
              <div className="price-presets-actions">
                <button type="button" onClick={onResetPriceDefaults}>
                  Restablecer
                </button>
                <button type="button" onClick={onClosePricePanel}>
                  Listo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {(!isViewingPedido || isEditMode) && (
        <button onClick={onSave} className="btn-guardar" type="button">
          {isViewingPedido ? <FiSave /> : <FiCheck />}
          {isViewingPedido ? "Guardar edición " : "Guardar"}
        </button>
      )}

      {isViewingPedido && isEditMode && (
        <button
          type="button"
          className="btn-edit-cancel"
          onClick={onCancelEdit}
        >
          <FiX /> Cancelar edición
        </button>
      )}

      {isViewingPedido && !isEditMode && (
        <button type="button" className="btn-edit-mode" onClick={onStartEdit}>
          <FiEdit3 /> Editar pedido
        </button>
      )}

      <button
        className="dialog-close close-action-btn"
        type="button"
        onClick={onClose}
      >
        ✖
      </button>
    </div>
  );
}

export default PedidoActions;
