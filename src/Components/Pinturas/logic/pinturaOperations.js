import { parseRalString } from "./parseRal";

const API = import.meta.env.VITE_API || "localhost";

/**
 * Busca una pintura existente en el catálogo que coincida con el RAL
 * Si no la encuentra pero el input tiene RAL, devuelve info para crear una nueva
 */
export async function findOrCreatePintura(searchInput, pinturasExistentes) {
  if (!searchInput || !searchInput.trim()) return null;

  const parsed = parseRalString(searchInput);

  // Si no hay RAL, no podemos proceder
  if (!parsed.ral) {
    return {
      found: false,
      needsCreate: false,
      reason:
        "Se requiere un código RAL (4 dígitos) para crear una nueva pintura",
    };
  }

  // Buscar en catálogo existente
  const existente = pinturasExistentes.find(
    (p) => String(p?.ral).trim() === parsed.ral,
  );

  if (existente) {
    return {
      found: true,
      pintura: existente,
      parsed,
    };
  }

  // No existe, pero tiene RAL válido, permite crear nueva
  return {
    found: false,
    needsCreate: true,
    parsed,
    datosNuevaPintura: {
      ral: parsed.ral,
      marca: parsed.marca || "",
    },
  };
}

/**
 * Crea una nueva pintura en la base de datos
 */
export async function createNewPintura(datosNuevaPintura) {
  try {
    const payload = {
      ral: datosNuevaPintura.ral,
      marca: datosNuevaPintura.marca || "",
    };

    const response = await fetch(`${API}/api/pintura/guardar`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
   
    if (!response.ok || result?.success === false) {
      throw new Error(result?.message || "Error al crear la pintura");
    }

    // Asegurar que la respuesta tiene un ID
    const pinturaDatos = result.data || result;
    if (!pinturaDatos.id) {
      pinturaDatos.id = pinturaDatos.id_pintura || pinturaDatos.pinturaId;
    }

    return {
      success: true,
      pintura: pinturaDatos,
      message: result.message,
    };
  } catch (error) {
    console.error("Error creando pintura:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
