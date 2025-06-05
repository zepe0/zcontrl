import { useEffect } from "react";
import "./MaterialesEdit.css";
function MarterialesEdit({
  inputs,
  estado,
  setEstado,
  reload,
  reloadMaterial,
  notifi,
  notifipintura,
}) {
  useEffect(() => {
    const dialog = document.querySelector(".editmaterial");
    if (estado !== null) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [estado]);

  const closeEditMaterial = () => {
    setEstado(null);
  };
  const API = import.meta.env.VITE_API || "localhost";
  const EditMaterial = (e) => {
    e.preventDefault();
    const comparador = e.target.ral ? "pintura" : "materiales";

    const inputs = e.target.elements;
    const formData = {};
    const inputsArray = Array.from(inputs);
    inputsArray.forEach((input) => {
      const name = input.name;
      const value = input.value || input.placeholder;
      if (name) formData[name] = value;
    });

    fetch(`${API}/api/${comparador}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formData,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error:", data.error);
          return;
        }
        if (data.exito) {
          setEstado(null);
          if (data.exito.includes("Pintura")) {
            reload();
            notifipintura();
          } else if (data.exito.includes("Material")) {
            reloadMaterial();
            notifi();
          }
        }
      })
      .catch((error) => console.error("Error:", error));
  };
  return (
    <dialog className="editmaterial">
      <button type="button" onClick={closeEditMaterial}>
        X
      </button>
      <form className="editmaterial-form" onSubmit={(e) => EditMaterial(e)}>
        {Object.entries(inputs).map(([key, value]) => {
          if (key === "id") {
            return (
              <input
                type="hidden"
                name={key}
                id={key}
                value={value != null ? value : "-"}
                key={key}
              />
            );
          }
          return (
            <div key={key}>
              <label htmlFor={key}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              <input
                type="text"
                name={key}
                id={key}
                placeholder={value != null ? value : "-"}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setEstado((prevState) => ({
                    ...prevState,
                    [key]: newValue,
                  }));
                }}
                value={estado ? estado[key] : ""}
              />
            </div>
          );
        })}
        <button type="submit">Guardar</button>
      </form>
    </dialog>
  );
}

export default MarterialesEdit;
