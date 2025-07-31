import Nav from "../Components/Nav";
import "./Home.css";
import "../ral.css";
import { useEffect, useState } from "react";

import ListaAlbaran from "../Components/Albaranes/ListaAlbaran";

import io from "socket.io-client";

import { toast } from "react-toastify";
import Dashboarditem from "../Components/DashboardItem";
import Loader from "../Components/Loader"; // Asegúrate de que la ruta sea correcta
const API = import.meta.env.VITE_API || "localhost";
const socket = io(`${API}`);

function Albaranes() {
 
  const [albaran, setAlbaran] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredAlbaranes, setFilteredAlbaranes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [loadingAlbaran, setLoadingAlbaran] = useState(true);


  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch(`${API}/`).then((res) => res.json()),
      fetch(`${API}/api/albaranes`).then((res) => res.json()),
    ])
      .then(([pinturasData, albaranData]) => {
        if (pinturasData.error) {
          toast.error(pinturasData.error)
        }
     
        setAlbaran(albaranData);
        setLoading(false);
        setLoadingAlbaran(false);
      
      })
      .catch((error) => {
        toast.error("Error al cargar los datos:", error);
        setLoading(false);
      });

    // Escuchar el evento `albaranModificado` desde el servidor
    socket.on("albaranModificado", (data) => {
      console.log("Evento recibido en Albaranes:");
      // Actualizar el estado global `albaran`
      setAlbaran((prevAlbaranes) =>
        prevAlbaranes.map((item) =>
          item.id === data.id ? { ...item, proceso: data.proceso } : item
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
      <Nav className="nav" />
      <div className="dashboard">
        <ul className="dashboardlist">
          <Dashboarditem />
        </ul>
      </div>

      <div className="cuerpo">
        <div className="listaalbaranes">
          <h2>Albaranes</h2>
     
          <div className="buttons_top">
         
            <input
              type="text"
              placeholder="Buscar "
              value={search}
              onChange={handleSearch}
              className="buttons_top"
            />
          </div>
          {loadingAlbaran ? (
            <Loader />
          ) : (
            <ListaAlbaran
              albaran={search.length > 0 ? filteredAlbaranes : albaran}
            />
          )}
        </div>
        
      </div>
    </section>
  );
}

export default Albaranes;
