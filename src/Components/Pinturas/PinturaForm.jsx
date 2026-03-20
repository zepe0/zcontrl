import { useEffect, useMemo, useState } from "react";
import "./PinturaForm.css";

function PinturaForm({ isOpen, onClose, onSave, pinturaInicial = null }) {
  const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  // Prioridad: Si existe pintura, vamos a Stock. Si no, a Info (Nueva).
  const [modo, setModo] = useState(pinturaInicial ? "stock" : "info");
  const [modoEntradaStock, setModoEntradaStock] = useState("cajas");
  const [cantidadCajas, setCantidadCajas] = useState("1");
  const [kgPorCaja, setKgPorCaja] = useState(() => {
    const saved = window.localStorage.getItem("pintura_kg_por_caja");
    return saved && toNumber(saved) > 0 ? saved : "25";
  });
  const [totalKgManual, setTotalKgManual] = useState("");
  const [precioAlbaranStock, setPrecioAlbaranStock] = useState("");

  useEffect(() => {
    setModo(pinturaInicial ? "stock" : "info");
    setModoEntradaStock("cajas");
    setCantidadCajas("1");
    setTotalKgManual("");
    setPrecioAlbaranStock("");
  }, [pinturaInicial]);

  useEffect(() => {
    if (toNumber(kgPorCaja) > 0) {
      window.localStorage.setItem("pintura_kg_por_caja", String(kgPorCaja));
    }
  }, [kgPorCaja]);

  const totalKgFinal = useMemo(() => {
    if (modoEntradaStock === "cajas") {
      return toNumber(cantidadCajas) * toNumber(kgPorCaja);
    }
    return toNumber(totalKgManual);
  }, [cantidadCajas, kgPorCaja, modoEntradaStock, totalKgManual]);

  const precioKgSugerido = useMemo(() => {
    const precioTotal = toNumber(precioAlbaranStock);
    if (totalKgFinal <= 0 || precioTotal <= 0) return 0;
    return precioTotal / totalKgFinal;
  }, [precioAlbaranStock, totalKgFinal]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);

    // En alta, el usuario introduce el total del albaran para los kg indicados.
    if (!pinturaInicial && modo === "info") {
      const kilos = parseFloat(data.stock || "0");
      const totalAlbaran = parseFloat(data.precio_albaran || "0");
      data.precio = kilos > 0 ? (totalAlbaran / kilos).toFixed(2) : "0.00";
    }

    if (pinturaInicial && modo === "stock") {
      const precioTotal = toNumber(data.precio_albaran || precioAlbaranStock);
      const kilosFinales = totalKgFinal;
      const cajas = toNumber(cantidadCajas);

      data.kg_entrada = kilosFinales > 0 ? kilosFinales.toFixed(2) : "0.00";
      data.precio_albaran = precioTotal > 0 ? precioTotal.toFixed(2) : "0.00";

      // Campos preparados para la tabla pintura_compras.
      data.formato_entrada = modoEntradaStock;
      data.formato_kg =
        modoEntradaStock === "cajas" && toNumber(kgPorCaja) > 0
          ? toNumber(kgPorCaja).toFixed(2)
          : null;
      data.cantidad_cajas =
        modoEntradaStock === "cajas" && cajas > 0 ? Math.round(cajas) : null;
      data.precio_total = precioTotal > 0 ? precioTotal.toFixed(2) : null;
      data.precio_total_caja =
        modoEntradaStock === "cajas" && cajas > 0
          ? (precioTotal / cajas).toFixed(2)
          : null;
      data.precio_kg_calculado =
        kilosFinales > 0 ? (precioTotal / kilosFinales).toFixed(2) : null;
    }

    data.operacion = modo;
    if (pinturaInicial) data.id = pinturaInicial.id;

    onSave(data);
  };

  return (
    <dialog className="pintura-modal" open>
      <div className="modal-content">
        <header className="pintura-modal-header">
          <div
            className={`circuloRal ${pinturaInicial?.ral ? `RAL-${pinturaInicial.ral}` : "ral-default"}`}
          ></div>
          <h2>
            {pinturaInicial
              ? `Gestión RAL ${pinturaInicial.ral} - ${pinturaInicial.marca}`
              : "Nueva Pintura"}
          </h2>
          <button type="button" className="close-x" onClick={onClose}>
            &times;
          </button>
        </header>

        {pinturaInicial && (
          <div className="modo-tabs">
            <button
              type="button"
              className={modo === "stock" ? "tab-btn active" : "tab-btn"}
              onClick={() => setModo("stock")}
            >
              Entrada de Stock
            </button>
            <button
              type="button"
              className={modo === "info" ? "tab-btn active" : "tab-btn"}
              onClick={() => setModo("info")}
            >
              Información Fija
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Añadimos una 'key' dinámica basada en el modo para limpiar los inputs automáticamente */}
          <div className="form-grid" key={modo}>
            {modo === "stock" && pinturaInicial ? (
              <>
                <div
                  className="entry-mode-selector full-width"
                  role="group"
                  aria-label="Formato de entrada"
                >
                  <button
                    type="button"
                    className={
                      modoEntradaStock === "cajas"
                        ? "entry-mode-btn active"
                        : "entry-mode-btn"
                    }
                    onClick={() => setModoEntradaStock("cajas")}
                  >
                    Por Cajas
                  </button>
                  <button
                    type="button"
                    className={
                      modoEntradaStock === "total"
                        ? "entry-mode-btn active"
                        : "entry-mode-btn"
                    }
                    onClick={() => setModoEntradaStock("total")}
                  >
                    Por Total
                  </button>
                </div>

                <div className="input-group full-width">
                  {modoEntradaStock === "cajas" ? (
                    <div className="input-inline-2col">
                      <div className="input-group">
                        <label htmlFor="cantidad_cajas">Numero de cajas</label>
                        <div className="input-with-icon">
                         
                          <input
                            id="cantidad_cajas"
                            name="cantidad_cajas"
                            type="number"
                            step="1"
                            min="1"
                            value={cantidadCajas}
                            onChange={(e) => setCantidadCajas(e.target.value)}
                            required
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="input-group">
                        <label htmlFor="formato_kg">Kg por caja</label>
                        <div className="input-with-icon">
                         
                          <input
                            id="formato_kg"
                            name="formato_kg"
                            type="number"
                            step="0.01"
                            min="0"
                            value={kgPorCaja}
                            onChange={(e) => setKgPorCaja(e.target.value)}
                            required
                          />
                         
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      <label htmlFor="kg_entrada">
                        Kilos RAL {pinturaInicial.ral}
                      </label>
                      <div className="input-with-icon">
                        
                        <input
                          id="kg_entrada"
                          name="kg_entrada"
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="Introduce kg recibidos..."
                          value={totalKgManual}
                          onChange={(e) => setTotalKgManual(e.target.value)}
                          required
                          autoFocus
                        />
                      </div>
                    </>
                  )}
                </div>

                <div className="calc-hint full-width">
                  <strong>Total a sumar: {totalKgFinal.toFixed(2)} Kg</strong>
                </div>

                <div className="input-group">
                  <label htmlFor="precio_albaran">
                    Precio Total Albarán (€)
                  </label>
                  <div className="input-with-icon">
                   
                    <input
                      id="precio_albaran"
                      name="precio_albaran"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="Total factura"
                      value={precioAlbaranStock}
                      onChange={(e) => setPrecioAlbaranStock(e.target.value)}
                      required
                    />
                  </div>
                  <span className="calc-inline" aria-live="polite">
                    Precio sugerido:{" "}
                    {precioKgSugerido > 0
                      ? `${precioKgSugerido.toFixed(2)} EUR/kg`
                      : "-"}
                  </span>
                </div>
                <div className="input-group">
                  <label htmlFor="proveedor">Proveedor</label>
                  <input
                    id="proveedor"
                    name="proveedor"
                    placeholder="Nombre empresa"
                    list="proveedores-sugeridos"
                  />
                  <datalist id="proveedores-sugeridos">
                    <option value="Axalta" />
                    <option value="Titan" />
                    <option value="Jotun" />
                  </datalist>
                </div>
              </>
            ) : (
              <>
                <div
                  className={`input-group ${!pinturaInicial ? "full-width" : ""}`}
                >
                  <label htmlFor="ral">Código RAL</label>
                  <input
                    id="ral"
                    name="ral"
                    defaultValue={pinturaInicial?.ral || ""}
                    required
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="marca">Marca</label>
                  <input
                    id="marca"
                    name="marca"
                    defaultValue={pinturaInicial?.marca || ""}
                  />
                </div>
                <div className="input-group">
                  <label htmlFor="refpintura">Referencia Fabricante</label>
                  <input
                    id="refpintura"
                    name="refpintura"
                    defaultValue={pinturaInicial?.refpintura || ""}
                  />
                </div>
                {!pinturaInicial && (
                  <>
                    <div className="input-group">
                      <label htmlFor="stock">Stock Inicial (kg)</label>
                      <input
                        id="stock"
                        type="number"
                        step="0.01"
                        name="stock"
                        required
                      />
                    </div>
                    <div className="input-group">
                      <label htmlFor="precio_albaran">
                        Precio Total de los kg (EUR)
                      </label>
                      <input
                        id="precio_albaran"
                        type="number"
                        step="0.01"
                        name="precio_albaran"
                        placeholder="Ej: 150.50"
                        required
                      />
                    </div>
                  </>
                )}
              </>
            )}
          </div>

          <footer className="pintura-form-footer">
            <button type="button" onClick={onClose} className="btn-cancel">
              Cancelar
            </button>
            <button type="submit" className="btn-save">
              {modo === "stock" ? "Registrar Entrada" : "Guardar Cambios"}
            </button>
          </footer>
        </form>
      </div>
    </dialog>
  );
}

export default PinturaForm;
