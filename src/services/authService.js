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
      localStorage.setItem("firstName", response.data.firstName || "");
      localStorage.setItem("lastName", response.data.lastName || "");
      localStorage.setItem("buildingName", response.data.buildingName || "");
      localStorage.setItem("unitId", response.data.unitId || "");
      localStorage.setItem("userUnitNumber", response.data.unitNumber || "");
      return response.data;
    } else {
      throw new Error(
        "Your account is not active. Please contact an administrator."
      );
    }
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error("Invalid username or password");
    } else if (error.response?.status === 500) {
      throw new Error("Server error. Please try again later.");
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
  localStorage.removeItem("firstName");
  localStorage.removeItem("lastName");
  localStorage.removeItem("buildingName");
  localStorage.removeItem("unitId");
  localStorage.removeItem("userUnitNumber");
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

export const getFirstName = () => localStorage.getItem("firstName");
export const getLastName = () => localStorage.getItem("lastName");
export const getBuildingName = () => localStorage.getItem("buildingName");
export const getUnitId = () => localStorage.getItem("unitId");
export const getUserUnitNumber = () => localStorage.getItem("userUnitNumber");

export const isAdmin = () => {
  const roles = getUserRoles();
  if (roles.includes("ADMIN")) {
    return true;
  }
  return false;
};

export const isBuildingManager = () => {
  const roles = getUserRoles();
  if (roles.includes("BUILDING MANAGER")) {
    return true;
  }
  return false;
};

export const isSecurity = () => {
  const roles = getUserRoles();
  if (roles.includes("SECURITY")) {
    return true;
  }
  return false;
};

export const isAmenityBookingEnabled = () => {
  const val = localStorage.getItem("amenityBookingEnabled");
  return val === "true";
};

export const isMaintenanceEnabled = () => {
  const val = localStorage.getItem("maintenanceEnabled");
  return val === "true";
};

export const isComplaintManagementEnabled = () => {
  const val = localStorage.getItem("complaintManagementEnabled");
  return val === "true";
};

export const saveBuildingSettings = (settings) => {
  if (!settings) return;
  localStorage.setItem("amenityBookingEnabled", settings.amenityBookingEnabled);
  localStorage.setItem("maintenanceEnabled", settings.maintenanceEnabled);
  localStorage.setItem("complaintManagementEnabled", settings.complaintManagementEnabled);
};

export default {
  login,
  logout,
  getJwtToken,
  isAuthenticated,
  getUserRoles,
  getUserId,
  getBuildingId,
  isAdmin,
  isBuildingManager,
  isSecurity,
  getFirstName,
  getLastName,
  getBuildingName,
  getUnitId,
  getUserUnitNumber,
  isAmenityBookingEnabled,
  isMaintenanceEnabled,
  isComplaintManagementEnabled,
  saveBuildingSettings,
};
