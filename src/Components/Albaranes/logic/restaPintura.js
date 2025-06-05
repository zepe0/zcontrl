import { toast } from "react-toastify";
const API = import.meta.env.VITE_API || "localhost";

const restaKG = (pinturaResta) => {
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
