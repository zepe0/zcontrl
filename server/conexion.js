/* eslint-disable no-undef */
import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });
let conexion;
try {
  conexion = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });
  console.log("¡Conexión exitosa a la base de datos!");
} catch (error) {
  console.error("Error al conectar a la base de datos:", error);
  process.exit(1);
}

export default conexion;
