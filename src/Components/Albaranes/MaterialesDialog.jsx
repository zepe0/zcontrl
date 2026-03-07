import React, { useEffect, useRef, useState, useLayoutEffect } from "react";
import "./MaterialesDialog.css";
import { toast, ToastContainer } from "react-toastify";
const API = import.meta.env.VITE_API || "localhost";

function MaterialesDialog({ onAddMaterial, onClose }) {
  const [material, setMaterial] = useState({
    ref: "",
    mat: "",
    unid: "",
    refObra: "",
    ral: "",
    consumo: "",
  });
  const [productos, setProductos] = useState([]);
  const [filteredProductos, setFilteredProductos] = useState([]);
  const [showTooltip, setShowTooltip] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  // color list (pinturas) used to suggest RAL codes
  const [pinturas, setPinturas] = useState([]);
  const [filteredPinturas, setFilteredPinturas] = useState([]);
  const [showRalTooltip, setShowRalTooltip] = useState(false);
  const [selectedRalIndex, setSelectedRalIndex] = useState(-1);
  const inputRef = useRef(null);
  const ralInputRef = useRef(null);
  const productsTooltipRef = useRef(null);
  const ralTooltipRef = useRef(null);

  const [prodTooltipStyle, setProdTooltipStyle] = useState({});
  const [ralTooltipStyle, setRalTooltipStyle] = useState({});

  useEffect(() => {
    fetch(`${API}/api/materiales/productos`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
      });

    // also fetch pinturas for RAL suggestions (same endpoint used by Pinturas page)
    fetch(`${API}/`)
      .then((res) => res.json())
      .then((data) => {
        setPinturas(data);
      });

    // when the materiales dialog closes we notify parent and also ensure
    // the "nuevoCliente" modal (if open) is shut.
    const dlg = document.getElementById("materiales");
    const handleClose = () => {
      const other = document.getElementById("nuevoCliente");
      if (other && other.open) other.close();
      if (typeof onClose === "function") onClose();
    };
    const handleKeydown = (e) => {
      if (e.key === "Escape") {
        // closing via Esc doesn't always fire close before bubbling; handle explicitly
        const other = document.getElementById("nuevoCliente");
        if (other && other.open) other.close();
        if (typeof onClose === "function") onClose();
      }
    };
    if (dlg) {
      dlg.addEventListener("close", handleClose);
      dlg.addEventListener("keydown", handleKeydown);
    }
    return () => {
      if (dlg) {
        dlg.removeEventListener("close", handleClose);
        dlg.removeEventListener("keydown", handleKeydown);
      }
    };
  }, []);

  // position products tooltip just below the material input
  useLayoutEffect(() => {
    if (!showTooltip) {
      setProdTooltipStyle({ display: "none" });
      return;
    }
    const input = inputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const left = Math.max(8, rect.left);
    const top = rect.bottom + 6;
    setProdTooltipStyle({
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      minWidth: `${rect.width}px`,
      maxWidth: `calc(100% - ${left + 8}px)`,
      zIndex: 2500,
    });
  }, [showTooltip, filteredProductos]);

  // position RAL tooltip just below the ral input
  useLayoutEffect(() => {
    if (!showRalTooltip) {
      setRalTooltipStyle({ display: "none" });
      return;
    }
    const input = ralInputRef.current;
    if (!input) return;
    const rect = input.getBoundingClientRect();
    const left = Math.max(8, rect.left);
    const top = rect.bottom + 6;
    setRalTooltipStyle({
      position: "fixed",
      left: `${left}px`,
      top: `${top}px`,
      minWidth: `${rect.width}px`,
      maxWidth: `calc(100% - ${left + 8}px)`,
      zIndex: 2500,
    });
  }, [showRalTooltip, filteredPinturas]);

  // hide tooltips on scroll/resize to avoid misplacement
  useEffect(() => {
    const handler = () => {
      if (showTooltip) setShowTooltip(false);
      if (showRalTooltip) setShowRalTooltip(false);
    };
    window.addEventListener("scroll", handler, true);
    window.addEventListener("resize", handler);
    return () => {
      window.removeEventListener("scroll", handler, true);
      window.removeEventListener("resize", handler);
    };
  }, [showTooltip, showRalTooltip]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setMaterial((prev) => ({ ...prev, [name]: value }));
    if (name === "mat") {
      // Filtra productos basados en el texto ingresado
      const filtered = productos.filter((producto) =>
        producto.nombre.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredProductos(filtered);
      setShowTooltip(filtered.length > 0);
      setSelectedIndex(-1); // Reinicia el índice de selección
    }

    if (name === "ral") {
      const filtered = pinturas.filter((p) =>
        p.ral.toLowerCase().includes(value.toLowerCase()),
      );
      setFilteredPinturas(filtered);
      setShowRalTooltip(filtered.length > 0);
      setSelectedRalIndex(-1);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prevIndex) =>
        Math.min(prevIndex + 1, filteredProductos.length - 1),
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
          ref: productoSeleccionado.id, // <-- igual que en el click
          mat: productoSeleccionado.nombre,
          consumo: productoSeleccionado.consumo || 0, // Asigna el consumo si existe
        }));
        setShowTooltip(false);
      }
    }
  };

  const handleRalKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedRalIndex((prev) =>
        Math.min(prev + 1, filteredPinturas.length - 1),
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedRalIndex((prev) => Math.max(prev - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (selectedRalIndex >= 0 && filteredPinturas[selectedRalIndex]) {
        const p = filteredPinturas[selectedRalIndex];
        setMaterial((prev) => ({
          ...prev,
          ral: `${p.ral} ${p.marca || ""}`.trim(),
        }));
        setShowRalTooltip(false);
      }
    }
  };

  const handleAddMaterial = (e) => {
    e.preventDefault();

    if (material.ref && material.mat && material.unid && material.refObra) {
      onAddMaterial(material); // Agrega el material al pedido

      setMaterial({
        ref: "",
        mat: "",
        unid: "",
        refObra: "",
        ral: "",
        consumo: "",
      }); // Reinicia el formulario
    } else {
      toast.error("Por favor, completa todos los campos obligatorios.");
    }
  };

  return (
    <dialog id="materiales">
      <form onSubmit={handleAddMaterial}>
        <div className="input-with-tooltip">
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
          {showTooltip && (
            <ul
              ref={productsTooltipRef}
              className="ListaProductos"
              style={prodTooltipStyle}
            >
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
        </div>

        <input
          type="text"
          name="ref"
          onChange={handleInputChange}
          placeholder="Referencia"
          value={material.ref}
          autoComplete="off"
        />

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
        <div className="input-with-tooltip">
          <input
            type="text"
            name="ral"
            placeholder="Ral"
            value={material.ral}
            onChange={handleInputChange}
            onKeyDown={handleRalKeyDown}
            onBlur={() => setTimeout(() => setShowRalTooltip(false), 100)}
            autoComplete="off"
            ref={ralInputRef}
          />
          {showRalTooltip && (
            <ul
              ref={ralTooltipRef}
              className="ListaProductos ral-tooltip"
              style={ralTooltipStyle}
            >
              {filteredPinturas.map((p, idx) => (
                <li
                  key={p.id}
                  className={idx === selectedRalIndex ? "highlight" : ""}
                  onClick={() => {
                    setMaterial((prev) => ({
                      ...prev,
                      ral: `${p.ral} ${p.marca || ""}`.trim(),
                    }));
                    setShowRalTooltip(false);
                  }}
                >
                  {`${p.ral} ${p.marca || ""}`.trim()}
                </li>
              ))}
            </ul>
          )}
        </div>
        <input
          type="text"
          name="consumo"
          placeholder="consumo"
          value={material.consumo}
          onChange={handleInputChange}
          autoComplete="off"
        />
        <button type="submit" onClick={handleAddMaterial}>
          Añadir Material
        </button>
      </form>
      <button
        className="dialog-material-close"
        style={{
          position: "absolute",
          top: "10px",
          right: "10px",
          zIndex: 1000,
        }}
        onClick={() => {
          const dlg = document.getElementById("materiales");
          if (dlg) dlg.close();
          if (typeof onClose === "function") onClose();
        }}
      >
        ✖
      </button>
      <ToastContainer position="top-right" />
    </dialog>
  );
}

export default MaterialesDialog;
