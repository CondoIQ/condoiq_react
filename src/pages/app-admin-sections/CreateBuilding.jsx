import React, { useState, useCallback } from "react";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Alert,
  CircularProgress,
} from "@mui/material";
import { motion } from "framer-motion";
import AnimatedBlob from "../../components/AnimatedBlob";
import WaveDivider from "../../components/WaveDivider";
import buildingService from "../../services/buildingService";
import debounce from "lodash.debounce";

const CreateBuilding = () => {
  const [buildingName, setBuildingName] = useState("");
  const [buildingId, setBuildingId] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [totalFloors, setTotalFloors] = useState("");
  const [totalUnits, setTotalUnits] = useState("");
  const [createdBy] = useState(localStorage.getItem("userID"));
  const [updatedBy] = useState(localStorage.getItem("userID"));

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const checkBuildingNameAvailability = useCallback(
    debounce(async (value) => {
      if (!value) return;
      setLoading(true);
      setError("");
      setSuccess("");
      try {
        const res = await buildingService.checkBuildingNameAvailability(value);
        if (res.buildingId != null) setError("Building Name already exists.");
        else setSuccess("Building Name is available.");
      } catch {
        setError("Failed to check building Name.");
      } finally {
        setLoading(false);
      }
    }, 500),
    []
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const payload = {
        buildingName,
        buildingId,
        addressLine1,
        addressLine2,
        city,
        state,
        country,
        postalCode,
        totalFloors,
        totalUnits,
        createdBy,
        updatedBy,
      };
      const res = await buildingService.createBuilding(payload);
      if (res.ok || res.status === 201) {
        setSuccess("Building onboarded successfully!");
        setBuildingName("");
        setBuildingId("");
        setAddressLine1("");
        setAddressLine2("");
        setCity("");
        setState("");
        setCountry("");
        setPostalCode("");
        setTotalFloors("");
        setTotalUnits("");
      }
    } catch {
      setError("Failed to create building. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative", width: "100%", mt: 4 }}>
      <AnimatedBlob
        top="10%"
        left="5%"
        size={220}
        color="#BB86FC"
        opacity={0.08}
      />
      <AnimatedBlob
        top="80%"
        left="85%"
        size={260}
        color="#7b1fa2"
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
          Onboard New Building
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
                fullWidth
                label="Building Name"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                onBlur={() => checkBuildingNameAvailability(buildingName)}
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Building ID"
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                required
              />
            </Grid>

            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Address Line 1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Address Line 2"
                value={addressLine2}
                onChange={(e) => setAddressLine2(e.target.value)}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="City"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="State"
                value={state}
                onChange={(e) => setState(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Country"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Total Floors"
                value={totalFloors}
                onChange={(e) => setTotalFloors(e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Total Units"
                value={totalUnits}
                onChange={(e) => setTotalUnits(e.target.value)}
                required
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
              background: "linear-gradient(135deg, #8e24aa, #7b1fa2)",
              "&:hover": {
                background: "linear-gradient(135deg, #9c27b0, #8e24aa)",
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Submit"
            )}
          </Button>
        </Box>
      </Paper>

      <WaveDivider color="#ffffff" />
    </Box>
  );
};

export default CreateBuilding;
