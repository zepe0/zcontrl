import Nav from "../Components/Nav";
import "./Materiales.css";
import "../ral.css";
import { useEffect, useState } from "react";
import PinturaCardEdit from "../Components/Pinturas/PinturaCardEdit";
import PinturaForm from "../Components/Pinturas/PinturaForm";
import EntradaMercancia from "./EntradaMercancia";
import { toast } from "react-toastify";
import Loader from "../Components/Loader";
const API = import.meta.env.VITE_API || "localhost";
function Pinturas() {
  const [productos, setProductos] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEntradaOpen, setIsEntradaOpen] = useState(false);
  const [pinturaInicial, setPinturaInicial] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState(null); // null | "low-stock" | "sin-precio"

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

  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase().trim();
    setSearch(query);

    if (query === "") {
      setFilteredProducts([]);
    } else {
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
    }
  };

  useEffect(() => {
    getPinturas();
  }, []);

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

    const coincidencia = textoRal.toString().match(/\d{4}/);

    if (coincidencia) {
      return `RAL-${coincidencia[0]}`;
    }

    const texto = textoRal.toString().toUpperCase();
    if (texto.includes("IMP")) return "ral-imprimacion";
    if (texto.includes("OXI")) return "ral-oxidon";

    return "ral-default";
  };

  const statsData = productos.reduce(
    (acc, p) => {
      const acabados = obtenerAcabados(p?.ral);
      const esValido =
        /^\d/.test(acabados.ralTexto) ||
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

  return (
    <section className="materiales">
      <Nav className="nav"></Nav>
      <div className="cont">
        <div className="pinturas-header">
          <div className="pinturas-stats">
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
                onChange={handleSearch}
              />
            </div>
            <button className="btn-add-pintura" onClick={addEntrada}>
              <span className="btn-add-icon">⚡</span>
              Entrada Mercancia
            </button>
          </div>
        </div>

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
      </div>
      <PinturaForm
        isOpen={isFormOpen}
        onClose={closePinturaForm}
        onSave={handleSavePintura}
        pinturaInicial={pinturaInicial}
      />
      <EntradaMercancia isOpen={isEntradaOpen} onClose={closeEntrada} />
    </section>
  );
}

export default Pinturas;
