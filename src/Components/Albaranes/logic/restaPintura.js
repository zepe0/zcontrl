import { toast } from "react-toastify";
const API = import.meta.env.VITE_API || "localhost";

const normalizeToken = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const isWildcardPintura = (value) => {
  const token = normalizeToken(value);
  return token === "pendiente" || token === "sistema";
};

const restaKG = (pinturaResta) => {
 
  if (typeof pinturaResta === "object" && pinturaResta !== null) {
    const isWildcard = [
      pinturaResta.id,
      pinturaResta.idPintura,
      pinturaResta.nombre,
      pinturaResta.pintura,
      pinturaResta.ral,
    ].some(isWildcardPintura);

    if (isWildcard) {
      return;
    }
  }

  if (!pinturaResta) {
    toast.error("No hay pintura para restar");
  } else if (!pinturaResta <= 0) {
    toast.error("No se a podido modificar la cantidad de pintura");
  } else if (pinturaResta > 0) {
    fetch(`${API}/api/albaranes/restaKG`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ pinturaResta }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Error:", data.error);
          return;
        }
        if (data.exito) {
          toast.success(data.exito);
        }
      })
      .catch((error) => toast.error("Error:", error));
  }
};
export default restaKG;
