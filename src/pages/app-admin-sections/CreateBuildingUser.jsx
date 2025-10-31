import React, { useState, useEffect, memo, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  MenuItem,
} from "@mui/material";
import { motion } from "framer-motion";
import AnimatedBlob from "../../components/AnimatedBlob";
import WaveDivider from "../../components/WaveDivider";
import buildingService from "../../services/buildingService";
import userAccountService from "../../services/userAccountService";
import rolesService from "../../services/rolesService";
import debounce from "lodash.debounce";

// Memoized component for static dropdown items
const MemoizedMenuItems = memo(({ items }) =>
  items.map((item) => (
    <option
      key={item.buildingId || item.roleId}
      value={item.buildingName || item.roleName}
    >
      {item.buildingName || item.roleName}
    </option>
  ))
);

const CreateBuildingUser = () => {
  // Separate state for each field
  const [buildingId, setBuildingId] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [email, setEmail] = useState("");
  const [passwordHash, setPasswordHash] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [roles, setroles] = useState([]);
  const [createdBy] = useState(localStorage.getItem("userID"));
  const [updatedBy] = useState(localStorage.getItem("userID"));

  const [availableBuildings, setAvailableBuildings] = useState([]);
  const [availableRoles, setAvailableRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  // Fetch buildings and roles
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bldgs, roles] = await Promise.all([
          buildingService.getAllBuildings(),
          rolesService.getAllRoles(),
        ]);
        setAvailableBuildings(bldgs || []);
        setAvailableRoles(roles || []);
      } catch {
        setError("Unable to load buildings or roles.");
      }
    };
    fetchData();
  }, []);

  // Debounced email availability check
  const checkEmailAvailability = useCallback(
    debounce(async (value) => {
      if (!value) return;
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        console.log("Checking email:", value);
        const res = await userAccountService.checkEmailAvailability(value);
        if (res?.exists) setError("Email already exists.");
        else setSuccess("Email is available.");
      } catch {
        setError("Failed to check email availability.");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
  };

  const toggleRole = (roleName) => {
    setroles((prev) =>
      prev.includes(roleName)
        ? prev.filter((r) => r !== roleName)
        : [...prev, roleName]
    );
  };

  const resetForm = () => {
    setBuildingId("");
    setFirstName("");
    setLastName("");
    setDateOfBirth("");
    setGender("");
    setEmail("");
    setPasswordHash("");
    setPhoneNumber("");
    setroles([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        buildingId,
        firstName,
        lastName,
        dateOfBirth,
        gender,
        email,
        passwordHash,
        phoneNumber,
        roles,
        createdBy,
        updatedBy,
      };
      const res = await userAccountService.createUserAccount(payload);
      if (res.ok || res.status === 201) {
        setSuccess("Building user created successfully!");
        resetForm();
      }
    } catch {
      setError("Failed to create building user.");
    } finally {
      setLoading(false);
    }
  };

  // Memoized component for dropdown items
  const MemoizedBuildingMenuItems = memo(({ buildings }) =>
    buildings.map((building) => (
      <MenuItem key={building.buildingId} value={building.buildingId}>
        {building.buildingName}
      </MenuItem>
    ))
  );

  const getBuildingName = (id) => {
    const building = availableBuildings.find((b) => b.buildingId === id);
    return building ? building.buildingName : "";
  };

  return (
    <Box sx={{ position: "relative", width: "100%", mt: 4 }}>
      <AnimatedBlob
        top="10%"
        left="5%"
        size={220}
        color="#42a5f5"
        opacity={0.08}
      />
      <AnimatedBlob
        top="80%"
        left="85%"
        size={260}
        color="#1565c0"
        opacity={0.08}
      />

      <Paper
        elevation={6}
        component={motion.div}
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        sx={{
          p: 5,
          borderRadius: 4,
          maxWidth: 700,
          mx: "auto",
          backgroundColor: "white",
        }}
      >
        <Typography
          variant="h5"
          align="center"
          sx={{ mb: 3, fontWeight: 700, color: "primary.main" }}
        >
          Create Building User
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Grid
            container
            spacing={2}
            sx={{ display: "flex", flexDirection: "column", gap: 2 }}
          >
            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Building"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                required
                disabled={loading}
                SelectProps={{
                  renderValue: (selectedId) => getBuildingName(selectedId), // <--- display name
                }}
              >
                {availableBuildings.length === 0 ? (
                  <MenuItem disabled>Loading...</MenuItem>
                ) : (
                  availableBuildings.map((building) => (
                    <MenuItem
                      key={building.buildingId}
                      value={building.buildingId}
                    >
                      {building.buildingName}
                    </MenuItem>
                  ))
                )}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                type="date"
                label="Date of Birth"
                InputLabelProps={{ shrink: true }}
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                select
                fullWidth
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                disabled={loading}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email}
                onChange={handleEmailChange}
                onBlur={() => checkEmailAvailability(email)}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Password"
                type="password"
                value={passwordHash}
                onChange={(e) => setPasswordHash(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Phone Number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                disabled={loading}
              />
            </Grid>

            {/* Horizontal Roles Checkboxes */}
            <Grid item xs={12}>
              <Typography sx={{ mb: 1 }}>Roles:</Typography>
              <FormGroup row>
                {availableRoles.map((role) => (
                  <FormControlLabel
                    key={role.roleId}
                    control={
                      <Checkbox
                        checked={roles.includes(role.roleName)}
                        onChange={() => toggleRole(role.roleName)}
                        disabled={loading}
                      />
                    }
                    label={role.roleName}
                  />
                ))}
              </FormGroup>
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Created By"
                value={createdBy}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Updated By"
                value={updatedBy}
                InputProps={{ readOnly: true }}
              />
            </Grid>
          </Grid>

          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 4,
              py: 1.5,
              borderRadius: "30px",
              fontWeight: 600,
              background: "linear-gradient(135deg, #1976d2, #1565c0)",
              "&:hover": {
                background: "linear-gradient(135deg, #1e88e5, #1976d2)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Create User"
            )}
          </Button>
        </Box>
      </Paper>

      <WaveDivider color="#ffffff" />
    </Box>
  );
};

export default CreateBuildingUser;
