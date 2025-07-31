import { useEffect, useState } from "react";
import "./AddPedido.css";
import ClienteSearch from "../Clientes/ClienteSearch";
import MaterialesDialog from "./MaterialesDialog";
import SignaturePad from "./SignaturePad";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
const API = import.meta.env.VITE_API || "localhost";
function AddPedido({ onAddAlbaran, onClose }) {
  const [clientes, setClientes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [firma, setFirma] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [pedido, setPedido] = useState({
    numAlbaran: "",
    cliente: "",
    Nif: "",
    tel: "",
    dir: "",
    albaran: materiales,
    firma: firma,
    observaciones: "",
    estado: "En Almacén",
  });
  const [nuevoCliente, setNuevoCliente] = useState({
    nombre: "",
    Nif: "",
    tel: "",
    dir: "",
  });
  const [numeroAlbaran, setNumeroAlbaran] = useState("");

  const [clienteActualizado, setClienteActualizado] = useState(0);
  useEffect(() => {
    fetch(`${API}/api/cliente`)
      .then((res) => res.json())
      .then((cliente) => setClientes(cliente));
    const dialog = document.getElementById("addPedido");
    if (dialog && !dialog.open) {
     dialog.showModal();
    }
    numalbaran(); 
    return () => {
      if (dialog && dialog.open) dialog.close();
    };
  }, []);
  const numalbaran = () => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0"); //
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    setNumeroAlbaran(`${dia}${mes}${año}${horas}${minutos}${segundos}`);
    setPedido((prevPedido) => ({
      ...prevPedido,
      numAlbaran: `${dia}${mes}${año}${horas}${minutos}${segundos}`,
    }));
  };


  const handleClienteSeleccionado = (cliente) => {
    setPedido((prevPedido) => ({
      ...prevPedido,
      cliente: cliente.nombre,
      Nif: cliente.Nif,
      tel: cliente.tel,
      dir: cliente.dir,
    }));
  };

  const handleNuevoClienteSubmit = async (e) => {
    e.preventDefault();
    const nuevoCliente = {
      nombre: e.target.nombre.value,
      Nif: e.target.Nif.value,
      tel: e.target.tel.value,
      dir: e.target.dir.value,
    };

    const res = await fetch(`${API}/api/cliente/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(nuevoCliente),
    });
    await res.json();

    // Actualiza la lista de clientes y selecciona automáticamente el nuevo cliente
    setClientes((prevClientes) => [...prevClientes, nuevoCliente]);
    setPedido((prevPedido) => ({
      ...prevPedido,
      cliente: nuevoCliente.nombre,
      tel: nuevoCliente.tel,
      dir: nuevoCliente.dir,
      Nif: nuevoCliente.Nif,
    }));
    setClienteActualizado((prev) => prev + 1);

    document.getElementById("nuevoCliente").close();
  };

  const handleAddCliente = (nombrePrellenado) => {
    setNuevoCliente((prev) => ({ ...prev, nombre: nombrePrellenado })); // Prellena el nombre
    document.getElementById("nuevoCliente").showModal(); // Abre el modal
  };

  const handleNuevoClienteChange = (e) => {
    const { name, value } = e.target;
    setNuevoCliente((prev) => ({ ...prev, [name]: value }));
  };

  const openMaterialesDialog = () => {
    document.getElementById("materiales").showModal();
  };
  const handleAddMaterial = (nuevoMaterial) => {
    setMateriales((prev) => [...prev, nuevoMaterial]);
    setPedido((prevPedido) => ({
      ...prevPedido,
      albaran: [...prevPedido.albaran, nuevoMaterial],
    }));
  };
  const handleObservacionesChange = (e) => {
    const { value } = e.target;
    setPedido((prevPedido) => ({
      ...prevPedido,
      observaciones: value,
    }));
  };
  const handleSaveSignature = (dataURL) => {
    setFirma(dataURL);
    setPedido((prevPedido) => ({
      ...prevPedido,
      firma: dataURL,
    }));
  };
  const Guardaralbaran = async () => {
    const res = await fetch(`${API}/api/albaran/add`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pedido),
    });
    const data = await res.json();

    if (data.error) {
      toast.error(data.error);
    }

    if (data.message) {
      console.log(data.message);
      onAddAlbaran(data.message);
      setPedido({
        numAlbaran: "",
        cliente: "",
        Nif: "",
        tel: "",
        dir: "",
        albaran: [],
        firma: null,
        observaciones: "",
        estado: "En Almacén",
      });
      setMateriales([]);
      document.getElementById("addPedido").close();
      setNumeroAlbaran("");
      setClienteActualizado(0);
      setNuevoCliente({
        nombre: "",
        Nif: "",
        tel: "",
        dir: "",
      });
      setClientes([]);
      fetch(`{API}/api/cliente`)
        .then((res) => res.json())
        .then((cliente) => setClientes(cliente));
      fetch(`{API}/api/materiales/productos`)
        .then((res) => res.json())
        .then((data) => setMateriales(data));
    }
  };
  return (
    <section>
      <dialog id="addPedido">
    <button
      className="dialog-close"
      onClick={() => {
        const dialog = document.getElementById("addPedido");
        if (dialog) dialog.close();
        onClose && onClose();
      }}
    >
      ✖
    </button>
        <button onClick={Guardaralbaran}>Guardar</button>
        <form id="datosCliente" className="formCliente">
          <div className="DatosClientes">
            <input
              type="text"
              name="numAlbaran"
              placeholder="Num. Albarán"
              value={numeroAlbaran}
              readOnly
            />
            <ClienteSearch
              clientes={clientes}
              onClienteSeleccionado={handleClienteSeleccionado}
              onAddCliente={handleAddCliente}
              materiales={materiales}
              cliente={pedido.cliente}
              clienteSeleccionado={clienteActualizado}
            />
            <input
              type="text"
              name="Nif"
              placeholder="Nif."
              value={pedido.Nif}
              readOnly
            />
            <input
              type="text"
              name="tel"
              placeholder="Tel."
              value={pedido.tel}
              readOnly
            />
            <input
              type="text"
              name="dir"
              placeholder="Dir."
              value={pedido.dir}
              readOnly
            />
          </div>
        </form>

        <h4>
          {" "}
          <button type="button" onClick={openMaterialesDialog}>
            {" "}
            ✙ Añadir
          </button>
        </h4>

        <ul className="AlbaranMateriales">
          <li className="AlbaranMaterialitem">
            <p>Referencia</p> <p>Nombre</p> <p>Cantidad</p> <p>R.Obra</p>
            <p>Ral</p>
          </li>
          {pedido.albaran.map((material, index) => (
            <li key={index} className="AlbaranMaterialitem">
              <p>{material.ref}</p> <p>{material.mat} </p>
              <p>
                {material.unid}
                <small>/Und</small>
              </p>
              <p>{material.refObra}</p>
              <p>{material.Ral}</p>
            </li>
          ))}
        </ul>
        <div className="dialog-footer">
          <textarea
            placeholder="Observaciones"
            value={pedido.observaciones}
            onChange={handleObservacionesChange}
          />
          <SignaturePad onSave={handleSaveSignature} />
        </div>
      </dialog>
      <dialog id="nuevoCliente">
        <form onSubmit={handleNuevoClienteSubmit}
        className="formNuevoCliente">
         <button
            className="dialog-close"
            onClick={() => {
              const dialog = document.getElementById("nuevoCliente");
              if (dialog) dialog.close();
            }}
            onKeyDownCapture={(e) => {
           
              if (e.key === "Escape") {
                e.preventDefault();
                const dialog = document.getElementById("nuevoCliente");
                if (dialog) dialog.close();
              }
            }
            }
          >
            ✖
          </button> 
         
          <fieldset> <img src="ClienteDefault.svg" width="24" height="24" viewBox="0 0 24 24"></img>Nuevo Cliente</fieldset>
          <input
            type="text"
            name="nombre"
            placeholder="Nombre"
            value={nuevoCliente.nombre}
            onChange={handleNuevoClienteChange}

          />
          <input
            type="text"
            name="Nif"
            placeholder="Nif"
            onChange={handleNuevoClienteChange}
          />
          <input
            type="text"
            name="tel"
            placeholder="Teléfono"
            onChange={handleNuevoClienteChange}
          />
          <input
            type="text"
            name="dir"
            placeholder="Dirección"
            onChange={handleNuevoClienteChange}
          />

          <button type="submit" className="btnGuardarCliente">Guardar Cliente</button>
        </form>
      </dialog>
      <MaterialesDialog
        onAddMaterial={handleAddMaterial}
        materiales={materiales}
      />
    </section>
  );
}
export default AddPedido;
