import Nav from "../Components/Nav";
import "./Materiales.css";
import "../ral.css";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FiBarChart2, FiList, FiTruck } from "react-icons/fi";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import PinturaCardEdit from "../Components/Pinturas/PinturaCardEdit";
import PinturaForm from "../Components/Pinturas/PinturaForm";
import EntradaMercancia from "./EntradaMercancia";
import { toast } from "react-toastify";
import Loader from "../Components/Loader";
import socket from "../socket/socket";
const API = import.meta.env.VITE_API || "localhost";

const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const formatKg = (value) => `${Number(value || 0).toFixed(2)} kg`;
const formatEur = (value) => `${Number(value || 0).toFixed(2)} EUR`;

function Pinturas() {
  const location = useLocation();
  const navigate = useNavigate();
  const [productos, setProductos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [pinturaInicial, setPinturaInicial] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // null | "low-stock" | "sin-precio"
  const [pinturaView, setPinturaView] = useState("lista"); // "lista" | "resumen"
  const [analyticsPeriod, setAnalyticsPeriod] = useState(getCurrentPeriod());
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [dataQuality, setDataQuality] = useState(null);
  const [dataQualityLoading, setDataQualityLoading] = useState(false);

  const obtenerAcabados = (ralValue) => {
    const ralOriginal = String(ralValue || "").trim();
    const ralTexto = ralOriginal.toUpperCase();
    const esImprimacion = ralTexto.includes("IMP");
    const esBrillo = !esImprimacion && /^\d{4}$/.test(ralOriginal);
    const esMate =
      !esImprimacion && (/\bMATE\b/.test(ralTexto) || /\bM\b/.test(ralTexto));
    const esSatinado =
      !esImprimacion && /\bSAT(?:INADO|INADA|INADOS|INADAS)?\b/.test(ralTexto);
    const esGofrado =
      !esImprimacion && /\bGOF(?:RADO|RADA|RADOS|RADAS)?\b/.test(ralTexto);
    const esTexturado =
      !esImprimacion &&
      /\bTXT\b|\bTEXTUR(?:ADO|ADA|ADOS|ADAS)?\b/.test(ralTexto);

    const badges = esImprimacion
      ? []
      : [
          esBrillo ? "BRILLO" : null,
          esMate ? "MATE" : null,
          esSatinado ? "SATINADO" : null,
          esGofrado ? "GOFRADO" : null,
          esTexturado ? "TEXTURADO" : null,
        ].filter(Boolean);

    const tokensBusqueda = [
      esImprimacion ? "imprimacion imp" : "",
      esBrillo ? "brillo" : "",
      esMate ? "mate m" : "",
      esSatinado ? "satinado sat" : "",
      esGofrado ? "gofrado gof" : "",
      esTexturado ? "texturado txt" : "",
    ]
      .filter(Boolean)
      .join(" ");

    return {
      ralOriginal,
      ralTexto,
      esImprimacion,
      esMate,
      esGofrado,
      badges,
      tokensBusqueda,
    };
  };

  const obtenerEtiquetaRal = (ralValue) => {
    const ralOriginal = String(ralValue || "").trim();
    const ralTexto = ralOriginal.toUpperCase();
    if (ralTexto.includes("IMP")) return "IMPRIMACION";
    if (ralTexto.startsWith("NOIR")) {
      const noirConNumeros = ralTexto.match(/^NOIR\s+\d+/);
      return noirConNumeros ? noirConNumeros[0] : "NOIR";
    }

    const coincidencia = ralTexto.match(/\d{4}/);
    if (coincidencia) return coincidencia[0];

    return ralTexto.slice(0, 4) || "SIN RAL";
  };

  const getPinturas = () => {
    setLoading(true);
    fetch(`${API}/api/pintura/lista-completa`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
        toast.error("Error al cargar las pinturas");
      });
  };

  const filtrarPinturasPorQuery = (queryRaw) => {
    const queryText = String(queryRaw || "");
    const query = queryText.toLowerCase().trim();
    setSearch(queryText);

    if (query === "") {
      setFilteredProducts([]);
      return;
    }

    const filtered = productos.filter((p) => {
      const acabados = obtenerAcabados(p?.ral);
      const ral = (p.ral || "").toLowerCase();
      const marca = (p.marca || "").toLowerCase();
      const ref = (p.refpintura || p.RefPintura || "").toLowerCase();
      const acabadosSearch = acabados.tokensBusqueda.toLowerCase();

      return (
        ral.includes(query) ||
        marca.includes(query) ||
        ref.includes(query) ||
        acabadosSearch.includes(query)
      );
    });
    setFilteredProducts(filtered);
  };

  const handleSearch = (e) => {
    filtrarPinturasPorQuery(e.target.value);
  };

  useEffect(() => {
    getPinturas();
  }, []);

  // Socket.IO listener para actualizar pinturas en tiempo real
  useEffect(() => {
    const handleNuevaPintura = () => {
      getPinturas();
      toast.info("Nueva pintura creada - Lista actualizada");
    };

    const handleAlbaranProcesado = () => {
      getPinturas();
      toast.info("Albarán procesado - Stock actualizado");
    };

    socket.on("nuevaPinturaCreada", handleNuevaPintura);
    socket.on("albaranProcesado", handleAlbaranProcesado);

    return () => {
      socket.off("nuevaPinturaCreada", handleNuevaPintura);
      socket.off("albaranProcesado", handleAlbaranProcesado);
    };
  }, []);

  useEffect(() => {
    const initialFilter = location?.state?.initialFilter;
    const initialView = location?.state?.initialView;
    const hasInitialState = Boolean(initialFilter || initialView);

    if (!hasInitialState) return;

    if (initialFilter === "low-stock" || initialFilter === "sin-precio") {
      setActiveFilter(initialFilter);
    }

    if (initialView === "lista" || initialView === "resumen") {
      setPinturaView(initialView);
    }

    navigate(location.pathname, { replace: true, state: null });
  }, [location.pathname, location.state, navigate]);

  useEffect(() => {
    const period = encodeURIComponent(analyticsPeriod);
    setAnalyticsLoading(true);
    setDataQualityLoading(true);

    Promise.all([
      fetch(`${API}/api/analytics/pinturas/monthly?period=${period}`)
        .then((res) => res.json())
        .catch(() => ({ error: true })),
      fetch(`${API}/api/analytics/pinturas/data-quality?period=${period}`)
        .then((res) => res.json())
        .catch(() => ({ error: true })),
    ])
      .then(([monthlyData, qualityData]) => {
        if (monthlyData?.error) {
          setAnalytics(null);
        } else {
          setAnalytics(monthlyData);
        }

        if (qualityData?.error) {
          setDataQuality(null);
        } else {
          setDataQuality(qualityData);
        }
      })
      .finally(() => {
        setAnalyticsLoading(false);
        setDataQualityLoading(false);
      });
  }, [analyticsPeriod]);

  const addEntrada = () => {
    setIsEntradaOpen(true);
  };

  const closeEntrada = () => {
    setIsEntradaOpen(false);
  };

  const closePinturaForm = () => {
    setIsFormOpen(false);
    setPinturaInicial(null);
  };

  const handleSavePintura = async (data) => {
    try {
      
      const response = await fetch(`${API}/api/pintura/guardar`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        closePinturaForm();
        getPinturas();
      } else {
        toast.error(result.message || "Error al guardar");
      }
    } catch (error) {
      console.error("Error guardando pintura:", error);
      toast.error("No se pudo conectar con el servidor");
    }
  };

  const handleEdit = (pintura) => {
    setPinturaInicial(pintura || null);
    setIsFormOpen(true);
  };

  const obtenerPrecioActual = (p) => {
    const historial = Array.isArray(p?.historial) ? p.historial : [];
    if (historial.length === 0) return 0;
    const ordenado = [...historial].sort((a, b) => {
      const fa = new Date(
        a?.fecha_compra || a?.fecha || a?.createdAt,
      ).getTime();
      const fb = new Date(
        b?.fecha_compra || b?.fecha || b?.createdAt,
      ).getTime();
      return (Number.isFinite(fb) ? fb : 0) - (Number.isFinite(fa) ? fa : 0);
    });
    return parseFloat(
      ordenado[0]?.precio_kg_calculado || ordenado[0]?.precio_kg || 0,
    );
  };

  const obtenerClaseRAL = (textoRal) => {
    if (!textoRal) return "ral-default";

    const texto = textoRal.toString().toUpperCase();
    if (texto.startsWith("NOIR")) return "ral-noir";

    const coincidencia = textoRal.toString().match(/\d{4}/);

    if (coincidencia) {
      return `RAL-${coincidencia[0]}`;
    }

    if (texto.includes("IMP")) return "ral-imprimacion";
    if (texto.includes("OXI")) return "ral-oxidon";

    return "ral-default";
  };

  const statsData = productos.reduce(
    (acc, p) => {
      const acabados = obtenerAcabados(p?.ral);
      const esValido =
        /^\d/.test(acabados.ralTexto) ||
        acabados.ralTexto.startsWith("NOIR") ||
        acabados.ralTexto.includes("IMP") ||
        acabados.ralTexto.includes("OXI");
      if (!esValido) return acc;
      acc.refs += 1;
      if (parseFloat(p.stock || 0) < 10) acc.bajoStock += 1;
      if (obtenerPrecioActual(p) === 0) acc.sinPrecio += 1;
      return acc;
    },
    { refs: 0, bajoStock: 0, sinPrecio: 0 },
  );

  const toggleFilter = (filtro) =>
    setActiveFilter((prev) => (prev === filtro ? null : filtro));

  const pinturasBase = search === "" ? productos : filteredProducts;
  const pinturasToRender =
    activeFilter === "low-stock"
      ? pinturasBase.filter((p) => parseFloat(p.stock || 0) < 10)
      : activeFilter === "sin-precio"
        ? pinturasBase.filter((p) => obtenerPrecioActual(p) === 0)
        : pinturasBase;

  const dailySeries = Array.isArray(analytics?.dailySeries)
    ? analytics.dailySeries.map((item) => ({
        day: item.day,
        consumoKg: Number(item.consumoKg || 0),
        entradaKg: Number(item.entradaKg || 0),
      }))
    : [];

  const topSpendSeries = Array.isArray(analytics?.rows)
    ? [...analytics.rows]
        .sort(
          (a, b) =>
            Number(b?.gasto_total_eur || 0) - Number(a?.gasto_total_eur || 0),
        )
        .slice(0, 10)
        .map((item) => ({
          ral: String(item?.ral || "-").slice(0, 12),
          gasto: Number(item?.gasto_total_eur || 0),
          consumo: Number(item?.consumo_kg || 0),
        }))
    : [];

  const stockByRal = new Map(
    productos.map((p) => [
      String(p?.ral || "")
        .trim()
        .toUpperCase(),
      Number(p?.stock || 0),
    ]),
  );

  const highConsumptionNoPurchaseAlerts = (
    Array.isArray(analytics?.rows) ? analytics.rows : []
  )
    .filter(
      (item) =>
        Number(item?.consumo_kg || 0) >= 20 &&
        Number(item?.total_kg_comprados || 0) <= 0,
    )
    .sort((a, b) => Number(b?.consumo_kg || 0) - Number(a?.consumo_kg || 0))
    .slice(0, 4)
    .map((item) => ({
      id: `high-no-buy-${item?.ral}`,
      type: "warning",
      title: "Consumo alto sin compra reciente",
      detail: `${item?.ral || "-"} consumo ${Number(item?.consumo_kg || 0).toFixed(2)} kg este mes y no tiene entradas registradas.`,
      ral: String(item?.ral || "").trim(),
      action: "search",
    }));

  const risingWeeklyCostAlerts = (
    Array.isArray(analytics?.weeklyCostRise) ? analytics.weeklyCostRise : []
  )
    .slice(0, 4)
    .map((item) => ({
      id: `weekly-rise-${item?.ral}`,
      type: "danger",
      title: "Coste de salida subiendo semana a semana",
      detail: `${item?.ral || "-"} sube ${Number(item?.deltaPct || 0).toFixed(1)}% (de ${Number(item?.prevUnitCost || 0).toFixed(2)} a ${Number(item?.lastUnitCost || 0).toFixed(2)} EUR/kg).`,
      ral: String(item?.ral || "").trim(),
      action: "search",
    }));

  const lowStockHighConsumptionAlerts = (
    Array.isArray(analytics?.rows) ? analytics.rows : []
  )
    .map((item) => {
      const ral = String(item?.ral || "").trim();
      const stock = stockByRal.get(ral.toUpperCase());
      return {
        ...item,
        stock: Number.isFinite(stock) ? stock : Number.POSITIVE_INFINITY,
      };
    })
    .filter(
      (item) =>
        Number(item?.consumo_kg || 0) >= 12 && Number(item?.stock || 0) <= 10,
    )
    .sort((a, b) => Number(a?.stock || 0) - Number(b?.stock || 0))
    .slice(0, 4)
    .map((item) => ({
      id: `low-stock-high-cons-${item?.ral}`,
      type: "warning",
      title: "Stock bajo con consumo alto",
      detail: `${item?.ral || "-"} stock ${Number(item?.stock || 0).toFixed(2)} kg y consumo ${Number(item?.consumo_kg || 0).toFixed(2)} kg.`,
      ral: String(item?.ral || "").trim(),
      action: "low-stock",
    }));

  const alertasOperativas = [
    ...highConsumptionNoPurchaseAlerts,
    ...risingWeeklyCostAlerts,
    ...lowStockHighConsumptionAlerts,
  ];

  const attentionCount = Number(dataQuality?.attentionCount || 0);

  const handleRevisarAlerta = (alerta) => {
    setPinturaView("lista");
    if (alerta?.action === "low-stock") {
      setActiveFilter("low-stock");
    } else {
      setActiveFilter(null);
    }

    filtrarPinturasPorQuery(alerta?.ral || "");
  };

  return (
    <section className="materiales">
      <Nav className="nav"></Nav>
      <div className="cont">
        <div className="pinturas-header">
          <div className="pinturas-stats">
            <button
              className={`stat-pill stat-pill--view stat-pill--view-list${
                pinturaView === "lista" ? " stat-pill--view-active" : ""
              }`}
              onClick={() => setPinturaView("lista")}
              title="Ver lista de pinturas"
            >
              <span className="stat-pill-icon">
                <FiList />
              </span>
              <div className="stat-pill-info">
                <span className="stat-value">Lista</span>
                <span className="stat-label">Vista</span>
              </div>
            </button>
            <button
              className={`stat-pill stat-pill--view stat-pill--view-summary${
                pinturaView === "resumen" ? " stat-pill--view-active" : ""
              }`}
              onClick={() => setPinturaView("resumen")}
              title="Ver resumen y gráficas"
            >
              <span className="stat-pill-icon">
                <FiBarChart2 />
              </span>
              <div className="stat-pill-info">
                <span className="stat-value">Resumen</span>
                <span className="stat-label">Vista</span>
              </div>
            </button>
            <div className="stat-pill-sep"></div>
            <div className="stat-pill">
              <span className="stat-pill-icon">🎨</span>
              <div className="stat-pill-info">
                <span className="stat-value">
                  {loading ? "–" : statsData.refs}
                </span>
                <span className="stat-label">Referencias</span>
              </div>
            </div>
            <button
              className={`stat-pill stat-pill--warning${
                activeFilter === "low-stock" ? " stat-pill--active" : ""
              }`}
              onClick={() => toggleFilter("low-stock")}
              title="Filtrar pinturas con stock bajo (< 10 kg)"
            >
              <span className="stat-pill-icon">⚠️</span>
              <div className="stat-pill-info">
                <span className="stat-value">
                  {loading ? "–" : statsData.bajoStock}
                </span>
                <span className="stat-label">Bajo stock</span>
              </div>
            </button>
            <button
              className={`stat-pill stat-pill--danger${
                activeFilter === "sin-precio" ? " stat-pill--active" : ""
              }`}
              onClick={() => toggleFilter("sin-precio")}
              title="Filtrar pinturas sin precio registrado"
            >
              <span className="stat-pill-icon">🏷️</span>
              <div className="stat-pill-info">
                <span className="stat-value">
                  {loading ? "–" : statsData.sinPrecio}
                </span>
                <span className="stat-label">Sin precio</span>
              </div>
            </button>
          </div>
          <div className="pinturas-actions">
            <div className="search-wrapper">
              <svg
                className="search-icon"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="RAL, marca, acabado..."
                value={search}
                onChange={handleSearch}
              />
            </div>
            <button className="btn-add-pintura" onClick={addEntrada}>
              <span className="btn-add-icon btn-add-icon-outline">
                <FiTruck />
              </span>
              Entrada Mercancia
            </button>
          </div>
        </div>

        {pinturaView === "resumen" && (
          <div className="pinturas-analytics-strip">
            <div className="analytics-strip-head">
              <div>
                <h3>Resumen mensual de pinturas</h3>
                <p>Compras, consumo y coste real del periodo seleccionado.</p>
              </div>
              <input
                type="month"
                value={analyticsPeriod}
                onChange={(e) =>
                  setAnalyticsPeriod(e.target.value || getCurrentPeriod())
                }
                className="analytics-period-input"
              />
            </div>

            <div className="analytics-strip-grid">
              <article className="analytics-mini-card">
                <span className="analytics-mini-label">Gasto compras</span>
                <strong>
                  {analyticsLoading
                    ? "…"
                    : `${Number(analytics?.totals?.gastoComprasEur || 0).toFixed(2)} €`}
                </strong>
              </article>
              <article className="analytics-mini-card">
                <span className="analytics-mini-label">Kg comprados</span>
                <strong>
                  {analyticsLoading
                    ? "…"
                    : `${Number(analytics?.totals?.kgComprados || 0).toFixed(2)} kg`}
                </strong>
              </article>
              <article className="analytics-mini-card">
                <span className="analytics-mini-label">Consumo</span>
                <strong>
                  {analyticsLoading
                    ? "…"
                    : `${Number(analytics?.totals?.consumoKg || 0).toFixed(2)} kg`}
                </strong>
              </article>
              <article className="analytics-mini-card">
                <span className="analytics-mini-label">Coste medio compra</span>
                <strong>
                  {analyticsLoading
                    ? "…"
                    : `${Number(analytics?.totals?.costeMedioCompra || 0).toFixed(2)} €/kg`}
                </strong>
              </article>
            </div>

            <div className="analytics-alerts-block">
              <div className="analytics-quality-block">
                <div className="analytics-quality-head">
                  <h4>Calidad de dato</h4>
                  <span>
                    {dataQualityLoading
                      ? "Calculando..."
                      : `${attentionCount} incidencias`}
                  </span>
                </div>
                <p className="analytics-quality-note">
                  Este total no equivale al numero de alertas operativas. Aqui
                  se suman incidencias de calidad de datos.
                </p>
                <div className="analytics-quality-grid">
                  <article className="analytics-quality-card">
                    <span>Salidas sin coste</span>
                    <strong>
                      {dataQualityLoading
                        ? "..."
                        : Number(dataQuality?.salidasSinCoste || 0)}
                    </strong>
                  </article>
                  <article className="analytics-quality-card">
                    <span>Movimientos sin RAL</span>
                    <strong>
                      {dataQualityLoading
                        ? "..."
                        : Number(dataQuality?.movimientosSinRal || 0)}
                    </strong>
                  </article>
                  <article className="analytics-quality-card">
                    <span>Pinturas sin precio</span>
                    <strong>
                      {dataQualityLoading
                        ? "..."
                        : Number(dataQuality?.pinturasSinPrecio || 0)}
                    </strong>
                  </article>
                </div>
              </div>

              <div className="analytics-alerts-head">
                <h4>Alertas operativas</h4>
                <span>
                  {analyticsLoading
                    ? ""
                    : `${alertasOperativas.length} alertas`}
                </span>
              </div>
              {analyticsLoading ? (
                <p className="analytics-empty">Analizando alertas…</p>
              ) : alertasOperativas.length > 0 ? (
                <div className="analytics-alerts-list">
                  {alertasOperativas.map((alerta) => (
                    <article
                      key={alerta.id}
                      className={`analytics-alert-card analytics-alert-${alerta.type}`}
                    >
                      <div>
                        <strong>{alerta.title}</strong>
                        <p>{alerta.detail}</p>
                      </div>
                      <button
                        type="button"
                        className="analytics-alert-action"
                        onClick={() => handleRevisarAlerta(alerta)}
                      >
                        Ir a revisar
                      </button>
                    </article>
                  ))}
                </div>
              ) : (
                <p className="analytics-empty">
                  Sin alertas críticas para este periodo.
                </p>
              )}
            </div>

            <div className="analytics-chart-grid">
              <article className="analytics-chart-card">
                <div className="analytics-chart-head">
                  <h4>Consumo diario</h4>
                  <span>kg por dia</span>
                </div>
                {analyticsLoading ? (
                  <p className="analytics-empty">Cargando serie diaria…</p>
                ) : dailySeries.length > 0 ? (
                  <div className="analytics-chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <LineChart
                        data={dailySeries}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#d7e6f1" />
                        <XAxis
                          dataKey="day"
                          tick={{ fill: "#3c5f77", fontSize: 12 }}
                        />
                        <YAxis tick={{ fill: "#3c5f77", fontSize: 12 }} />
                        <Tooltip
                          formatter={(value) => formatKg(value)}
                          labelFormatter={(label) => `Dia ${label}`}
                        />
                        <Line
                          type="monotone"
                          dataKey="consumoKg"
                          name="Consumo"
                          stroke="#2563eb"
                          strokeWidth={2.5}
                          dot={{ r: 2.5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="entradaKg"
                          name="Entradas"
                          stroke="#0f766e"
                          strokeWidth={2}
                          dot={{ r: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="analytics-empty">
                    No hay movimientos diarios para este periodo.
                  </p>
                )}
              </article>

              <article className="analytics-chart-card">
                <div className="analytics-chart-head">
                  <h4>Top gasto por RAL</h4>
                  <span>Top 10 referencias</span>
                </div>
                {analyticsLoading ? (
                  <p className="analytics-empty">Cargando ranking de gasto…</p>
                ) : topSpendSeries.length > 0 ? (
                  <div className="analytics-chart-wrap">
                    <ResponsiveContainer width="100%" height={260}>
                      <BarChart
                        data={topSpendSeries}
                        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#d7e6f1" />
                        <XAxis
                          dataKey="ral"
                          tick={{ fill: "#3c5f77", fontSize: 11 }}
                          interval={0}
                          angle={-25}
                          textAnchor="end"
                          height={64}
                        />
                        <YAxis tick={{ fill: "#3c5f77", fontSize: 12 }} />
                        <Tooltip formatter={(value) => formatEur(value)} />
                        <Bar
                          dataKey="gasto"
                          name="Gasto"
                          fill="#1d4ed8"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <p className="analytics-empty">
                    No hay gasto de compras para este periodo.
                  </p>
                )}
              </article>
            </div>

            <div className="analytics-top-list">
              <div className="analytics-top-head">
                <span>Top referencias del mes</span>
                <span>
                  {analyticsLoading
                    ? ""
                    : `${analytics?.totals?.totalReferencias || 0} refs`}
                </span>
              </div>
              {analyticsLoading ? (
                <p className="analytics-empty">Cargando métricas…</p>
              ) : Array.isArray(analytics?.topRals) &&
                analytics.topRals.length > 0 ? (
                analytics.topRals.map((item) => (
                  <div
                    className="analytics-top-row"
                    key={`${item.ral}-${item.marca}`}
                  >
                    <div>
                      <strong>{item.ral}</strong>
                      <span>{item.marca || "-"}</span>
                    </div>
                    <div>
                      <strong>
                        {Number(item.gasto_total_eur || 0).toFixed(2)} €
                      </strong>
                      <span>{Number(item.consumo_kg || 0).toFixed(2)} kg</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="analytics-empty">
                  Sin datos de compras o consumo para este mes.
                </p>
              )}
            </div>
          </div>
        )}

        {pinturaView === "lista" && (
          <div className="pinturas-container">
            {loading ? (
              <Loader />
            ) : pinturasToRender.length > 0 ? (
              <div className="pinturas-grid">
                {pinturasToRender.map((pintura) => {
                  const acabados = obtenerAcabados(pintura?.ral);

                  // REGLA: Es válido si empieza por número O si es Imprimación u Oxidón
                  const esRegistroValido =
                    /^\d/.test(acabados.ralTexto) ||
                    acabados.ralTexto.startsWith("NOIR") ||
                    acabados.ralTexto.includes("IMP") ||
                    acabados.ralTexto.includes("OXI");
                  if (!esRegistroValido) return null;
                  const claseColor = obtenerClaseRAL(pintura?.ral);
                  const etiquetaRal = obtenerEtiquetaRal(pintura?.ral);

                  return (
                    <PinturaCardEdit
                      key={pintura.id}
                      pintura={pintura}
                      onEdit={handleEdit}
                      ralClass={claseColor}
                      hasGofrado={acabados.esGofrado}
                      hasMate={acabados.esMate}
                      finishBadges={acabados.badges}
                      displayRal={etiquetaRal}
                    />
                  );
                })}
              </div>
            ) : (
              <p className="pinturas-empty">Sin resultados</p>
            )}
          </div>
        )}
      </div>
      <PinturaForm
        isOpen={isFormOpen}
        onClose={closePinturaForm}
        onSave={handleSavePintura}
        pinturaInicial={pinturaInicial}
      />
      <EntradaMercancia
        isOpen={isEntradaOpen}
        onClose={closeEntrada}
        onAlbaranProcesado={getPinturas}
      />
    </section>
  );
}

export default Pinturas;
