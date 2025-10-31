// src/App.jsx
import React from "react";
import { ThemeProvider, CssBaseline } from "@mui/material";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
  useNavigate,
} from "react-router-dom";
import theme from "./theme";

import NavigationBar from "./components/NavigationBar";
import LandingPage from "./pages/LandingPage";
import AdminLoginPage from "./pages/AdminLoginPage";
import AdminDashboard from "./pages/AdminDashboard";
import LoginPage from "./pages/LoginPage";
import HomePage from "./pages/HomePage";
import ProtectedRoute from "./components/ProtectedRoute";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleNavigation = (path) => navigate(path);

  return (
    <>
      <NavigationBar
        onLogin={() => handleNavigation("/login")}
        onAdminLogin={() => handleNavigation("/admin-login")}
        hideButtons={
          location.pathname === "/admin-login" || location.pathname === "/login"
        }
      />

      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin-login" element={<AdminLoginPage />} />

        {/* Protected routes */}
        <Route
          path="/homepage"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}
