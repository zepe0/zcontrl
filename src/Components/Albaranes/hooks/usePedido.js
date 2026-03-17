import { useCallback, useEffect, useMemo, useReducer } from "react";
import { normalizeOrderStatus } from "../logic/orderStatusFlow";
import {
  calculatePaintConsumption,
  getLineBaseAmount,
  getPedidoTotals,
  normalizeUnit,
  parseNumber,
  resolveLineRequiredStock,
} from "../logic/calculosPedido";
import {
  fetchCatalogoMateriales,
  fetchCatalogoPinturas,
  fetchClientes,
  fetchPedidoDetalle,
} from "../logic/pedidosApi";
import {
  createEmptyMaterialDraft,
  createInitialPedidoState,
  pedidoActionTypes,
  pedidoReducer,
} from "./pedidoReducer";

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

const normalizeDimensionToMm = (value) => {
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue <= 0) return "";
  return numericValue <= 50
    ? String(Math.round(numericValue * 1000))
    : String(Math.round(numericValue));
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

const mapApiLineToPedidoLine = (item) => ({
  ref: item.idMaterial || item.idMateriales || item.producto_id || "",
  mat: item.nombreMaterial || item.mat || "",
  unidad_medida: resolveUnitFromItem(item),
  cantidad: item.cantidad ?? "",
  largo: normalizeDimensionToMm(item.largo || item.longitud || item.alto),
  ancho: normalizeDimensionToMm(item.ancho),
  longitud: normalizeDimensionToMm(item.longitud || item.largo || item.alto),
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
});

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

