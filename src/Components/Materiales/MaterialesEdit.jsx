import { useEffect } from "react";
import "./MaterialesEdit.css"; 

function MarterialesEdit({ inputs, estado, setEstado }) {
  useEffect(() => {
    const dialog = document.querySelector(".editmaterial");
    if (estado !== null) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [estado]); // Escucha cambios en `estado`

  const closeEditMaterial = () => {
    setEstado(null); // Actualiza el estado a `null` para cerrar el modal
  };

  return (
    <dialog className="editmaterial">
      <form>
        <button type="button" onClick={closeEditMaterial}>
          X
        </button>
        {Object.entries(inputs).map(([key, value]) => (
          <div key={key}>
            <label htmlFor={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)}
            </label>
            <input
              type="text"
              name={key}
              id={key}
              value={value != null ? value : "-"}
            />
          </div>
        ))}
        <button type="submit">Guardar</button>
      </form>
    </dialog>
  );
}

export default MarterialesEdit;
