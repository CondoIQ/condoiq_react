import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
} from "@mui/material";
import adminService from "../../services/adminService";

const CreateAdminProfile = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAlert(null);
    try {
      const res = await adminService.createAdmin({
        firstName,
        lastName,
        username,
        password,
      });
      if (res.ok === null)
        setAlert({ type: "error", text: res.message || "Username exists!" });
      else {
        setAlert({
          type: "success",
          text: res.message || "Admin created successfully!",
        });
        setFirstName("");
        setLastName("");
        setUsername("");
        setPassword("");
      }
    } catch {
      setAlert({ type: "error", text: "Server error, try again." });
    }
  };

  return (
    <Paper
      sx={{
        p: 5,
        borderRadius: 4,
        width: "90%",
        maxWidth: 600,
        backgroundColor: "white",
      }}
    >
      <Typography
        variant="h5"
        sx={{ color: "#7b1fa2", fontWeight: 700, mb: 3 }}
      >
        Create Admin Profile
      </Typography>

      {alert && (
        <Alert severity={alert.type} sx={{ mb: 2 }}>
          {alert.text}
        </Alert>
      )}

      <Box
        component="form"
        onSubmit={handleSubmit}
        sx={{ display: "flex", flexDirection: "column", gap: 2 }}
      >
        <TextField
          name="firstName"
          label="First Name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          name="lastName"
          label="Last Name"
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          name="username"
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <TextField
          name="password"
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          sx={{ mt: 2, bgcolor: "#7b1fa2", "&:hover": { bgcolor: "#6a1b9a" } }}
        >
          Create Admin
        </Button>
      </Box>
    </Paper>
  );
};

export default CreateAdminProfile;
