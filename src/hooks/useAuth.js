// src/hooks/useAuth.js
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

export const useAuth = () => {
  const navigate = useNavigate();

  const logout = () => {
    authService.logout();
    navigate("/login"); // optional, in case you want react-router redirect
  };

  const getToken = () => authService.getJwtToken();
  const getUserId = () => authService.getUserId();
  const isAuthenticated = () => authService.isAuthenticated();
  const isAdmin = () => authService.isAdmin();
  const isBuildingManager = () => authService.isBuildingManager();
  const getBuildingId = () => authService.getBuildingId();
  const getFirstName = () => authService.getFirstName();
  const getLastName = () => authService.getLastName();
  const getBuildingName = () => authService.getBuildingName();
  const getUnitId = () => authService.getUnitId();

  return {
    logout,
    getToken,
    getUserId,
    isAuthenticated,
    isAdmin,
    isBuildingManager,
    getBuildingId,
    getFirstName,
    getLastName,
    getBuildingName,
    getUnitId,
  };
};
