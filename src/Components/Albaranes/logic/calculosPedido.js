/* 

MODIFICAR RECARGO POR ESPESOR Y CALCULO DE IVA

El código define unos valores por defecto al principio del archivo:

DEFAULT_ESPESOR_RECARGO_MM  3: Si el espesor es mayor a 3mm, se aplica el recargo.
DEFAULT_ESPESOR_RECARGO_FACTOR = 1.1: El recargo es del 10% (multiplicar por 1.1).
DEFAULT_IVA_RATE = 0.21: El IVA aplicado es del 21%.
 solo suma en la linea el recargo si el espesor supera el umbral, y el IVA se calcula sobre la base total del pedido.

  */

const DEFAULT_ESPESOR_RECARGO_MM = 3;
const DEFAULT_ESPESOR_RECARGO_FACTOR = 1.1;
const DEFAULT_IVA_RATE = 0.21;
const DEFAULT_PAINT_CONSUMPTION_M2_RATIO = 0.24;
// Desarrollo perimetral medio asumido para líneas ml sin ancho: 1.25 m × 0.24 = 0.30
const DEFAULT_ML_DEVELOPMENT_M = 1.25;
const DEFAULT_PAINT_CONSUMPTION_UD_BASE = 0.12;

/**
 * Convierte un valor a numero de forma segura.
 *
 * @param {string|number|null|undefined} value - Valor de entrada.
 * @returns {number} Numero valido o 0 si no es convertible.
 */
