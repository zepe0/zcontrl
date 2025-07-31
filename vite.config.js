import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  base: "/zcontrol/",
 

  plugins: [react()],
  server: {
   /*  https: true, */
    host: "0.0.0.0", // Permite accesos desde la red local
    port: 3000, 
    // Puerto para el servidor de desarrollo
  },
});
