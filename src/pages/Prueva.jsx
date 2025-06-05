import { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./Prueva.css";
const API = import.meta.env.VITE_API || "localhost";
const socket = io(`${API}`);

function Prueva() {
  const [productos, setProductos] = useState([]);
  const [nuevoProducto, setNuevoProducto] = useState("");

  useEffect(() => {
    // Escucha actualizaciones desde el servidor
    socket.on("actualizarProductos", (data) => {
      setProductos((prev) => [...prev, data]); // Actualiza la lista de productos
    });

    // Limpia el listener al desmontar el componente
    return () => {
      socket.off("actualizarProductos");
    };
  }, []);

  const enviarProducto = () => {
    // Enviar datos al servidor
    socket.emit("modificarProducto", { nombre: nuevoProducto });
    setNuevoProducto("");
  };

  const eliminarProducto = (index) => {
    // Enviar datos al servidor
    productos.splice(index, 1);
    setProductos([...productos]);
    console.log(productos);

    socket.emit("eliminarProducto", { index });
  };

  return (
    <body>
      <aside class="sidebar">
        <nav>
          <ul>
            <li>
              <a href="#">Dashboard</a>
            </li>
            <li>
              <a href="#">Pintura</a>
            </li>
            <li>
              <a href="#">Albaranes</a>
            </li>
            <li>
              <a href="#">Material</a>
            </li>
            <li>
              <a href="#">Pedidos</a>
            </li>
            <li>
              <a href="#">Settings</a>
            </li>
            <li>
              <a href="#">Profile</a>
            </li>
            <li>
              <a href="#">Logout</a>
            </li>
          </ul>
        </nav>
      </aside>

      <main>
        <section class="summary">
          <div class="summary-box finalizados">11</div>
          <div class="summary-box">-</div>
          <div class="summary-box">3</div>
          <div class="summary-box">5</div>
        </section>

        <section class="data-table" id="albaranes">
          <h2>Albaranes</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Ejemplo 1</td>
                <td>13/03/2025</td>
                <td>En Proceso</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section class="data-table" id="pedidos">
          <h2>Pedidos</h2>
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Fecha</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>1</td>
                <td>Ejemplo 1</td>
                <td>13/03/2025</td>
                <td>Aceptado</td>
              </tr>
            </tbody>
          </table>
        </section>

        <aside class="pintura">
          <h2>Pintura</h2>
          <ul>
            <li>Color 1: 200 kg</li>
            <li>Color 2: 200 kg</li>
          </ul>
        </aside>
      </main>
    </body>
  );
}

export default Prueva;
