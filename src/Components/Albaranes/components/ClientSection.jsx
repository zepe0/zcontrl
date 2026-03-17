import {
  FiCheck,
  FiCreditCard,
  FiEdit3,
  FiMapPin,
  FiPhone,
  FiX,
} from "react-icons/fi";
import ClienteSearch from "../../Clientes/ClienteSearch";

function ClientSection({
  clientes,
  materiales,
  pedido,
  nuevoCliente,
  clienteActualizado,
  hasSelectedCliente,
  clienteInitials,
  phoneUrl,
  mapsUrl,
  isEditMode,
  isEditingCliente,
  isAddingCliente,
  clienteSavedFlash,
  isPedidoFieldInvalid,
  onClienteSeleccionado,
  onAddCliente,
  onClienteFieldChange,
  onSaveClienteEdicion,
  onCambiarCliente,
  onStartEditCliente,
  onNuevoClienteChange,
  onNuevoClienteSubmit,
  onCancelNuevoCliente,
}) {
  return (
    <form id="datosCliente" className="formCliente cliente-panel">
      <div className="DatosClientes cliente-grid">
        <div className="cliente-title-row full-width">
          <h3 className="cliente-title">Datos del cliente</h3>
          <span
            className={`saved-pill ${clienteSavedFlash ? "is-visible" : ""}`}
          >
            <FiCheck />
            Cliente guardado
          </span>
        </div>

        {!hasSelectedCliente && !isAddingCliente && (
          <div
            className={`field-group full-width ${isPedidoFieldInvalid("cliente") ? "validation-focus-block" : ""}`}
            data-pedido-field="cliente"
          >
            <label>Cliente</label>
            <ClienteSearch
              clientes={clientes}
              onClienteSeleccionado={onClienteSeleccionado}
              onAddCliente={onAddCliente}
              materiales={materiales}
              cliente={pedido.cliente}
              clienteSeleccionado={clienteActualizado}
            />
          </div>
        )}

        {hasSelectedCliente && !isEditingCliente && (
          <div
            className={`cliente-smart-card full-width ${isPedidoFieldInvalid("Nif") ? "validation-focus-block" : ""}`}
            data-pedido-field="Nif"
          >
            <div className="cliente-smart-info">
              <div className="cliente-identity-line">
                <span className="cliente-avatar" aria-hidden="true">
                  {clienteInitials || "CL"}
                </span>
                <strong className="cliente-main-name">{pedido.cliente}</strong>
              </div>
              <div className="cliente-smart-meta">
                <button
                  type="button"
                  className="cliente-info-chip cliente-chip-action"
                  title={`Llamar: ${pedido.tel || "Sin teléfono"}`}
                  onClick={() => {
                    if (phoneUrl) {
                      window.location.href = phoneUrl;
                    }
                  }}
                  disabled={!phoneUrl}
                >
                  <FiPhone />
                  {pedido.tel || "Sin teléfono"}
                </button>
                <span className="cliente-info-chip">
                  <FiCreditCard />
                  {pedido.Nif || "Sin NIF"}
                </span>
                <button
                  type="button"
                  className="cliente-info-chip cliente-chip-action cliente-address-inline"
                  title={`Abrir mapa: ${pedido.dir || "Sin dirección"}`}
                  onClick={() => mapsUrl && window.open(mapsUrl, "_blank")}
                  disabled={!mapsUrl}
                >
                  <FiMapPin />
                  {pedido.dir || "Sin dirección"}
                </button>
              </div>
            </div>
            <div className="cliente-smart-actions">
              {isEditMode && (
                <>
                  <button
                    type="button"
                    className="cliente-action-btn"
                    title="Editar ficha del cliente"
                    onClick={onStartEditCliente}
                  >
                    <FiEdit3 />
                  </button>
                  <button
                    type="button"
                    className="cliente-action-btn"
                    title="Cambiar cliente"
                    onClick={onCambiarCliente}
                  >
                    <FiX />
                  </button>
                </>
              )}
            </div>
          </div>
        )}

        {hasSelectedCliente && isEditingCliente && isEditMode && (
          <div className="cliente-edit-grid full-width">
            <div className="field-group cliente-col-span-2">
              <label>Nombre del cliente</label>
              <input
                type="text"
                name="cliente"
                value={pedido.cliente}
                onChange={(event) =>
                  onClienteFieldChange("cliente", event.target.value)
                }
              />
            </div>
            <div
              className={`field-group ${isPedidoFieldInvalid("Nif") ? "validation-focus-block" : ""}`}
              data-pedido-field="Nif"
            >
              <label>NIF</label>
              <input
                className={
                  isPedidoFieldInvalid("Nif") ? "validation-focus" : ""
                }
                type="text"
                name="Nif"
                value={pedido.Nif}
                onChange={(event) =>
                  onClienteFieldChange("Nif", event.target.value)
                }
              />
            </div>
            <div className="field-group">
              <label>Telefono</label>
              <input
                type="text"
                name="tel"
                value={pedido.tel}
                onChange={(event) =>
                  onClienteFieldChange("tel", event.target.value)
                }
              />
            </div>
            <div className="field-group cliente-col-span-2">
              <label>Direccion</label>
              <input
                type="text"
                name="dir"
                value={pedido.dir}
                onChange={(event) =>
                  onClienteFieldChange("dir", event.target.value)
                }
              />
            </div>
            <div className="cliente-edit-actions full-width">
              <button
                type="button"
                className="cliente-action-btn"
                title="Guardar cambios"
                onClick={onSaveClienteEdicion}
              >
                <FiCheck />
              </button>
            </div>
          </div>
        )}

        {isAddingCliente && isEditMode && (
          <div className="cliente-edit-grid full-width">
            <div className="field-group cliente-col-span-2">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={nuevoCliente.nombre}
                onChange={onNuevoClienteChange}
              />
            </div>
            <div className="field-group">
              <label>NIF</label>
              <input
                type="text"
                name="Nif"
                value={nuevoCliente.Nif}
                onChange={onNuevoClienteChange}
              />
            </div>
            <div className="field-group">
              <label>Telefono</label>
              <input
                type="text"
                name="tel"
                value={nuevoCliente.tel}
                onChange={onNuevoClienteChange}
              />
            </div>
            <div className="field-group cliente-col-span-2">
              <label>Direccion</label>
              <input
                type="text"
                name="dir"
                value={nuevoCliente.dir}
                onChange={onNuevoClienteChange}
              />
            </div>
            <div className="cliente-edit-actions full-width">
              <button
                type="button"
                className="cliente-action-btn"
                title="Guardar nuevo cliente"
                onClick={onNuevoClienteSubmit}
              >
                <FiCheck />
              </button>
              <button
                type="button"
                className="cliente-action-btn"
                title="Cancelar"
                onClick={onCancelNuevoCliente}
              >
                <FiX />
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}

export default ClientSection;
