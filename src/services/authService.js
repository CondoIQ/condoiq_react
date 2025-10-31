// src/services/authService.js
import axios from "axios";

const API_URL = "http://localhost:8080/api/auth";

export const login = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });

    console.log("Login response:", response.data);

    if (response.data?.isActive) {
      localStorage.setItem("jwtToken", response.data.jwtToken);
      localStorage.setItem("roles", response.data.roles);
      localStorage.setItem("userId", response.data.userId);
      localStorage.setItem("buildingId", response.data.buildingId);
      return response.data;
    } else {
      throw new Error(
        "Your account is not active. Please contact an administrator."
      );
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Invalid username or password");
    } else {
      throw new Error(error.message || "Unable to login. Please try again.");
    }
  }
};

export const logout = () => {
  localStorage.removeItem("jwtToken");
  localStorage.removeItem("roles");
  localStorage.removeItem("userId");
  localStorage.removeItem("buildingId");
  window.location.href = "/login"; // redirect to login page
};

export const getJwtToken = () => localStorage.getItem("jwtToken");

export const isAuthenticated = () => !!getJwtToken();

export const getUserRoles = () => {
  const roles = localStorage.getItem("roles");
  return roles ? roles.split(",") : [];
};

export const getUserId = () => localStorage.getItem("userId");

export const getBuildingId = () => localStorage.getItem("buildingId");

export default {
  login,
  logout,
  getJwtToken,
  isAuthenticated,
  getUserRoles,
  getUserId,
  getBuildingId,
};
