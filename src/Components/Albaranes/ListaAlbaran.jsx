import { useState, useEffect } from "react";
import "./ListaAlbaran.css";

import { toast } from "react-toastify";
import Loader from "../Loader/";

const API = import.meta.env.VITE_API || "localhost";
function ListaAlbaran({ albaran }) {
  const [albaranfind, setAlbaranfind] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editedProducts, setEditedProducts] = useState([]);

  // Effect: whenever the dialog element closes (via X, Esc, backdrop, etc.)
  // make sure any edit state is reset so it doesn't persist in later opens.
  useEffect(() => {
    const dlg = document.querySelector(".dialog");
    if (!dlg) return;
    const handleClose = () => {
      setEditing(false);
      setEditedProducts([]);
    };
    dlg.addEventListener("close", handleClose);
    return () => {
      dlg.removeEventListener("close", handleClose);
    };
  }, []);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  function printQR(qrValue, nombre) {
    const qrHtml = `
    <html>
      <head>
        <title>Imprimir QR</title>
        <style>
          body { margin:0; display:flex; flex-direction:column; align-items:center; justify-content:center; height:100vh; }
          .nombreQR { margin-top: 16px; font-size: 18pt; font-weight: bold; text-align: center; }
        </style>
      </head>
      <body>
        <div id="qr"></div>
        <div class="nombreQR">${nombre}</div>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <script>
          new QRCode(document.getElementById("qr"), {
            text: "${qrValue}",
            width: 300,
            height: 300
          });
          window.onload = () => setTimeout(() => window.print(), 500);
          window.onafterprint = () => window.close();
        </script>
      </body>
    </html>
  `;
    const printWindow = window.open("", "_blank");
    printWindow.document.write(qrHtml);
    printWindow.document.close();
  }

  function esAlbaranValorado() {
    return window.location.href.includes("Albaranes");
  }
  function viewAlbaran(id) {
    setLoading(true);
    const dialog = document.querySelector(".dialog");
    dialog.showModal();

    let url = "";
    let options = {};

    if (esAlbaranValorado()) {
      url = `${API}/api/albaranvalor`;
      options = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      };
    } else {
      url = `${API}/api/albaran/${id}`;
      options = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      };
    }

    fetch(url, options)
      .then((res) => res.json())
      .then((data) => {
        setLoading(false);
        if (data.error) {
          toast.error("Error:", data.error);
          return;
        }
        setAlbaranfind(data);
      })
      .catch((error) => {
        setLoading(false);
        toast.error("Error:", error);
      });
  }

  function closedialog() {
    // close any open <dialog> elements to avoid leaving others (e.g. add‑cliente) visible
    const dialogs = document.querySelectorAll("dialog");
    dialogs.forEach((d) => {
      try {
        d.close();
      } catch {}
    });

    setAlbaranfind([]);
    // cancel any in‑progress edits
    setEditing(false);
    setEditedProducts([]);
  }

  function saveProceso() {
    const dialog = document.querySelector(".dialog");
    const proceso = document.getElementById("proceso").value;

    fetch(`${API}/api/albaranes/edit`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ proceso, id: albaranfind.productos[0].idALbaran }),
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
        dialog.close();
      })
      .catch((error) => toast.error("Error:", error));
  }

  const saveEditedProducts = async () => {
    let anyError = false;

    for (const prod of editedProducts) {
      debugger
      try {
        const res = await fetch(`${API}/api/materiales/edit`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            idMaterial: prod.idMaterial,
            cantidad: prod.cantidad,
            ral: prod.ral,
            nombreMaterial: prod.nombreMaterial,
            refObra: prod.refObra,
            cliente_id: prod.cliente_id, // Nuevo campo
            pedido_id: prod.pedido_id, // Nuevo campo
            idALbaran: prod.idALbaran, // Nuevo campo
            
          }),
        });
        if (!res.ok) {
          anyError = true;
          const text = await res.text();
          console.error("Update failed", text);
        }
      } catch (e) {
        anyError = true;
        console.error("Error updating product", e);
      }
    }
    if (anyError) {
      toast.error("Algunos productos no se pudieron actualizar");
    } else {
      toast.success("Productos actualizados correctamente");
    }
    setEditing(false);
    viewAlbaran(albaranfind.productos[0].idALbaran);
  };

  return (
    <div className="listaprocesos">
      <dialog className="dialog">
        <div className="dialog-content">
          {loading ? (
            <Loader />
          ) : (
            <>
              <div className="dialog-buttons">
                <button
                  onClick={() => {
                    closedialog();
                  }}
                  className="cerrar-btn"
                >
                  X
                </button>
                {!esAlbaranValorado() && (
                  <button onClick={saveProceso}>Guardar</button>
                )}
                {!editing && (
                  <button
                    onClick={() => {
                      setEditing(true);
                      setEditedProducts(
                        albaranfind.productos.map((p) => ({ ...p })),
                      );
                    }}
                  >
                    Editar
                  </button>
                )}
                {editing && (
                  <>
                    <button
                      onClick={saveEditedProducts}
                      className="guardar-btn"
                    >
                      Guardar cambios
                    </button>
                    <button
                      className="cancel-btn"
                      onClick={() => {
                        setEditing(false);
                        // revert edits by reloading current albaran data
                        if (albaranfind.productos?.[0]?.idALbaran) {
                          viewAlbaran(albaranfind.productos[0].idALbaran);
                        }
                      }}
                    >
                      Cancelar
                    </button>
                  </>
                )}
                <button className="print-btn" onClick={() => window.print()}>
                  Imprimir
                </button>
                <button
                  className="print-btn"
                  onClick={() =>
                    printQR(
                      albaranfind.productos[0].idALbaran,
                      albaranfind.cliente.nombre,
                    )
                  }
                >
                  <p className="nombreQR">QR</p>
                </button>
              </div>

              {albaranfind.cliente && (
                <section className="dialog-cliente">
                  {!esAlbaranValorado() && (
                    <select
                      name="proceso"
                      id="proceso"
                      className="selectProceso"
                    >
                      <option value={albaranfind.cliente.proceso}>
                        {albaranfind.cliente.proceso}
                      </option>
                      {[
                        "En proceso",
                        "Completado",
                        "Pendiente",
                        "Cancelado",
                        "En Limpieza",
                        "En Pintura",
                        "En Almacen",
                        "Entregado",
                      ]
                        .filter((opcion) => opcion !== albaranfind.proceso)
                        .map((opcion) => (
                          <option key={opcion} value={opcion}>
                            {opcion}
                          </option>
                        ))}
                    </select>
                  )}
                  <div className="dialog-cliente">
                    <p>{albaranfind.productos[0].idALbaran} </p>
                    <p>{albaranfind.cliente.nombre}</p>
                    <p>{albaranfind.cliente.Nif}</p>
                    <p>{albaranfind.cliente.dir}</p>
                    <p>{albaranfind.cliente.tel}</p>
                  </div>
                </section>
              )}
              <div className="dialog-productos">
                <h3 className="titulo-datosalbaran">Datos Albaran</h3>

                <ul className="producto">
                  <li
                    className={
                      esAlbaranValorado()
                        ? "dialog-productos-lista-valorado  encabezado"
                        : "dialog-productos-lista  encabezado"
                    }
                  >
                    <p>Nombre</p>
                    <p>Unidades</p>
                    <p>Ref Obra</p>
                    <p>Ral</p>
                    {esAlbaranValorado() && <p>Precio</p>}
                  </li>
                  {albaranfind.productos &&
                    albaranfind.productos.map((producto) => (
                      <li
                        key={producto.idMaterial}
                        className={
                          esAlbaranValorado()
                            ? "dialog-productos-lista-valorado "
                            : "dialog-productos-lista  "
                        }
                      >
                        {editing ? (
                          <input
                            type="text"
                            value={
                              editedProducts.find(
                                (p) => p.idMaterial === producto.idMaterial,
                              )?.nombreMaterial || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedProducts((prev) =>
                                prev.map((p) =>
                                  p.idMaterial === producto.idMaterial
                                    ? { ...p, nombreMaterial: val }
                                    : p,
                                ),
                              );
                            }}
                            className="edit-field"
                          />
                        ) : (
                          <p className="Nombre">{producto.nombreMaterial}</p>
                        )}
                        {editing ? (
                          <input
                            type="number"
                            value={
                              editedProducts.find(
                                (p) => p.idMaterial === producto.idMaterial,
                              )?.cantidad || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedProducts((prev) =>
                                prev.map((p) =>
                                  p.idMaterial === producto.idMaterial
                                    ? { ...p, cantidad: val }
                                    : p,
                                ),
                              );
                            }}
                            className="edit-field small"
                          />
                        ) : (
                          <p className="">{producto.cantidad} </p>
                        )}

                        {editing ? (
                          <input
                            type="text"
                            value={
                              editedProducts.find(
                                (p) => p.idMaterial === producto.idMaterial,
                              )?.refObra || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedProducts((prev) =>
                                prev.map((p) =>
                                  p.idMaterial === producto.idMaterial
                                    ? { ...p, refObra: val }
                                    : p,
                                ),
                              );
                            }}
                            className="edit-field"
                          />
                        ) : (
                          <p className="refOb">{producto.refObra}</p>
                        )}
                        {editing ? (
                          <input
                            type="text"
                            value={
                              editedProducts.find(
                                (p) => p.idMaterial === producto.idMaterial,
                              )?.ral || ""
                            }
                            onChange={(e) => {
                              const val = e.target.value;
                              setEditedProducts((prev) =>
                                prev.map((p) =>
                                  p.idMaterial === producto.idMaterial
                                    ? { ...p, ral: val }
                                    : p,
                                ),
                              );
                            }}
                            className="edit-field small"
                          />
                        ) : (
                          <p className="ral">{producto.ral}</p>
                        )}
                        {producto.precio && (
                          <p className="precio"> {producto.precio} €</p>
                        )}
                      </li>
                    ))}
                </ul>
                <hr></hr>
                {esAlbaranValorado() && albaranfind.productos && (
                  <ul className="total">
                    <li className="cajatotal">
                      <p>Subtotal</p>
                      <p>
                        {(() => {
                          // Calcula el subtotal
                          const subtotal = albaranfind.productos.reduce(
                            (total, producto) =>
                              total +
                              (parseFloat(producto.precio) || 0) *
                                (producto.cantidad || 0),
                            0,
                          );
                          return subtotal.toFixed(2);
                        })()}{" "}
                        €
                      </p>
                    </li>
                    <li className="cajatotal">
                      <p>IVA (21%)</p>
                      <p>
                        {(() => {
                          // Calcula el subtotal y el IVA
                          const subtotal = albaranfind.productos.reduce(
                            (total, producto) =>
                              total +
                              (parseFloat(producto.precio) || 0) *
                                (producto.cantidad || 0),
                            0,
                          );
                          const iva = subtotal * 0.21;
                          return iva.toFixed(2);
                        })()}{" "}
                        €
                      </p>
                    </li>
                    <li className="cajatotal">
                      <p>Total</p>
                      <p>
                        {(() => {
                          // Calcula el subtotal y el total con IVA
                          const subtotal = albaranfind.productos.reduce(
                            (total, producto) =>
                              total +
                              (parseFloat(producto.precio) || 0) *
                                (producto.cantidad || 0),
                            0,
                          );
                          const total = subtotal * 1.21;
                          return total.toFixed(2);
                        })()}{" "}
                        €
                      </p>
                    </li>
                  </ul>
                )}
              </div>
              <div className="observaciones-block">
                <h3 className="observacionesTitulo">Observaciones</h3>
                {albaranfind.productos ? (
                  <p className="observaciones">
                    {albaranfind.productos[0].observaciones}{" "}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>
      </dialog>
      {albaran.length > 0 ? (
        albaran.map((albaran) => (
          <ul
            className="albaran"
            key={albaran.id}
            onClick={() => viewAlbaran(albaran.id)}
          >
            <li>{albaran.id}</li>
            <li>{albaran.obra}</li>
            <li>{albaran.cliente_nombre}</li>
            <li>{formatearFecha(albaran.fecha)}</li>
            <li
              className={
                albaran.proceso === "En proceso"
                  ? "proceso"
                  : albaran.proceso === "Completado"
                    ? "completado"
                    : albaran.proceso === "Pendiente"
                      ? "pendiente"
                      : albaran.proceso === "En Limpieza"
                        ? "limpieza"
                        : albaran.proceso === "En Pintura"
                          ? "pintura"
                          : albaran.proceso === "En Almacen"
                            ? "Almacen"
                            : albaran.proceso === "Entregado"
                              ? "completado"
                              : "cancelado"
              }
            >
              {albaran.proceso}
            </li>
          </ul>
        ))
      ) : (
        <p>No hay Albaranes.</p>
      )}
    </div>
  );
}

export default ListaAlbaran;
