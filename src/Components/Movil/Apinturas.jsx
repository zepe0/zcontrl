import { useEffect, useState } from "react";
import "./Apinturas.css";
import QRCode from "react-qr-code";
import { toast } from "react-toastify";

import EscanerCodigo from "../QRcode/EscanerCodigo";
const API = import.meta.env.VITE_API || "localhost";

function APinturas() {
  const [estanterias, setEstanterias] = useState([]);
  const [numAlturas, setNumAlturas] = useState(0);
  const [numEstantes, setNumEstantes] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [verpalet, SetVerpalet] = useState("");
  const [qrData, setQrData] = useState("");
  const [selectedPosition, setSelectedPosition] = useState(null);

  useEffect(() => {
    const fetchEstanterias = async () => {
      try {
        const response = await fetch(`${API}/api/estanterias/`);
        const data = await response.json();
        setEstanterias(data);
      } catch (err) {
        console.error("Error al cargar las estanterías:", err);
      }
    };
    fetchEstanterias();
  }, []);

  const handleAddEstanteria = () => setShowForm(true);

  const handleDelEstanteria = async (id) => {
    if (estanterias.length > 0) {
      try {
        const response = await fetch(`${API}/api/estanterias/delete`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });

        if (!response.ok) {
          toast.error("Error al eliminar la estantería");
        } else {
          setEstanterias(estanterias.filter((est) => est.id !== id));
          toast.success("Estantería eliminada correctamente");
        }
      } catch (error) {
        console.error("Error al eliminar la estantería:", error);
        toast.error("Error al eliminar la estantería");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (numAlturas > 0 && numEstantes > 0) {
      const matriz = Array.from({ length: numAlturas }, () =>
        Array(numEstantes).fill(null)
      );
      const nuevaEstanteria = {
        id: Date.now(),
        numAlturas,
        numEstantes,
        matriz,
      };
      setEstanterias([...estanterias, nuevaEstanteria]);
      setNumAlturas(0);
      setNumEstantes(0);
      setShowForm(false);

      try {
        await fetch(`${API}/api/estanterias/add`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(nuevaEstanteria),
        });
      } catch (err) {
        alert("Error al guardar la estantería en la base de datos", err);
      }
    }
  };
  const colocarProducto = (producto) => {
    if (!selectedPosition) return;

    const { estId, filaIdx, colIdx } = selectedPosition;

    setEstanterias((prevEstanterias) =>
      prevEstanterias.map((est) => {
        if (est.id === estId) {
          const nuevaMatriz = est.matriz.map((fila, fIdx) =>
            fila.map((item, cIdx) => {
              if (fIdx === filaIdx && cIdx === colIdx) {
                return producto;
              }
              return item;
            })
          );

          return { ...est, matriz: nuevaMatriz };
        }
        return est;
      })
    );
  };

  return (
    <div className="apinturas">
      <h1>Almacén de Pinturas</h1>
      <button onClick={handleAddEstanteria}>Añadir estantería</button>
      {showForm && (
        <form onSubmit={handleFormSubmit} style={{ margin: "16px 0" }}>
          <label>
            Nº de alturas:
            <input
              type="number"
              min="1"
              value={numAlturas}
              onChange={(e) => setNumAlturas(Number(e.target.value))}
              required
              style={{ marginLeft: 8, marginRight: 16 }}
            />
          </label>
          <label>
            Nº de estantes por altura:
            <input
              type="number"
              min="1"
              value={numEstantes}
              onChange={(e) => setNumEstantes(Number(e.target.value))}
              required
              style={{ marginLeft: 8 }}
            />
          </label>
          <button type="submit" style={{ marginLeft: 16 }}>
            Crear
          </button>
        </form>
      )}

      <div className="estanterias">
        {estanterias.map((est, idx) => (
          <div key={est.id} className="estanteria">
            <h2>
              Estantería #{idx + 1} <QRCode value={`${idx + 1}`} size={40} />
            </h2>
            <button onClick={() => handleDelEstanteria(est.id)}>🗑️</button>
            <div className="matriz">
              {est.matriz.map((fila, alturaIdx) => (
                <div key={alturaIdx} className="altura">
                  {fila.map((producto, estanteIdx) => (
                    <div key={estanteIdx} className="hueco">
                      <span>{`${idx + 1}-A${alturaIdx + 1}-E${
                        estanteIdx + 1
                      }:`}</span>
                      <button
                        onClick={() => {
                          document.getElementById("vistapalet").showModal();
                          SetVerpalet(
                            `${idx + 1}-A${alturaIdx + 1}-E${estanteIdx + 1}:`
                          );
                          setSelectedPosition({
                            estId: est.id,
                            filaIdx: alturaIdx,
                            colIdx: estanteIdx,
                          });
                        }}
                        style={{ marginLeft: 8, marginTop: 4 }}
                      >
                        {" "}
                        ➕
                      </button>
                      {producto ? (
                        <span className="producto">{producto}</span>
                      ) : (
                        <button
                          onClick={() => {
                            document.getElementById("vistapalet").showModal();
                            SetVerpalet(
                              `${idx + 1}-A${alturaIdx + 1}-E${estanteIdx + 1}:`
                            );
                            setSelectedPosition({
                              estId: est.id,
                              filaIdx: alturaIdx,
                              colIdx: estanteIdx,
                            });
                          }}
                          style={{ marginLeft: 8, marginTop: 4 }}
                        >
                          {" "}
                          👁
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <dialog id="vistapalet">
        <div className="vista-palet">
          <h3>Palet en {verpalet}</h3>

          <div className="vista-palet-content">
            <p>Escanea el código QR del producto:</p>
            <QRCode value={verpalet} size={128} />
            <div
              style={{
                width: "20%",
                height: "20%",
                overflow: "hidden",
                display: "flex",
              }}
            >
              {verpalet && (
                <EscanerCodigo
                  onScan={(rawValue) => {
                    if (!rawValue) return;

                    if (!verpalet || verpalet.trim() === "") {
                      toast.error("No se ha seleccionado una posición válida");
                      return;
                    }

                    colocarProducto(rawValue);
                    toast.success("Producto colocado en " + verpalet);

                    setTimeout(() => {
                      SetVerpalet("");
                      document.getElementById("vistapalet").close();
                    }, 500);
                  }}
                  onError={(err) => {
                    if (err.name !== "NotFoundException2") {
                      console.error("Error de escaneo:", err);
                    }
                  }}
                />
              )}
            </div>
          </div>

          <button onClick={() => document.getElementById("vistapalet").close()}>
            Cerrar
          </button>
        </div>
      </dialog>
    </div>
  );
}

export default APinturas;
