import React, { useState, memo, useCallback } from "react";
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Tooltip,
} from "@mui/material";
import {
  QrCode,
  ToggleOn,
  Apartment,
  Logout,
  Menu as MenuIcon,
  AdminPanelSettings,
  CellTowerSharp,
} from "@mui/icons-material";
import { useNavigate } from "react-router-dom";
import NavigationBar from "../components/NavigationBar";
import AnimatedBlob from "../components/AnimatedBlob";
import CreateAdminProfile from "./app-admin-sections/CreateAdminProfile";
import CreateBuilding from "./app-admin-sections/CreateBuilding";
import Buildings from "./app-admin-sections/Buildings";
import CreateBuildingUser from "./app-admin-sections/CreateBuildingUser";
import { useAuth } from "../hooks/useAuth";

const drawerWidth = 240;

// Memoized Sidebar to avoid re-renders
const Sidebar = memo(
  ({ open, selected, setSelected, setOpen, handleLogout }) => {
    const menuItems = [
      { label: "Buildings", icon: <Apartment /> },
      { label: "Create Building", icon: <CellTowerSharp /> },
      { label: "Create Building Users", icon: <ToggleOn /> },
      { label: "Create Admin Profile", icon: <AdminPanelSettings /> },
    ];

    return (
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          width: open ? drawerWidth : 72,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: open ? drawerWidth : 72,
            transition: "width 0.3s ease",
            boxSizing: "border-box",
            backgroundColor: "rgba(255,255,255,0.7)",
            backdropFilter: "blur(10px)",
            borderRight: "1px solid rgba(0,0,0,0.05)",
            mt: "64px",
            height: "calc(100vh - 64px)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: open ? "space-between" : "center",
            px: 2,
            py: 1.5,
          }}
        >
          {open && (
            <span style={{ fontWeight: 700, color: "#7b1fa2" }}>Admin</span>
          )}
          <IconButton onClick={() => setOpen((prev) => !prev)}>
            <MenuIcon sx={{ color: "#7b1fa2" }} />
          </IconButton>
        </Box>
        <Divider />
        <List>
          {menuItems.map((item) => (
            <Tooltip
              key={item.label}
              title={!open ? item.label : ""}
              placement="right"
            >
              <ListItem
                button
                onClick={() => setSelected(item.label)}
                sx={{
                  borderRadius: 2,
                  mx: 1,
                  my: 0.5,
                  color: selected === item.label ? "#7b1fa2" : "#4a148c",
                  backgroundColor:
                    selected === item.label
                      ? "rgba(123, 31, 162, 0.08)"
                      : "transparent",
                  "&:hover": { backgroundColor: "rgba(123, 31, 162, 0.1)" },
                }}
              >
                <ListItemIcon sx={{ color: "#7b1fa2", minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                {open && (
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{ fontWeight: 500 }}
                  />
                )}
              </ListItem>
            </Tooltip>
          ))}
        </List>
        <Box sx={{ flexGrow: 1 }} />
        <Box sx={{ px: 1, pb: 2 }}>
          <Tooltip title={!open ? "Logout" : ""} placement="right">
            <ListItem
              button
              onClick={handleLogout}
              sx={{
                borderRadius: 2,
                mx: 1,
                color: "#b71c1c",
                "&:hover": { backgroundColor: "rgba(244, 67, 54, 0.1)" },
              }}
            >
              <ListItemIcon sx={{ color: "#b71c1c", minWidth: 40 }}>
                <Logout />
              </ListItemIcon>
              {open && <ListItemText primary="Logout" />}
            </ListItem>
          </Tooltip>
        </Box>
      </Drawer>
    );
  }
);

// Memoized background blobs
const BackgroundBlobs = memo(() => (
  <>
    <AnimatedBlob
      top="5%"
      left="10%"
      size={250}
      color="#BB86FC"
      opacity={0.08}
    />
    <AnimatedBlob
      top="70%"
      left="80%"
      size={300}
      color="#7b1fa2"
      opacity={0.08}
    />
  </>
));

// Memoized section rendering
const SectionRenderer = memo(({ selected }) => {
  switch (selected) {
    case "Buildings":
      return <Buildings />;
    case "Create Building":
      return <CreateBuilding />;
    case "Create Building Users":
      return <CreateBuildingUser />;
    case "Create Admin Profile":
      return <CreateAdminProfile />;
    default:
      return null;
  }
});

const AdminDashboard = () => {
  const { logout, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(true);
  const [selected, setSelected] = useState("");
  const navigate = useNavigate();

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        backgroundColor: "#faf6ff",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <NavigationBar hideButtons />
      <BackgroundBlobs />
      <Box sx={{ display: "flex", flex: 1 }}>
        <Sidebar
          open={open}
          selected={selected}
          setSelected={setSelected}
          setOpen={setOpen}
          handleLogout={logout}
        />
        <Box
          sx={{
            flexGrow: 1,
            p: 4,
            mt: "64px",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
          }}
        >
          <SectionRenderer selected={selected} />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminDashboard;
