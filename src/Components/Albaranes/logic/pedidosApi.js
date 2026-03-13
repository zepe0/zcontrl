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

  return parseJsonSafe(response);
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
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ estado: nuevoEstado }),
  });

  return parseJsonSafe(response);
};
