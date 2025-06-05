import Nav from "../Components/Nav";
import "./Home.css";
import "../ral.css";
import { useEffect, useState } from "react";
import LisatPintura from "../Components/Pinturas/ListaPintura";
import ListaAlbaran from "../Components/Albaranes/ListaAlbaran";
import AddPedido from "../Components/Albaranes/AddPedido";
import io from "socket.io-client";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
const API = import.meta.env.VITE_API || "localhost";
const socket = io(`${API}`);

function Home() {
  const [pinturas, setPinturas] = useState([]);
  const [albaran, setAlbaran] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredAlbaranes, setFilteredAlbaranes] = useState([]);
  const [showAddPedido, setShowAddPedido] = useState(false);

  useEffect(() => {
    // Cargar las pinturas al inicio
    fetch(`${API}/`)
      .then((res) => res.json())
      .then((data) => setPinturas(data))
      .catch((error) => toast.error("Error al cargar las pinturas:", error));

    // Cargar los albaranes al inicio
    fetch(`${API}/api/albaranes`)
      .then((res) => res.json())
      .then((data) => setAlbaran(data))
      .catch((error) => toast.error("Error al cargar los albaranes:", error));

    // Escuchar el evento `albaranModificado` desde el servidor
    socket.on("albaranModificado", (data) => {
      console.log("Evento recibido en Home:");
      // Actualizar el estado global `albaran`
      setAlbaran((prevAlbaranes) =>
        prevAlbaranes.map((item) =>
          item.id === data.id ? { ...item, proceso: data.proceso } : item
        )
      );
    });

    socket.on("Actualizar_pintura", (data) => {
      setPinturas(data);
    });

    socket.on("pinturaModificada", (data) => {
      console.log("Evento recibido en Home para pintura:");

      setPinturas((prevPinturas) =>
        prevPinturas.map((item) =>
          item.id === data.id ? { ...item, ...data } : item
        )
      );
    });

    socket.on("actualizarAlbaranes", (data) => {
      console.log("Actualización de albaranes recibida:");
      setAlbaran(data);
    });

    return () => {
      socket.off("Actualizar_pintura");
      socket.off("albaranModificado");
      socket.off("pinturaModificada");
      socket.off("actualizarAlbaranes");
    };
  }, []);
  const handleAddAlbaran = (nuevoAlbaran) => {
    if (nuevoAlbaran) {
      fetch(`${API}/api/albaranes`)
        .then((res) => res.json())
        .then((data) => {
          setAlbaran(data);
          socket.emit("nuevoAlbaran", data);
          toast.success("Albarán añadido correctamente");
        })
        .catch((error) => toast.error("Error al cargar los albaranes:", error));
    }
  };
  function formateaFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    const dia = String(fecha.getDate()).padStart(2, "0");
    const mes = String(fecha.getMonth() + 1).padStart(2, "0");
    const año = fecha.getFullYear();
    return `${dia}/${mes}/${año}`;
  }
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearch(query);

    if (query === "") {
      setFilteredAlbaranes([]);
    } else {
      const filtered = albaran.filter(
        (item) =>
          (item.nCliente && item.nCliente.toLowerCase().includes(query)) ||
          (item.proceso && item.proceso.toLowerCase().includes(query)) ||
          (formateaFecha(item.fecha) &&
            formateaFecha(item.fecha).toLowerCase().includes(query)) // Ajusta el campo de fecha según tu modelo
      );
      setFilteredAlbaranes(filtered);
    }
  };

  return (
    <section className="home">
      <Nav className="nav"></Nav>
      <div className="dashboard">
        <ul className="dashboardlist">
          <div className="dashboarditem">
            <li>
              <Link to="/Pinturas">Pintura</Link>
            </li>
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

      <div className="cuerpo">
        <div className="listaalbaranes">
          <h2>Pedidos</h2>
          {showAddPedido && (
            <AddPedido
              onAddAlbaran={handleAddAlbaran}
              onClose={() => setShowAddPedido(false)}
            />
          )}
          <div className="buttons_top">
            <button onClick={() => setShowAddPedido(!showAddPedido)}>
              Añadir pedido
            </button>
            <input
              type="text"
              placeholder="Buscar "
              value={search}
              onChange={handleSearch}
              className="buttons_top"
            />
          </div>
          <ListaAlbaran
            albaran={search.length > 0 ? filteredAlbaranes : albaran}
          />
        </div>
        <div className="listapinturas">
          <h2>Pintura</h2>
          <LisatPintura pinturas={pinturas} />
        </div>
      </div>
    </section>
  );
}

export default Home;