export const parseNumber = (value) => {
  if (typeof value === "string") {
    const normalized = value.replace(/\s+/g, "").replace(",", ".");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : 0;
  }

  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

/**
 * Normaliza la unidad de medida a: ud, ml o m2.
 *
 * @param {string|number|null|undefined} value - Unidad original.
 * @returns {"ud"|"ml"|"m2"} Unidad normalizada.
 */
export const normalizeUnit = (value) => {
  const raw = String(value || "ud")
    .trim()
    .toLowerCase()
    .replace("²", "2");

  if (raw === "3") return "m2";
  if (raw === "2") return "ml";
  if (raw === "1") return "ud";
  if (raw.includes("m2") || raw.includes("superficie")) return "m2";
  if (raw.includes("ml") || raw.includes("lineal")) return "ml";
  return "ud";
};

/**
 * Convierte milimetros a metros.
 *
 * @param {string|number|null|undefined} valueMm - Valor en milimetros.
 * @returns {number} Valor en metros.
 */
export const mmToMeters = (valueMm) => parseNumber(valueMm) / 1000;

/**
 * Calcula la base de consumo de una linea antes de aplicar precio y recargo.
 *
 * @param {Object} line - Linea del albaran.
 * @returns {number} Base de consumo en la unidad correspondiente.
 */
export const getLineBaseAmount = (line) => {
  const unit = normalizeUnit(line?.unidad_medida);
  const cantidad = parseNumber(line?.cantidad ?? line?.unid);
  const largoMm = parseNumber(line?.largo ?? line?.alto ?? line?.longitud);
  const anchoMm = parseNumber(line?.ancho);

  const largoM = mmToMeters(largoMm);
  const anchoM = mmToMeters(anchoMm);

  // Compatibilidad con lineas antiguas ya calculadas sin medidas detalladas.
  const legacyBase = parseNumber(line?.unid);

  if (unit === "m2") {
    return largoMm && anchoMm ? cantidad * largoM * anchoM : legacyBase;
  }

  if (unit === "ml") {
    return largoMm ? cantidad * largoM : legacyBase;
  }

  return cantidad;
};

/**
 * Calcula el factor de recargo por espesor.
 *
 * @param {Object} line - Linea del albaran.
 * @param {Object} [options] - Configuracion opcional del recargo.
 * @param {number} [options.espesorRecargoMm=3] - Umbral en mm para aplicar recargo.
 * @param {number} [options.espesorRecargoFactor=1.1] - Multiplicador cuando supera el umbral.
 * @returns {number} Factor multiplicador final (1 si no aplica recargo).
 */
export const getEspesorRecargoFactor = (
  line,
  {
    espesorRecargoMm = DEFAULT_ESPESOR_RECARGO_MM,
    espesorRecargoFactor = DEFAULT_ESPESOR_RECARGO_FACTOR,
  } = {},
) => {
  const espesorMm = parseNumber(line?.espesor);
  return espesorMm > espesorRecargoMm ? espesorRecargoFactor : 1;
};

/**
 * Calcula el subtotal de una linea.
 * Formula: base * precio_unitario * recargo_espesor.
 *
 * @param {Object} line - Linea del albaran.
 * @param {Object} [options] - Opciones de recargo por espesor.
 * @returns {number} Subtotal economico de la linea.
 */
export const getLineSubtotal = (line, options = {}) => {
  const baseAmount = getLineBaseAmount(line);
  const recargo = getEspesorRecargoFactor(line, options);
  return baseAmount * parseNumber(line?.precio_unitario) * recargo;
};

/**
 * Calcula el total de la base del pedido basándose en las líneas y opciones.
 *
 * @param {Array<Object>} lines - Listado de productos o lineas del pedido.
 * @param {Object} [options] - Configuracion adicional para el calculo de subtotales.
 * @returns {number} Suma de subtotales de todas las lineas.
 */
export const getPedidoBaseTotal = (lines = [], options = {}) => {
  return lines.reduce((acc, line) => acc + getLineSubtotal(line, options), 0);
};

/**
 * Calcula base, IVA e importe total del pedido en un solo paso.
 *
 * @param {Array<Object>} lines - Lineas del pedido.
 * @param {Object} [options] - Configuracion del calculo.
 * @param {number} [options.ivaRate=0.21] - Tipo de IVA aplicado (0.21 = 21%).
 * @param {number} [options.espesorRecargoMm=3] - Umbral de recargo por espesor.
 * @param {number} [options.espesorRecargoFactor=1.1] - Factor de recargo por espesor.
 * @returns {{base:number, iva:number, total:number}} Totales economicos del pedido.
 */
export const getPedidoTotals = (lines = [], options = {}) => {
  const { ivaRate = DEFAULT_IVA_RATE, ...subtotalOptions } = options;
  const base = getPedidoBaseTotal(lines, subtotalOptions);
  const iva = base * parseNumber(ivaRate);
  const total = base + iva;

  return { base, iva, total };
};

/**
 * Calcula el consumo orientativo de pintura (kg) para una linea.
 *
 * Logica hibrida (cualquier unidad):
 * 1. Si hay largo y ancho: superficie real (L * A / 1_000_000) * cantidad * 0.24
 * 2. Si no hay ancho:
 *    - ml: longitud * desarrollo_medio_1.25m * cantidad * 0.24
 *    - ud sin medidas: consumo base 0.12 por unidad
 *    - m2 sin ancho: 0 (dato insuficiente)
 *
 * Nota: getLineBaseAmount sigue usando solo 'cantidad' para ud para no
 * alterar el precio de venta cuando la unidad es por pieza.
 *
 * @param {Object} linea - Linea del albaran.
 * @returns {number} Consumo calculado en kg.
 */
export const calculatePaintConsumption = (linea) => {
  const unit = normalizeUnit(linea?.unidad_medida);
  const cantidad = parseNumber(linea?.cantidad ?? linea?.unid);
  const largoMm = parseNumber(linea?.largo ?? linea?.longitud ?? linea?.alto);
  const anchoMm = parseNumber(linea?.ancho);

  if (cantidad <= 0) return 0;

  // Caso 1: hay largo Y ancho → superficie real, independiente de la unidad.
  if (largoMm > 0 && anchoMm > 0) {
    const areaM2 = (largoMm * anchoMm) / 1000000;
    return areaM2 * cantidad * DEFAULT_PAINT_CONSUMPTION_M2_RATIO;
  }

  // Caso 2: solo largo, sin ancho.
  if (largoMm > 0) {
    if (unit === "ml") {
      // Estimación con desarrollo perimetral medio de 1.25 m.
      return (
        (largoMm / 1000) *
        DEFAULT_ML_DEVELOPMENT_M *
        cantidad *
        DEFAULT_PAINT_CONSUMPTION_M2_RATIO
      );
    }
    // m2 con solo largo: dato insuficiente.
    return 0;
  }

  // Caso 3: ud sin medidas → consumo base por pieza.
  return cantidad * DEFAULT_PAINT_CONSUMPTION_UD_BASE;
};

/**
 * Resuelve el consumo requerido para control de stock.
 * Prioriza consumo informado en la linea y, si no existe, calcula uno orientativo.
 *
 * @param {Object} linea - Linea del albaran.
 * @returns {number} Consumo requerido en kg.
 */
export const resolveLineRequiredStock = (linea) => {
  const consumoGuardado = parseNumber(linea?.consumo);
  if (consumoGuardado > 0) return consumoGuardado;

  const consumoCalculado = calculatePaintConsumption(linea);
  if (consumoCalculado > 0) return consumoCalculado;

  return parseNumber(linea?.cantidad ?? linea?.unid);
};
