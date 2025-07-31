import { Link } from "react-router-dom";
import Nav from "../Components/Nav";
import "./Materiales.css";
import "../ral.css";
import { useEffect, useState } from "react";
import MarterialesEdit from "../Components/Materiales/MaterialesEdit";
import { toast } from "react-toastify";
import Dashboarditem from "../Components/DashboardItem";
import Loader from "../Components/Loader"; // Asegúrate de que la ruta sea correcta
const API = import.meta.env.VITE_API || "localhost";
function Pinturas() {
  const [productos, setProductos] = useState([]);
  const [estado, setEstado] = useState(null);
  const [inputs, setInputs] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const getPinturas = () => {
    fetch(`${API}/`)
      .then((res) => res.json())
      .then((data) => {
        setProductos(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast.error("Error al cargar las pinturas");
      });
  };
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);
    if (query === "") {
      setFilteredProducts([]);
    } else {
      const filtered = productos.filter(
        (producto) =>
          producto.ral.toLowerCase().includes(query) ||
          producto.marca.toLowerCase().includes(query)
      );
      setFilteredProducts(filtered);
    }
  };
  const notifipintura = () => {
    toast.success("Pintura editada correctamente");
  };
  useEffect(() => {
    getPinturas();
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

    fetch(`http://192.168.1.36/api/materiales/add`, {
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

  const editpintura = (id) => {
    const material = productos.find((material) => material.id === id);
    setInputs(material);
    setEstado(true);
  };

  return (
    <section className="materiales">
      <Nav className="nav"></Nav>
      <div className="dashboard">
        <ul className="dashboardlist">
          <Dashboarditem />
        </ul>
      </div>
      <div className="cont">
        <div className="buttons_top">
          <button className="add" onClick={() => addMaterial()}>
            Añadir
          </button>
          <input type="text" placeholder="Buscar" onChange={handleSearch} />
        </div>

        {loading ? (
          <Loader />
        ) : search.length > 0 ? (
          filteredProducts.length > 0 ? (
            <ul className="productos">
              {filteredProducts.map((pintura) => (
                <li
                  key={pintura.id}
                  className="pinturalist"
                  onClick={() => editpintura(pintura.id)}
                >
                  <p className={`${pintura.ral.replace(/\s+/g, "-")} `}></p>
                  <p className="materialesitem ">{pintura.ral}</p>
                  <p className="materialesitem ">{pintura.marca}</p>
                  <p
                    className={`${
                      pintura.stock < 10 ? "warning" : ""
                    } materialesitem nombre-cabezera-right`}
                  >
                    {pintura.stock}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p>Sin resultados</p>
          )
        ) : productos.length > 0 ? (
          <ul className="productos">
            {productos.map((pintura) => (
              <li
                key={pintura.id}
                className="pinturalist"
                onClick={() => editpintura(pintura.id)}
              >
                <p className={`${pintura.ral.replace(/\s+/g, "-")} `}></p>
                <p className="materialesitem ">{pintura.ral}</p>
                <p className="materialesitem ">{pintura.marca}</p>
                <p
                  className={`${
                    pintura.stock < 10 ? "warning" : ""
                  } materialesitem nombre-cabezera-right`}
                >
                  {pintura.stock}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>Cargando...</p>
        )}
      </div>
      <dialog className="addpintura">
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
        reload={getPinturas}
        notifipintura={notifipintura}
      />
    </section>
  );
}

export default Pinturas;
