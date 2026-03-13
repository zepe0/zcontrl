import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./AddPedido.css";
import "../../ral.css";
import ClienteSearch from "../Clientes/ClienteSearch";
import UploadPedidoFile from "./UploadPedidoFile";
import ReviewPedidoData from "./ReviewPedidoData";
import OrderStatusBar from "./OrderStatusBar";
import { normalizeOrderStatus } from "./logic/orderStatusFlow";
import {
  getLineBaseAmount,
  getLineSubtotal,
  normalizeUnit,
  parseNumber,
} from "./logic/calculosPedido";
import {
  crearAlbaran,
  crearCliente,
  fetchCatalogoMateriales,
  fetchCatalogoPinturas,
  fetchClientes,
  fetchPedidoDetalle,
  updateMaterialLine,
  updatePedidoEstado,
} from "./logic/pedidosApi";
import { toast } from "react-toastify";
import {
  FiCheck,
  FiAlertTriangle,
  FiCreditCard,
  FiEdit3,
  FiEye,
  FiEyeOff,
  FiFileText,
  FiMapPin,
  FiPackage,
  FiPhone,
  FiPrinter,
  FiSave,
  FiSliders,
  FiRotateCcw,
  FiTrash2,
  FiX,
} from "react-icons/fi";
const API = import.meta.env.VITE_API || "localhost";

const moneyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
});

const measureFormatter = new Intl.NumberFormat("es-ES", {
  maximumFractionDigits: 2,
});

const createEmptyMaterialDraft = () => ({
  ref: "",
  mat: "",
  unidad_medida: "ud",
  cantidad: "",
  largo: "",
  ancho: "",
  longitud: "",
  espesor: "",
  unid: "",
  refObra: "",
  ral: "",
  Ral: "",
  precio_unitario: "",
  consumo: "",
});

function MedidasInput({
  unit,
  largo,
  ancho,
  espesor,
  onLargoChange,
  onAnchoChange,
  onEspesorChange,
  largoFieldProps,
  anchoFieldProps,
  espesorFieldProps,
}) {
  return (
    <span className="medidas-editor">
      <span className={`dimension-group unit-${unit}`}>
        {unit !== "ud" && (
          <input
            className={`inline-line-input line-edit-field ${largoFieldProps?.isInvalid ? "validation-focus" : ""}`}
            type="number"
            min="0"
            step="0.01"
            value={largo || ""}
            onChange={onLargoChange}
            placeholder="L"
            aria-invalid={Boolean(largoFieldProps?.isInvalid)}
            {...(largoFieldProps?.attrs || {})}
          />
        )}
        {unit === "m2" && (
          <>
            <span className="measure-multiplier">x</span>
            <input
              className={`inline-line-input line-edit-field ${anchoFieldProps?.isInvalid ? "validation-focus" : ""}`}
              type="number"
              min="0"
              step="0.01"
              value={ancho || ""}
              onChange={onAnchoChange}
              placeholder="A"
              aria-invalid={Boolean(anchoFieldProps?.isInvalid)}
              {...(anchoFieldProps?.attrs || {})}
            />
          </>
        )}
        {unit === "ud" && <span className="dimension-placeholder">-</span>}
      </span>
      <label className="espesor-inline">
        <span>x</span>
        <input
          className={`inline-line-input line-edit-field is-espesor-input ${espesorFieldProps?.isInvalid ? "validation-focus" : ""}`}
          type="number"
          min="0"
          step="0.01"
          value={espesor || ""}
          onChange={onEspesorChange}
          placeholder="0"
          aria-invalid={Boolean(espesorFieldProps?.isInvalid)}
          {...(espesorFieldProps?.attrs || {})}
        />
      </label>
    </span>
  );
}

