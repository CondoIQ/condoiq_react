// src/pages/units/AllUnits.jsx
import React, {
  useState,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";

import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  Divider,
  TextField,
  InputAdornment,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Drawer,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Switch,
  FormControlLabel,
  Tabs,
  Tab,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import {
  Refresh,
  Search,
  Add,
  Edit as EditIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import HomeIcon from "@mui/icons-material/Home";
import { motion } from "framer-motion";
import debounce from "lodash.debounce";

import { useAuth } from "../../hooks/useAuth";
import unitService from "../../services/unitService";
import { getUserId } from "../../services/authService";
import UnitResidents from "./units/UnitResidents";

const AllUnits = () => {
  const { getBuildingId } = useAuth();
  const buildingId = getBuildingId();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Data states
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Search
  const [searchTerm, setSearchTerm] = useState("");
  const handleSearch = useCallback(
    debounce((value) => setSearchTerm(value), 300),
    []
  );

  // Create dialog states
  const [openCreateDialog, setOpenCreateDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState("");
  const [createFormErrors, setCreateFormErrors] = useState({});

  // Drawer (view/edit) states
  const [openDrawer, setOpenDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [drawerUnit, setDrawerUnit] = useState(null); // unit currently displayed in drawer
  const [drawerEditMode, setDrawerEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [drawerFormErrors, setDrawerFormErrors] = useState({});
  const [drawerError, setDrawerError] = useState("");

  // Refs for create form (standalone dialog)
  const c_unitNumberRef = useRef();
  const c_floorNumberRef = useRef();
  const c_squareFeetRef = useRef();
  const c_numOfOwnersRef = useRef();
  const c_numOfResidentsRef = useRef();
  const c_numOfBedroomsRef = useRef();
  const c_numOfBathroomsRef = useRef();
  const c_isOccupiedRef = useRef();
  const c_isActiveRef = useRef();

  // Refs for drawer edit form (separate from create)
  const d_unitNumberRef = useRef();
  const d_floorNumberRef = useRef();
  const d_squareFeetRef = useRef();
  const d_numOfOwnersRef = useRef();
  const d_numOfResidentsRef = useRef();
  const d_numOfBedroomsRef = useRef();
  const d_numOfBathroomsRef = useRef();
  const d_isOccupiedRef = useRef();
  const d_isActiveRef = useRef();

  // Fetch units
  const fetchUnits = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await unitService.getAllUnits(buildingId);
      const unitsList = Array.isArray(data?.data) ? data.data : data;
      setUnits(Array.isArray(unitsList) ? unitsList : [unitsList]);
    } catch (err) {
      setError(err?.message || "Failed to load units.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [buildingId]);

  // Filtered units (search)
  const filteredUnits = useMemo(() => {
    if (!searchTerm) return units;
    return units.filter((u) =>
      (u.unitNumber || "")
        .toString()
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [units, searchTerm]);

  // -------- CREATE (standalone dialog) --------
  const validateCreateForm = () => {
    const errors = {};
    if (!c_unitNumberRef.current?.value?.trim())
      errors.unitNumber = "Unit Number is required";
    if (!c_floorNumberRef.current?.value) errors.floorNumber = "Required";
    if (!c_squareFeetRef.current?.value) errors.squareFeet = "Required";
    if (!c_numOfOwnersRef.current?.value) errors.numOfOwners = "Required";
    if (!c_numOfResidentsRef.current?.value) errors.numOfResidents = "Required";
    if (!c_numOfBedroomsRef.current?.value) errors.numOfBedrooms = "Required";
    if (!c_numOfBathroomsRef.current?.value) errors.numOfBathrooms = "Required";

    setCreateFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateUnit = async () => {
    setCreateError("");
    if (!validateCreateForm()) return;

    setCreating(true);
    try {
      const userId = getUserId();
      const payload = {
        buildingId,
        unitNumber: c_unitNumberRef.current.value.trim(),
        floorNumber: parseInt(c_floorNumberRef.current.value),
        squareFeet: parseFloat(c_squareFeetRef.current.value),
        numOfOwners: parseInt(c_numOfOwnersRef.current.value),
        numOfResidents: parseInt(c_numOfResidentsRef.current.value),
        numOfBedrooms: parseInt(c_numOfBedroomsRef.current.value),
        numOfBathrooms: parseFloat(c_numOfBathroomsRef.current.value),
        isOccupied: !!c_isOccupiedRef.current?.checked,
        isActive: !!c_isActiveRef.current?.checked,
        createdBy: userId,
        updatedBy: userId,
      };

      const created = await unitService.createUnit(payload);
      // If API returns created object inside data
      const createdUnit = created?.data ?? created;
      setUnits((prev) => [createdUnit, ...prev]);
      setOpenCreateDialog(false);
      setCreateFormErrors({});
    } catch (err) {
      setCreateError(err?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  const checkUnitNumber = async () => {
    const errors = {};

    const payload = buildingId + "-" + c_unitNumberRef.current.value.trim();
    const response = await unitService.getUnitById(payload);

    if (response != null) {
      errors.unitNumber = "Unit already exist.";
      setCreateFormErrors(errors);
    } else {
      setCreateFormErrors({});
    }
    return Object.keys(errors).length === 0;
  };

  // -------- DRAWER (view + edit) --------
  const openDrawerForUnit = (unit) => {
    setDrawerUnit(unit);
    setDrawerEditMode(false);
    setDrawerFormErrors({});
    setDrawerError("");
    setActiveTab(0);
    setOpenDrawer(true);

    // small timeout to ensure refs exist in DOM if switching to edit mode later
    setTimeout(() => {
      if (d_unitNumberRef.current)
        d_unitNumberRef.current.value = unit.unitNumber ?? "";
      if (d_floorNumberRef.current)
        d_floorNumberRef.current.value = unit.floorNumber ?? "";
      if (d_squareFeetRef.current)
        d_squareFeetRef.current.value = unit.squareFeet ?? "";
      if (d_numOfOwnersRef.current)
        d_numOfOwnersRef.current.value = unit.numOfOwners ?? "";
      if (d_numOfResidentsRef.current)
        d_numOfResidentsRef.current.value = unit.numOfResidents ?? "";
      if (d_numOfBedroomsRef.current)
        d_numOfBedroomsRef.current.value = unit.numOfBedrooms ?? "";
      if (d_numOfBathroomsRef.current)
        d_numOfBathroomsRef.current.value = unit.numOfBathrooms ?? "";
      if (d_isOccupiedRef.current)
        d_isOccupiedRef.current.checked = !!unit.isOccupied;
      if (d_isActiveRef.current)
        d_isActiveRef.current.checked = !!unit.isActive;
    }, 30);
  };

  const validateDrawerForm = () => {
    const errors = {};
    if (!d_unitNumberRef.current?.value?.trim())
      errors.unitNumber = "Unit Number is required";
    if (!d_floorNumberRef.current?.value) errors.floorNumber = "Required";
    if (!d_squareFeetRef.current?.value) errors.squareFeet = "Required";
    if (!d_numOfOwnersRef.current?.value) errors.numOfOwners = "Required";
    if (!d_numOfResidentsRef.current?.value) errors.numOfResidents = "Required";
    if (!d_numOfBedroomsRef.current?.value) errors.numOfBedrooms = "Required";
    if (!d_numOfBathroomsRef.current?.value) errors.numOfBathrooms = "Required";

    setDrawerFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleUpdateUnit = async () => {
    if (!drawerUnit) return;
    setDrawerError("");
    if (!validateDrawerForm()) return;

    setUpdating(true);
    try {
      const userId = getUserId();
      const payload = {
        unitId: drawerUnit.unitId,
        buildingId,
        unitNumber: d_unitNumberRef.current.value.trim(),
        floorNumber: parseInt(d_floorNumberRef.current.value),
        squareFeet: parseFloat(d_squareFeetRef.current.value),
        numOfOwners: parseInt(d_numOfOwnersRef.current.value),
        numOfResidents: parseInt(d_numOfResidentsRef.current.value),
        numOfBedrooms: parseInt(d_numOfBedroomsRef.current.value),
        numOfBathrooms: parseFloat(d_numOfBathroomsRef.current.value),
        isOccupied: !!d_isOccupiedRef.current?.checked,
        isActive: !!d_isActiveRef.current?.checked,
        updatedBy: userId,
      };

      await unitService.updateUnit(payload);
      // update local list
      setUnits((prev) =>
        prev.map((u) =>
          u.unitId === drawerUnit.unitId ? { ...u, ...payload } : u
        )
      );

      // switch back to read-only details view
      setDrawerEditMode(false);
      setDrawerUnit((prev) => ({ ...prev, ...payload }));
    } catch (err) {
      setDrawerError(err?.message || "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  // UI helpers
  const renderDetailRow = (label, value) => (
    <Box display="flex" justifyContent="space-between" py={0.6}>
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {value ?? "-"}
      </Typography>
    </Box>
  );

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      sx={{
        width: "100%",
        minHeight: "calc(100vh - 100px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        p: isMobile ? 1.5 : 4,
      }}
    >
      <Paper
        sx={{
          p: isMobile ? 2 : 4,
          borderRadius: 4,
          width: "100%",
          maxWidth: 1500,
        }}
      >
        {/* Header */}
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          flexWrap="wrap"
          mb={2}
          gap={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Units ({filteredUnits.length})
          </Typography>

          <Box display="flex" gap={1} flexWrap="wrap">
            <TextField
              size="small"
              placeholder="Search units..."
              variant="outlined"
              onChange={(e) => handleSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: "text.secondary" }} />
                  </InputAdornment>
                ),
              }}
            />
            <Tooltip title="Refresh">
              <IconButton onClick={fetchUnits}>
                <Refresh color="primary" />
              </IconButton>
            </Tooltip>

            <Button
              variant="contained"
              color="primary"
              startIcon={<Add />}
              onClick={() => {
                // open create dialog and reset
                setCreateError("");
                setCreateFormErrors({});
                setOpenCreateDialog(true);
                // small tick to allow dialog mount then reset refs
                setTimeout(() => {
                  if (c_unitNumberRef.current)
                    c_unitNumberRef.current.value = "";
                  if (c_floorNumberRef.current)
                    c_floorNumberRef.current.value = "";
                  if (c_squareFeetRef.current)
                    c_squareFeetRef.current.value = "";
                  if (c_numOfOwnersRef.current)
                    c_numOfOwnersRef.current.value = "";
                  if (c_numOfResidentsRef.current)
                    c_numOfResidentsRef.current.value = "";
                  if (c_numOfBedroomsRef.current)
                    c_numOfBedroomsRef.current.value = "";
                  if (c_numOfBathroomsRef.current)
                    c_numOfBathroomsRef.current.value = "";
                  if (c_isOccupiedRef.current)
                    c_isOccupiedRef.current.checked = false;
                  if (c_isActiveRef.current)
                    c_isActiveRef.current.checked = true;
                }, 50);
              }}
            >
              Create Unit
            </Button>
          </Box>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* Content */}
        {loading ? (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">{error}</Alert>
        ) : filteredUnits.length === 0 ? (
          <Alert severity="info">No units found.</Alert>
        ) : (
          <Grid container spacing={3}>
            {filteredUnits.map((unit) => (
              <Grid key={unit.unitId} item xs={6} sm={4} md={3} lg={2}>
                <Card
                  component={motion.div}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                  sx={{
                    p: 2,
                    textAlign: "center",
                    borderRadius: 3,
                    background: "#f6f7fb",
                    cursor: "pointer",
                    minHeight: 140,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexDirection: "column",
                  }}
                  onClick={() => openDrawerForUnit(unit)}
                >
                  <CardActionArea sx={{ width: "100%", p: 1 }}>
                    <HomeIcon sx={{ fontSize: 52, color: "primary.main" }} />
                    <CardContent>
                      <Typography variant="h6" fontWeight={700}>
                        {unit.unitNumber}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Floor {unit.floorNumber ?? "-"}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* ---------------- CREATE DIALOG (standalone) ---------------- */}
        <Dialog
          open={openCreateDialog}
          onClose={() => setOpenCreateDialog(false)}
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>Create Unit</DialogTitle>
          <DialogContent>
            {createError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {createError}
              </Alert>
            )}

            <Box component="form" sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Unit Number"
                inputRef={c_unitNumberRef}
                error={!!createFormErrors.unitNumber}
                helperText={createFormErrors.unitNumber}
                margin="normal"
                onBlur={checkUnitNumber}
              />
              <TextField
                fullWidth
                label="Floor Number"
                type="number"
                inputRef={c_floorNumberRef}
                error={!!createFormErrors.floorNumber}
                helperText={createFormErrors.floorNumber}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Square Feet"
                type="number"
                inputRef={c_squareFeetRef}
                error={!!createFormErrors.squareFeet}
                helperText={createFormErrors.squareFeet}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Number of Owners"
                type="number"
                inputRef={c_numOfOwnersRef}
                error={!!createFormErrors.numOfOwners}
                helperText={createFormErrors.numOfOwners}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Number of Residents"
                type="number"
                inputRef={c_numOfResidentsRef}
                error={!!createFormErrors.numOfResidents}
                helperText={createFormErrors.numOfResidents}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Number of Bedrooms"
                type="number"
                inputRef={c_numOfBedroomsRef}
                error={!!createFormErrors.numOfBedrooms}
                helperText={createFormErrors.numOfBedrooms}
                margin="normal"
              />
              <TextField
                fullWidth
                label="Number of Bathrooms"
                type="number"
                inputRef={c_numOfBathroomsRef}
                error={!!createFormErrors.numOfBathrooms}
                helperText={createFormErrors.numOfBathrooms}
                margin="normal"
              />
              <FormControlLabel
                control={
                  <Switch inputRef={c_isOccupiedRef} defaultChecked={false} />
                }
                label="Occupied"
              />
              <FormControlLabel
                control={<Switch inputRef={c_isActiveRef} defaultChecked />}
                label="Active"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setOpenCreateDialog(false);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCreateUnit}
              disabled={creating}
            >
              {creating ? "Creating..." : "Create"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* ---------------- DRAWER (view + edit) ---------------- */}
        <Drawer
          anchor="right"
          open={openDrawer}
          onClose={() => {
            setOpenDrawer(false);
            setDrawerUnit(null);
            setDrawerEditMode(false);
          }}
          PaperProps={{
            sx: {
              width: isMobile ? "100%" : 560,
              p: 3,
              borderRadius: "12px 0 0 12px",
            },
          }}
        >
          <Box
            component={motion.div}
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.32 }}
            sx={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
            >
              <Typography variant="h6" fontWeight={600}>
                {drawerUnit ? `Unit ${drawerUnit.unitNumber}` : "Unit"}
              </Typography>

              <Box display="flex" gap={1} alignItems="center">
                {!drawerEditMode ? (
                  <Button
                    startIcon={<EditIcon />}
                    onClick={() => {
                      setDrawerEditMode(true);
                      // ensure refs have current values
                      setTimeout(() => {
                        if (drawerUnit) {
                          if (d_unitNumberRef.current)
                            d_unitNumberRef.current.value =
                              drawerUnit.unitNumber ?? "";
                          if (d_floorNumberRef.current)
                            d_floorNumberRef.current.value =
                              drawerUnit.floorNumber ?? "";
                          if (d_squareFeetRef.current)
                            d_squareFeetRef.current.value =
                              drawerUnit.squareFeet ?? "";
                          if (d_numOfOwnersRef.current)
                            d_numOfOwnersRef.current.value =
                              drawerUnit.numOfOwners ?? "";
                          if (d_numOfResidentsRef.current)
                            d_numOfResidentsRef.current.value =
                              drawerUnit.numOfResidents ?? "";
                          if (d_numOfBedroomsRef.current)
                            d_numOfBedroomsRef.current.value =
                              drawerUnit.numOfBedrooms ?? "";
                          if (d_numOfBathroomsRef.current)
                            d_numOfBathroomsRef.current.value =
                              drawerUnit.numOfBathrooms ?? "";
                          if (d_isOccupiedRef.current)
                            d_isOccupiedRef.current.checked =
                              !!drawerUnit.isOccupied;
                          if (d_isActiveRef.current)
                            d_isActiveRef.current.checked =
                              !!drawerUnit.isActive;
                        }
                      }, 30);
                    }}
                  >
                    Edit
                  </Button>
                ) : (
                  <Button
                    startIcon={<SaveIcon />}
                    variant="contained"
                    onClick={handleUpdateUnit}
                    disabled={updating}
                  >
                    {updating ? "Saving..." : "Save"}
                  </Button>
                )}
              </Box>
            </Box>

            <Tabs
              value={activeTab}
              onChange={(e, v) => setActiveTab(v)}
              sx={{ mt: 2, mb: 2 }}
            >
              <Tab label="Details" />
              <Tab label="Residents" />
              <Tab label="Requests" />
              <Tab label="Complaints" />
            </Tabs>

            <Divider sx={{ mb: 2 }} />

            <Box sx={{ overflow: "auto", flex: 1 }}>
              {drawerError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {drawerError}
                </Alert>
              )}

              {/* DETAILS TAB */}
              {activeTab === 0 && (
                <Box>

                  {!drawerEditMode ? (
                    // READ-ONLY LAYOUT
                    <Box>
                      <Box mb={2}>
                        {renderDetailRow("Unit Number", drawerUnit?.unitNumber)}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow("Floor", drawerUnit?.floorNumber)}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow("Square Feet", drawerUnit?.squareFeet)}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow("Owners", drawerUnit?.numOfOwners)}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow(
                          "Residents",
                          drawerUnit?.numOfResidents
                        )}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow("Bedrooms", drawerUnit?.numOfBedrooms)}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow(
                          "Bathrooms",
                          drawerUnit?.numOfBathrooms
                        )}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow(
                          "Occupied",
                          drawerUnit?.isOccupied ? "Yes" : "No"
                        )}
                      </Box>
                      <Box mb={1}>
                        {renderDetailRow(
                          "Active",
                          drawerUnit?.isActive ? "Yes" : "No"
                        )}
                      </Box>

                      <Divider sx={{ my: 2 }} />

                      {/* Future quick actions */}
                      <Box display="flex" gap={1} flexWrap="wrap">
                        <Button
                          size="small"
                          onClick={() => {
                            setActiveTab(3); // jump to Requests
                          }}
                        >
                          View Requests
                        </Button>
                        <Button
                          size="small"
                          onClick={() => {
                            setActiveTab(4); // jump to Complaints
                          }}
                        >
                          View Complaints
                        </Button>
                      </Box>
                    </Box>
                  ) : (
                    // EDITABLE LAYOUT
                    <Box component="form">
                      <TextField
                        fullWidth
                        label="Unit Number"
                        inputRef={d_unitNumberRef}
                        error={!!drawerFormErrors.unitNumber}
                        helperText={drawerFormErrors.unitNumber}
                        margin="normal"
                        disabled={false} // allow editing unit number here — if you want to lock, set to drawerUnit ? true : false
                      />

                      <TextField
                        fullWidth
                        label="Floor Number"
                        type="number"
                        inputRef={d_floorNumberRef}
                        margin="normal"
                        error={!!drawerFormErrors.floorNumber}
                        helperText={drawerFormErrors.floorNumber}
                      />

                      <TextField
                        fullWidth
                        label="Square Feet"
                        type="number"
                        inputRef={d_squareFeetRef}
                        margin="normal"
                        error={!!drawerFormErrors.squareFeet}
                        helperText={drawerFormErrors.squareFeet}
                      />

                      <TextField
                        fullWidth
                        label="Number of Owners"
                        type="number"
                        inputRef={d_numOfOwnersRef}
                        margin="normal"
                      />

                      <TextField
                        fullWidth
                        label="Number of Residents"
                        type="number"
                        inputRef={d_numOfResidentsRef}
                        margin="normal"
                      />

                      <TextField
                        fullWidth
                        label="Bedrooms"
                        type="number"
                        inputRef={d_numOfBedroomsRef}
                        margin="normal"
                      />

                      <TextField
                        fullWidth
                        label="Bathrooms"
                        type="number"
                        inputRef={d_numOfBathroomsRef}
                        margin="normal"
                      />
                      <FormControlLabel
                        control={<Switch inputRef={d_isOccupiedRef} />}
                        label="Occupied"
                      />
                      <FormControlLabel
                        control={<Switch inputRef={d_isActiveRef} />}
                        label="Active"
                      />
                    </Box>
                  )}
                </Box>
              )}

              {/* RESIDENTS TAB */}
              {activeTab === 1 && <UnitResidents unit={drawerUnit} />}

              {/* REQUESTS TAB */}
              {activeTab === 2 && (
                <Box p={2}>
                  <Typography>Requests content coming soon...</Typography>
                </Box>
              )}

              {/* COMPLAINTS TAB */}
              {activeTab === 3 && (
                <Box p={2}>
                  <Typography>Complaints content coming soon...</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Drawer>
      </Paper>
    </Box>
  );
};

export default AllUnits;
