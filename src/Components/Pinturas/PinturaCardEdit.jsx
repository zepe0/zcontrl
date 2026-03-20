import { useState } from "react";
import "./PinturaCardEdit.css";
import HistorialModal from "./HistorialModal";

const MAX_STOCK_VISUAL = 50;

function PinturaCardEdit({
  pintura,
  onEdit,
  ralClass = "ral-default",
  hasGofrado = false,
  hasMate = false,
  finishBadges = [],
  displayRal,
}) {
  const historial = Array.isArray(pintura?.historial)
    ? pintura.historial.slice(0, 5)
    : [];
  const ralTexto = String(pintura?.ral || "").toUpperCase();
  const esMetalico = /9006|9007|9022|9023/.test(ralTexto);

  // 2. Definimos si es válido para mostrar historial (Número OR IMP OR OXI)
  const esRalValido =
    /^\d/.test(ralTexto) ||
    ralTexto.includes("IMP") ||
    ralTexto.includes("OXI");
  const stock = Number(pintura?.stock) || 0;
  const stockCritico = stock <= 0;
  const isLowStock = stock < 10;
  const stockProgress = Math.min(
    (Math.max(stock, 0) / MAX_STOCK_VISUAL) * 100,
    100,
  );

  const handleEditClick = (event) => {
    event.stopPropagation();
    onEdit?.(pintura);
  };

  const [showHistorialDropdown, setShowHistorialDropdown] = useState(false);
  const [showFullModal, setShowFullModal] = useState(false);

  const handleHistorialHover = () => {
    setShowHistorialDropdown(true);
  };

  const handleHistorialLeave = () => {
    setShowHistorialDropdown(false);
  };

  const handleHistorialClick = (e) => {
    e.stopPropagation();
    setShowFullModal(true);
  };

  const formatHistorialDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString();
  };

  const historialOrdenadoPorFecha = [...historial].sort((a, b) => {
    const fechaA = new Date(
      a?.fecha_compra || a?.fecha || a?.createdAt,
    ).getTime();
    const fechaB = new Date(
      b?.fecha_compra || b?.fecha || b?.createdAt,
    ).getTime();
    return (
      (Number.isFinite(fechaB) ? fechaB : 0) -
      (Number.isFinite(fechaA) ? fechaA : 0)
    );
  });

  const ultimoRegistro = historialOrdenadoPorFecha[0];
  const precioUltimoKg =
    ultimoRegistro?.precio_kg_calculado || ultimoRegistro?.precio_kg || "0.00";
  const fechaUltimaCompra = ultimoRegistro
    ? formatHistorialDate(
        ultimoRegistro.fecha_compra ||
          ultimoRegistro.fecha ||
          ultimoRegistro.createdAt,
      )
    : null;
  const clasesAcabado = [
    "acabado-overlay",
    hasGofrado ? "gofrado-texture gofrado-overlay" : "",
    hasMate ? "mate-overlay" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <>
      <article
        className={`pintura-card-modern${stockCritico ? " stock-critico" : ""}${showHistorialDropdown ? " historial-open" : ""}`}
        onClick={handleEditClick}
      >
        <div className={`pintura-color-preview ${ralClass}`}>
          {(hasGofrado || hasMate) && <div className={clasesAcabado}></div>}
          {(finishBadges.length > 0 || esMetalico) && (
            <div className="acabado-badge">
              {finishBadges.map((badge) => (
                <span
                  key={badge}
                  className={`acabado-chip acabado-${badge.toLowerCase()}`}
                >
                  {badge}
                </span>
              ))}
              {esMetalico && (
                <span className="acabado-chip acabado-metalico">Metal</span>
              )}
            </div>
          )}
          <span className="ral-tag">
            {displayRal || pintura?.ral || "SIN RAL"}
          </span>
        </div>

        <div className="pintura-body">
          <div className="pintura-header-info">
            <h4>{pintura?.marca || "Marca Genérica"}</h4>
          </div>

          <div className="pintura-stock-section">
            <div className="stock-info">
              <span className="label">Stock</span>
              <span
                className={`value ${stockCritico ? "stock-negativo" : isLowStock ? "low-stock" : ""}`}
              >
                {stock} <small>kg</small>
                {stockCritico && <span className="stock-alerta-tag">⚠️</span>}
              </span>
            </div>

            <div className="stock-progress-bg">
              <div
                className={`stock-progress-fill ${
                  stockCritico
                    ? "bg-critico"
                    : isLowStock
                      ? "bg-warn"
                      : "bg-success"
                }`}
                style={{ width: `${stockProgress}%` }}
              ></div>
            </div>

            {fechaUltimaCompra && (
              <div className="ultima-compra">
                <span className="ultima-compra-label">Última compra:</span>
                <span className="ultima-compra-valor">{fechaUltimaCompra}</span>
                <button
                  type="button"
                  className="historial-btn"
                  onMouseEnter={handleHistorialHover}
                  onMouseLeave={handleHistorialLeave}
                  onClick={handleHistorialClick}
                  title="Hover para ver últimas entradas, click para historial completo"
                  aria-expanded={showHistorialDropdown}
                >
                  📋
                </button>
                {showHistorialDropdown && (
                  <div
                    className="historial-dropdown"
                    onMouseEnter={handleHistorialHover}
                    onMouseLeave={handleHistorialLeave}
                  >
                    <div className="historial-dropdown-header">
                      Últimas 5 entradas
                    </div>
                    {historial.length > 0 ? (
                      historial.map((h, i) => (
                        <div key={`${h?.id || "h"}-${i}`} className="h-fila">
                          <span className="h-fecha">
                            {formatHistorialDate(
                              h?.fecha_compra || h?.fecha || h?.createdAt,
                            )}
                          </span>
                          <span className="h-precio">
                            {h?.precio_kg_calculado || h?.precio_kg || "-"} €/kg
                          </span>
                          <span className="h-precio">
                            {Number(h?.cantidad_cajas || 0).toLocaleString(
                              "es-ES",
                            )}{" "}
                            caja(s)
                          </span>
                          <span className="h-prov">
                            {h?.proveedor || "S/P"}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="h-vacio">Sin historial</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <footer className="pintura-footer-modern">
          {esRalValido && (
            <div className="price-badge precio-tag">{precioUltimoKg} €/kg</div>
          )}
          <button
            type="button"
            className="edit-icon-btn"
            onClick={handleEditClick}
          >
            Editar
          </button>
        </footer>
      </article>
      {showFullModal && (
        <HistorialModal
          pintura={pintura}
          onClose={() => setShowFullModal(false)}
        />
      )}
    </>
  );
}

export default PinturaCardEdit;
