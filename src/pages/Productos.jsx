import { useState, useEffect } from "react";
const API = import.meta.env.VITE_API || "localhost";
function Home() {
  const [productos, setProductos] = useState([]);

  useEffect(() => {
    fetch(`${API}/productos`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Error al obtener los datos");
        }
        return response.json();
      })
      .then((data) => setProductos(data))
      .catch((error) => console.error("Error:", error));
  }, []); // Se ejecuta al montar el componente

  return (
    <div>
      <h1>Bienvenido a la Página Principal</h1>
      <ul>
        {productos.map((producto) => (
          <li key={producto.id}>{producto.nombre}</li>
        ))}
      </ul>
    </div>
  );
}

export default Home;
