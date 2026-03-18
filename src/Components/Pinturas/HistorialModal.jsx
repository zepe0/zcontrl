import { useMemo, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  Brush,
} from "recharts";
import * as XLSX from "xlsx";
import "./HistorialModal.css";

function HistorialModal({ pintura, onClose }) {
  const [exportStatus, setExportStatus] = useState("idle");

  const formatHistorialDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toLocaleDateString();
  };

  const formatHistorialDateISO = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    return parsed.toISOString().split("T")[0];
  };

  const formatShortDate = (value) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return "-";
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    return `${day}/${month}`;
  };

  const {
    dataGrafica,
    datosTabla,
    precioPromedio,
    precioMin,
    precioMax,
    trendLabel,
    trendClass,
  } = useMemo(() => {
    const historialCompleto = Array.isArray(pintura?.historial)
      ? pintura.historial
      : [];

    const sorted = [...historialCompleto].sort((a, b) => {
      const fechaA = new Date(
        a?.fecha_compra || a?.fecha || a?.createdAt,
      ).getTime();
      const fechaB = new Date(
        b?.fecha_compra || b?.fecha || b?.createdAt,
      ).getTime();
      return (
        (Number.isFinite(fechaA) ? fechaA : 0) -
        (Number.isFinite(fechaB) ? fechaB : 0)
      );
    });

    const grafica = sorted.map((h) => ({
      fechaISO: formatHistorialDateISO(
        h?.fecha_compra || h?.fecha || h?.createdAt,
      ),
      fechaCorta: formatShortDate(h?.fecha_compra || h?.fecha || h?.createdAt),
      precio: parseFloat(h?.precio_kg_calculado || h?.precio_kg || 0),
      proveedor: h?.proveedor || "S/P",
    }));

    const tabla = [...sorted].reverse();
    const preciosValidos = grafica
      .map((item) => item.precio)
      .filter((n) => Number.isFinite(n) && n > 0);

    const promedio = preciosValidos.length
      ? preciosValidos.reduce((acc, n) => acc + n, 0) / preciosValidos.length
      : 0;
    const min = preciosValidos.length ? Math.min(...preciosValidos) : 0;
    const max = preciosValidos.length ? Math.max(...preciosValidos) : 0;

    let trend = "Sin comparativa";
    let trendTone = "neutral";

    if (tabla.length >= 2) {
      const actual = parseFloat(
        tabla[0]?.precio_kg_calculado || tabla[0]?.precio_kg || 0,
      );
      const anterior = parseFloat(
        tabla[1]?.precio_kg_calculado || tabla[1]?.precio_kg || 0,
      );
      if (
        Number.isFinite(actual) &&
        Number.isFinite(anterior) &&
        anterior > 0
      ) {
        const deltaPct = ((actual - anterior) / anterior) * 100;
        if (Math.abs(deltaPct) < 0.15) {
          trend = "Precio estable";
          trendTone = "neutral";
        } else if (deltaPct > 0) {
          trend = `↑ +${deltaPct.toFixed(1)}%`;
          trendTone = "up";
        } else {
          trend = `↓ ${deltaPct.toFixed(1)}%`;
          trendTone = "down";
        }
      }
    }

    return {
      dataGrafica: grafica,
      datosTabla: tabla,
      precioPromedio: promedio,
      precioMin: min,
      precioMax: max,
      trendLabel: trend,
      trendClass: trendTone,
    };
  }, [pintura?.historial]);

  const exportarExcel = () => {
    if (exportStatus === "loading") return;
    setExportStatus("loading");

    setTimeout(() => {
      try {
        const ws = XLSX.utils.json_to_sheet(
          datosTabla.map((h) => ({
            Fecha: formatHistorialDate(
              h?.fecha_compra || h?.fecha || h?.createdAt,
            ),
            "Precio €/kg": h?.precio_kg_calculado || h?.precio_kg || "-",
            Proveedor: h?.proveedor || "S/P",
          })),
        );
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Historial");
        XLSX.writeFile(wb, `historial-${pintura?.ral || "pintura"}.xlsx`);
        setExportStatus("success");
        setTimeout(() => setExportStatus("idle"), 1600);
      } catch {
        setExportStatus("idle");
      }
    }, 120);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="historial-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <header className="modal-header">
          <div className="modal-title-wrap">
            <h2>Historial Completo - {pintura?.ral || "Pintura"}</h2>
            <span className={`trend-badge trend-${trendClass}`}>
              {trendLabel} <strong>vs última compra</strong>
            </span>
          </div>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </header>

        <div className="modal-content-historial">
          <div className="dashboard-layout dashboard-centered">
            <section className="resumen-cards" aria-label="Resumen histórico">
              <article className="resumen-card">
                <span className="resumen-label">Media histórica</span>
                <strong>
                  {precioPromedio ? precioPromedio.toFixed(2) : "0.00"} €/kg
                </strong>
              </article>
              <article className="resumen-card">
                <span className="resumen-label">Rango histórico</span>
                <strong>
                  {precioMin ? precioMin.toFixed(2) : "0.00"} -{" "}
                  {precioMax ? precioMax.toFixed(2) : "0.00"} €/kg
                </strong>
              </article>
            </section>

            {/* Gráfica de evolución de precio */}
            <div className="grafica-section">
              <div className="section-head">
                <h3>Evolución del Precio (€/kg)</h3>
                <div className="metricas-inline">
                  <span>{dataGrafica.length} registros</span>
                </div>
              </div>
              {dataGrafica.length > 0 ? (
                <div className="chart-wrap">
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={dataGrafica}
                      margin={{ top: 12, right: 16, left: 0, bottom: 8 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#dbe4ee" />
                      <XAxis
                        dataKey="fechaCorta"
                        interval="preserveStartEnd"
                        minTickGap={30}
                        tick={{ fill: "#64748b", fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: "#64748b", fontSize: 11 }} />
                      <Tooltip
                        formatter={(value) => [
                          `${Number(value).toFixed(2)} €/kg`,
                          "Precio",
                        ]}
                        labelFormatter={(_, payload) => {
                          const raw = payload?.[0]?.payload?.fechaISO || "-";
                          return `Fecha: ${raw}`;
                        }}
                      />
                      <Legend />
                      {precioPromedio > 0 && (
                        <ReferenceLine
                          y={precioPromedio}
                          stroke="#64748b"
                          strokeDasharray="5 5"
                          label={{
                            position: "right",
                            value: `MEDIA: ${precioPromedio.toFixed(2)}€`,
                            fill: "#64748b",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        />
                      )}
                      {precioMin > 0 && (
                        <ReferenceLine
                          y={precioMin}
                          stroke="#10b981"
                          strokeDasharray="2 4"
                          label={{
                            position: "right",
                            value: `MÍN: ${precioMin.toFixed(2)}€`,
                            fill: "#10b981",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        />
                      )}
                      {precioMax > 0 && (
                        <ReferenceLine
                          y={precioMax}
                          stroke="#ef4444"
                          strokeDasharray="2 4"
                          label={{
                            position: "right",
                            value: `MÁX: ${precioMax.toFixed(2)}€`,
                            fill: "#ef4444",
                            fontSize: 10,
                            fontWeight: "bold",
                          }}
                        />
                      )}
                      <Line
                        type="monotone"
                        dataKey="precio"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        name="Precio €/kg"
                        dot={false}
                        activeDot={{ fill: "#1d4ed8", r: 5 }}
                      />
                      {dataGrafica.length > 15 && (
                        <Brush
                          dataKey="fechaCorta"
                          height={30}
                          stroke="#a1aed9"
                          fill="#eff6ff"
                          startIndex={Math.max(0, dataGrafica.length - 20)}
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="no-data">Sin datos de historial</div>
              )}
            </div>

            {/* Tabla con scroll */}
            <div className="tabla-section">
              <div className="tabla-header">
                <h3>Registros</h3>
                <button
                  className={`btn-export btn-export-${exportStatus}`}
                  onClick={exportarExcel}
                >
                  {exportStatus === "loading" && "Exportando..."}
                  {exportStatus === "success" && "✓ Exportado"}
                  {exportStatus === "idle" && "📥 Exportar Excel"}
                </button>
              </div>
              <div className="tabla-scroll">
                {datosTabla.length > 0 ? (
                  <table className="historial-table">
                    <thead>
                      <tr>
                        <th>Fecha</th>
                        <th className="th-precio">Precio €/kg</th>
                        <th>Proveedor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosTabla.map((h, i) => (
                        <tr key={`${h?.id || "h"}-${i}`}>
                          <td>
                            {formatHistorialDate(
                              h?.fecha_compra || h?.fecha || h?.createdAt,
                            )}
                          </td>
                          <td className="precio-cell">
                            {h?.precio_kg_calculado || h?.precio_kg || "-"}€
                          </td>
                          <td className="proveedor-cell">
                            {h?.proveedor || "S/P"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="no-data">Sin registros de historial</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HistorialModal;
