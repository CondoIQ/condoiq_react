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
  Box,
  Divider,
} from "@mui/material";
import { useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const NavigationBar = ({ onLogin, onAdminLogin, hideButtons }) => {
  const {
    logout,
    isAuthenticated,
    getFirstName,
    getLastName,
    getBuildingName,
  } = useAuth();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // check if we’re on dashboard route
  const isAdminDashboard = location.pathname === "/admin-dashboard";

  const firstName = getFirstName() || "";
  const lastName = getLastName() || "";
  const buildingName = getBuildingName() || "";

  const initials =
    (firstName ? firstName[0].toUpperCase() : "") +
    (lastName ? lastName[0].toUpperCase() : "");

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
              <Avatar sx={{ bgcolor: "primary.main" }}>
                {initials || "U"}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={open}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              transformOrigin={{ vertical: "top", horizontal: "right" }}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  borderRadius: 3,
                  minWidth: 280,
                  boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
                  overflow: "visible",
                  "&:before": {
                    content: '""',
                    display: "block",
                    position: "absolute",
                    top: 0,
                    right: 14,
                    width: 10,
                    height: 10,
                    bgcolor: "background.paper",
                    transform: "translateY(-50%) rotate(45deg)",
                    zIndex: 0,
                  },
                },
              }}
            >
              <Box sx={{ p: 3, pb: 2 }}>
                <Box display="flex" alignItems="center" gap={2} mb={2}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "primary.main",
                      fontSize: "1.25rem",
                      fontWeight: 600,
                      boxShadow: "0 4px 12px rgba(123, 31, 162, 0.2)",
                    }}
                  >
                    {initials || "U"}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={700}>
                      {firstName} {lastName}
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        fontSize: "0.8rem",
                      }}
                    >
                      {buildingName}
                    </Typography>
                  </Box>
                </Box>

                <Divider sx={{ my: 1.5 }} />

                <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 1 }}>
                  Profile
                </MenuItem>
                <MenuItem onClick={handleMenuClose} sx={{ borderRadius: 1 }}>
                  Settings
                </MenuItem>
                <MenuItem
                  onClick={logout}
                  sx={{ borderRadius: 1, color: "error.main" }}
                >
                  Logout
                </MenuItem>
              </Box>
            </Menu>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default NavigationBar;
