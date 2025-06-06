import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config({ path: "../../.env" });


import { createServer } from "http";
import { Server } from "socket.io";

// Importa las rutas
import productosRouter from "./query/productos.js";
import getPinturas from "./query/Pintura/getPinturas.js";
import getAlbaranes from "./query/Albaranes/getAlbaranes.js";
import editAlbaran from "./query/Albaranes/editAlbaran.js";
import addMaterial from "./query/Material/addMaterial.js";
import getMaterial from "./query/Material/getMaterial.js";
import getClientes from "./query/Clientes/getClientes.js";
import addCliente from "./query/Clientes/addCliente.js";
import getCliente from "./query/Clientes/getCliente.js";
import newAlbaran from "./query/Albaranes/newAlbaran.js";
import getAlbaran from "./query/Albaranes/getAlbaran.js";
import editPintura from "./query/Pintura/editPintura.js";
import editMaterial from "./query/Material/editMaterial.js";

const app = express();
const PORT = process.env.PORT || 3001;
const API = process.env.API || "localhost";

// Middleware para habilitar CORS (necesario para conectar con React en desarrollo)
app.use(cors());

// Middleware para parsear JSON
app.use(express.json());

const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
  },
});

// Usar las rutas de productos
app.use("/api/productos", productosRouter);
app.use("/api/albaranes", getAlbaranes);
app.use("/api/albaran", newAlbaran(io));
app.use("/api/albaran", getAlbaran);
app.use("/api/albaranes", editAlbaran(io));

app.use("/api/materiales", addMaterial(io));
app.use("/api/materiales", getMaterial);
app.use("/api/materiales/edit", editMaterial);

app.use("/api/cliente", getClientes);
app.use("/api/cliente", addCliente(io));
app.use("/api/cliente", getCliente);

app.use("/", getPinturas);
app.use("/api/pintura/edit", editPintura);

// Configurar los eventos de Socket.IO
io.on("connection", (socket) => {
  console.log(`Cliente conectado: ${socket.id}`);

  
  socket.on("nuevoAlbaran", (data) => {
  
    io.emit("actualizarAlbaranes", data);
  });

  socket.on("modificarProducto", (data) => {
 
    io.emit("actualizarProductos", data);
  });

  // Detectar desconexión
  socket.on("disconnect", () => {
    console.log(`Cliente desconectado: ${socket.id}`);
  });
});

// Inicia el servidor HTTP
httpServer.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor ejecutándose en ${API}:${PORT}`);
});
