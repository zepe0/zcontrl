/**
 * Ejecuta una petición HTTP y devuelve el JSON cuando existe.
 *
 * @param {Response} response - Respuesta de fetch.
 * @returns {Promise<any>} JSON parseado o null si no hay contenido.
 */
const parseJsonSafe = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
};

/**
 * Obtiene el detalle completo de un pedido/albarán por id.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {string|number} pedidoId - Identificador del pedido.
 * @returns {Promise<any>} JSON de respuesta de la API.
 */
export const fetchPedidoDetalle = async (apiBase, pedidoId) => {
  const response = await fetch(`${apiBase}/api/albaran/${pedidoId}`);
  return parseJsonSafe(response);
};

/**
 * Carga el listado de clientes.
 *
 * @param {string} apiBase - URL base de la API.
 * @returns {Promise<Array<any>>} Array de clientes.
 */
export const fetchClientes = async (apiBase) => {
  const response = await fetch(`${apiBase}/api/cliente`);
  const data = await parseJsonSafe(response);
  return Array.isArray(data) ? data : [];
};

/**
 * Carga el catálogo de materiales.
 *
 * @param {string} apiBase - URL base de la API.
 * @returns {Promise<Array<any>>} Array de materiales.
 */
export const fetchCatalogoMateriales = async (apiBase) => {
  const response = await fetch(`${apiBase}/api/materiales/productos`);
  const data = await parseJsonSafe(response);
  return Array.isArray(data) ? data : [];
};

/**
 * Carga el catálogo de pinturas.
 *
 * @param {string} apiBase - URL base de la API.
 * @returns {Promise<Array<any>>} Array de pinturas.
 */
export const fetchCatalogoPinturas = async (apiBase) => {
  const response = await fetch(`${apiBase}/`);
  const data = await parseJsonSafe(response);
  return Array.isArray(data) ? data : [];
};

/**
 * Carga las tarifas estándar para cálculo de precio sugerido.
 *
 * @param {string} apiBase - URL base de la API.
 * @returns {Promise<Array<any>>} Array de tarifas.
 */
export const fetchTarifasEstandar = async (apiBase) => {
  try {
    const response = await fetch(`${apiBase}/api/tarifas_estandar`);
    if (!response.ok) return [];
    const data = await parseJsonSafe(response);
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.tarifas)) return data.tarifas;
    if (Array.isArray(data?.data?.tarifas)) return data.data.tarifas;
    return [];
  } catch {
    return [];
  }
};

/**
 * Guarda un snapshot de tarifas estándar tal y como se muestran en pantalla.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {Array<any>} tarifas - Tarifas a persistir.
 * @returns {Promise<{ok:boolean,status:number,data:any}>} Resultado de la operación.
 */
export const saveTarifasEstandar = async (apiBase, tarifas) => {
  const payload = {
    tarifas: Array.isArray(tarifas) ? tarifas : [],
  };

  const response = await fetch(`${apiBase}/api/tarifas_estandar`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

/**
 * Crea un nuevo cliente.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {Object} cliente - Datos del cliente.
 * @returns {Promise<any>} JSON de respuesta de la API.
 */
export const crearCliente = async (apiBase, cliente) => {
  const response = await fetch(`${apiBase}/api/cliente/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(cliente),
  });

  const data = await parseJsonSafe(response);
  if (!response.ok || data?.error) {
    throw new Error(data?.error || `Error ${response.status}`);
  }
  return data;
};

/**
 * Crea un nuevo albarán/pedido.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {Object} pedido - Payload completo del pedido.
 * @returns {Promise<any>} JSON de respuesta de la API.
 */
export const crearAlbaran = async (apiBase, pedido) => {
  const response = await fetch(`${apiBase}/api/albaran/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(pedido),
  });

  return parseJsonSafe(response);
};

/**
 * Actualiza una linea de material en la API.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {Object} payload - Payload con los datos de la linea.
 * @returns {Promise<{ok:boolean,status:number,data:any}>} Resultado de la operación.
 */
export const updateMaterialLine = async (apiBase, payload) => {
  const response = await fetch(`${apiBase}/api/materiales/edit`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};

/**
 * Actualiza el estado de un pedido.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {string|number} pedidoId - Identificador del pedido.
 * @param {string} nuevoEstado - Nuevo estado del pedido.
 * @returns {Promise<any>} JSON de respuesta de la API.
 */
export const updatePedidoEstado = async (apiBase, pedidoId, nuevoEstado) => {
  const response = await fetch(`${apiBase}/api/pedidos/${pedidoId}/estado`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  return parseJsonSafe(response);
};

/**
 * Actualiza en batch el estado de fabricación manual de un conjunto de líneas.
 *
 * @param {string} apiBase - URL base de la API.
 * @param {Array<string|number>} lineIds - Identificadores de línea.
 * @param {Object} [options] - Opciones de actualización.
 * @param {boolean|number} [options.fabricacionManual=1] - Nuevo estado de fabricación manual.
 * @param {boolean} [options.completado=true] - Flag de completado manual.
 * @param {string|null} [options.fechaFabricacionManual] - Fecha ISO de fabricación manual.
 * @returns {Promise<{ok:boolean,status:number,data:any}>} Resultado de la operación.
 */
export const completeLineasManualBatch = async (
  apiBase,
  lineIds,
  options = {},
) => {
  const ids = Array.isArray(lineIds)
    ? lineIds.filter((id) => id !== null && id !== undefined && id !== "")
    : [];

  const nextManual =
    options.fabricacionManual === undefined
      ? 1
      : options.fabricacionManual
        ? 1
        : 0;
  const payload = {
    ids,
    lineIds: ids,
    completado:
      options.completado === undefined
        ? Boolean(nextManual)
        : Boolean(options.completado),
    fabricacion_manual: nextManual,
  };

  if (Object.prototype.hasOwnProperty.call(options, "fechaFabricacionManual")) {
    payload.fecha_fabricacion_manual = options.fechaFabricacionManual;
  }

  const response = await fetch(`${apiBase}/api/linia/edit`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await parseJsonSafe(response);
  return {
    ok: response.ok,
    status: response.status,
    data,
  };
};
