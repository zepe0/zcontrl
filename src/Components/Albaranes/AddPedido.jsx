import { useEffect, useState } from "react";
import "./AddPedido.css";
import ClienteSearch from "../Clientes/ClienteSearch";
import MaterialesDialog from "./MaterialesDialog";
import SignaturePad from "./SignaturePad";
import UploadPedidoFile from "./UploadPedidoFile";
import ReviewPedidoData from "./ReviewPedidoData";
import { toast } from "react-toastify";
import { Socket } from "socket.io-client";
const API = import.meta.env.VITE_API || "localhost";
function AddPedido({ onAddAlbaran, onClose }) {
  const [clientes, setClientes] = useState([]);
  const [materiales, setMateriales] = useState([]);
  const [firma, setFirma] = useState(null);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [showReview, setShowReview] = useState(false);
  const [extractedData, setExtractedData] = useState(null);

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
    numalbaran();
  }, []);

  useEffect(() => {
    fetch(`${API}/api/cliente`)
      .then((res) => res.json())
      .then((cliente) => setClientes(cliente))
      .catch((error) => console.error("Error al cargar clientes:", error));
  }, []);

  useEffect(() => {
    const dialog = document.getElementById("addPedido");
    if (dialog) {
      if (!dialog.open) {
        dialog.showModal();
      }
      return () => {
        if (dialog && dialog.open) {
          dialog.close();
        }
      };
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        const dialog = document.getElementById("addPedido");
        if (dialog && dialog.open) {
          dialog.close();
          closeAllSubdialogs();
          onClose && onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const numalbaran = () => {
    const ahora = new Date();
    const año = ahora.getFullYear();
    const mes = String(ahora.getMonth() + 1).padStart(2, "0");
    const dia = String(ahora.getDate()).padStart(2, "0");
    const horas = String(ahora.getHours()).padStart(2, "0");
    const minutos = String(ahora.getMinutes()).padStart(2, "0");
    const segundos = String(ahora.getSeconds()).padStart(2, "0");

    const nuevoNumAlbaran = `${dia}${mes}${año}${horas}${minutos}${segundos}`;
    setNumeroAlbaran(nuevoNumAlbaran);
    setPedido((prevPedido) => ({
      ...prevPedido,
      numAlbaran: nuevoNumAlbaran,
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

  // utility to close any secondary modal that may be open
  const closeAllSubdialogs = () => {
    ["nuevoCliente", "materiales", "reviewPedido"].forEach((id) => {
      const dlg = document.getElementById(id);
      if (dlg && dlg.open) dlg.close();
    });
  };

  const openMaterialesDialog = () => {
    // close any other sub-dialog (nuevoCliente, review) before opening materiales
    closeAllSubdialogs();
    const dlg = document.getElementById("materiales");
    if (dlg) dlg.showModal();
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

  const handleDataExtracted = (data) => {
    // Guardar los datos extraídos y mostrar el diálogo de revisión
    setExtractedData(data);
    setShowReview(true);
  };

  const handleReviewConfirm = (reviewedData) => {
    // Procesar los datos revisados y confirmados
    if (reviewedData.cliente) {
      setPedido((prevPedido) => ({
        ...prevPedido,
        cliente: reviewedData.cliente.nombre || "",
        Nif: reviewedData.cliente.Nif || "",
        tel: reviewedData.cliente.tel || "",
        dir: reviewedData.cliente.dir || "",
        numAlbaran: reviewedData.numAlbaran || prevPedido.numAlbaran,
      }));
    }

    if (reviewedData.materiales && Array.isArray(reviewedData.materiales)) {
      setMateriales(reviewedData.materiales);
      setPedido((prevPedido) => ({
        ...prevPedido,
        albaran: reviewedData.materiales,
      }));
    }

    if (reviewedData.observaciones) {
      setPedido((prevPedido) => ({
        ...prevPedido,
        observaciones: reviewedData.observaciones,
      }));
    }

    // Cerrar el diálogo de revisión
    const dialog = document.getElementById("reviewPedido");
    if (dialog) {
      dialog.close();
    }
    setShowReview(false);
    toast.success("Datos del pedido confirmados correctamente");
  };

  const handleReviewCancel = () => {
    // Cerrar el diálogo de revisión sin aplicar cambios
    const dialog = document.getElementById("reviewPedido");
    if (dialog) {
      dialog.close();
    }
    setShow(false);
    setExtractedData(null);
  };

  return (
    <section id="addPedidoSection">
      <dialog id="addPedido">
        <button
          className="dialog-close"
          onClick={() => {
            const dialog = document.getElementById("addPedido");
            if (dialog) dialog.close();
            closeAllSubdialogs();
            closeAllSubdialogs();
            onClose && onClose();
          }}
        >
          ✖
        </button>
        <div className="dialog-buttons-container">
          <button onClick={Guardaralbaran} className="btn-guardar">
            Guardar
          </button>
          <UploadPedidoFile onDataExtracted={handleDataExtracted} />
        </div>
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
        <form onSubmit={handleNuevoClienteSubmit} className="formNuevoCliente">
          <button
            className="dialog-close"
            onClick={() => {
              const dialog = document.getElementById("nuevoCliente");
              if (dialog) dialog.close();
              closeAllSubdialogs();
            }}
            onKeyDownCapture={(e) => {
              if (e.key === "Escape") {
                e.preventDefault();
                const dialog = document.getElementById("nuevoCliente");
                if (dialog) dialog.close();
                closeAllSubdialogs();
              }
            }}
          >
            ✖
          </button>

          <fieldset>
            {" "}
            <img
              src="ClienteDefault.svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            ></img>
            Nuevo Cliente
          </fieldset>
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

          <button type="submit" className="btnGuardarCliente">
            Guardar Cliente
          </button>
        </form>
      </dialog>
      <MaterialesDialog
        onAddMaterial={handleAddMaterial}
        materiales={materiales}
        onClose={closeAllSubdialogs}
      />
      {showReview && extractedData && (
        <ReviewPedidoData
          extractedData={extractedData}
          onConfirm={handleReviewConfirm}
          onCancel={handleReviewCancel}
        />
      )}
    </section>
  );
}
export default AddPedido;
