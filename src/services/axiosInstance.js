// src/services/axiosInstance.js
import axios from "axios";
import { getJwtToken, logout } from "./authService";

const axiosInstance = axios.create({
  baseURL: "http://localhost:8080",
});

axiosInstance.interceptors.request.use((config) => {
  const token = getJwtToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => {
    // Successful response — must return it
    console.log("Response interceptor:", response);
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      console.log(error.response);
      localStorage.removeItem("jwtToken");
      localStorage.removeItem("roles");
      localStorage.removeItem("userId");
      localStorage.removeItem("buildingId");
      //window.location.href = "/login"; // redirect to login page
      logout();
      return Promise.reject(error);
    }

    // Always reject so calling code can handle other errors
    return Promise.reject(error);
  }
);

export default axiosInstance;
