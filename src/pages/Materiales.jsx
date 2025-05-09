import { Link } from "react-router-dom";
import Nav from "../Components/Nav";
import "./Materiales.css";
import { useEffect, useState } from "react";
import MarterialesEdit from "../Components/Materiales/MaterialesEdit";
import { toast } from "react-toastify";
const API = import.meta.env.VITE_API || "localhost";
function Marteriales() {
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [materialE, setMaterial] = useState([]);

  const getMaterial = () => {
    fetch(`http://${API}:3001/api/materiales/productos`)
    .then((res) => res.json())
    .then((data) => {
      setProductos(data);
      toast.success("Materiales cargados correctamente")
    });
  }
  useEffect(() => {
    getMaterial();
  }, []);

 
  const addMaterial = () => {
    const dialog = document.querySelector(".addmaterial");
    dialog.showModal();
  };
  const closeAddMaterial = () => {
    const dialog = document.querySelector(".addmaterial");

    dialog.close();
  };
  const AddNewMaterial = (e) => {
    e.preventDefault();
    const dialog = document.querySelector(".addmaterial");
    const nombre = document.getElementById("nombre").value;
    const stock = document.getElementById("stock").value;
    const precio = document.getElementById("precio").value;
    const obra = document.getElementById("Obra").value;
    const consumo = document.getElementById("consumo").value;

    fetch(`http://192.168.1.36:3001/api/materiales/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ nombre, stock, precio, obra, consumo }),
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
  const editMaterial = (id) => {
    const material = productos.find((material) => material.id === id);
    setInputs(material);
    setEstado(true);
  };

  return (
    <section className="materiales">
      <Nav className="nav"></Nav>
      <div className="dashboard">
        <ul className="dashboardlist">
          <div className="dashboarditem">
            <Link to="/Pinturas">Pintura</Link>
            <li>Albaranes</li>
            <li>
              <Link to="/Materiales">Material</Link>
            </li>
            <li>Pedidos</li>
          </div>
          <div className="dashboarditem">
            <li>Salir</li>
            <li>Albaranes</li>
          </div>
        </ul>
      </div>
      <div className="cont">
        <h1>Materiales</h1>
        <button className="add" onClick={() => addMaterial()}>
          Añadir
        </button>
        <li className="cabezera ">
          <p className="materialesitem nombre-cabezera margin-left">Nombre</p>
          <p className="materialesitem nombre-cabezera">Uni</p>
          <p className="materialesitem nombre-cabezera">Ref-Obra</p>
          <p className="materialesitem nombre-cabezera ">Precio</p>
        </li>
        {productos.length > 0 ? (
          <ul className="productos">
            {productos.map((material) => (
              <li
                key={material.id}
                className="materialeslist"
                onClick={() => editMaterial(material.id)}
              >
                <p className="materialesitem" >{material.nombre}</p>
                <p className="materialesitem">{material.uni}</p>
                <p className="materialesitem">{material.refObra}</p>
                <p className="materialesitem">
                  {material.precio ? material.precio : -""} €
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Cargando...</p>
        )}
      </div>
      <dialog className="addmaterial">
        <h2>Añadir Material</h2>
        <form>
          <label htmlFor="nombre">Nombre</label>
          <input type="text" name="nombre" id="nombre" />
          <label htmlFor="stock">Stock</label>
          <input type="number" name="stock" id="stock" />
          <label htmlFor="precio">Precio</label>
          <input type="number" name="precio" id="precio" />
          <label htmlFor="Obra">Obra</label>
          <input type="text" name="Obra" id="Obra" />
          <label htmlFor="Obra">consumo</label>
          <input type="number" name="consumo" id="consumo" />

          <button onClick={() => closeAddMaterial()}>Cancelar</button>
          <button onClick={(e) => AddNewMaterial(e)}>Añadir</button>
        </form>
      </dialog>
      <MarterialesEdit
        inputs={inputs || {}}
        estado={estado}
        setEstado={setEstado}
        reloadMaterial={getMaterial} 
      />
    </section>
  );
}

export default Marteriales;