export const usePedido = ({ apiBase, pedidoId = null, onError } = {}) => {
  const [state, dispatch] = useReducer(
    pedidoReducer,
    createInitialPedidoState(pedidoId),
  );

  const isViewingPedido = state.flags.isViewingPedido;

  const generateNumeroAlbaran = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const nextNumeroAlbaran = `${day}${month}${year}${hours}${minutes}${seconds}`;

    dispatch({
      type: pedidoActionTypes.SET_NUMERO_ALBARAN,
      payload: nextNumeroAlbaran,
    });
  }, []);

  const hydratePedido = useCallback(async () => {
    if (!isViewingPedido || !pedidoId) return;

    try {
      const data = await fetchPedidoDetalle(apiBase, pedidoId);
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

      const lineas = productos.map(mapApiLineToPedidoLine);

      dispatch({
        type: pedidoActionTypes.SET_NUMERO_ALBARAN,
        payload: numero,
      });
      dispatch({
        type: pedidoActionTypes.SET_PEDIDO,
        payload: {
          id: pedidoData?.id || pedidoData?.pedido_id || numero,
          numAlbaran: numero,
          cliente: cliente.nombre || "",
          Nif: cliente.Nif || "",
          tel: cliente.tel || "",
          dir: cliente.dir || "",
          albaran: lineas,
          firma: null,
          observaciones:
            pedidoData?.observaciones ||
            productos?.[0]?.observaciones ||
            data?.observaciones ||
            "",
          estado: normalizeOrderStatus(
            pedidoData?.estado ||
              cliente.proceso ||
              data?.proceso ||
              "Borrador",
          ),
        },
      });
    } catch (error) {
      onError?.(error);
    }
  }, [apiBase, isViewingPedido, onError, pedidoId]);

  const loadCatalogs = useCallback(async () => {
    try {
      const [clientes, materiales, pinturas] = await Promise.all([
        fetchClientes(apiBase),
        fetchCatalogoMateriales(apiBase),
        fetchCatalogoPinturas(apiBase),
      ]);

      dispatch({
        type: pedidoActionTypes.SET_CLIENTES,
        payload: clientes || [],
      });
      dispatch({
        type: pedidoActionTypes.SET_CATALOGOS,
        payload: {
          materiales: materiales || [],
          pinturas: pinturas || [],
        },
      });
    } catch (error) {
      onError?.(error);
    }
  }, [apiBase, onError]);

  const getDefaultUnitPrice = useCallback(
    (unitValue) => {
      const unit = normalizeUnit(unitValue);
      const price = state.preferences.priceDefaults[unit];
      return Number.isFinite(Number(price)) ? Number(price) : 0;
    },
    [state.preferences.priceDefaults],
  );

  const syncCalculatedLine = useCallback(
    (line, field, value) => {
      const nextLine = {
        ...(line || {}),
        [field]: value,
      };

      if (field === "mat") {
        const selectedMaterial = state.catalogos.materiales.find(
          (item) => normalizeText(item.nombre) === normalizeText(value),
        );

        if (selectedMaterial) {
          const selectedUnit = normalizeUnit(
            selectedMaterial.unidad_medida ||
              selectedMaterial.unidad ||
              selectedMaterial.uni ||
              selectedMaterial.unidadMedida ||
              nextLine.unidad_medida ||
              "ud",
          );

          nextLine.ref = selectedMaterial.id || nextLine.ref || "";
          nextLine.idMaterial =
            selectedMaterial.id || nextLine.idMaterial || nextLine.ref;
          nextLine.unidad_medida = selectedUnit;
          nextLine.refObra =
            selectedMaterial.refObra ||
            selectedMaterial.obra ||
            selectedMaterial.referencia ||
            nextLine.refObra ||
            "";
          nextLine.precio_unitario =
            selectedMaterial.precio ??
            selectedMaterial.precioCatalogo ??
            selectedMaterial.precio_unitario ??
            getDefaultUnitPrice(selectedUnit);
        }
      }

      if (field === "unidad_medida") {
        nextLine.unidad_medida = normalizeUnit(value);
        nextLine.precio_unitario = getDefaultUnitPrice(value);
      }

      if (field === "largo") {
        nextLine.longitud = value;
      }

      if (field === "ral") {
        nextLine.ral = value;
        nextLine.Ral = value;
      }

      nextLine.unid = getLineBaseAmount(nextLine, { includePrice: false });
      nextLine.consumo = calculatePaintConsumption(nextLine);

      return nextLine;
    },
    [getDefaultUnitPrice, state.catalogos.materiales],
  );

  const checkStockAvailability = useCallback(
    (lineas) => {
      const source = Array.isArray(lineas) ? lineas : [];
      const issues = [];

      source.forEach((linea, index) => {
        const rawRal = String(linea?.Ral || linea?.ral || "").trim();
        if (
          !rawRal ||
          rawRal === "-" ||
          Number(linea?.fabricacion_manual) === 1
        ) {
          return;
        }

        const required = resolveLineRequiredStock(linea);
        const lineRalKey = normalizeRalKey(rawRal);
        const lineRalCode = extractRalCode(rawRal);
        const pintura = state.catalogos.pinturas.find(
          (item) =>
            normalizeRalKey(`${item?.ral || ""} ${item?.marca || ""}`) ===
              lineRalKey || extractRalCode(item?.ral) === lineRalCode,
        );
        const stock = parseNumber(pintura?.stock);

        if (!pintura || stock <= 0) {
          issues.push({
            lineIndex: index,
            material: String(linea?.mat || linea?.nombreMaterial || "").trim(),
            ral: rawRal,
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
    [state.catalogos.pinturas],
  );

  useEffect(() => {
    dispatch({
      type: pedidoActionTypes.SET_FLAGS,
      payload: {
        isViewingPedido: Boolean(pedidoId),
        isEditMode: !pedidoId,
        showInlineEditor: !pedidoId,
      },
    });
  }, [pedidoId]);

  useEffect(() => {
    loadCatalogs();
  }, [loadCatalogs]);

  useEffect(() => {
    if (isViewingPedido) {
      hydratePedido();
      return;
    }

    generateNumeroAlbaran();
  }, [generateNumeroAlbaran, hydratePedido, isViewingPedido]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("zcontrol.priceDefaults");
      if (!stored) return;
      const parsed = JSON.parse(stored);
      dispatch({
        type: pedidoActionTypes.SET_PRICE_DEFAULTS,
        payload: parsed,
      });
    } catch {
      return;
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      "zcontrol.priceDefaults",
      JSON.stringify(state.preferences.priceDefaults),
    );
  }, [state.preferences.priceDefaults]);

  useEffect(() => {
    const stockCheck = checkStockAvailability(state.pedido.albaran);
    dispatch({
      type: pedidoActionTypes.SET_STOCK_AVAILABILITY,
      payload: stockCheck,
    });
    dispatch({
      type: pedidoActionTypes.SET_STATUS_WARNING_INFO,
      payload: stockCheck.hasIssues
        ? {
            blockedTo: "Pendiente",
            message: stockCheck.message,
            missingRals: stockCheck.missingRals,
          }
        : null,
    });
  }, [checkStockAvailability, state.pedido.albaran]);

  const actions = useMemo(
    () => ({
      setPedidoField: (field, value) =>
        dispatch({ type: pedidoActionTypes.SET_PEDIDO_FIELD, field, value }),
      patchPedido: (payload) =>
        dispatch({ type: pedidoActionTypes.PATCH_PEDIDO, payload }),
      setNuevoClienteField: (field, value) =>
        dispatch({
          type: pedidoActionTypes.SET_NUEVO_CLIENTE_FIELD,
          field,
          value,
        }),
      resetNuevoCliente: () =>
        dispatch({ type: pedidoActionTypes.RESET_NUEVO_CLIENTE }),
      setDraftField: (field, value) =>
        dispatch({ type: pedidoActionTypes.SET_DRAFT_FIELD, field, value }),
      replaceDraft: (payload) =>
        dispatch({ type: pedidoActionTypes.RESET_DRAFT, payload }),
      resetDraft: () => dispatch({ type: pedidoActionTypes.RESET_DRAFT }),
      setFlag: (flag, value) =>
        dispatch({ type: pedidoActionTypes.SET_FLAG, flag, value }),
      setFlags: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_FLAGS, payload }),
      setPriceDefaults: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_PRICE_DEFAULTS, payload }),
      setPrintMode: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_PRINT_MODE, payload }),
      setValidationIssues: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_VALIDATION_ISSUES, payload }),
      setDraftValidationIssues: (payload) =>
        dispatch({
          type: pedidoActionTypes.SET_DRAFT_VALIDATION_ISSUES,
          payload,
        }),
      replaceLines: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_LINES, payload }),
      addLine: (payload) =>
        dispatch({ type: pedidoActionTypes.ADD_LINE, payload }),
      updateLine: (index, payload) =>
        dispatch({ type: pedidoActionTypes.UPDATE_LINE, index, payload }),
      removeLine: (index) =>
        dispatch({ type: pedidoActionTypes.REMOVE_LINE, index }),
      setSelectedLineIndexes: (payload) =>
        dispatch({
          type: pedidoActionTypes.SET_SELECTED_LINE_INDEXES,
          payload,
        }),
      setLineSnapshots: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_LINE_SNAPSHOTS, payload }),
      setExtractedData: (payload) =>
        dispatch({ type: pedidoActionTypes.SET_EXTRACTED_DATA, payload }),
      incrementRefreshToken: () =>
        dispatch({ type: pedidoActionTypes.INCREMENT_REFRESH_TOKEN }),
      incrementClienteActualizado: () =>
        dispatch({ type: pedidoActionTypes.INCREMENT_CLIENTE_ACTUALIZADO }),
      generateNumeroAlbaran,
      hydratePedido,
      loadCatalogs,
      syncCalculatedLine,
      createEmptyMaterialDraft,
    }),
    [generateNumeroAlbaran, hydratePedido, loadCatalogs, syncCalculatedLine],
  );

  const derived = useMemo(() => {
    const totals = getPedidoTotals(state.pedido.albaran);
    const stockIssueByLine = new Map(
      (state.stockAvailability.issues || []).map((issue) => [
        issue.lineIndex,
        issue,
      ]),
    );
    const allLineIndexes = (state.pedido.albaran || []).map(
      (_, index) => index,
    );

    return {
      totals,
      iva: totals.iva,
      total: totals.total,
      stockIssueByLine,
      allLineIndexes,
      areAllLinesSelected:
        allLineIndexes.length > 0 &&
        allLineIndexes.every((index) =>
          state.selectedLineIndexes.includes(index),
        ),
      hasSelectedCliente: Boolean(String(state.pedido.cliente || "").trim()),
    };
  }, [
    state.pedido.albaran,
    state.pedido.cliente,
    state.selectedLineIndexes,
    state.stockAvailability.issues,
  ]);

  return {
    state,
    actions,
    derived,
  };
};

export default usePedido;
