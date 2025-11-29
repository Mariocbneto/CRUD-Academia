import axios from "axios";

const baseURL =
  import.meta.env.VITE_API_URL?.toString() || "http://localhost:3000/api";

export const api = axios.create({
  baseURL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  },
);
