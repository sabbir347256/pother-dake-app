import { io } from "socket.io-client";
import config from "./envConfig";

export const socket = io(config?.backendUrl || "http://192.168.0.100:5000", {
  autoConnect: false,
});