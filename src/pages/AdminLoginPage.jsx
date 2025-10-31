import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  Fade,
  Link,
  Alert,
  CircularProgress,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  AdminPanelSettings,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { adminLogin } from "../services/adminService";
import AnimatedBlob from "../components/AnimatedBlob";
import WaveDivider from "../components/WaveDivider";

const AdminLoginPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await adminLogin(credentials.username, credentials.password);
      localStorage.setItem("userID", data.user_id);
      localStorage.setItem("userName", data.first_name + " " + data.last_name);
      navigate("/admin-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        position: "relative",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "#faf6ff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <AnimatedBlob
        top="5%"
        left="10%"
        size={250}
        color="#BB86FC"
        opacity={0.15}
      />
      <AnimatedBlob
        bottom="10%"
        right="10%"
        size={300}
        color="#7b1fa2"
        opacity={0.15}
      />

      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          width: "100%",
          opacity: 0.4,
        }}
      >
        <WaveDivider color="#ffffff" />
      </Box>

      <Container
        maxWidth="sm"
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <Paper
          elevation={10}
          sx={{
            p: 5,
            borderRadius: 4,
            backgroundColor: "white",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box display="flex" flexDirection="column" alignItems="center" mb={3}>
            <AdminPanelSettings
              sx={{ fontSize: 60, color: "primary.main", mb: 1 }}
            />
            <Typography
              variant="h5"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Admin Login
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit}>
            <TextField
              fullWidth
              label="Username"
              name="username"
              variant="outlined"
              value={credentials.username}
              onChange={handleChange}
              sx={{ mb: 3 }}
              required
            />

            <TextField
              fullWidth
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              value={credentials.password}
              onChange={handleChange}
              required
              sx={{ mb: 2 }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box textAlign="right" sx={{ mb: 3 }}>
              <Link href="#" underline="hover" sx={{ color: "primary.main" }}>
                Forgot password?
              </Link>
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={loading}
              sx={{
                borderRadius: "30px",
                py: 1.5,
                fontWeight: 600,
                background: "linear-gradient(135deg, #8e24aa, #7b1fa2)",
                "&:hover": {
                  background: "linear-gradient(135deg, #9c27b0, #8e24aa)",
                },
              }}
            >
              {loading ? (
                <CircularProgress size={24} color="inherit" />
              ) : (
                "Login"
              )}
            </Button>
          </Box>
        </Paper>

        <Fade in timeout={1000}>
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 3, textAlign: "center" }}
          >
            © {new Date().getFullYear()} CondoIQ — Admin Portal
          </Typography>
        </Fade>
      </Container>
    </Box>
  );
};

export default AdminLoginPage;
