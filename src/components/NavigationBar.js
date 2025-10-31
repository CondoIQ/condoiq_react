// src/components/NavigationBar.jsx
import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NavigationBar = ({ onLogin, onAdminLogin, hideButtons }) => {
  const { logout, isAuthenticated } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // check if we’re on dashboard route
  const isAdminDashboard = location.pathname === "/admin-dashboard";

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        backdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
      }}
    >
      <Toolbar>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, fontWeight: 700, color: "primary.main" }}
          onClick={() => (window.location.href = "/")}
        >
          <Button>CondoIQ</Button>
        </Typography>

        {/* Regular landing page buttons */}
        {!hideButtons && !isAuthenticated() && (
          <>
            <Button onClick={onLogin}>Login</Button>
            <Button onClick={onAdminLogin}>Admin Login</Button>
          </>
        )}

        {/* Admin Dashboard Profile Menu */}
        {isAuthenticated() && (
          <>
            <IconButton onClick={handleMenuOpen}>
              <Avatar sx={{ bgcolor: "primary.main" }}>A</Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
            >
              <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
              <MenuItem onClick={handleMenuClose}>Settings</MenuItem>
              <MenuItem onClick={logout}>Logout</MenuItem>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
