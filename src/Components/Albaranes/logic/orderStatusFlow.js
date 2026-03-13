export const ORDER_STATUS_STEPS = [
  "Borrador",
  "Confirmado",
  "Pendiente",
  "EnProceso",
  "Almacén",
  "Completado",
];

export const normalizeOrderStatus = (value) => {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");

  if (normalized === "borrador") return "Borrador";
  if (normalized === "confirmado") return "Confirmado";
  if (
    normalized === "pendiente" ||
    normalized === "pendientedematerial" ||
    normalized === "faltastock"
  ) {
    return "Pendiente";
  }
  if (normalized === "enproceso" || normalized === "proceso") {
    return "EnProceso";
  }
  if (normalized === "almacen" || normalized === "enalmacen") {
    return "Almacén";
  }
  if (normalized === "completado" || normalized === "completo") {
    return "Completado";
  }

  return "Borrador";
};
