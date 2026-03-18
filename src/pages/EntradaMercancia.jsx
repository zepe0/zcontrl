import { useEffect, useMemo, useState } from "react";
import {
  FiBox,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
  FiTruck,
  FiX,
} from "react-icons/fi";
import { toast } from "react-toastify";
import "./EntradaMercancia.css";
import { parseRalString } from "../Components/Pinturas/logic/parseRal";
import { createNewPintura } from "../Components/Pinturas/logic/pinturaOperations";

const API = import.meta.env.VITE_API || "localhost";

function EntradaMercancia({ isOpen, onClose }) {
  const [pinturas, setPinturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [lineas, setLineas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCreateOption, setShowCreateOption] = useState(null);
  const [isCreatingPintura, setIsCreatingPintura] = useState(false);

  useEffect(() => {
    fetch(`${API}/api/pintura/lista-completa`)
      .then((res) => res.json())
      .then((data) => {
        setPinturas(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((error) => {
        console.error("Error cargando pinturas:", error);
        toast.error("No se pudo cargar el catalogo de pinturas");
        setLoading(false);
      });
  }, []);

  const resultados = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      setShowCreateOption(null);
      return [];
    }

    const existentes = pinturas
      .filter((p) => {
        const ral = String(p?.ral || "").toLowerCase();
        const marca = String(p?.marca || "").toLowerCase();
        const ref = String(p?.refpintura || p?.RefPintura || "").toLowerCase();
        const id = String(p?.id || "").toLowerCase();
        return (
          ral.includes(query) ||
          marca.includes(query) ||
          ref.includes(query) ||
          id.includes(query)
        );
      })
      .slice(0, 10);

    // Si no hay resultados exactos, analizar si es posible crear una nueva pintura
    if (existentes.length === 0) {
      const parsed = parseRalString(search);
      if (parsed.ral) {
        // Verificar que no exista ya
        const yaExiste = pinturas.some((p) => String(p?.ral) === parsed.ral);
        if (!yaExiste) {
          setShowCreateOption({
            parsed,
            datosNuevaPintura: {
              ral: parsed.ral,
              marca: parsed.marca || "",
            },
          });
        }
      }
    } else {
      setShowCreateOption(null);
    }

    return existentes;
  }, [pinturas, search]);

  const addLinea = (pintura) => {
    const pinturaId = String(pintura?.id || "");
    if (!pinturaId) return;

    const yaExiste = lineas.some(
      (linea) => String(linea.pintura_id) === pinturaId,
    );
    if (yaExiste) {
      toast.info("Esa pintura ya esta en el albaran");
      return;
    }

    setLineas((prev) => [
      ...prev,
      {
        rowId: `${pinturaId}-${Date.now()}`,
        pintura_id: pinturaId,
        ral: String(pintura?.ral || "SIN RAL"),
        marca: String(pintura?.marca || ""),
        proveedor: "",
        cantidad_cajas: 1,
        formato_kg: 25,
        precio_total: "",
      },
    ]);

    setSearch("");
  };

  const removeLinea = (rowId) => {
    setLineas((prev) => prev.filter((linea) => linea.rowId !== rowId));
  };

  const handleCreateAndAddPintura = async () => {
    if (!showCreateOption) return;

    setIsCreatingPintura(true);
    try {
      const result = await createNewPintura(showCreateOption.datosNuevaPintura);

      if (!result.success) {
        throw new Error(result.error);
      }

      const nuevaPintura = result.pintura;

      // Asegurar que la pintura tenga todos los datos necesarios
      const pinturaProcesada = {
        id:
          nuevaPintura.id || nuevaPintura.id_pintura || nuevaPintura.pinturaId,
        ral: nuevaPintura.ral || showCreateOption.datosNuevaPintura.ral,
        marca: nuevaPintura.marca || showCreateOption.datosNuevaPintura.marca,
        refpintura: nuevaPintura.refpintura || "",
        stock_actual: nuevaPintura.stock_actual || 0,
        precio_referencia: nuevaPintura.precio_referencia || 0,
        ...nuevaPintura,
      };

      // Agregar la nueva pintura al catálogo
      setPinturas((prev) => [...prev, pinturaProcesada]);

      // Agregar como línea al albarán
      addLinea(pinturaProcesada);

      toast.success(
        `Pintura "RAL ${pinturaProcesada.ral}" creada y añadida al albarán`,
      );
      setShowCreateOption(null);
      setSearch("");
    } catch (error) {
      console.error("Error creando pintura:", error);
      toast.error(error.message || "Error al crear la pintura");
    } finally {
      setIsCreatingPintura(false);
    }
  };

  const updateLinea = (rowId, field, value) => {
    setLineas((prev) =>
      prev.map((linea) =>
        linea.rowId === rowId
          ? {
              ...linea,
              [field]: value,
            }
          : linea,
      ),
    );
  };

  const toNumber = (value) => {
    const parsed = parseFloat(value);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const lineasCalculadas = useMemo(
    () =>
      lineas.map((linea) => {
        const cantidad = toNumber(linea.cantidad_cajas);
        const formato = toNumber(linea.formato_kg);
        const totalKg = cantidad * formato;
        const precioTotal = toNumber(linea.precio_total);
        const precioKg = totalKg > 0 ? precioTotal / totalKg : 0;
        return {
          ...linea,
          totalKg,
          precioTotal,
          precioKg,
        };
      }),
    [lineas],
  );

  const resumen = useMemo(() => {
    return lineasCalculadas.reduce(
      (acc, linea) => {
        acc.totalKg += linea.totalKg;
        acc.totalEuros += linea.precioTotal;
        return acc;
      },
      { totalKg: 0, totalEuros: 0 },
    );
  }, [lineasCalculadas]);

  const isValid =
    lineasCalculadas.length > 0 &&
    lineasCalculadas.every(
      (linea) =>
        toNumber(linea.cantidad_cajas) > 0 &&
        toNumber(linea.formato_kg) > 0 &&
        linea.precioTotal > 0,
    );

  const procesarAlbaran = async () => {
    if (!isValid) {
      toast.error("Completa todas las lineas con cajas, kg y precio");
      return;
    }

    const payload = {
      fecha_compra: new Date().toISOString(),
      lineas: lineasCalculadas.map((linea) => ({
        pintura_id: linea.pintura_id,
        proveedor: String(linea.proveedor || "").trim() || null,
        cantidad_cajas: Math.round(toNumber(linea.cantidad_cajas)),
        formato_kg: Number(toNumber(linea.formato_kg).toFixed(2)),
        precio_total: Number(linea.precioTotal.toFixed(2)),
        precio_total_caja:
          toNumber(linea.cantidad_cajas) > 0
            ? Number(
                (linea.precioTotal / toNumber(linea.cantidad_cajas)).toFixed(2),
              )
            : null,
        precio_kg_calculado:
          linea.totalKg > 0 ? Number(linea.precioKg.toFixed(2)) : null,
        kg_entrada: Number(linea.totalKg.toFixed(2)),
        precio_albaran: Number(linea.precioTotal.toFixed(2)),
      })),
    };

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API}/api/pintura/procesar-albaran`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || result?.success === false) {
        throw new Error(result?.message || "No se pudo procesar el albaran");
      }

      toast.success(result?.message || "Albaran procesado correctamente");
      setLineas([]);
    } catch (error) {
      console.error("Error procesando albaran:", error);
      toast.error(error?.message || "Error al procesar el albaran");
    } finally {
      setIsSubmitting(false);
    }
  };

  return isOpen ? (
    <div className="entrada-modal-overlay">
      <div className="entrada-modal">
        <button
          className="entrada-modal-close"
          onClick={onClose}
          aria-label="Cerrar"
        >
          <FiX />
        </button>

        <header className="entrada-header">
          <div>
            <h1>Entrada de Mercancia</h1>
            <p>
              Carga rapida de lineas para un albaran completo en una sola
              operacion.
            </p>
          </div>
          <div className="entrada-kpis" aria-label="Resumen albaran">
            <div className="kpi-chip">
              <FiBox />
              <span>{lineasCalculadas.length} lineas</span>
            </div>
            <div className="kpi-chip">
              <FiPackage />
              <span>{resumen.totalKg.toFixed(2)} kg</span>
            </div>
            <div className="kpi-chip">
              <FiTruck />
              <span>{resumen.totalEuros.toFixed(2)} EUR</span>
            </div>
          </div>
        </header>

        <section
          className="entrada-search-card"
          aria-label="Buscador rapido de pinturas"
        >
          <label htmlFor="entrada-search">
            Buscar pintura por RAL, marca o referencia
          </label>
          <div className="entrada-search-control">
            <FiSearch />
            <input
              id="entrada-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ejemplo: 7016, axalta, ref..."
              disabled={loading}
            />
          </div>

          {search.trim() && (
            <>
              {resultados.length > 0 && (
                <ul className="entrada-results" role="listbox">
                  {resultados.map((p) => (
                    <li key={p.id}>
                      <button
                        type="button"
                        className="entrada-result-btn"
                        onClick={() => addLinea(p)}
                      >
                        <strong>{String(p?.ral || "SIN RAL")}</strong>
                        <span>{String(p?.marca || "Sin marca")}</span>
                        <FiPlus />
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              {resultados.length === 0 && showCreateOption && (
                <div className="entrada-create-option">
                  <div className="create-option-content">
                    <div className="create-option-info">
                      <p className="create-option-title">
                        Pintura no encontrada
                      </p>
                      <p className="create-option-details">
                        <strong>RAL:</strong>{" "}
                        {showCreateOption.datosNuevaPintura.ral}
                        {showCreateOption.parsed.acabado && (
                          <>
                            <br />
                            <strong>Acabado:</strong>{" "}
                            {showCreateOption.parsed.acabado}
                          </>
                        )}
                        {showCreateOption.datosNuevaPintura.marca && (
                          <>
                            <br />
                            <strong>Marca:</strong>{" "}
                            {showCreateOption.datosNuevaPintura.marca}
                          </>
                        )}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="btn-create-pintura"
                      onClick={handleCreateAndAddPintura}
                      disabled={isCreatingPintura}
                    >
                      {isCreatingPintura ? "Creando..." : "✚ Crear y Agregar"}
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>

        <section className="entrada-table-card" aria-label="Lineas del albaran">
          <div className="entrada-table-scroll">
            <table className="entrada-table">
              <thead>
                <tr>
                  <th>RAL</th>
                  <th>Proveedor</th>
                  <th>Formato (Cajas x Kg)</th>
                  <th>Total Kg</th>
                  <th>Precio Total</th>
                  <th>Precio por Kg</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {lineasCalculadas.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="entrada-empty">
                      Anade pinturas con el buscador para empezar el albaran.
                    </td>
                  </tr>
                ) : (
                  lineasCalculadas.map((linea) => (
                    <tr key={linea.rowId}>
                      <td>
                        <div className="ral-cell">
                          <strong>{linea.ral}</strong>
                          <span>{linea.marca || "-"}</span>
                        </div>
                      </td>
                      <td>
                        <input
                          className="table-input"
                          type="text"
                          value={linea.proveedor}
                          onChange={(e) =>
                            updateLinea(
                              linea.rowId,
                              "proveedor",
                              e.target.value,
                            )
                          }
                          placeholder="Proveedor"
                        />
                      </td>
                      <td>
                        <div className="formato-inline">
                          <input
                            className="table-input table-input-sm"
                            type="number"
                            min="1"
                            step="1"
                            value={linea.cantidad_cajas}
                            onChange={(e) =>
                              updateLinea(
                                linea.rowId,
                                "cantidad_cajas",
                                e.target.value,
                              )
                            }
                          />
                          <span className="times">x</span>
                          <input
                            className="table-input table-input-sm"
                            type="number"
                            min="0"
                            step="0.01"
                            value={linea.formato_kg}
                            onChange={(e) =>
                              updateLinea(
                                linea.rowId,
                                "formato_kg",
                                e.target.value,
                              )
                            }
                          />
                        </div>
                      </td>
                      <td className="numeric">{linea.totalKg.toFixed(2)} kg</td>
                      <td>
                        <input
                          className="table-input"
                          type="number"
                          min="0"
                          step="0.01"
                          value={linea.precio_total}
                          onChange={(e) =>
                            updateLinea(
                              linea.rowId,
                              "precio_total",
                              e.target.value,
                            )
                          }
                          placeholder="0.00"
                        />
                      </td>
                      <td className="numeric strong">
                        {linea.precioKg > 0
                          ? `${linea.precioKg.toFixed(2)} EUR/kg`
                          : "-"}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-line"
                          onClick={() => removeLinea(linea.rowId)}
                          aria-label="Eliminar linea"
                        >
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <footer className="entrada-footer">
            <p>
              Revisa los precios por kg antes de confirmar para detectar errores
              del albaran.
            </p>
            <button
              type="button"
              className="btn-procesar"
              onClick={procesarAlbaran}
              disabled={!isValid || isSubmitting}
            >
              {isSubmitting ? "Procesando..." : "Procesar Albaran"}
            </button>
          </footer>
        </section>
      </div>
    </div>
  ) : null;
}

export default EntradaMercancia;
