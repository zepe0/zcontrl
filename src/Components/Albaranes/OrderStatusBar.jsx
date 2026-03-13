import { useMemo, useState } from "react";
import "./OrderStatusBar.css";
import {
  ORDER_STATUS_STEPS,
  normalizeOrderStatus,
} from "./logic/orderStatusFlow";

const labelMap = {
  Borrador: "Borrador",
  Confirmado: "Confirmado",
  Pendiente: "Pendiente",
  EnProceso: "En proceso",
  Almacén: "Almacén",
  Completado: "Completado",
};

function OrderStatusBar({
  status,
  onStatusChange,
  disabled = false,
  warningInfo = null,
  isFullyAdvanced = false,
  className = "",
  onViewInventory,
}) {
  const [errorMessage, setErrorMessage] = useState("");
  const currentStatus = normalizeOrderStatus(status);

  const currentIndex = useMemo(
    () => ORDER_STATUS_STEPS.indexOf(currentStatus),
    [currentStatus],
  );

  const handleStepClick = async (nextStatus) => {
    if (disabled) return;

    const nextNormalized = normalizeOrderStatus(nextStatus);
    const nextIndex = ORDER_STATUS_STEPS.indexOf(nextNormalized);

    if (nextIndex === -1 || currentIndex === -1 || nextIndex === currentIndex) {
      return;
    }

    const canSkipPendingByAdvanced =
      isFullyAdvanced && currentIndex === 1 && nextIndex === 3;

    if (Math.abs(nextIndex - currentIndex) > 1 && !canSkipPendingByAdvanced) {
      setErrorMessage(
        "Cambio no permitido: no se puede saltar etapas del flujo del pedido.",
      );
      return;
    }

    setErrorMessage("");

    if (typeof onStatusChange !== "function") return;

    const result = await onStatusChange(nextNormalized, {
      from: currentStatus,
      to: nextNormalized,
      fromIndex: currentIndex,
      toIndex: nextIndex,
    });

    if (result === false) {
      setErrorMessage("No se pudo aplicar el cambio de estado.");
      return;
    }

    if (result && typeof result === "object" && result.ok === false) {
      setErrorMessage(
        result.message || "No se pudo aplicar el cambio de estado.",
      );
      return;
    }

    setErrorMessage("");
  };

  return (
    <div
      className={`order-status-wrap ${className}`.trim()}
      aria-label="Flujo de estado del pedido"
    >
      <div className="order-status-header-row">
        <span className="order-status-title">Flujo</span>
      </div>

      <div
        className="order-status-track"
        role="tablist"
        aria-label="Estados del pedido"
      >
        <span className="order-status-base-line" aria-hidden="true" />
        {ORDER_STATUS_STEPS.map((step, index) => {
          const isCurrent = index === currentIndex;
          const isCompleted = index < currentIndex;
          const canSkipPendingByAdvanced =
            isFullyAdvanced && currentIndex === 1 && index === 3;
          const isNextReachable =
            Math.abs(index - currentIndex) <= 1 || canSkipPendingByAdvanced;
          const hasWarning = warningInfo?.blockedTo === step;
          const isPendingCurrent = isCurrent && step === "Pendiente";
          const showPendingAlert =
            step === "Pendiente" && (isPendingCurrent || hasWarning);

          const warningTooltip = hasWarning
            ? warningInfo?.missingRals?.length
              ? `Falta stock: ${warningInfo.missingRals.join(", ")}`
              : warningInfo.message || "Falta stock para este estado."
            : labelMap[step];

          return (
            <button
              key={step}
              type="button"
              role="tab"
              aria-selected={isCurrent}
              className={`order-status-step ${isCurrent ? "is-current" : ""} ${isCompleted ? "is-completed" : ""} ${hasWarning ? "is-warning" : ""} ${isPendingCurrent ? "is-pending-current" : ""}`}
              onClick={() => handleStepClick(step)}
              disabled={disabled || !isNextReachable}
              title={warningTooltip}
            >
              <span className="order-status-label order-status-label-top">
                {labelMap[step]}
              </span>
              <span className="order-status-dot-wrap" aria-hidden="true">
                <span className="order-status-dot" />
                {showPendingAlert ? (
                  <span className="order-status-warning-badge">!</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {warningInfo?.message && (
        <div className="order-status-persistent-alert" role="status">
          <span className="order-status-persistent-text">
            Falta stock de:{" "}
            {warningInfo.missingRals?.join(", ") || "materiales"}
          </span>
          <button
            type="button"
            className="order-status-inventory-btn"
            onClick={onViewInventory}
          >
            Ver Inventario
          </button>
        </div>
      )}

      {errorMessage && <p className="order-status-error">{errorMessage}</p>}
    </div>
  );
}

export default OrderStatusBar;
