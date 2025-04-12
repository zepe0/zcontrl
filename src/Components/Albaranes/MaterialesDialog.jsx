import React, { useEffect, useRef, useState } from "react";
import "./MaterialesDialog.css";
const API = import.meta.env.VITE_API || "localhost";

function MaterialesDialog({ onAddMaterial }) {
  const [material, setMaterial] = useState({
    ref: "",
    mat: "",
    unid: "",
    refObra: "",
    ral: "",
  });
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]); // Coincidencias filtradas
  const [showTooltip, setShowTooltip] = useState(false); // Tooltip desplegable
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);

  useEffect(() => {
    fetch(`http://${API}:3001/api/materiales/productos`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
      });
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setMaterial((prev) => ({ ...prev, [name]: value }));
    if (name === "mat") {
      // Filtra productos basados en el texto ingresado
      const filtered = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredProductos(filtered);
      setShowTooltip(filtered.length > 0);
      setSelectedIndex(-1); // Reinicia el índice de selección
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredProductos.length - 1)
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prevIndex) => Math.max(prevIndex - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedIndex >= 0 && filteredProductos[selectedIndex]) {
        const productoSeleccionado = filteredProductos[selectedIndex];
        setMaterial((prev) => ({
          ...prev,
          ref: productoSeleccionado.ref,
          mat: productoSeleccionado.nombre,
        }));
        setShowTooltip(false);
      }
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();

    if (material.ref && material.mat && material.unid && material.refObra) {
      onAddMaterial(material); // Agrega el material al pedido

      setMaterial({ ref: "", mat: "", unid: "", refObra: "", Ral: "" });
    }
  };

  return (
    <dialog id="materiales">
      <form onSubmit={handleAddMaterial}>
        <input
          type="text"
          name="mat"
          placeholder="Material"
          value={material.mat}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          ref={inputRef}
          autoComplete="off"
        />

        <input
          type="text"
          name="ref"
          onChange={handleInputChange}
          placeholder="Referencia"
          value={material.ref}
          autoComplete="off"
        />
        {showTooltip && (
          <ul className="ListaProductos">
            {filteredProductos.map((producto, index) => (
              <li
                key={producto.id}
                className={index === selectedIndex ? "highlight" : ""}
                onClick={() => {
                  setMaterial((prev) => ({
                    ...prev,
                    ref: producto.id,
                    mat: producto.nombre,
                  }));
                  setShowTooltip(false);
                }}
              >
                {producto.nombre}
              </li>
            ))}
          </ul>
        )}

        <input
          type="number"
          name="unid"
          placeholder="Unidades"
          value={material.unid}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="refObra"
          placeholder="Ref-Obra"
          value={material.refObra}
          onChange={handleInputChange}
          autoComplete="off"
        />
        <input
          type="text"
          name="Ral"
          placeholder="Ral"
          value={material.Ral}
          onChange={handleInputChange}
          autoComplete="off"
        />
        <button type="submit" onClick={handleAddMaterial}>
          Añadir Material
        </button>
      </form>
    </dialog>
  );
}

export default MaterialesDialog;
