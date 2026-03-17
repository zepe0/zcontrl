import { FiCheck, FiPackage } from "react-icons/fi";

function PedidoTable({
  isValued,
  printMode,
  isEditMode,
  showInlineEditor,
  lineSavedFlash,
  lineas,
  selectedLineIndexes,
  stockAvailability,
  areAllLinesSelected,
  onCompleteInsufficientManual,
  onMarkSelectedManual,
  onToggleInlineEditor,
  onToggleSelectAllLines,
  renderDraftRow,
  renderLineRow,
}) {
  return (
    <section className="lineas-block">
      <div className="lineas-header">
        <h3>Lineas de pedido</h3>
        <div className="lineas-header-actions">
          <button
            type="button"
            className="bulk-manual-btn"
            onClick={onCompleteInsufficientManual}
            disabled={stockAvailability.issues.length === 0}
            title="Marcar como Hechas manualmente todas las líneas con stock insuficiente"
          >
            Completar producción manualmente
          </button>
          {selectedLineIndexes.length > 0 && (
            <button
              type="button"
              className="bulk-selected-btn"
              onClick={onMarkSelectedManual}
            >
              Marcar seleccionadas como Hechas ({selectedLineIndexes.length})
            </button>
          )}
          {isEditMode && (
            <button
              type="button"
              className="add-line-toggle"
              onClick={onToggleInlineEditor}
            >
              {showInlineEditor ? "Cerrar nueva línea" : "+ Añadir nueva línea"}
            </button>
          )}
        </div>
        <span className={`saved-pill ${lineSavedFlash ? "is-visible" : ""}`}>
          <FiCheck />
          Linea guardada
        </span>
      </div>

      <div
        className={`AlbaranMateriales ${isValued ? "valued-mode" : ""} ${printMode === "logistico" ? "print-logistico" : ""}`}
      >
        <ul className="albaran-static-lines">
          <li className="AlbaranMaterialitem">
            <p className="line-select-col">
              <input
                type="checkbox"
                className="line-selector-checkbox"
                checked={areAllLinesSelected}
                onChange={onToggleSelectAllLines}
                aria-label="Seleccionar todas las líneas"
              />
            </p>
            <p>Nombre</p>
            <p>Unidades</p>
            <p>Medidas</p>
            <p>R.Obra</p>
            <p>Ral</p>
            <p
              className={`no-print-logistico ${isValued ? "" : "column-placeholder"}`}
            >
              {isValued ? "P. Unitario" : ""}
            </p>
            <p
              className={`no-print-logistico ${isValued ? "" : "column-placeholder"}`}
            >
              {isValued ? "Subtotal" : ""}
            </p>
            <p className="actions-col-header"></p>
          </li>

          {isEditMode && showInlineEditor && renderDraftRow?.()}
        </ul>

        <ul className={`albaran-added-lines ${isEditMode ? "is-editing" : ""}`}>
          {lineas.length === 0 && (
            <li className="albaran-empty-inline">
              <FiPackage className="empty-state-icon" />
              Aun no hay materiales en este pedido. Empieza anadiendo uno
              arriba.
            </li>
          )}
          {lineas.map((linea, index) => renderLineRow?.(linea, index))}
        </ul>
      </div>
    </section>
  );
}

export default PedidoTable;
