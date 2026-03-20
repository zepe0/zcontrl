import Nav from "../Components/Nav";
import "./Home.css";
import "../ral.css";
import { useEffect, useMemo, useState } from "react";
import LisatPintura from "../Components/Pinturas/ListaPintura";
import ListaAlbaran from "../Components/Albaranes/ListaAlbaran";
import AddPedido from "../Components/Albaranes/AddPedido";
import io from "socket.io-client";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import {
  FiAlertTriangle,
  FiClipboard,
  FiClock,
  FiDatabase,
  FiDroplet,
  FiPlus,
  FiSearch,
  FiTag,
  FiTruck,
  FiX,
} from "react-icons/fi";
const API = import.meta.env.VITE_API || "localhost";
const socket = io(`${API}`);

const getCurrentPeriod = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

function Home() {
  const navigate = useNavigate();
  const [pinturas, setPinturas] = useState([]);
  const [albaran, setAlbaran] = useState([]);
  const [activeKpi, setActiveKpi] = useState("none");
  const [sinPrecioCount, setSinPrecioCount] = useState(0);
  const [dataQualityCount, setDataQualityCount] = useState(0);
  const [searchPedidos, setSearchPedidos] = useState("");
  const [searchPinturas, setSearchPinturas] = useState("");
  const [showPaintSearch, setShowPaintSearch] = useState(false);
  const [showAddPedido, setShowAddPedido] = useState(false);
  const [activePedidoId, setActivePedidoId] = useState(null);
  const [loadingAlbaran, setLoadingAlbaran] = useState(true);
  const [loadingPinturas, setLoadingPinturas] = useState(true);

  useEffect(() => {
    const period = getCurrentPeriod();

    fetch(`${API}/api/pintura/sin-precio/count`)
      .then((r) => r.json())
      .then((d) => setSinPrecioCount(Number(d?.count || 0)))
      .catch(() => {});

    fetch(
      `${API}/api/analytics/pinturas/data-quality?period=${encodeURIComponent(period)}`,
    )
      .then((r) => r.json())
      .then((d) => setDataQualityCount(Number(d?.attentionCount || 0)))
      .catch(() => {});

    Promise.all([
      fetch(`${API}/`).then((res) => res.json()),
      fetch(`${API}/api/albaranes`).then((res) => res.json()),
    ])
      .then(([pinturasData, albaranData]) => {
        const pinturasSafe =
          !pinturasData?.error && Array.isArray(pinturasData)
            ? pinturasData
            : [];
        setPinturas(pinturasSafe);

        setAlbaran(albaranData);
        setLoadingAlbaran(false);
        setLoadingPinturas(false);
      })
      .catch((error) => {
        toast.error("Error al cargar los datos:", error);
        setLoadingAlbaran(false);
        setLoadingPinturas(false);
      });

    // Escuchar el evento `albaranModificado` desde el servidor
    socket.on("albaranModificado", (data) => {
      console.log("Evento recibido en Home:");
      // Actualizar el estado global `albaran`
      setAlbaran((prevAlbaranes) =>
        prevAlbaranes.map((item) =>
          item.id === data.id ? { ...item, proceso: data.proceso } : item,
        ),
      );
    });

    socket.on("Actualizar_pintura", (data) => {
      setPinturas(Array.isArray(data) ? data : []);
    });

    socket.on("pinturaModificada", (data) => {
      console.log("Evento recibido en Home para pintura:");

      setPinturas((prevPinturas) =>
        prevPinturas.map((item) =>
          item.id === data.id ? { ...item, ...data } : item,
        ),
      );
    });

    socket.on("actualizarAlbaranes", (data) => {
      console.log("Actualización de albaranes recibida:");
      setAlbaran(data);
    });

    socket.on("estadoPedidoActualizado", (data) => {
      console.log("Estado de pedido actualizado:", data);
      const { pedidoId, estado, cambioAutomatico } = data;

      if (cambioAutomatico) {
        toast.info(`Pedido ${pedidoId} cambió a ${estado} por falta de stock`);
      }

      setAlbaran((prevAlbaranes) =>
        prevAlbaranes.map((item) =>
          item.id === pedidoId ? { ...item, proceso: estado } : item,
        ),
      );
    });

    return () => {
      socket.off("Actualizar_pintura");
      socket.off("albaranModificado");
      socket.off("pinturaModificada");
      socket.off("actualizarAlbaranes");
      socket.off("estadoPedidoActualizado");
    };
  }, []);
  const handleAddAlbaran = (nuevoAlbaran) => {
    if (nuevoAlbaran) {
      setShowAddPedido(false);
      setActivePedidoId(null);
      fetch(`${API}/api/albaranes`)
        .then((res) => res.json())
        .then((data) => {
          setAlbaran(data);
          socket.emit("nuevoAlbaran", data);
          toast.success("Albarán añadido correctamente");
        })
        .catch((error) => toast.error("Error al cargar los albaranes:", error));
    }
  };
  function formateaFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }

  const isPlaceholderPintura = (pintura) => {
    const id = String(pintura?.id || "")
      .trim()
      .toUpperCase();
    const ral = String(pintura?.ral || "")
      .trim()
      .toUpperCase();
    return id === "REFNONE" || ral === "SIN ESPECIFICAR";
  };

  const queryPedidos = searchPedidos.trim().toLowerCase();
  const queryPinturas = searchPinturas.trim().toLowerCase();
  const safePinturas = useMemo(
    () => (Array.isArray(pinturas) ? pinturas : []),
    [pinturas],
  );
  const today = new Date();
  const todayText = `${String(today.getDate()).padStart(2, "0")}/${String(today.getMonth() + 1).padStart(2, "0")}/${today.getFullYear()}`;

  const filteredAlbaranes = useMemo(() => {
    let base = albaran;

    if (activeKpi === "today") {
      base = base.filter(
        (item) => item.fecha && formateaFecha(item.fecha) === todayText,
      );
    }

    if (activeKpi === "almacen") {
      base = base.filter((item) => {
        const proceso = String(item.proceso || "").toLowerCase();
        return proceso.includes("en almacén") || proceso.includes("en almacen");
      });
    }

    if (!queryPedidos) return base;
    return base.filter((item) => {
      const refsObra = Array.isArray(item.lineas)
        ? item.lineas
            .map((linea) => String(linea?.refObra || "").trim())
            .filter((ref) => ref && ref !== "-")
        : [];

      const values = [
        item.id,
        item.nCliente,
        item.cliente_nombre,
        item.proceso,
        item.obra,
        item.ral,
        formateaFecha(item.fecha),
        ...refsObra,
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return values.some((value) => value.includes(queryPedidos));
    });
  }, [albaran, queryPedidos, activeKpi, todayText]);

  const filteredPinturas = useMemo(() => {
    let base = safePinturas.filter((pintura) => !isPlaceholderPintura(pintura));

    if (activeKpi === "criticalStock") {
      base = base.filter((pintura) => Number(pintura.stock) < 5);
    }

    if (!queryPinturas) return base;
    return base.filter((pintura) => {
      const values = [pintura.ral, pintura.marca, pintura.stock]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return values.some((value) => value.includes(queryPinturas));
    });
  }, [safePinturas, queryPinturas, activeKpi]);

  const kpiData = useMemo(() => {
    const pedidosHoy = albaran.filter(
      (item) => item.fecha && formateaFecha(item.fecha) === todayText,
    ).length;

    const stockCritico = safePinturas.filter(
      (item) => Number(item.stock) < 5 && !isPlaceholderPintura(item),
    ).length;

    const pendientes = albaran.filter((item) => {
      const proceso = String(item.proceso || "").toLowerCase();
      return proceso.includes("en almacén") || proceso.includes("en almacen");
    }).length;

    return { pedidosHoy, stockCritico, pendientes };
  }, [albaran, safePinturas, todayText]);

  const handleKpiClick = (kpi) => {
    setActiveKpi((prev) => {
      const next = prev === kpi ? "none" : kpi;
      if (next === "criticalStock") {
        setShowPaintSearch(true);
      }
      return next;
    });
  };

  return (
    <section className="home">
      <Nav className="nav" />

      <div className="cuerpo">
        <div className="listaalbaranes">
          <h2 className="panel-title">
            <FiClipboard />
            Pedidos
          </h2>
          <div className="kpi-grid">
            <button
              type="button"
              className={`kpi-card ${activeKpi === "today" ? "kpi-card-active" : ""}`}
              onClick={() => handleKpiClick("today")}
            >
              <span className="kpi-icon kpi-icon-orders">
                <FiTruck />
              </span>
              <span className="kpi-label">Pedidos hoy</span>
              <strong className="kpi-value">{kpiData.pedidosHoy}</strong>
            </button>
            <button
              type="button"
              className={`kpi-card ${activeKpi === "criticalStock" ? "kpi-card-active" : ""}`}
              onClick={() => handleKpiClick("criticalStock")}
            >
              <span className="kpi-icon kpi-icon-critical">
                <FiAlertTriangle />
              </span>
              <span className="kpi-label">Stock critico</span>
              <strong className="kpi-value alert">
                {kpiData.stockCritico}
              </strong>
            </button>
            <button
              type="button"
              className={`kpi-card ${activeKpi === "almacen" ? "kpi-card-active" : ""}`}
              onClick={() => handleKpiClick("almacen")}
            >
              <span className="kpi-icon kpi-icon-pending">
                <FiClock />
              </span>
              <span className="kpi-label">Pendientes</span>
              <strong className="kpi-value">{kpiData.pendientes}</strong>
            </button>
            <button
              type="button"
              className="kpi-card kpi-card--link"
              onClick={() =>
                navigate("/Pinturas", {
                  state: { initialFilter: "sin-precio", initialView: "lista" },
                })
              }
              title="Ir a /Pinturas y revisar pinturas sin precio"
            >
              <span className="kpi-icon kpi-icon-noprice">
                <FiTag />
              </span>
              <span className="kpi-label"> Pinturas sin precio </span>
              <strong
                className={`kpi-value${sinPrecioCount > 0 ? " alert" : ""}`}
              >
                {sinPrecioCount}
              </strong>
            </button>
            <button
              type="button"
              className="kpi-card kpi-card--quality"
              onClick={() =>
                navigate("/Pinturas", {
                  state: { initialView: "resumen" },
                })
              }
              title="Revisar calidad de datos del módulo de pinturas"
            >
              <span className="kpi-icon kpi-icon-quality">
                <FiDatabase />
              </span>
              <span className="kpi-label"> Calidad de dato </span>
              <strong
                className={`kpi-value${dataQualityCount > 0 ? " alert" : ""}`}
              >
                {dataQualityCount}
              </strong>
            </button>
          </div>
          {showAddPedido && (
            <AddPedido
              onAddAlbaran={handleAddAlbaran}
              pedidoId={activePedidoId}
              onClose={() => {
                setShowAddPedido(false);
                setActivePedidoId(null);
              }}
            />
          )}
          <div className="buttons_top">
            <button
              onClick={() => {
                setActivePedidoId(null);
                setShowAddPedido(true);
              }}
            >
              <FiPlus />
              Añadir pedido
            </button>
            <div className="search-box">
              <FiSearch />
              <input
                type="text"
                placeholder="Buscar pedidos"
                value={searchPedidos}
                onChange={(e) => setSearchPedidos(e.target.value)}
              />
            </div>
          </div>
          {loadingAlbaran ? (
            <div className="skeleton-list" aria-hidden="true">
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
              <div className="skeleton-item"></div>
            </div>
          ) : (
            <ListaAlbaran
              albaran={filteredAlbaranes}
              onOpenPedido={(pedidoId) => {
                setActivePedidoId(pedidoId);
                setShowAddPedido(true);
              }}
            />
          )}
        </div>
        <div className="listapinturas">
          <div className="panel-header">
            <h2 className="panel-title">
              <FiDroplet />
              Pintura
            </h2>
            <button
              type="button"
              className="paint-search-toggle"
              onClick={() => setShowPaintSearch((prev) => !prev)}
              aria-label={
                showPaintSearch ? "Cerrar busqueda" : "Abrir busqueda"
              }
              title={showPaintSearch ? "Cerrar busqueda" : "Buscar pinturas"}
            >
              {showPaintSearch ? <FiX /> : <FiSearch />}
            </button>
          </div>
          <div className="buttons_top paint-tools">
            {showPaintSearch && (
              <div className="search-box paint-search-box">
                <FiSearch />
                <input
                  type="text"
                  placeholder="Introducir nombre o RAL"
                  value={searchPinturas}
                  onChange={(e) => setSearchPinturas(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="paint-content">
            {loadingPinturas ? (
              <div className="skeleton-list" aria-hidden="true">
                <div className="skeleton-item small"></div>
                <div className="skeleton-item small"></div>
                <div className="skeleton-item small"></div>
                <div className="skeleton-item small"></div>
                <div className="skeleton-item small"></div>
              </div>
            ) : (
              <LisatPintura
                pinturas={filteredPinturas}
                hasSearchQuery={queryPinturas.length > 0}
              />
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Home;
