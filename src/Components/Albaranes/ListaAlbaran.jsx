import { FiClipboard } from "react-icons/fi";
import "./ListaAlbaran.css";

function ListaAlbaran({ albaran, onOpenPedido }) {
  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  const getClienteNombre = (item) =>
    item.cliente_nombre || item.nCliente || "Cliente";

  const getInitials = (name) =>
    name
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join("");

  const getProcesoClass = (proceso) => {
    const value = (proceso || "").toLowerCase();
    if (value.includes("completado") || value.includes("entregado")) {
      return "status-pill status-done";
    }
    if (value.includes("proceso")) {
      return "status-pill status-progress";
    }
    if (value.includes("almacen")) {
      return "status-pill status-warehouse";
    }
    if (value.includes("pendiente")) {
      return "status-pill status-pending";
    }
    return "status-pill status-default";
  };

  const getRefObraFromItem = (item) => {
    if (Array.isArray(item?.lineas) && item.lineas.length > 0) {
      const refValida = item.lineas
        .map((linea) => String(linea?.refObra || "").trim())
        .find((ref) => ref && ref !== "-");
      if (refValida) return refValida;
    }

    const directa = String(item?.refObra || item?.obra || "").trim();
    return directa && directa !== "-" ? directa : "N. ref";
  };

  const handleOpen = (id) => {
    if (typeof onOpenPedido === "function") {
      onOpenPedido(id);
    }
  };

  return (
    <div className="listaprocesos">
      {albaran.length > 0 ? (
        albaran.map((albaranItem) => (
          <ul
            className="albaran"
            key={albaranItem.id}
            onClick={() => handleOpen(albaranItem.id)}
          >
            <li className="cliente-cell">
              <span className="cliente-avatar">
                {getInitials(getClienteNombre(albaranItem))}
              </span>
              <span className="cliente-meta">
                <strong>{getClienteNombre(albaranItem)}</strong>
                <small>
                  {albaranItem.obra || "Sin obra"}
                  {albaranItem.ral ? ` • RAL ${albaranItem.ral}` : ""}
                </small>
              </span>
            </li>

            <li className="pedido-id">{getRefObraFromItem(albaranItem)}</li>
            <li className="pedido-fecha">
              {formatearFecha(albaranItem.fecha)}
            </li>
            <li className={getProcesoClass(albaranItem.proceso)}>
              {albaranItem.proceso}
            </li>
          </ul>
        ))
      ) : (
        <div className="albaran-empty">
          <FiClipboard />
          <p>No hay pedidos pendientes hoy. Buen trabajo.</p>
        </div>
      )}
    </div>
  );
}

export default ListaAlbaran;
