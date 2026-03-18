/**
 * Extrae RAL, acabado y marca de un string libre
 * Ej: "7025 MATE AXALTA" -> { ral: "7025", acabado: "MATE", marca: "AXALTA" }
 * Ej: "MATE ROJO AXALTA" -> { ral: null, acabado: "MATE", marca: "ROJO AXALTA" }
 */
export function parseRalString(input) {
  if (!input || typeof input !== 'string') {
    return { ral: null, acabado: null, marca: null };
  }

  const normalized = input.trim();
  
  // Lista de acabados posibles (case-insensitive)
  const acabados = ['txt', 'texturado', 'gofrado', 'gof', 'mate', 'm', 'satinado', 'sat', 'brillo'];
  
  // Expresión para detectar RAL (4 dígitos al inicio o después de espacio)
  const ralMatch = normalized.match(/^(\d{4})(?:\s|$)|(\s(\d{4})(?:\s|$))/);
  let ral = null;
  let remainingAfterRal = normalized;
  
  if (ralMatch) {
    ral = ralMatch[1] || ralMatch[3];
    // Remover el RAL del string
    remainingAfterRal = normalized.replace(/^\d{4}\s*/, '').replace(/\s\d{4}\s*/, '');
  }

  // Buscar acabado en el string restante
  let acabado = null;
  let remainingAfterAcabado = remainingAfterRal;
  
  for (const acabadoOption of acabados) {
    const regex = new RegExp(`\\b${acabadoOption}\\b`, 'i');
    const match = remainingAfterRal.match(regex);
    
    if (match) {
      acabado = match[0].toUpperCase();
      // Remover el acabado
      remainingAfterAcabado = remainingAfterRal.replace(regex, '').trim();
      break;
    }
  }

  // Lo que queda es la marca (o nombre adicional)
  const marca = remainingAfterAcabado.trim() || null;

  return {
    ral: ral || null,
    acabado: acabado || null,
    marca: marca || null,
    original: normalized
  };
}

/**
 * Construye el nombre completo de la pintura basado en RAL y acabado
 */
export function buildRalName(ral, acabado) {
  if (!ral && !acabado) return '';
  if (ral && !acabado) return ral;
  if (!ral && acabado) return acabado;
  return `${ral} ${acabado}`;
}
