import Nav from "../Components/Nav";
import "./Home.css";
import "../ral.css";
import { useEffect, useState } from "react";
import LisatPintura from "../Components/Pinturas/ListaPintura";
import ListaAlbaran from "../Components/Albaranes/ListaAlbaran";
import AddPedido from "../Components/Albaranes/AddPedido";
import io from "socket.io-client";
import { Link } from "react-router-dom";
const API = import.meta.env.VITE_API || "localhost";
const socket = io(`http://${API}:3001`);

function Home() {
  const [pinturas, setPinturas] = useState([]);
  const [albaran, setAlbaran] = useState([]);

  useEffect(() => {
    // Cargar las pinturas al inicio
    fetch(`http://${API}:3001/`)
      .then((res) => res.json())
      .then((data) => setPinturas(data))
      .catch((error) => console.error("Error al cargar las pinturas:", error));

    // Cargar los albaranes al inicio
    fetch(`http://${API}:3001/api/albaranes`)
      .then((res) => res.json())
      .then((data) => setAlbaran(data))
      .catch((error) => console.error("Error al cargar los albaranes:", error));

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
      socket.off("albaranModificado");
      socket.off("pinturaModificada");
      socket.off("actualizarAlbaranes");
    };
  }, []);
  const handleAddAlbaran = (nuevoAlbaran) => {
    if (nuevoAlbaran) {
      fetch(`http://${API}:3001/api/albaranes`)
        .then((res) => res.json())
        .then((data) => {
          setAlbaran(data);
          socket.emit("nuevoAlbaran", data);
        })
        .catch((error) =>
          console.error("Error al cargar los albaranes:", error)
        );
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
          <AddPedido onAddAlbaran={handleAddAlbaran} />
          <ListaAlbaran albaran={albaran} />
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
