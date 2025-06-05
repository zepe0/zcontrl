import { io } from "socket.io-client";
const API = import.meta.env.VITE_API || "localhost";
const socket = io(`${API}`);
export default socket;
