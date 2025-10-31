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
  const isAuthenticated = () => authService.isAuthenticated();

  return { logout, getToken, isAuthenticated };
};
