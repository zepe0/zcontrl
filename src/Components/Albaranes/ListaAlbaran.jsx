import { useState } from "react";
import "./ListaAlbaran.css";
import { toast } from "react-toastify";
const API = import.meta.env.VITE_API || "localhost";
function ListaAlbaran({ albaran }) {
  const [albaranfind, setAlbaranfind] = useState([]);

  const formatearFecha = (fecha) => {
    const date = new Date(fecha);
    const dia = String(date.getDate()).padStart(2, "0");
    const mes = String(date.getMonth() + 1).padStart(2, "0");
    const año = date.getFullYear();
    return `${dia}/${mes}/${año}`;
  };

  function viewAlbaran(id) {
    const dialog = document.querySelector(".dialog");
    dialog.showModal();
    /*   const albaranfind = albaran.find((item) => item.id === id); */

    fetch(`${API}/api/albaran/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          toast.error("Error:", data.error);
          return;
        }
        setAlbaranfind(data);
      })
      .catch((error) => toast.error("Error:", error));
  }

  function closedialog() {
    const dialog = document.querySelector(".dialog");
    dialog.close();
    setAlbaranfind([]);
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

  return (
    <div className="listaprocesos">
      <dialog className="dialog">
        <div className="dialog-content">
          <button onClick={closedialog}>X</button>

          {albaranfind.cliente && (
            <section className="dialog-cliente">
              <select name="proceso" id="proceso" className="selectProceso">
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
            <h3>Datos Albaran</h3>

            <ul>
              <li className="dialog-productos-lista ">
                <p>Nombre</p>
                <p>Unidades</p>
                <p>Ref Obra</p>
                <p>Ral</p>
              </li>

              {albaranfind.productos &&
                albaranfind.productos.map((producto) => (
                  <li
                    key={producto.idMaterial}
                    className="dialog-productos-lista"
                  >
                    <p className="Nombre">{producto.nombreMaterial}</p>
                    <p className="">{producto.cantidad} </p>

                    <p className="refOb">{producto.refObra}</p>
                    <p className="ral">{producto.ral}</p>
                  </li>
                ))}
            </ul>
            <hr></hr>
            <h3 className="observacionesTitulo">Observaciones</h3>
            {albaranfind.productos ? (
              <p className="observaciones">
                {albaranfind.productos[0].observaciones}{" "}
              </p>
            ) : null}
          </div>
          <p></p>
          <button onClick={saveProceso}>Guardar</button>
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
            <li>{albaran.nCliente}</li>
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
