import "./AlbaranTrabajoPrint.css";

const parseNumber = (value) => {
  const normalized = String(value ?? "")
    .replace(",", ".")
    .trim();
  const num = Number(normalized);
  return Number.isFinite(num) ? num : 0;
};

const formatMeasure = (value) => {
  const num = parseNumber(value);
  if (num <= 0) return "-";
  return Number.isInteger(num)
    ? String(num)
    : num.toFixed(2).replace(/\.00$/, "");
};

const formatDate = (value) => {
  if (!value) return new Date().toLocaleDateString("es-ES");
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime()))
    return new Date().toLocaleDateString("es-ES");
  return parsed.toLocaleDateString("es-ES");
};

function AlbaranTrabajoPrint({
  pedido,
  cliente,
  lineas,
  numeroAlbaran,
  observaciones,
  stockIssueByLine,
}) {
  const lineasToPrint = Array.isArray(lineas)
    ? lineas
    : Array.isArray(pedido?.albaran)
      ? pedido.albaran
      : [];
  const refObra = [
    ...new Set(
      lineasToPrint
        .map((linea) => String(linea?.refObra || "").trim())
        .filter(Boolean),
    ),
  ]
    .slice(0, 3)
    .join(" | ");

  return (
    <div className="albaran-container-print">
      <article className="trabajo-print-sheet">
        <header className="trabajo-print-header">
          <div>
            <h1>ORDEN DE TRABAJO</h1>
            <p className="trabajo-print-subtitle">Producción interna</p>
            <div className="header-top-info">
              <p>
                <strong>FECHA ENTREGA:</strong>{" "}
                {formatDate(pedido?.fecha_entrega || pedido?.fechaEntrega)}
              </p>
            </div>
          </div>
          <div className="trabajo-print-meta">
            <p>
              <span>Pedido:</span> {pedido?.numAlbaran || numeroAlbaran || "-"}
            </p>
          </div>
        </header>

        <section className="trabajo-print-client">
          <div>
            <p className="label">Cliente</p>
            <p>{cliente || pedido?.cliente || "-"}</p>
          </div>
          <div>
            <p className="label">NIF</p>
            <p>{pedido?.Nif || "-"}</p>
          </div>
          <div>
            <p className="label">Teléfono</p>
            <p>{pedido?.tel || "-"}</p>
          </div>
          <div className="span-2">
            <p className="label">Dirección</p>
            <p>{pedido?.dir || "-"}</p>
          </div>
          <div className="span-2">
            <p className="label">Referencia de obra</p>
            <p>{refObra || "-"}</p>
          </div>
        </section>

        <table className="trabajo-print-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Material</th>
              <th>Cantidad</th>
              <th>Medidas (L x A x E mm)</th>
              <th>RAL</th>
              <th>Control</th>
            </tr>
          </thead>
          <tbody>
            {lineasToPrint.map((linea, index) => {
              const isManual =
                linea?.fabricacion_manual === 1 ||
                linea?.fabricacion_manual === "1" ||
                linea?.fabricacion_manual === true;
              const stockIssueKey =
                linea?.idLinea || linea?.lineId || linea?.id || index;
              const mappedIssue =
                stockIssueByLine instanceof Map
                  ? stockIssueByLine.get(index) ||
                    stockIssueByLine.get(stockIssueKey)
                  : stockIssueByLine?.[stockIssueKey] ||
                    stockIssueByLine?.[index];
              const hasStockIssue =
                linea?.faltaStock === true ||
                linea?.faltaStock === 1 ||
                Boolean(mappedIssue);
              const largo = formatMeasure(
                linea?.largo || linea?.longitud || linea?.alto,
              );
              const ancho = formatMeasure(linea?.ancho);
              const espesor = formatMeasure(linea?.espesor);
              const cantidad = formatMeasure(linea?.cantidad ?? linea?.unid);

              return (
                <tr
                  key={`${linea?.id || linea?.ref || index}-${index}`}
                  className="linea-sin-bordes"
                >
                  <td>{index + 1}</td>
                  <td>
                    <span className="material-name-print">
                      {linea?.nombreMaterial || linea?.mat || "-"}
                    </span>
                  </td>
                  <td className="text-center">{cantidad}</td>
                  <td className="text-center">{`${largo} x ${ancho} x ${espesor}`}</td>
                  <td>
                    <span className="ral-cell-print">
                      {String(linea?.ral || linea?.Ral || "-").trim() || "-"}{" "}
                      {linea?.tiene_imprimacion ? "+ IMP" : ""}
                      {hasStockIssue && (
                        <span
                          className="indicador-stock-sutil"
                          aria-hidden="true"
                        />
                      )}
                    </span>
                  </td>
                  <td className="control-col text-center">
                    {isManual ? (
                      <span className="check-control-final">✓</span>
                    ) : (
                      <div className="casilla-vacia-control"></div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        <section className="trabajo-print-notes">
          <p className="label">Observaciones</p>
          <div>{observaciones || pedido?.observaciones || " "}</div>
        </section>

        <footer className="trabajo-print-signatures">
          <div>
            <p>Firma Cliente / Receptor</p>
            <span className="linea-firma" />
          </div>
        </footer>
      </article>
    </div>
  );
}

export default AlbaranTrabajoPrint;
