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
  const API = import.meta.env.VITE_API || "localhost";
  const EditMaterial = (e) => {
    e.preventDefault();
    const comparador = e.target.ral ? "pintura" : "materiales";

    const inputs = e.target.elements;
   const formData={};
    const inputsArray = Array.from(inputs);
    inputsArray.forEach((input) => {
      const name = input.name;
      const value = input.value || input.placeholder; 
    if(name)
      formData[name] = value;

    });
    debugger    

   

    fetch(`http://${API}:3001/api/${comparador}/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        formData
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          console.error("Error:", data.error);
          return;
        }
        if (data.exito) {
          console.log(data.exito);
        }
        dialog.close();
      })
      .catch((error) => console.error("Error:", error));
  };
  return (
    <dialog className="editmaterial">
      <button type="button" onClick={closeEditMaterial}>
        X
      </button>
      <form className="editmaterial-form" onSubmit={(e) => EditMaterial(e)}>
        {Object.entries(inputs).map(
          ([key, value]) =>
            key !== "id" && (
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
            )
        )}
        <button type="submit">Guardar</button>
      </form>
    </dialog>
  );
}

export default MarterialesEdit;
