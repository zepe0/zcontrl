function PedidoFooter({
  isValued,
  observaciones,
  totals,
  onObservacionesChange,
  readOnly,
}) {
  return (
    <div className="dialog-footer split-footer">
      <div className={`obs-panel ${isValued ? "obs-panel-valued" : ""}`}>
        <label>Observaciones</label>
        <textarea
          placeholder="Observaciones"
          value={observaciones}
          onChange={onObservacionesChange}
          readOnly={readOnly}
        />
      </div>
      {isValued && (
        <div className="totals-footer footer-totals no-print-logistico">
          <p>
            Base imponible: <strong>{totals.base}</strong>
          </p>
          <p>
            IVA (21%): <strong>{totals.iva}</strong>
          </p>
          <p className="total-final">
            Total: <strong>{totals.total}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default PedidoFooter;
