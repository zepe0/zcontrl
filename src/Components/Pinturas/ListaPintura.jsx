import { FiAlertTriangle, FiDroplet } from "react-icons/fi";

function LisatPintura({ pinturas, hasSearchQuery = false }) {
  const safePinturas = Array.isArray(pinturas) ? pinturas : [];

  const normalizeToken = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");

  const isWildcardPintura = (pintura) => {
    const values = [
      pintura?.nombre,
      pintura?.ral,
      pintura?.marca,
      pintura?.id,
      pintura?.idPintura,
    ];

    return values.some((value) => {
      const token = normalizeToken(value);
      return (
        token === "pendiente" ||
        token === "sin color" ||
        token === "sincolor" ||
        token === "sistema"
      );
    });
  };

  const isPlaceholderPintura = (pintura) => {
    const id = String(pintura?.id || "")
      .trim()
      .toUpperCase();
    const ral = String(pintura?.ral || "")
      .trim()
      .toUpperCase();
    return id === "REFNONE" || ral === "SIN ESPECIFICAR";
  };

  const getRalClassToken = (ralValue) => {
    const digits = String(ralValue || "").replace(/\D+/g, "");
    return digits.slice(0, 4);
  };

  const isNoirRal = (ralValue) => normalizeToken(ralValue).startsWith("noir");

  const isImprimacionRal = (ralValue) =>
    normalizeToken(ralValue) === "imprimacion";

  const pinturasFiltradas = safePinturas.filter(
    (pintura) => !isPlaceholderPintura(pintura) && !isWildcardPintura(pintura),
  );

  const maxStock = Math.max(
    ...pinturasFiltradas.map((pintura) => Number(pintura.stock) || 0),
    1,
  );

  return (
    <div className="left">
      {pinturasFiltradas.length > 0 ? (
        pinturasFiltradas.map((pintura) => {
          const stock = Number(pintura.stock) || 0;
          const percent = Math.max(0, Math.min(100, (stock / maxStock) * 100));
          const isCritical = stock < 5;
          const isNegative = stock < 0;
          const ralToken = getRalClassToken(pintura.ral);
          const isImprimacion = isImprimacionRal(pintura.ral);
          const isNoir = isNoirRal(pintura.ral);

          return (
            <ul className="paint-row" key={pintura.id}>
              <li
                className={
                  isImprimacion
                    ? "circuloRal"
                    : isNoir
                      ? "ral-noir circuloRal"
                      : ralToken
                        ? `RAL-${ralToken} circuloRal`
                        : "circuloRal"
                }
                style={
                  isImprimacion
                    ? {
                        background:
                          "radial-gradient(circle at 30% 30%, #ffffff 0%, #9fc5e8 45%, #1f5f86 100%)",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#ffffff",
                      }
                    : undefined
                }
                title={
                  isImprimacion ? "Imprimación" : String(pintura.ral || "")
                }
              >
                {isImprimacion ? (
                  <FiDroplet size={11} aria-hidden="true" />
                ) : null}
              </li>

              <li
                className={`alingl ${isCritical ? "stock-critical" : ""} ${isNegative ? "stock-negative" : ""}`}
              >
                {pintura.ral}
              </li>
              <li
                className={`alingl paint-brand ${isCritical ? "stock-critical" : ""} ${isNegative ? "stock-negative" : ""}`}
              >
                {pintura.marca.length > 9
                  ? `${pintura.marca.substring(0, 9)}...`
                  : pintura.marca}
              </li>

              <li
                className={`alingl paint-stock ${isCritical ? "stock-critical" : ""} ${isNegative ? "stock-negative" : ""}`}
              >
                <span className="paint-stock-top">
                  {(isCritical || isNegative) && (
                    <FiAlertTriangle className="stock-alert-icon" />
                  )}
                  <strong>{stock.toFixed(2)}</strong>
                  <span className="stock-unit">Kg</span>
                </span>
                <span className="stock-progress-track">
                  <span
                    className={`stock-progress-fill ${isCritical ? "critical" : ""} ${isNegative ? "negative" : ""}`}
                    style={{ width: `${percent}%` }}
                  ></span>
                </span>
              </li>
            </ul>
          );
        })
      ) : (
        <div className="paint-empty-card" role="status">
          <span className="paint-empty-icon-wrap" aria-hidden="true">
            <FiDroplet />
          </span>
          <p className="paint-empty-title">
            {hasSearchQuery
              ? "No se han encontrado pinturas"
              : "Aún no hay pinturas añadidas"}
          </p>
          <p className="paint-empty-subtitle">
            {hasSearchQuery
              ? "Prueba con otro término de búsqueda"
              : "Registra tu primera pintura para empezar a controlar el stock en tiempo real."}
          </p>
        </div>
      )}
    </div>
  );
}
export default LisatPintura;
