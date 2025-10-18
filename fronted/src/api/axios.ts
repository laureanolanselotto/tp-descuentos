import axios from "axios";

const instance = axios.create({
    baseURL: "http://localhost:3000/api", // Cambiar a la URL 
    withCredentials: true, // Habilitar el envío de cookies
});

export default instance;