function AddPedido({ onAddAlbaran, onClose, pedidoId = null }) {
  const [clientes, setClientes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [catalogoMateriales, setCatalogoMateriales] = useState([]);
  const [catalogoPinturas, setCatalogoPinturas] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

  const [pedido, setPedido] = useState({
    numAlbaran: "",
    cliente: "",
    Nif: "",
    tel: "",
    dir: "",
    albaran: materiales,
    firma: null,
    observaciones: "",
    estado: "Borrador",
  });
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    Nif: "",
    tel: "",
    dir: "",
  });
  const [numeroAlbaran, setNumeroAlbaran] = useState("");
  const [isValued, setIsValued] = useState(true);
  const [printMode, setPrintMode] = useState("normal");
  const [draftMaterial, setDraftMaterial] = useState(
    createEmptyMaterialDraft(),
  );
  const [isEditingCliente, setIsEditingCliente] = useState(false);
  const [isAddingCliente, setIsAddingCliente] = useState(false);
  const [lineSavedFlash, setLineSavedFlash] = useState(false);
  const [clienteSavedFlash, setClienteSavedFlash] = useState(false);
  const [showPricePanel, setShowPricePanel] = useState(false);
  const [isEditMode, setIsEditMode] = useState(!pedidoId);
  const [showInlineEditor, setShowInlineEditor] = useState(false);
  const [pedidoRefreshToken, setPedidoRefreshToken] = useState(0);
  const [lineSnapshots, setLineSnapshots] = useState([]);
  const [validationIssues, setValidationIssues] = useState([]);
  const [draftValidationIssues, setDraftValidationIssues] = useState([]);
  const [statusWarningInfo, setStatusWarningInfo] = useState(null);
  const [selectedLineIndexes, setSelectedLineIndexes] = useState([]);
  const [stockAvailability, setStockAvailability] = useState({
    hasIssues: false,
    issues: [],
    missingRals: [],
    message: "",
  });
  const shouldAutoFocusValidationRef = useRef(false);
  const shouldAutoFocusDraftRef = useRef(false);
  const isUpdatingStatusRef = useRef(false);
  const [priceDefaults, setPriceDefaults] = useState({
    ud: 12,
    m2: 23.26,
    ml: 15.38,
  });

  const [clienteActualizado, setClienteActualizado] = useState(0);
  const isViewingPedido = Boolean(pedidoId);

  useEffect(() => {
    setIsEditMode(!isViewingPedido);
    setShowInlineEditor(!isViewingPedido);
  }, [isViewingPedido]);

  useEffect(() => {
    if (!isViewingPedido) {
      numalbaran();
    }
  }, [isViewingPedido]);

  const fetchPedidoData = useCallback(async () => {
    if (!isViewingPedido) return;

    try {
      const data = await fetchPedidoDetalle(API, pedidoId);
      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const pedidoData = data?.pedido || {};
      const cliente = data?.cliente || {};
      const productos = Array.isArray(data?.lineas)
        ? data.lineas
        : Array.isArray(data?.productos)
          ? data.productos
          : [];
      const numero =
        pedidoData?.id ||
        pedidoData?.pedido_id ||
        productos?.[0]?.idALbaran ||
        cliente?.idAlbaran ||
        pedidoId;

      const normalizeDimensionToMm = (value) => {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) return "";
        // Si viene en metros (p.e. 2.00), convertir a mm para mantener cálculo interno actual.
        return n <= 50 ? String(Math.round(n * 1000)) : String(Math.round(n));
      };

      const resolveUnitFromItem = (item) => {
        const raw = String(
          item?.unidad_medida || item?.unidad || item?.tipo_unidad || "",
        )
          .trim()
          .toLowerCase()
          .replace("²", "2");

        if (raw.includes("m2") || raw.includes("superficie") || raw === "3") {
          return "m2";
        }

        if (raw.includes("ml") || raw.includes("lineal") || raw === "2") {
          return "ml";
        }

        if (raw.includes("ud") || raw === "1") {
          return "ud";
        }

        const largo = Number(item?.largo ?? item?.longitud ?? item?.alto) || 0;
        const ancho = Number(item?.ancho) || 0;
        if (largo > 0 && ancho > 0) return "m2";
        if (largo > 0) return "ml";
        return "ud";
      };

      const lineas = productos.map((item) => ({
        ref: item.idMaterial || item.idMateriales || item.producto_id || "",
        mat: item.nombreMaterial || item.mat || "",
        unidad_medida: resolveUnitFromItem(item),
        cantidad: item.cantidad ?? "",
        largo: normalizeDimensionToMm(item.largo || item.longitud || item.alto),
        ancho: normalizeDimensionToMm(item.ancho),
        longitud: normalizeDimensionToMm(
          item.longitud || item.largo || item.alto,
        ),
        espesor: item.espesor ?? "",
        unid: item.unid || item.uni || item.total_unidades_calculadas || "",
        refObra: item.refObra || "",
        ral: item.ral || "",
        Ral: item.ral || "",
        precio_unitario:
          item.precio_unitario ?? item.precioCatalogo ?? item.precio ?? "",
        consumo: item.consumo || "",
        idMaterial: item.idMaterial || item.producto_id || item.idMateriales,
        fabricacion_manual:
          item.fabricacion_manual === 1 ||
          item.fabricacion_manual === "1" ||
          item.fabricacion_manual === true ||
          String(item.fabricacion_manual || "").toLowerCase() === "true" ||
          String(item.fabricacion_manual || "").toLowerCase() === "t"
            ? 1
            : 0,
        fecha_fabricacion_manual: item.fecha_fabricacion_manual || null,
      }));

      setNumeroAlbaran(numero);
      setMateriales(lineas);
      setPedido((prevPedido) => ({
        ...prevPedido,
        numAlbaran: numero,
        id: pedidoData?.id || pedidoData?.pedido_id || numero,
        cliente: cliente.nombre || "",
        Nif: cliente.Nif || "",
        tel: cliente.tel || "",
        dir: cliente.dir || "",
        albaran: lineas,
        observaciones:
          pedidoData?.observaciones ||
          productos?.[0]?.observaciones ||
          data?.observaciones ||
          "",
        estado: normalizeOrderStatus(
          pedidoData?.estado ||
            cliente.proceso ||
            data?.proceso ||
            prevPedido.estado,
        ),
      }));
    } catch (error) {
      toast.error("Error al cargar el pedido", error);
    }
  }, [isViewingPedido, pedidoId]);

  useEffect(() => {
    fetchPedidoData();
  }, [fetchPedidoData, pedidoRefreshToken]);

  useEffect(() => {
    fetchClientes(API)
      .then((cliente) => setClientes(cliente))
      .catch((error) => console.error("Error al cargar clientes:", error));
  }, []);

  useEffect(() => {
    fetchCatalogoMateriales(API)
      .then((data) => setCatalogoMateriales(data))
      .catch(() => setCatalogoMateriales([]));

    fetchCatalogoPinturas(API)
      .then((data) => setCatalogoPinturas(data))
      .catch(() => setCatalogoPinturas([]));
  }, []);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zcontrol.priceDefaults");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      if (parsed && typeof parsed === "object") {
        setPriceDefaults((prev) => ({
          ...prev,
          ud: Number.isFinite(Number(parsed.ud)) ? Number(parsed.ud) : prev.ud,
          m2: Number.isFinite(Number(parsed.m2)) ? Number(parsed.m2) : prev.m2,
          ml: Number.isFinite(Number(parsed.ml)) ? Number(parsed.ml) : prev.ml,
        }));
      }
    } catch {
      // noop
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "zcontrol.priceDefaults",
      JSON.stringify(priceDefaults),
    );
  }, [priceDefaults]);

  useEffect(() => {
    const dialog = document.getElementById("addPedido");
    if (dialog) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return () => {
        if (dialog && dialog.open) {
          dialog.close();
        }
      };
    }
  }, []);

  useEffect(() => {
    const resetPrintMode = () => setPrintMode("normal");
    window.addEventListener("afterprint", resetPrintMode);
    return () => window.removeEventListener("afterprint", resetPrintMode);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const dialog = document.getElementById("addPedido");
        if (dialog && dialog.open) {
          dialog.close();
          closeAllSubdialogs();
          onClose && onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const numalbaran = () => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    const nuevoNumAlbaran = `${dia}${mes}${año}${horas}${minutos}${segundos}`;
    setNumeroAlbaran(nuevoNumAlbaran);
    setPedido((prevPedido) => ({
      ...prevPedido,
      numAlbaran: nuevoNumAlbaran,
    }));
  };

  const handleClienteSeleccionado = (cliente) => {
    shouldAutoFocusValidationRef.current = false;
    setValidationIssues((prev) =>
      prev.filter((issue) => {
        if (issue.scope !== "pedido") return true;
        if (issue.field === "cliente") return false;
        if (issue.field === "Nif") {
          return !String(cliente?.Nif || "").trim();
        }
        return true;
      }),
    );
    setIsEditingCliente(false);
    setPedido((prevPedido) => ({
      ...prevPedido,
      cliente: cliente.nombre,
      Nif: cliente.Nif,
      tel: cliente.tel,
      dir: cliente.dir,
    }));
  };

  const handleClienteFieldChange = (field, value) => {
    shouldAutoFocusValidationRef.current = false;
    setPedido((prevPedido) => ({
      ...prevPedido,
      [field]: value,
    }));

    if (field === "cliente") {
      setValidationIssues((prev) =>
        prev.filter(
          (issue) => !(issue.scope === "pedido" && issue.field === "cliente"),
        ),
      );
    }

    if (field === "Nif") {
      setValidationIssues((prev) =>
        prev.filter(
          (issue) => !(issue.scope === "pedido" && issue.field === "Nif"),
        ),
      );
    }
  };

  const handleNuevoClienteSubmit = async () => {
    if (!String(nuevoCliente.nombre || "").trim()) {
      toast.error("El nombre del cliente es obligatorio");
      return;
    }

    await guardarNuevoCliente(nuevoCliente);
    setIsAddingCliente(false);
    setNuevoCliente({ nombre: "", Nif: "", tel: "", dir: "" });
    setClienteSavedFlash(true);
    setTimeout(() => setClienteSavedFlash(false), 2000);
  };

  const guardarNuevoCliente = async (nuevoClienteData) => {
    await crearCliente(API, nuevoClienteData);

    // Actualiza la lista de clientes y selecciona automáticamente el nuevo cliente
    setClientes((prevClientes) => [...prevClientes, nuevoClienteData]);
    setPedido((prevPedido) => ({
      ...prevPedido,
      cliente: nuevoClienteData.nombre,
      tel: nuevoClienteData.tel,
      dir: nuevoClienteData.dir,
      Nif: nuevoClienteData.Nif,
    }));
    setClienteActualizado((prev) => prev + 1);
  };

  const handleAddCliente = (nombrePrellenado) => {
    setNuevoCliente((prev) => ({ ...prev, nombre: nombrePrellenado })); // Prellena el nombre
    setIsAddingCliente(true); // Activa el modo de agregar cliente
  };

  const handleSaveClienteEdicion = () => {
    setIsEditingCliente(false);
    setClienteSavedFlash(true);
    setTimeout(() => setClienteSavedFlash(false), 2000);
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  // utility to close any secondary modal that may be open
  const closeAllSubdialogs = () => {
    ["reviewPedido"].forEach((id) => {
      const dlg = document.getElementById(id);
      if (dlg && dlg.open) dlg.close();
    });
  };

  const handleAddMaterial = (nuevoMaterial) => {
    setMateriales((prev) => [...prev, nuevoMaterial]);
    setPedido((prevPedido) => ({
      ...prevPedido,
      albaran: [...prevPedido.albaran, nuevoMaterial],
    }));

    if (isEditMode) {
      // Las nuevas líneas no tienen base de comparación para deshacer por fila.
      setLineSnapshots((prev) => [...prev, null]);
    }
  };

  const handleLinePriceChange = (index, rawValue) => {
    const safeValue = rawValue === "" ? "" : Number(rawValue);

    setPedido((prevPedido) => {
      const next = [...prevPedido.albaran];
      next[index] = {
        ...next[index],
        precio_unitario: safeValue,
      };
      return {
        ...prevPedido,
        albaran: next,
      };
    });

    setMateriales((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = {
          ...next[index],
          precio_unitario: safeValue,
        };
      }
      return next;
    });
  };

  const handleRemoveMaterialLine = (indexToRemove) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      albaran: prevPedido.albaran.filter((_, index) => index !== indexToRemove),
    }));

    setMateriales((prev) => prev.filter((_, index) => index !== indexToRemove));
    setLineSnapshots((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );

    setSelectedLineIndexes((prev) =>
      prev
        .filter((idx) => idx !== indexToRemove)
        .map((idx) => (idx > indexToRemove ? idx - 1 : idx)),
    );
  };

  const getLineWithFieldChange = (line, field, value) => {
    const next = {
      ...(line || {}),
      [field]: value,
    };

    if (field === "mat") {
      const selectedMaterial = catalogoMateriales.find(
        (item) => normalizeText(item.nombre) === normalizeText(value),
      );

      if (selectedMaterial) {
        const selectedUnit = normalizeUnit(
          selectedMaterial.unidad_medida ||
            selectedMaterial.unidad ||
            selectedMaterial.uni ||
            selectedMaterial.unidadMedida ||
            next.unidad_medida ||
            "ud",
        );

        next.ref = selectedMaterial.id || next.ref || "";
        next.idMaterial = selectedMaterial.id || next.idMaterial || next.ref;
        next.unidad_medida = selectedUnit;
        next.refObra =
          selectedMaterial.refObra ||
          selectedMaterial.obra ||
          selectedMaterial.referencia ||
          next.refObra ||
          "";

        next.precio_unitario =
          selectedMaterial.precio ??
          selectedMaterial.precio_unitario ??
          next.precio_unitario ??
          getDefaultUnitPrice(selectedUnit);

        next.cantidad = next.cantidad || "1";

        if (selectedUnit === "ml") {
          next.largo = next.largo || next.longitud || "1000";
          next.longitud = next.largo;
          next.ancho = "";
        } else if (selectedUnit === "m2") {
          next.largo = next.largo || next.longitud || "1000";
          next.longitud = next.largo;
          next.ancho = next.ancho || "1000";
        } else {
          next.largo = "";
          next.longitud = "";
          next.ancho = "";
        }
      }
    }

    if (field === "unidad_medida") {
      const unit = normalizeUnit(value);
      next.unidad_medida = unit;
      next.precio_unitario = getDefaultUnitPrice(unit);
      next.cantidad = next.cantidad || "1";

      if (unit === "ud") {
        next.largo = "";
        next.longitud = "";
        next.ancho = "";
      }

      if (unit === "ml") {
        next.largo = next.largo || next.longitud || "1000";
        next.longitud = next.largo;
        next.ancho = "";
      }

      if (unit === "m2") {
        next.largo = next.largo || next.longitud || "1000";
        next.longitud = next.largo;
        next.ancho = next.ancho || "1000";
      }
    }

    if (field === "largo") {
      next.longitud = value;
    }

    if (field === "ral") {
      next.ral = value;
      next.Ral = value;
    }

    return next;
  };

  const handleLineFieldChange = (index, field, value) => {
    clearValidationIssueForChange(index, field);

    setPedido((prevPedido) => {
      const next = [...prevPedido.albaran];
      next[index] = getLineWithFieldChange(next[index], field, value);
      return {
        ...prevPedido,
        albaran: next,
      };
    });

    setMateriales((prev) => {
      const next = [...prev];
      next[index] = getLineWithFieldChange(next[index], field, value);
      return next;
    });
  };

  const handleUndoLineChanges = (index) => {
    const original = lineSnapshots[index];
    if (!original) return;

    const restoredLine = JSON.parse(JSON.stringify(original));

    setPedido((prevPedido) => {
      const next = [...prevPedido.albaran];
      next[index] = restoredLine;
      return {
        ...prevPedido,
        albaran: next,
      };
    });

    setMateriales((prev) => {
      const next = [...prev];
      next[index] = restoredLine;
      return next;
    });
  };

  const getComparableLine = (line) => ({
    mat: String(line?.mat || "").trim(),
    unidad_medida: normalizeUnit(line?.unidad_medida),
    cantidad: String(line?.cantidad ?? "").trim(),
    largo: String(line?.largo ?? line?.longitud ?? "").trim(),
    ancho: String(line?.ancho ?? "").trim(),
    espesor: String(line?.espesor ?? "").trim(),
    refObra: String(line?.refObra || "").trim(),
    ral: String(line?.Ral || line?.ral || "").trim(),
    precio_unitario: String(line?.precio_unitario ?? "").trim(),
    fabricacion_manual: isLineFabricacionManual(line),
  });

  const isLineDirty = (line, index) => {
    const snapshot = lineSnapshots[index];
    if (!snapshot) return false;
    return (
      JSON.stringify(getComparableLine(line)) !==
      JSON.stringify(getComparableLine(snapshot))
    );
  };

  const normalizeText = (value) =>
    String(value || "")
      .trim()
      .toLowerCase();

  const getDefaultUnitPrice = (unitValue) => {
    const unit = normalizeUnit(unitValue);
    const price = priceDefaults[unit];
    return Number.isFinite(Number(price)) ? Number(price) : 0;
  };

  const isLineFabricacionManual = (linea) => {
    const raw = linea?.fabricacion_manual;
    return (
      raw === 1 ||
      raw === "1" ||
      raw === true ||
      raw === "t" ||
      String(raw || "").toLowerCase() === "true"
    );
  };

  const tieneErrorDeStock = (linea, pinturaStock) => {
    const sinStock = !pinturaStock || pinturaStock <= 0;
    return sinStock && Number(linea?.fabricacion_manual) !== 1;
  };

  const buildLineUpdatePayload = (linea, overrides = {}) => {
    const nextManual =
      overrides.fabricacion_manual ?? isLineFabricacionManual(linea);
    const nextManualDate =
      overrides.fecha_fabricacion_manual ??
      (nextManual
        ? linea?.fecha_fabricacion_manual || new Date().toISOString()
        : null);

    return {
      idMaterial: linea?.idMaterial || linea?.ref,
      cantidad: linea?.cantidad,
      ral: linea?.ral || linea?.Ral,
      nombreMaterial: linea?.mat || linea?.nombreMaterial,
      refObra: linea?.refObra,
      pedido_id: pedido.numAlbaran,
      idALbaran: pedido.numAlbaran,
      estado: overrides.estado ?? pedido.estado,
      precio: linea?.precio_unitario,
      precio_unitario: linea?.precio_unitario,
      largo: linea?.largo || linea?.longitud,
      ancho: linea?.ancho,
      espesor: linea?.espesor,
      unidad_medida: normalizeUnit(linea?.unidad_medida),
      fabricacion_manual: nextManual ? 1 : 0,
      fecha_fabricacion_manual: nextManualDate,
    };
  };

  const applyManualLineState = (lineIndex, nextManual, nextDate) => {
    setPedido((prevPedido) => {
      const nextLines = [...(prevPedido?.albaran || [])];
      if (!nextLines[lineIndex]) return prevPedido;
      nextLines[lineIndex] = {
        ...nextLines[lineIndex],
        fabricacion_manual: nextManual ? 1 : 0,
        fecha_fabricacion_manual: nextDate,
      };
      return {
        ...prevPedido,
        albaran: nextLines,
      };
    });

    setMateriales((prev) => {
      const next = [...prev];
      if (!next[lineIndex]) return prev;
      next[lineIndex] = {
        ...next[lineIndex],
        fabricacion_manual: nextManual ? 1 : 0,
        fecha_fabricacion_manual: nextDate,
      };
      return next;
    });
  };

  const persistLineManualState = async (line, nextManual, nextDate) => {
    if (!isViewingPedido) return true;

    try {
      const result = await updateMaterialLine(
        API,
        buildLineUpdatePayload(line, {
          fabricacion_manual: nextManual,
          fecha_fabricacion_manual: nextDate,
        }),
      );

      return result.ok;
    } catch {
      return false;
    }
  };

  const applyManualChangesBatch = async (
    lineIndexes,
    nextManual,
    successMessage,
  ) => {
    const indexes = [...new Set(lineIndexes)].filter(
      (idx) => Number.isInteger(idx) && idx >= 0,
    );

    if (indexes.length === 0) {
      toast.info("No hay líneas para actualizar.");
      return;
    }

    const now = new Date().toISOString();
    const baseLines = Array.isArray(pedido?.albaran) ? pedido.albaran : [];
    const changes = indexes
      .map((idx) => {
        const line = baseLines[idx];
        if (!line) return null;
        const prevManual = isLineFabricacionManual(line);
        const prevDate = line?.fecha_fabricacion_manual || null;
        const nextDate = nextManual
          ? line?.fecha_fabricacion_manual || now
          : null;
        return {
          index: idx,
          line,
          prevManual,
          prevDate,
          nextManual,
          nextDate,
        };
      })
      .filter(Boolean)
      .filter((item) => item.prevManual !== item.nextManual);

    if (changes.length === 0) {
      toast.info("No hay cambios pendientes en las líneas seleccionadas.");
      return;
    }

    const persisted = await Promise.all(
      changes.map((item) =>
        persistLineManualState(item.line, item.nextManual, item.nextDate),
      ),
    );

    const successfulChanges = changes.filter((_, i) => persisted[i]);
    const failedCount = changes.length - successfulChanges.length;

    successfulChanges.forEach((item) => {
      applyManualLineState(item.index, item.nextManual, item.nextDate);
    });

    setSelectedLineIndexes([]);

    if (successfulChanges.length > 0) {
      if (isViewingPedido) {
        setPedidoRefreshToken((prev) => prev + 1);
      }

      const toastId = toast.success(
        <span>
          {successMessage}
          <button
            type="button"
            className="toast-undo-btn"
            onClick={async () => {
              const reverted = await Promise.all(
                successfulChanges.map((item) =>
                  persistLineManualState(
                    item.line,
                    item.prevManual,
                    item.prevDate,
                  ),
                ),
              );

              successfulChanges.forEach((item, idx) => {
                if (reverted[idx]) {
                  applyManualLineState(
                    item.index,
                    item.prevManual,
                    item.prevDate,
                  );
                }
              });

              toast.dismiss(toastId);
              toast.info("Cambios deshechos.");
            }}
          >
            Deshacer
          </button>
        </span>,
        { autoClose: 7000, closeOnClick: false },
      );
    }

    if (failedCount > 0) {
      toast.error(
        `No se pudieron actualizar ${failedCount} línea(s). Revisa la conexión/API.`,
      );
    }
  };

  const handleToggleFabricacionManual = async (lineIndex) => {
    const line = pedido?.albaran?.[lineIndex];
    if (!line) return;

    const currentManual = isLineFabricacionManual(line);
    const nextManual = !currentManual;
    await applyManualChangesBatch(
      [lineIndex],
      nextManual,
      nextManual
        ? "Línea marcada como Hecho manual."
        : "Línea devuelta a control de stock.",
    );
  };

  const normalizeRalKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, " ");

  const extractRalCode = (value) => {
    const raw = String(value || "")
      .trim()
      .toUpperCase();
    if (!raw) return "";

    const match = raw.match(/[A-Z0-9-]+/);
    return match ? match[0] : raw;
  };

  const resolveLineRequiredStock = (linea) => {
    const consumo = parseNumber(linea?.consumo);
    if (consumo > 0) return consumo;
    return parseNumber(linea?.cantidad ?? linea?.unid);
  };

  const checkStockAvailability = useCallback(
    (lineas) => {
      const source = Array.isArray(lineas) ? lineas : [];
      const issues = [];

      source.forEach((linea, index) => {
        if (isLineFabricacionManual(linea)) return;

        const rawRal = String(linea?.Ral || line?.ral || "").trim();
        if (!rawRal || rawRal === "-") return;

        const required = resolveLineRequiredStock(linea);

        const lineRalKey = normalizeRalKey(rawRal);
        const lineRalCode = extractRalCode(rawRal);

        const byExactKey = (catalogoPinturas || []).find(
          (item) =>
            normalizeRalKey(`${item?.ral || ""} ${item?.marca || ""}`) ===
            lineRalKey,
        );

        const byCode =
          byExactKey ||
          (catalogoPinturas || []).find(
            (item) => extractRalCode(item?.ral) === lineRalCode,
          );

        const stock = parseNumber(byCode?.stock);
        const label = byCode
          ? `${byCode.ral || rawRal} ${byCode.marca || ""}`.trim()
          : rawRal;

        if (tieneErrorDeStock(linea, stock)) {
          issues.push({
            lineIndex: index,
            material: String(linea?.mat || linea?.nombreMaterial || "").trim(),
            ral: label || rawRal,
            stock,
            required,
          });
        }
      });

      const missingRals = [...new Set(issues.map((item) => item.ral))];
      return {
        hasIssues: issues.length > 0,
        issues,
        missingRals,
        message:
          issues.length > 0
            ? `Falta stock de: ${missingRals.slice(0, 4).join(", ")}`
            : "",
      };
    },
    [catalogoPinturas],
  );

  const validateStockForStatus = () => {
    const stockCheck = checkStockAvailability(pedido?.albaran);
    return {
      ok: !stockCheck.hasIssues,
      noStockRal: stockCheck.missingRals,
    };
  };

  useEffect(() => {
    const stockCheck = checkStockAvailability(pedido?.albaran);
    setStockAvailability(stockCheck);

    const baseLines = Array.isArray(pedido?.albaran) ? pedido.albaran : [];
    const lineas = (stockCheck.issues || []).map((issue) => {
      const original = baseLines[issue.lineIndex] || {};
      return {
        ...original,
        stockVal: Number(issue.stock) || 0,
        consumoTotal: Number(issue.required) || 0,
        _ralLabel: issue.ral,
      };
    });
    const issues = lineas.filter(
      (l) => l.stockVal < l.consumoTotal && Number(l.fabricacion_manual) !== 1,
    );

    if (issues.length > 0) {
      const missingRals = [
        ...new Set(
          issues
            .map((linea) =>
              String(linea._ralLabel || linea.Ral || linea.ral || "").trim(),
            )
            .filter(Boolean),
        ),
      ];
      setStatusWarningInfo({
        blockedTo: "Pendiente",
        message: `Falta stock de: ${missingRals.slice(0, 4).join(", ")}`,
        missingRals,
      });
      return;
    }

    setStatusWarningInfo(null);
  }, [pedido?.albaran, checkStockAvailability]);

  useEffect(() => {
    const lines = Array.isArray(pedido?.albaran) ? pedido.albaran : [];
    const maxIndex = lines.length - 1;
    setSelectedLineIndexes((prev) =>
      prev.filter(
        (idx) =>
          idx <= maxIndex && Number(lines[idx]?.fabricacion_manual) !== 1,
      ),
    );
  }, [pedido?.albaran]);

  const handleOrderStatusChange = async (nextStatus, context) => {
    const currentStatus = normalizeOrderStatus(pedido?.estado);
    const toStatus = normalizeOrderStatus(nextStatus);

    const canSkipPendingByAdvanced =
      isFullyAdvanced && context?.fromIndex === 1 && context?.toIndex === 3;

    if (
      context &&
      Math.abs(context.toIndex - context.fromIndex) > 1 &&
      !canSkipPendingByAdvanced
    ) {
      return {
        ok: false,
        message: "No puedes saltar etapas del flujo del pedido.",
      };
    }

    if (["EnProceso", "Almacén"].includes(toStatus)) {
      const stockCheck = validateStockForStatus();
      if (!stockCheck.ok) {
        const listado = [...new Set(stockCheck.noStockRal)]
          .slice(0, 3)
          .join(", ");
        const message = listado
          ? `No hay stock de pintura para: ${listado}.`
          : "No hay stock de pintura suficiente para este paso.";

        setPedido((prevPedido) => ({
          ...prevPedido,
          estado: "Pendiente",
        }));

        setStatusWarningInfo({
          blockedTo: "Pendiente",
          message,
          missingRals: stockCheck.noStockRal,
        });
        toast.warning(`Pedido en Pendiente por stock: ${message}`);
        return {
          ok: true,
          message,
          autoStatus: "Pendiente",
        };
      }
    }

    setStatusWarningInfo(null);

    setPedido((prevPedido) => ({
      ...prevPedido,
      estado: toStatus,
    }));

    if (currentStatus !== toStatus) {
      toast.success(`Estado actualizado: ${toStatus}`);
    }

    return { ok: true };
  };

  const stockIssueByLine = useMemo(
    () =>
      new Map(
        (stockAvailability.issues || []).map((issue) => [
          issue.lineIndex,
          issue,
        ]),
      ),
    [stockAvailability],
  );

  const allLineIndexes = useMemo(
    () => (pedido?.albaran || []).map((_, index) => index),
    [pedido?.albaran],
  );

  useEffect(() => {
    if (!isViewingPedido) return;

    const autoUpdateStatus = async () => {
      if (isUpdatingStatusRef.current) return;

      const id = pedido?.id || pedido?.numAlbaran || numeroAlbaran || pedidoId;
      if (!id || id === "nuevo") return;

      const lineas = Array.isArray(pedido?.albaran) ? pedido.albaran : [];
      const todasManuales =
        lineas.length > 0 &&
        lineas.every((l) => Number(l?.fabricacion_manual) === 1);
      const estadoActual = normalizeOrderStatus(pedido?.estado || "");
      const esEstadoInicial =
        estadoActual === "Borrador" || estadoActual === "Confirmado";

      if (!todasManuales || !esEstadoInicial) return;

      try {
        isUpdatingStatusRef.current = true;

        const result = await updatePedidoEstado(API, id, "EnProceso");

        const hasApiError = Boolean(result?.error) || result?.ok === false;
        if (hasApiError) {
          throw new Error(
            result?.data?.error ||
              result?.error ||
              "No se pudo actualizar el estado del pedido.",
          );
        }

        await fetchPedidoData();
        toast.success("Logística: Estado actualizado a 'En proceso'");
      } catch (error) {
        toast.error(
          error?.message ||
            "No se pudo sincronizar el estado automático del pedido.",
        );
      } finally {
        isUpdatingStatusRef.current = false;
      }
    };

    autoUpdateStatus();
  }, [
    isViewingPedido,
    pedido?.id,
    pedido?.estado,
    pedido?.albaran,
    pedido?.numAlbaran,
    numeroAlbaran,
    pedidoId,
    fetchPedidoData,
  ]);

  const areAllLinesSelected =
    allLineIndexes.length > 0 &&
    allLineIndexes.every((idx) => selectedLineIndexes.includes(idx));

  const handleViewInventory = () => {
    window.location.href = "/pinturas";
  };

  const toggleLineSelection = (lineIndex) => {
    setSelectedLineIndexes((prev) =>
      prev.includes(lineIndex)
        ? prev.filter((idx) => idx !== lineIndex)
        : [...prev, lineIndex],
    );
  };

  const toggleSelectAllLines = () => {
    setSelectedLineIndexes((prev) =>
      prev.length === allLineIndexes.length ? [] : allLineIndexes,
    );
  };

  const handleMarkSelectedManual = async () => {
    await applyManualChangesBatch(
      selectedLineIndexes,
      true,
      `${selectedLineIndexes.length} línea(s) marcadas como Hechas manualmente.`,
    );
  };

  const handleCompleteInsufficientManual = async () => {
    const insufficientIndexes = (stockAvailability.issues || []).map(
      (issue) => issue.lineIndex,
    );

    await applyManualChangesBatch(
      insufficientIndexes,
      true,
      "Producción completada manualmente para líneas sin stock.",
    );

    if (isViewingPedido) {
      setPedidoRefreshToken((prev) => prev + 1);
    }
  };

  const mapInputFieldToIssueField = (field) => {
    const map = {
      mat: "nombre",
      cantidad: "unidades",
      largo: "largo",
      ancho: "ancho",
      espesor: "espesor",
      refObra: "refObra",
      ral: "ral",
      precio_unitario: "precio",
      precio: "precio",
    };

    return map[field] || field;
  };

  const isDraftIssueField = (field) =>
    draftValidationIssues.some((issue) => issue.field === field);

  const clearDraftIssueForChange = (field) => {
    shouldAutoFocusDraftRef.current = false;
    const issueField = mapInputFieldToIssueField(field);
    setDraftValidationIssues((prev) =>
      prev.filter((issue) => issue.field !== issueField),
    );
  };

  const getDraftValidationIssues = () => {
    const issues = [];
    const unit = normalizeUnit(draftMaterial?.unidad_medida);
    const cantidad = parseNumber(
      draftMaterial?.cantidad ?? draftMaterial?.unid,
    );
    const largo = parseNumber(draftMaterial?.largo ?? draftMaterial?.longitud);
    const ancho = parseNumber(draftMaterial?.ancho);
    const espesor = parseNumber(draftMaterial?.espesor);
    const precio = parseNumber(draftMaterial?.precio_unitario);
    const ral = String(draftMaterial?.Ral || draftMaterial?.ral || "").trim();

    if (!String(draftMaterial?.mat || "").trim()) {
      issues.push({ field: "nombre" });
    }

    if (cantidad <= 0) {
      issues.push({ field: "unidades" });
    }

    if ((unit === "ml" || unit === "m2") && !largo) {
      issues.push({ field: "largo" });
    }

    if (unit === "m2" && !ancho) {
      issues.push({ field: "ancho" });
    }

    if ((unit === "ml" || unit === "m2") && espesor <= 0) {
      issues.push({ field: "espesor" });
    }

    if (!String(draftMaterial?.refObra || "").trim()) {
      issues.push({ field: "refObra" });
    }

    if (!ral) {
      issues.push({ field: "ral" });
    }

    if (isValued && precio <= 0) {
      issues.push({ field: "precio" });
    }

    return issues;
  };

  const handlePriceDefaultChange = (unit, rawValue) => {
    setPriceDefaults((prev) => ({
      ...prev,
      [unit]: rawValue === "" ? "" : Number(rawValue),
    }));
  };

  const handleDraftMaterialChange = (field, value) => {
    clearDraftIssueForChange(field);

    setDraftMaterial((prev) => {
      const base = prev || createEmptyMaterialDraft();
      const next = {
        ...base,
        [field]: value,
        ...(field === "ral" ? { Ral: value } : {}),
      };

      if (field === "mat") {
        const selectedMaterial = catalogoMateriales.find(
          (item) => normalizeText(item.nombre) === normalizeText(value),
        );

        if (selectedMaterial) {
          const selectedUnit = normalizeUnit(
            selectedMaterial.unidad_medida ||
              selectedMaterial.unidad ||
              selectedMaterial.uni ||
              selectedMaterial.unidadMedida ||
              "ud",
          );

          next.ref = selectedMaterial.id || "";
          next.unidad_medida = selectedUnit;
          next.refObra =
            selectedMaterial.refObra ||
            selectedMaterial.obra ||
            selectedMaterial.referencia ||
            next.refObra ||
            "";

          // Prioriza el precio definido en el artículo; si no existe usa tarifa rápida por unidad.
          next.precio_unitario =
            selectedMaterial.precio ??
            selectedMaterial.precio_unitario ??
            getDefaultUnitPrice(selectedUnit);

          next.consumo = selectedMaterial.consumo ?? "";

          // Autorrelleno base para acelerar la línea.
          next.cantidad = next.cantidad || "1";
          if (selectedUnit === "ml") {
            next.largo = next.largo || next.longitud || "1000";
            next.longitud = next.largo;
            next.ancho = "";
            next.espesor = "";
          } else if (selectedUnit === "m2") {
            next.largo = next.largo || next.alto || "1000";
            next.ancho = next.ancho || "1000";
            next.longitud = next.largo;
          } else {
            next.largo = "";
            next.longitud = "";
            next.ancho = "";
            next.espesor = "";
          }
        }
      }

      if (field === "unidad_medida") {
        const unit = normalizeUnit(value);
        next.unidad_medida = unit;
        next.precio_unitario = getDefaultUnitPrice(unit);
        next.cantidad = next.cantidad || "1";

        if (unit === "ud") {
          next.largo = "";
          next.longitud = "";
          next.ancho = "";
          next.espesor = "";
        }

        if (unit === "ml") {
          next.largo = next.largo || next.longitud || "1000";
          next.longitud = next.largo;
          next.ancho = "";
          next.espesor = "";
        }

        if (unit === "m2") {
          next.largo = next.largo || next.alto || "1000";
          next.ancho = next.ancho || "1000";
          next.longitud = next.largo;
        }
      }

      if (field === "largo") {
        next.longitud = value;
      }

      if (field === "ral") {
        const selectedRal = catalogoPinturas.find(
          (item) =>
            normalizeText(`${item.ral} ${item.marca || ""}`) ===
            normalizeText(value),
        );

        if (selectedRal) {
          next.ral = `${selectedRal.ral} ${selectedRal.marca || ""}`.trim();
          next.Ral = next.ral;
        }
      }

      return next;
    });
  };

  const cancelInlineMaterial = () => {
    shouldAutoFocusDraftRef.current = false;
    setDraftMaterial(createEmptyMaterialDraft());
    setDraftValidationIssues([]);
    setShowInlineEditor(false);
  };

  const saveInlineMaterial = () => {
    const draftIssues = getDraftValidationIssues();
    if (draftIssues.length > 0) {
      shouldAutoFocusDraftRef.current = true;
      setDraftValidationIssues(draftIssues);
      toast.error(
        "Rellena las casillas marcadas en rojo para añadir la línea.",
      );
      return;
    }

    const draftUnit = normalizeUnit(draftMaterial?.unidad_medida);
    const cantidad = parseNumber(
      draftMaterial?.cantidad ?? draftMaterial?.unid,
    );
    const largo = parseNumber(draftMaterial?.largo ?? draftMaterial?.longitud);
    const ancho = parseNumber(draftMaterial?.ancho);

    if (!draftMaterial?.mat || !cantidad || !draftMaterial?.refObra) {
      toast.error("Completa material, unidades y referencia de obra");
      return;
    }

    if (draftUnit === "m2" && (!ancho || !largo)) {
      toast.error("Para m² completa largo y ancho");
      return;
    }

    if (draftUnit === "ml" && !largo) {
      toast.error("Para metros lineales completa la longitud");
      return;
    }

    const baseAmount = getLineBaseAmount(draftMaterial);

    const normalizedMaterial = {
      ...draftMaterial,
      unidad_medida: draftUnit,
      cantidad,
      largo: draftMaterial.largo || draftMaterial.longitud || "",
      longitud: draftMaterial.largo || draftMaterial.longitud || "",
      unid: baseAmount,
      Ral: draftMaterial.Ral || draftMaterial.ral || "",
      fabricacion_manual: false,
      fecha_fabricacion_manual: null,
    };

    handleAddMaterial(normalizedMaterial);
    setDraftMaterial(createEmptyMaterialDraft());
    setDraftValidationIssues([]);
    shouldAutoFocusDraftRef.current = false;
    setShowInlineEditor(false);
    setLineSavedFlash(true);
    setTimeout(() => setLineSavedFlash(false), 2000);
  };

  const handleInlineKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      saveInlineMaterial();
    }
  };

  const handleObservacionesChange = (e) => {
    const { value } = e.target;
    setPedido((prevPedido) => ({
      ...prevPedido,
      observaciones: value,
    }));
  };

  const getRalClass = (ralValue) => {
    const raw = String(ralValue || "");
    const match = raw.match(/\d{3,4}/);
    if (!match) return "";

    const code = match[0];
    const padded = code.padStart(4, "0");

    // Devuelve ambas variantes para cubrir catálogos con o sin cero inicial.
    return `RAL-${padded} RAL-${String(Number(code))}`;
  };

  const getRalText = (material) => material.Ral || material.ral || "-";

  const getTruncatedRalText = (ralValue, maxLength = 12) => {
    const raw = String(ralValue || "-").trim();
    if (!raw || raw === "-") return "-";
    return raw.length > maxLength ? `${raw.slice(0, maxLength)}...` : raw;
  };

  const formatEspesorValue = (value) => {
    const raw = String(value ?? "").trim();
    if (!raw) return "";

    const normalized = raw.replace(",", ".");
    const num = Number(normalized);
    if (!Number.isFinite(num)) return raw;

    const fixed = num.toFixed(2);
    return fixed.endsWith(".00") ? String(Math.trunc(num)) : fixed;
  };

  const getLineDetailParts = (line) => {
    const largoMm = parseNumber(line?.largo ?? line?.alto ?? line?.longitud);
    const anchoMm = parseNumber(line?.ancho);
    const espesorRaw = formatEspesorValue(line?.espesor);

    if (largoMm > 0 && anchoMm > 0) {
      return {
        main: `${measureFormatter.format(largoMm)} x ${measureFormatter.format(anchoMm)} mm`,
        espesor: espesorRaw,
      };
    }

    if (largoMm > 0) {
      return {
        main: `${measureFormatter.format(largoMm)} mm`,
        espesor: espesorRaw,
      };
    }

    return {
      main: "Sin medidas",
      espesor: espesorRaw,
    };
  };

  const getLineUnitsText = (line) => {
    const cantidad = parseNumber(line?.cantidad ?? line?.unid);
    return `${measureFormatter.format(cantidad)} Ud`;
  };

  const getManualCompletionTooltip = (fechaFabricacionManual) => {
    if (!fechaFabricacionManual) return undefined;

    const parsedDate = new Date(fechaFabricacionManual);
    if (Number.isNaN(parsedDate.getTime())) return undefined;

    return `Completado manualmente por el taller el ${parsedDate.toLocaleString("es-ES")}`;
  };

  const getMoneyParts = (value) => {
    const amount = parseNumber(value);
    return {
      number: amount.toLocaleString("es-ES", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
    };
  };

  const shouldShowRalDot = (ralValue) => {
    const raw = String(ralValue || "")
      .trim()
      .toUpperCase();
    return raw && raw !== "-" && raw !== "SIN ESPECIFICAR";
  };

  const getPedidoValidationQueue = () => {
    const issues = [];
    const lineas = Array.isArray(pedido?.albaran) ? pedido.albaran : [];

    if (!String(pedido?.cliente || "").trim()) {
      issues.push({
        scope: "pedido",
        field: "cliente",
        message: "Selecciona un cliente para continuar.",
      });
    }

    if (!String(pedido?.Nif || "").trim()) {
      issues.push({
        scope: "pedido",
        field: "Nif",
        message: "El NIF del cliente es obligatorio.",
      });
    }

    if (lineas.length === 0) {
      issues.push({
        scope: "pedido",
        field: "lineas",
        message: "Anade al menos una linea de material.",
      });
      return issues;
    }

    lineas.forEach((linea, index) => {
      const lineNo = index + 1;
      const unit = normalizeUnit(linea?.unidad_medida);
      const cantidad = parseNumber(linea?.cantidad ?? line?.unid);
      const largo = parseNumber(linea?.largo ?? line?.longitud ?? line?.alto);
      const ancho = parseNumber(linea?.ancho);
      const espesor = parseNumber(linea?.espesor);
      const precio = parseNumber(linea?.precio_unitario);
      const ral = String(linea?.Ral || line?.ral || "").trim();

      if (!String(linea?.mat || linea?.nombreMaterial || "").trim()) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "nombre",
          message: "Completa el nombre/material.",
        });
      }

      if (cantidad <= 0) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "unidades",
          message: "Indica unidades/cantidad mayor que 0.",
        });
      }

      if ((unit === "ml" || unit === "m2") && !largo) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "largo",
          message: "Falta largo para esta unidad.",
        });
      }

      if (unit === "m2" && !ancho) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "ancho",
          message: "Falta ancho para unidad m2.",
        });
      }

      if ((unit === "ml" || unit === "m2") && espesor <= 0) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "espesor",
          message: "Completa el espesor (mm) mayor que 0.",
        });
      }

      if (!String(linea?.refObra || "").trim()) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "refObra",
          message:
            "Falta referencia de obra (si no la tienes ahora, puedes escribir '-').",
        });
      }

      if (!ral) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "ral",
          message: "Falta RAL (si no aplica, puedes escribir '-').",
        });
      }

      if (isValued && precio <= 0) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "precio",
          message: "Indica precio unitario mayor que 0 (modo valorado).",
        });
      }

      if (isViewingPedido && !(linea?.idMaterial || linea?.ref)) {
        issues.push({
          scope: "linea",
          lineNo,
          field: "idMaterial",
          message: "Falta el identificador para actualizar esta linea.",
        });
      }
    });

    return issues;
  };

  const notifyValidationIssues = (issues) => {
    if (!issues?.length) return;

    if (
      issues.some((issue) => issue.scope === "pedido" && issue.field === "Nif")
    ) {
      toast.error(
        "Para guardar el albaran necesitas al menos el NIF del cliente.",
      );
      return;
    }

    toast.error("Rellena las casillas marcadas en rojo.");
  };

  const clearValidationIssueForChange = (index, field) => {
    shouldAutoFocusValidationRef.current = false;
    setValidationIssues((prev) => {
      if (!Array.isArray(prev) || prev.length === 0) return prev;
      const issueField = mapInputFieldToIssueField(field);
      return prev.filter(
        (issue) =>
          !(
            issue.scope === "linea" &&
            issue.lineNo === index + 1 &&
            issue.field === issueField
          ),
      );
    });
  };

  const isPedidoFieldInvalid = (field) =>
    validationIssues.some(
      (issue) => issue.scope === "pedido" && issue.field === field,
    );

  const isIssueField = (index, field) => {
    return validationIssues.some(
      (issue) =>
        issue.scope === "linea" &&
        issue.lineNo === index + 1 &&
        issue.field === field,
    );
  };

  useEffect(() => {
    if (
      !Array.isArray(validationIssues) ||
      validationIssues.length === 0 ||
      !isEditMode
    ) {
      return;
    }

    if (!shouldAutoFocusValidationRef.current) {
      return;
    }

    const getWeight = (issue) => {
      if (issue.scope === "pedido") {
        const pedidoOrder = { cliente: 0, Nif: 1, lineas: 2 };
        return pedidoOrder[issue.field] ?? 999;
      }

      const lineOrder = {
        nombre: 0,
        unidades: 1,
        largo: 2,
        ancho: 3,
        espesor: 4,
        refObra: 5,
        ral: 6,
        precio: 7,
        idMaterial: 8,
      };
      return lineOrder[issue.field] ?? 999;
    };

    const firstIssue = [...validationIssues].sort((a, b) => {
      const lineA = a.lineNo ?? 0;
      const lineB = b.lineNo ?? 0;
      if (lineA !== lineB) return lineA - lineB;
      return getWeight(a) - getWeight(b);
    })[0];
    if (!firstIssue) return;

    if (firstIssue.scope === "pedido") {
      const pedidoTarget = document.querySelector(
        `[data-pedido-field="${firstIssue.field}"]`,
      );
      if (pedidoTarget) {
        pedidoTarget.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    const selector = `[data-line-index="${firstIssue.lineNo - 1}"][data-field="${firstIssue.field}"]`;
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }

    shouldAutoFocusValidationRef.current = false;
  }, [validationIssues, isEditMode]);

  useEffect(() => {
    if (
      !showInlineEditor ||
      !Array.isArray(draftValidationIssues) ||
      draftValidationIssues.length === 0
    ) {
      return;
    }

    if (!shouldAutoFocusDraftRef.current) {
      return;
    }

    const order = {
      nombre: 0,
      unidades: 1,
      largo: 2,
      ancho: 3,
      espesor: 4,
      refObra: 5,
      ral: 6,
      precio: 7,
    };

    const firstIssue = [...draftValidationIssues].sort(
      (a, b) => (order[a.field] ?? 999) - (order[b.field] ?? 999),
    )[0];
    if (!firstIssue) return;

    const selector = `[data-draft-field="${firstIssue.field}"]`;
    const target = document.querySelector(selector);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "center" });
    if (typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }

    shouldAutoFocusDraftRef.current = false;
  }, [draftValidationIssues, showInlineEditor]);

  const handleCancelPedidoEdit = () => {
    setIsEditMode(false);
    setIsEditingCliente(false);
    setShowInlineEditor(false);
    setLineSnapshots([]);
  };

  const totals = pedido.albaran.reduce(
    (acc, item) => {
      const subtotal = getLineSubtotal(item);

      return {
        base: acc.base + subtotal,
      };
    },
    { base: 0 },
  );

  const iva = totals.base * 0.21;
  const total = totals.base + iva;

  const printTrabajo = () => {
    setPrintMode("logistico");
    setTimeout(() => window.print(), 40);
  };

  const printValorado = () => {
    setPrintMode("valorado");
    setTimeout(() => window.print(), 40);
  };

  const Guardaralbaran = async () => {
    const validationQueue = getPedidoValidationQueue();
    const shouldValidateDraft = showInlineEditor;
    const draftIssues = shouldValidateDraft ? getDraftValidationIssues() : [];

    if (validationQueue.length > 0 || draftIssues.length > 0) {
      shouldAutoFocusValidationRef.current = validationQueue.length > 0;
      shouldAutoFocusDraftRef.current = draftIssues.length > 0;
      setValidationIssues(validationQueue);
      setDraftValidationIssues(draftIssues);
      notifyValidationIssues([
        ...validationQueue,
        ...draftIssues.map((issue) => ({ scope: "draft", ...issue })),
      ]);
      return;
    }

    setValidationIssues([]);
    setDraftValidationIssues([]);
    shouldAutoFocusValidationRef.current = false;
    shouldAutoFocusDraftRef.current = false;

    if (isViewingPedido) {
      let anyError = false;

      for (const prod of pedido.albaran) {
        try {
          const result = await updateMaterialLine(
            API,
            buildLineUpdatePayload(prod, { estado: pedido.estado }),
          );

          if (!result.ok) {
            anyError = true;
          }
        } catch {
          anyError = true;
        }
      }

      if (anyError) {
        toast.error("Algunos cambios no se pudieron guardar");
      } else {
        toast.success("Pedido actualizado correctamente");
        setIsEditMode(false);
        onAddAlbaran && onAddAlbaran("updated");
      }
      return;
    }

    const data = await crearAlbaran(API, pedido);

    if (data.error) {
      toast.error(data.error);
    }

    if (data.message) {
      console.log(data.message);
      onAddAlbaran(data.message);
      setPedido({
        numAlbaran: "",
        cliente: "",
        Nif: "",
        tel: "",
        dir: "",
        albaran: [],
        firma: null,
        observaciones: "",
        estado: "Borrador",
      });
      setIsValued(true);
      setDraftMaterial(createEmptyMaterialDraft());
      setMateriales([]);
      document.getElementById("addPedido").close();
      setNumeroAlbaran("");
      setClienteActualizado(0);
      setNuevoCliente({
        nombre: "",
        Nif: "",
        tel: "",
        dir: "",
      });
      setClientes([]);
      fetchClientes(API).then((cliente) => setClientes(cliente));
      fetchCatalogoMateriales(API).then((data) => {
        setMateriales(data);
        onClose();
      });
    }
  };

  const handleDataExtracted = (data) => {
    // Guardar los datos extraídos y mostrar el diálogo de revisión
    setExtractedData(data);
    setShowReview(true);
  };

  const handleReviewConfirm = (reviewedData) => {
    // Procesar los datos revisados y confirmados
    if (reviewedData.cliente) {
      setPedido((prevPedido) => ({
        ...prevPedido,
        cliente: reviewedData.cliente.nombre || "",
        Nif: reviewedData.cliente.Nif || "",
        tel: reviewedData.cliente.tel || "",
        dir: reviewedData.cliente.dir || "",
        numAlbaran: reviewedData.numAlbaran || prevPedido.numAlbaran,
      }));
    }

    if (reviewedData.materiales && Array.isArray(reviewedData.materiales)) {
      setMateriales(reviewedData.materiales);
      setPedido((prevPedido) => ({
        ...prevPedido,
        albaran: reviewedData.materiales,
      }));
    }

    if (reviewedData.observaciones) {
      setPedido((prevPedido) => ({
        ...prevPedido,
        observaciones: reviewedData.observaciones,
      }));
    }

    // Cerrar el diálogo de revisión
    const dialog = document.getElementById("reviewPedido");
    if (dialog) {
      dialog.close();
    }
    setShowReview(false);
    toast.success("Datos del pedido confirmados correctamente");
  };

  const handleReviewCancel = () => {
    // Cerrar el diálogo de revisión sin aplicar cambios
    const dialog = document.getElementById("reviewPedido");
    if (dialog) {
      dialog.close();
    }
    setShowReview(false);
    setExtractedData(null);
  };

  const hasSelectedCliente = Boolean(String(pedido.cliente || "").trim());
  const clienteInitials = String(pedido.cliente || "")
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");
  const phoneDigits = String(pedido.tel || "").replace(/\s+/g, "");
  const mapsUrl = pedido.dir
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(pedido.dir)}`
    : "";
  const phoneUrl = phoneDigits ? `tel:${phoneDigits}` : "";
  const draftUnit = normalizeUnit(draftMaterial?.unidad_medida);
  const lineas = Array.isArray(pedido?.albaran) ? pedido.albaran : [];
  const isFullyAdvanced =
    lineas.length > 0 &&
    lineas.every((l) => Number(l?.fabricacion_manual) === 1);
  const statusBarPedidoId =
    pedido?.id || pedido?.numAlbaran || numeroAlbaran || pedidoId || "nuevo";

  const handleCambiarCliente = () => {
    setIsEditingCliente(false);
    setPedido((prevPedido) => ({
      ...prevPedido,
      cliente: "",
      Nif: "",
      tel: "",
      dir: "",
    }));
    setClienteActualizado((prev) => prev + 1);
  };

  return (
    <section id="addPedidoSection">
      <dialog id="addPedido" className="add-pedido-modal">
        <div className={`add-pedido-header ${isValued ? "valued-header" : ""}`}>
          <div className="pedido-id-box">
            <span className="pedido-id-label">Pedido</span>
            <strong>{numeroAlbaran}</strong>
          </div>
          <OrderStatusBar
            key={`bar-${normalizeOrderStatus(pedido.estado)}-${statusBarPedidoId}`}
            status={normalizeOrderStatus(pedido.estado)}
            onStatusChange={handleOrderStatusChange}
            disabled={!isEditMode}
            warningInfo={statusWarningInfo}
            isFullyAdvanced={isFullyAdvanced}
            className="order-status-inline"
            onViewInventory={handleViewInventory}
          />
          <div className="dialog-buttons-container">
            <div className="dialog-toolbar-group">
              <button
                type="button"
                className={`icon-action-btn valued-toggle ${isValued ? "is-active" : ""}`}
                onClick={() => setIsValued((prev) => !prev)}
                aria-pressed={isValued}
                title={isValued ? "Ocultar precios" : "Mostrar precios"}
              >
                {isValued ? <FiEye /> : <FiEyeOff />}
              </button>
              <button
                type="button"
                className="icon-action-btn btn-print"
                onClick={printTrabajo}
                title="Imprimir trabajo"
                aria-label="Imprimir trabajo"
              >
                <FiFileText />
              </button>
              <button
                type="button"
                className="icon-action-btn btn-print"
                onClick={printValorado}
                title="Imprimir valorado"
                aria-label="Imprimir valorado"
              >
                <FiPrinter />
              </button>
              <UploadPedidoFile onDataExtracted={handleDataExtracted} />
              <div className="price-presets-wrap">
                <button
                  type="button"
                  className={`icon-action-btn btn-print ${showPricePanel ? "is-active" : ""}`}
                  onClick={() => setShowPricePanel((prev) => !prev)}
                  title="Configurar precios rápidos"
                  aria-label="Configurar precios rápidos"
                >
                  <FiSliders />
                </button>
                {showPricePanel && (
                  <div className="price-presets-panel">
                    <p>Precios rápidos por unidad</p>
                    <label>
                      € / Ud
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceDefaults.ud}
                        onChange={(e) =>
                          handlePriceDefaultChange("ud", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      € / ml
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceDefaults.ml}
                        onChange={(e) =>
                          handlePriceDefaultChange("ml", e.target.value)
                        }
                      />
                    </label>
                    <label>
                      € / m²
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={priceDefaults.m2}
                        onChange={(e) =>
                          handlePriceDefaultChange("m2", e.target.value)
                        }
                      />
                    </label>
                    <div className="price-presets-actions">
                      <button
                        type="button"
                        onClick={() =>
                          setPriceDefaults({ ud: 12, m2: 23.26, ml: 15.38 })
                        }
                      >
                        Restablecer
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPricePanel(false)}
                      >
                        Listo
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            {(!isViewingPedido || isEditMode) && (
              <button
                onClick={Guardaralbaran}
                className="btn-guardar"
                type="button"
              >
                {isViewingPedido ? <FiSave /> : <FiCheck />}
                {isViewingPedido ? "Guardar edición" : "Guardar "}
              </button>
            )}
            {isViewingPedido && isEditMode && (
              <button
                type="button"
                className="btn-edit-cancel"
                onClick={handleCancelPedidoEdit}
              >
                <FiX /> Cancelar edición
              </button>
            )}
            {isViewingPedido && !isEditMode && (
              <button
                type="button"
                className="btn-edit-mode"
                onClick={() => {
                  setLineSnapshots(
                    JSON.parse(JSON.stringify(pedido.albaran || [])),
                  );
                  setIsEditMode(true);
                }}
              >
                <FiEdit3 /> Editar pedido
              </button>
            )}
            <button
              className="dialog-close close-action-btn"
              type="button"
              onClick={() => {
                const dialog = document.getElementById("addPedido");
                if (dialog) dialog.close();
                closeAllSubdialogs();
                onClose && onClose();
              }}
            >
              ✖
            </button>
          </div>
        </div>
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
                  onClienteSeleccionado={handleClienteSeleccionado}
                  onAddCliente={handleAddCliente}
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
                    <strong className="cliente-main-name">
                      {pedido.cliente}
                    </strong>
                  </div>
                  <div className="cliente-smart-meta">
                    <button
                      type="button"
                      className="cliente-info-chip cliente-chip-action"
                      title={`Llamar: ${pedido.tel || "Sin teléfono"}`}
                      onClick={() => {
                        if (!phoneUrl) return;
                        window.location.href = phoneUrl;
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
                        onClick={() => setIsEditingCliente(true)}
                      >
                        <FiEdit3 />
                      </button>
                      <button
                        type="button"
                        className="cliente-action-btn"
                        title="Cambiar cliente"
                        onClick={handleCambiarCliente}
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
                    onChange={(e) =>
                      handleClienteFieldChange("cliente", e.target.value)
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
                    onChange={(e) =>
                      handleClienteFieldChange("Nif", e.target.value)
                    }
                  />
                </div>
                <div className="field-group">
                  <label>Telefono</label>
                  <input
                    type="text"
                    name="tel"
                    value={pedido.tel}
                    onChange={(e) =>
                      handleClienteFieldChange("tel", e.target.value)
                    }
                  />
                </div>
                <div className="field-group cliente-col-span-2">
                  <label>Direccion</label>
                  <input
                    type="text"
                    name="dir"
                    value={pedido.dir}
                    onChange={(e) =>
                      handleClienteFieldChange("dir", e.target.value)
                    }
                  />
                </div>
                <div className="cliente-edit-actions full-width">
                  <button
                    type="button"
                    className="cliente-action-btn"
                    title="Guardar cambios"
                    onClick={handleSaveClienteEdicion}
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
                    onChange={handleNuevoClienteChange}
                  />
                </div>
                <div className="field-group">
                  <label>NIF</label>
                  <input
                    type="text"
                    name="Nif"
                    value={nuevoCliente.Nif}
                    onChange={handleNuevoClienteChange}
                  />
                </div>
                <div className="field-group">
                  <label>Telefono</label>
                  <input
                    type="text"
                    name="tel"
                    value={nuevoCliente.tel}
                    onChange={handleNuevoClienteChange}
                  />
                </div>
                <div className="field-group cliente-col-span-2">
                  <label>Direccion</label>
                  <input
                    type="text"
                    name="dir"
                    value={nuevoCliente.dir}
                    onChange={handleNuevoClienteChange}
                  />
                </div>
                <div className="cliente-edit-actions full-width">
                  <button
                    type="button"
                    className="cliente-action-btn"
                    title="Guardar nuevo cliente"
                    onClick={handleNuevoClienteSubmit}
                  >
                    <FiCheck />
                  </button>
                  <button
                    type="button"
                    className="cliente-action-btn"
                    title="Cancelar"
                    onClick={() => {
                      setIsAddingCliente(false);
                      setNuevoCliente({
                        nombre: "",
                        Nif: "",
                        tel: "",
                        dir: "",
                      });
                    }}
                  >
                    <FiX />
                  </button>
                </div>
              </div>
            )}
          </div>
        </form>

        <section className="lineas-block">
          <div className="lineas-header">
            <h3>Lineas de pedido</h3>
            <div className="lineas-header-actions">
              <button
                type="button"
                className="bulk-manual-btn"
                onClick={handleCompleteInsufficientManual}
                disabled={stockAvailability.issues.length === 0}
                title="Marcar como Hechas manualmente todas las líneas con stock insuficiente"
              >
                Completar producción manualmente
              </button>
              {selectedLineIndexes.length > 0 && (
                <button
                  type="button"
                  className="bulk-selected-btn"
                  onClick={handleMarkSelectedManual}
                >
                  Marcar seleccionadas como Hechas ({selectedLineIndexes.length}
                  )
                </button>
              )}
              {isEditMode && (
                <button
                  type="button"
                  className="add-line-toggle"
                  onClick={() => setShowInlineEditor((prev) => !prev)}
                >
                  {showInlineEditor
                    ? "Cerrar nueva línea"
                    : "+ Añadir nueva línea"}
                </button>
              )}
            </div>
            <span
              className={`saved-pill ${lineSavedFlash ? "is-visible" : ""}`}
            >
              <FiCheck />
              Linea guardada
            </span>
          </div>

          <div
            className={`AlbaranMateriales ${isValued ? "valued-mode" : ""} ${printMode === "logistico" ? "print-logistico" : ""}`}
          >
            <ul className="albaran-static-lines">
              <li className="AlbaranMaterialitem">
                <p className="line-select-col">
                  <input
                    type="checkbox"
                    className="line-selector-checkbox"
                    checked={areAllLinesSelected}
                    onChange={toggleSelectAllLines}
                    aria-label="Seleccionar todas las líneas"
                  />
                </p>
                <p>Nombre</p>
                <p>Unidades</p>
                <p>Medidas</p>
                <p>R.Obra</p>
                <p>Ral</p>
                <p
                  className={`no-print-logistico ${isValued ? "" : "column-placeholder"}`}
                >
                  {isValued ? "P. Unitario" : ""}
                </p>
                <p
                  className={`no-print-logistico ${isValued ? "" : "column-placeholder"}`}
                >
                  {isValued ? "Subtotal" : ""}
                </p>
                <p className="actions-col-header"></p>
              </li>

              {isEditMode && showInlineEditor && (
                <li className="AlbaranMaterialitem inline-material-row">
                  <p className="line-select-col"></p>
                  <p>
                    <div className="material-input-with-unit">
                      <input
                        list={
                          draftMaterial.mat.trim().length >= 2
                            ? "materiales-catalogo"
                            : undefined
                        }
                        className={`inline-line-input line-edit-field ${isDraftIssueField("nombre") ? "validation-focus" : ""}`}
                        type="text"
                        value={draftMaterial.mat}
                        onChange={(e) =>
                          handleDraftMaterialChange("mat", e.target.value)
                        }
                        onKeyDown={handleInlineKeyDown}
                        placeholder="Material"
                        aria-invalid={isDraftIssueField("nombre")}
                        data-draft-field="nombre"
                      />
                      <select
                        className="unit-select line-edit-field"
                        value={draftUnit}
                        onChange={(e) =>
                          handleDraftMaterialChange(
                            "unidad_medida",
                            e.target.value,
                          )
                        }
                        title="Unidad de medida"
                      >
                        <option value="ud">Ud</option>
                        <option value="ml">ml</option>
                        <option value="m2">m²</option>
                      </select>
                    </div>
                  </p>
                  <p className="units-cell">
                    <input
                      className={`inline-line-input line-edit-field ${isDraftIssueField("unidades") ? "validation-focus" : ""}`}
                      type="number"
                      min="0"
                      step="1"
                      value={draftMaterial.cantidad}
                      onChange={(e) =>
                        handleDraftMaterialChange("cantidad", e.target.value)
                      }
                      onKeyDown={handleInlineKeyDown}
                      placeholder="Cant."
                      aria-invalid={isDraftIssueField("unidades")}
                      data-draft-field="unidades"
                    />
                  </p>
                  <p className="measure-cell">
                    <div className="measure-inputs">
                      <MedidasInput
                        unit={draftUnit}
                        largo={draftMaterial.largo || draftMaterial.longitud}
                        ancho={draftMaterial.ancho}
                        espesor={draftMaterial.espesor}
                        onLargoChange={(e) =>
                          handleDraftMaterialChange("largo", e.target.value)
                        }
                        onAnchoChange={(e) =>
                          handleDraftMaterialChange("ancho", e.target.value)
                        }
                        onEspesorChange={(e) =>
                          handleDraftMaterialChange("espesor", e.target.value)
                        }
                        largoFieldProps={{
                          isInvalid: isDraftIssueField("largo"),
                          attrs: {
                            "data-draft-field": "largo",
                          },
                        }}
                        anchoFieldProps={{
                          isInvalid: isDraftIssueField("ancho"),
                          attrs: {
                            "data-draft-field": "ancho",
                          },
                        }}
                        espesorFieldProps={{
                          isInvalid: isDraftIssueField("espesor"),
                          attrs: {
                            "data-draft-field": "espesor",
                          },
                        }}
                      />
                    </div>
                  </p>
                  <p>
                    <input
                      className={`inline-line-input line-edit-field ${isDraftIssueField("refObra") ? "validation-focus" : ""}`}
                      type="text"
                      value={draftMaterial.refObra}
                      onChange={(e) =>
                        handleDraftMaterialChange("refObra", e.target.value)
                      }
                      onKeyDown={handleInlineKeyDown}
                      placeholder="R. Obra"
                      aria-invalid={isDraftIssueField("refObra")}
                      data-draft-field="refObra"
                    />
                  </p>
                  <p className="ral-cell inline-ral-field">
                    <input
                      list="ral-catalogo"
                      className={`inline-line-input line-edit-field ${isDraftIssueField("ral") ? "validation-focus" : ""}`}
                      type="text"
                      value={draftMaterial.ral}
                      onChange={(e) =>
                        handleDraftMaterialChange("ral", e.target.value)
                      }
                      onKeyDown={handleInlineKeyDown}
                      placeholder="RAL"
                      aria-invalid={isDraftIssueField("ral")}
                      data-draft-field="ral"
                    />
                    {shouldShowRalDot(
                      draftMaterial.Ral || draftMaterial.ral,
                    ) && (
                      <span
                        className={`ral-dot ${getRalClass(draftMaterial.Ral || draftMaterial.ral)}`}
                      ></span>
                    )}
                  </p>
                  <p
                    className={`price-cell ${isValued ? "" : "column-placeholder"}`}
                  >
                    <input
                      className={`line-price-input line-edit-field ${isValued ? "" : "line-price-input-hidden"} ${isDraftIssueField("precio") ? "validation-focus" : ""}`}
                      type="number"
                      min="0"
                      step="0.01"
                      value={
                        isValued ? (draftMaterial.precio_unitario ?? "") : ""
                      }
                      onChange={(e) =>
                        handleDraftMaterialChange(
                          "precio_unitario",
                          e.target.value,
                        )
                      }
                      onKeyDown={handleInlineKeyDown}
                      placeholder="0,00"
                      disabled={!isValued}
                      tabIndex={isValued ? 0 : -1}
                      aria-invalid={isDraftIssueField("precio")}
                      data-draft-field="precio"
                    />
                  </p>
                  <p
                    className={`subtotal-cell ${isValued ? "" : "column-placeholder"}`}
                  >
                    <span className={isValued ? "" : "subtotal-placeholder"}>
                      {isValued
                        ? moneyFormatter.format(getLineSubtotal(draftMaterial))
                        : moneyFormatter.format(0)}
                    </span>
                  </p>
                  <div className="inline-line-actions actions-col-cell">
                    <button
                      type="button"
                      className="inline-line-btn save"
                      onClick={saveInlineMaterial}
                      title="Guardar línea"
                    >
                      <FiCheck />
                    </button>
                    <button
                      type="button"
                      className="inline-line-btn cancel"
                      onClick={cancelInlineMaterial}
                      title="Cancelar línea"
                    >
                      <FiX />
                    </button>
                  </div>
                </li>
              )}
            </ul>

            <ul
              className={`albaran-added-lines ${isEditMode ? "is-editing" : ""}`}
            >
              {lineas.length === 0 && (
                <li className="albaran-empty-inline">
                  <FiPackage className="empty-state-icon" />
                  Aun no hay materiales en este pedido. Empieza anadiendo uno
                  arriba.
                </li>
              )}
              {lineas.map((material, index) =>
                (() => {
                  const stockIssue = stockIssueByLine.get(index);
                  const linea = material;
                  const isManual = Number(linea.fabricacion_manual) === 1;
                  const hasStockIssue = Boolean(stockIssue) && !isManual;
                  const rowToneClass = isManual
                    ? "row-manual-success"
                    : hasStockIssue
                      ? "row-error"
                      : "";
                  const stockTooltip = hasStockIssue
                    ? `Stock actual: ${stockIssue.stock.toLocaleString("es-ES", { maximumFractionDigits: 2 })}kg | Necesario: ${stockIssue.required.toLocaleString("es-ES", { maximumFractionDigits: 2 })}kg`
                    : "";

                  return (
                    <li
                      key={index}
                      className={`linea-item AlbaranMaterialitem added-material-row ${isEditMode ? "is-editable-row" : ""} ${rowToneClass}`}
                    >
                      <p className="line-select-col">
                        {!isManual ? (
                          <input
                            type="checkbox"
                            className="line-selector-checkbox"
                            checked={selectedLineIndexes.includes(index)}
                            onChange={() => toggleLineSelection(index)}
                            aria-label={`Seleccionar línea ${index + 1}`}
                          />
                        ) : (
                          <span
                            className="line-selector-placeholder"
                            aria-hidden="true"
                          />
                        )}
                      </p>
                      <p className="material-name-cell">
                        {isEditMode ? (
                          <>
                            <span className="material-input-with-unit">
                              <input
                                list="materiales-catalogo"
                                className={`inline-line-input line-edit-field ${isIssueField(index, "nombre") ? "validation-focus" : ""}`}
                                type="text"
                                value={material.mat || ""}
                                disabled={isManual}
                                onChange={(e) =>
                                  handleLineFieldChange(
                                    index,
                                    "mat",
                                    e.target.value,
                                  )
                                }
                                placeholder="Material"
                                aria-invalid={isIssueField(index, "nombre")}
                                data-line-index={index}
                                data-field="nombre"
                              />
                              <select
                                className="unit-select line-edit-field"
                                value={normalizeUnit(material.unidad_medida)}
                                disabled={isManual}
                                onChange={(e) =>
                                  handleLineFieldChange(
                                    index,
                                    "unidad_medida",
                                    e.target.value,
                                  )
                                }
                                title="Unidad de medida"
                              >
                                <option value="ud">Ud</option>
                                <option value="ml">ml</option>
                                <option value="m2">m²</option>
                              </select>
                            </span>
                            {isManual && (
                              <span
                                className="manual-check-icon"
                                title={getManualCompletionTooltip(
                                  material.fecha_fabricacion_manual,
                                )}
                              >
                                <FiCheck />
                              </span>
                            )}
                            {hasStockIssue && (
                              <span
                                className="line-stock-warning-icon"
                                title={stockTooltip}
                              >
                                <FiAlertTriangle />
                              </span>
                            )}
                          </>
                        ) : (
                          <span className="material-name-with-warning">
                            <span>{material.mat}</span>
                            {isManual && (
                              <span
                                className="manual-check-icon"
                                title={getManualCompletionTooltip(
                                  material.fecha_fabricacion_manual,
                                )}
                              >
                                <FiCheck />
                              </span>
                            )}
                            {hasStockIssue && (
                              <span
                                className="line-stock-warning-icon"
                                title={stockTooltip}
                              >
                                <FiAlertTriangle />
                              </span>
                            )}
                          </span>
                        )}
                      </p>
                      <p className="units-cell">
                        {isEditMode ? (
                          <input
                            className={`inline-line-input line-edit-field ${isIssueField(index, "unidades") ? "validation-focus" : ""}`}
                            type="number"
                            min="0"
                            step="1"
                            value={material.cantidad ?? ""}
                            disabled={isManual}
                            onChange={(e) =>
                              handleLineFieldChange(
                                index,
                                "cantidad",
                                e.target.value,
                              )
                            }
                            placeholder="Cant."
                            aria-invalid={isIssueField(index, "unidades")}
                            data-line-index={index}
                            data-field="unidades"
                          />
                        ) : (
                          getLineUnitsText(material)
                        )}
                      </p>
                      {isEditMode ? (
                        <p className="measure-cell">
                          <MedidasInput
                            unit={normalizeUnit(material.unidad_medida)}
                            largo={material.largo || material.longitud || ""}
                            ancho={material.ancho || ""}
                            espesor={material.espesor || ""}
                            onLargoChange={(e) =>
                              handleLineFieldChange(
                                index,
                                "largo",
                                e.target.value,
                              )
                            }
                            onAnchoChange={(e) =>
                              handleLineFieldChange(
                                index,
                                "ancho",
                                e.target.value,
                              )
                            }
                            onEspesorChange={(e) =>
                              handleLineFieldChange(
                                index,
                                "espesor",
                                e.target.value,
                              )
                            }
                            largoFieldProps={{
                              isInvalid: isIssueField(index, "largo"),
                              attrs: {
                                "data-line-index": index,
                                "data-field": "largo",
                                disabled: isManual,
                              },
                            }}
                            anchoFieldProps={{
                              isInvalid: isIssueField(index, "ancho"),
                              attrs: {
                                "data-line-index": index,
                                "data-field": "ancho",
                                disabled: isManual,
                              },
                            }}
                            espesorFieldProps={{
                              isInvalid: isIssueField(index, "espesor"),
                              attrs: {
                                "data-line-index": index,
                                "data-field": "espesor",
                                disabled: isManual,
                              },
                            }}
                          />
                        </p>
                      ) : (
                        (() => {
                          const detail = getLineDetailParts(material);
                          return (
                            <p className="measure-summary">
                              <span>{detail.main}</span>
                              {detail.espesor && (
                                <span className="espesor-tag">
                                  E: {detail.espesor}
                                </span>
                              )}
                            </p>
                          );
                        })()
                      )}
                      <p>
                        {isEditMode ? (
                          <input
                            className={`inline-line-input line-edit-field ${isIssueField(index, "refObra") ? "validation-focus" : ""}`}
                            type="text"
                            value={material.refObra || ""}
                            disabled={isManual}
                            onChange={(e) =>
                              handleLineFieldChange(
                                index,
                                "refObra",
                                e.target.value,
                              )
                            }
                            placeholder="R. Obra"
                            aria-invalid={isIssueField(index, "refObra")}
                            data-line-index={index}
                            data-field="refObra"
                          />
                        ) : (
                          material.refObra
                        )}
                      </p>
                      <p className="ral-cell">
                        {isEditMode ? (
                          <input
                            list="ral-catalogo"
                            className={`inline-line-input line-edit-field ${isIssueField(index, "ral") ? "validation-focus" : ""}`}
                            type="text"
                            value={material.Ral || material.ral || ""}
                            disabled={isManual}
                            onChange={(e) =>
                              handleLineFieldChange(
                                index,
                                "ral",
                                e.target.value,
                              )
                            }
                            placeholder="RAL"
                            aria-invalid={isIssueField(index, "ral")}
                            data-line-index={index}
                            data-field="ral"
                          />
                        ) : (
                          <span
                            className="ral-text"
                            title={getRalText(material)}
                            aria-label={getRalText(material)}
                          >
                            {getTruncatedRalText(getRalText(material), 12)}
                          </span>
                        )}
                        {shouldShowRalDot(getRalText(material)) && (
                          <span
                            className={`ral-dot ${getRalClass(getRalText(material))}`}
                          ></span>
                        )}
                      </p>
                      <p
                        className={`no-print-logistico price-cell ${isValued ? "" : "column-placeholder"}`}
                      >
                        {isEditMode ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={
                              isValued ? (material.precio_unitario ?? "") : ""
                            }
                            onChange={(e) => {
                              clearValidationIssueForChange(
                                index,
                                "precio_unitario",
                              );
                              handleLinePriceChange(index, e.target.value);
                            }}
                            placeholder="0,00"
                            disabled={!isValued || isManual}
                            tabIndex={isValued ? 0 : -1}
                            className={`line-price-input line-edit-field ${isValued ? "" : "line-price-input-hidden"} ${isIssueField(index, "precio") ? "validation-focus" : ""}`}
                            aria-invalid={isIssueField(index, "precio")}
                            data-line-index={index}
                            data-field="precio"
                          />
                        ) : (
                          <span className="line-price-readonly">
                            {isValued ? (
                              <>
                                <span className="money-value">
                                  {
                                    getMoneyParts(material.precio_unitario)
                                      .number
                                  }
                                </span>
                                <span className="money-currency">€</span>
                              </>
                            ) : (
                              "-"
                            )}
                          </span>
                        )}
                      </p>
                      <p
                        id="subtotal"
                        className={`no-print-logistico subtotal-cell ${isValued ? "" : "column-placeholder"}`}
                      >
                        <span
                          className={isValued ? "" : "subtotal-placeholder"}
                        >
                          {isValued ? (
                            <span className="line-price-readonly">
                              <span className="money-value">
                                {
                                  getMoneyParts(getLineSubtotal(material))
                                    .number
                                }
                              </span>
                              <span className="money-currency">€</span>
                            </span>
                          ) : (
                            <span className="line-price-readonly">
                              <span className="money-value">0,00</span>
                              <span className="money-currency">€</span>
                            </span>
                          )}
                        </span>
                      </p>
                      <div className="added-line-actions actions-col-cell">
                        {isManual ? (
                          <button
                            type="button"
                            className="inline-line-btn manual-reset"
                            onClick={() => handleToggleFabricacionManual(index)}
                            title="Deshacer producción adelantada"
                          >
                            <FiRotateCcw />
                          </button>
                        ) : (
                          <>
                            <button
                              type="button"
                              className="inline-line-btn manual-toggle"
                              onClick={() =>
                                handleToggleFabricacionManual(index)
                              }
                              title="Marcar como Hecho manual"
                            >
                              <FiCheck />
                            </button>
                            {isEditMode &&
                              isLineDirty(material, index) &&
                              lineSnapshots[index] && (
                                <button
                                  type="button"
                                  className="inline-line-btn undo"
                                  onClick={() => handleUndoLineChanges(index)}
                                  title="Deshacer cambios de esta línea"
                                >
                                  <FiRotateCcw />
                                </button>
                              )}
                            {isEditMode && (
                              <button
                                type="button"
                                className="inline-line-btn delete"
                                onClick={() => handleRemoveMaterialLine(index)}
                                title="Eliminar línea"
                              >
                                <FiTrash2 />
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  );
                })(),
              )}
            </ul>
          </div>
        </section>

        <div className="dialog-footer split-footer">
          <div className={`obs-panel ${isValued ? "obs-panel-valued" : ""}`}>
            <label>Observaciones</label>
            <textarea
              placeholder="Observaciones"
              value={pedido.observaciones}
              onChange={handleObservacionesChange}
              readOnly={!isEditMode}
            />
          </div>
          {isValued && (
            <div className="totals-footer footer-totals no-print-logistico">
              <p>
                Base imponible:{" "}
                <strong>{moneyFormatter.format(totals.base)}</strong>
              </p>
              <p>
                IVA (21%): <strong>{moneyFormatter.format(iva)}</strong>
              </p>
              <p className="total-final">
                Total: <strong>{moneyFormatter.format(total)}</strong>
              </p>
            </div>
          )}
        </div>
      </dialog>
      <datalist id="materiales-catalogo">
        {catalogoMateriales.map((material) => (
          <option key={material.id} value={material.nombre} />
        ))}
      </datalist>
      <datalist id="ral-catalogo">
        {catalogoPinturas.map((pintura) => (
          <option
            key={pintura.id}
            value={`${pintura.ral} ${pintura.marca || ""}`.trim()}
          />
        ))}
      </datalist>
      {showReview && extractedData && (
        <ReviewPedidoData
          extractedData={extractedData}
          onConfirm={handleReviewConfirm}
          onCancel={handleReviewCancel}
        />
      )}
    </section>
  );
}
export default AddPedido;
