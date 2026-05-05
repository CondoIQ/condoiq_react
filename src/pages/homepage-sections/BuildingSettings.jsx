import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    CircularProgress,
    Alert,
    Switch,
    FormControlLabel,
    Button,
    Divider,
    Grid,
    TextField,
    useTheme,
    useMediaQuery,
    Snackbar,
} from "@mui/material";
import { Save as SaveIcon, Refresh as RefreshIcon, SettingsSuggest } from "@mui/icons-material";
import { motion } from "framer-motion";
import { useAuth } from "../../hooks/useAuth";
import { saveBuildingSettings } from "../../services/authService";
import buildingSettingsService from "../../services/buildingSettingsService";

const BuildingSettings = () => {
    const { getBuildingId, getUserId } = useAuth();
    const buildingId = getBuildingId();
    const userId = getUserId();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [saving, setSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

    // Field-level error state
    const [formErrors, setFormErrors] = useState({});

    const fetchSettings = async () => {
        try {
            setLoading(true);
            setError("");
            console.log(buildingId);
            const data = await buildingSettingsService.getBuildingSettings(buildingId);
            setSettings(data);
        } catch (err) {
            setError(err?.message || "Failed to load building settings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (buildingId) {
            fetchSettings();
        }
    }, [buildingId]);

    const handleToggle = (field) => (event) => {
        setSettings((prev) => ({
            ...prev,
            [field]: event.target.checked,
        }));
    };

    const handleChange = (field) => (event) => {
        setSettings((prev) => ({
            ...prev,
            [field]: event.target.value,
        }));
        // Clear error for this field on change
        if (formErrors[field]) {
            setFormErrors(prev => ({ ...prev, [field]: null }));
        }
    };

    const validateForm = () => {
        const errors = {};
        // L1 and L2 support assignees are optional per user request
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            setSnackbar({ open: true, message: "Please fix validation errors.", severity: "error" });
            return;
        }

        try {
            setSaving(true);
            const payload = {
                buildingId,
                ...settings,
                updatedBy: userId,
            };
            await buildingSettingsService.updateBuildingSettings(payload);
            // Update local storage to reflect changes immediately
            saveBuildingSettings(payload);
            setSnackbar({ open: true, message: "Settings saved successfully", severity: "success" });
        } catch (err) {
            setSnackbar({ open: true, message: err?.message || "Failed to save settings", severity: "error" });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box
            component={motion.div}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            sx={{
                width: "100%",
                minHeight: "calc(100vh - 100px)",
                display: "flex",
                justifyContent: "center",
                alignItems: "flex-start",
                p: isMobile ? 1.5 : 4
            }}
        >
            <Paper
                sx={{
                    p: isMobile ? 2 : 4,
                    borderRadius: 4,
                    width: "100%",
                    maxWidth: 1600,
                    backgroundColor: "white",
                }}
            >
                {/* Header - Aligned with Amenities/Units style */}
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Box display="flex" alignItems="center" gap={1}>
                        <SettingsSuggest sx={{ color: "primary.main", fontSize: 30 }} />
                        <Typography variant="h6" fontWeight={600}>
                            Building Settings
                        </Typography>
                    </Box>

                    <Box>
                        <Button
                            startIcon={<RefreshIcon />}
                            onClick={fetchSettings}
                            sx={{ mr: 1 }}
                            color="primary"
                        >
                            Reload
                        </Button>
                        <Button
                            variant="contained"
                            startIcon={<SaveIcon />}
                            onClick={handleSave}
                            disabled={saving}
                            color="primary"
                            sx={{ textTransform: "none" }}
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </Button>
                    </Box>
                </Box>

                <Divider sx={{ mb: 3 }} />

                {error && (
                    <Alert severity="error" sx={{ mb: 3 }}>
                        {error}
                    </Alert>
                )}

                <Grid container spacing={4}>
                    {/* Amenity Bookings Section */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                            AmenityBookings
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Configure AmenityBookings access and rules for your building.
                        </Typography>

                        <Box>
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings?.amenityBookingEnabled || false}
                                        onChange={handleToggle("amenityBookingEnabled")}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={500}>Enable AmenityBookings</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Allow residents to access the AmenityBookings portal.
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 2, display: "flex", alignItems: "flex-start" }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings?.maintenanceEnabled || false}
                                        onChange={handleToggle("maintenanceEnabled")}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={500}>Maintenance Portal</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Allow residents to submit maintenance requests.
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}
                            />

                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={settings?.complaintManagementEnabled || false}
                                        onChange={handleToggle("complaintManagementEnabled")}
                                        color="primary"
                                    />
                                }
                                label={
                                    <Box>
                                        <Typography variant="subtitle1" fontWeight={500}>Complaint Management</Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            Allow residents to access the Complaints and Issues portal.
                                        </Typography>
                                    </Box>
                                }
                                sx={{ mb: 1, display: "flex", alignItems: "flex-start" }}
                            />
                        </Box>
                    </Grid>

                    {/* Configuration Section - using standard TextFields */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="h6" fontWeight={600} color="primary.main" gutterBottom>
                            Workflow Configuration
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3}>
                            Define roles for automated workflow assignments. (Optional)
                        </Typography>

                        <Box component="form" noValidate display="flex" flexDirection="column" gap={3}>
                            <TextField
                                fullWidth
                                label="L1 Support Assignee Role"
                                value={settings?.complaintL1AssigneeRole || ""}
                                onChange={handleChange("complaintL1AssigneeRole")}
                                variant="outlined"
                                placeholder="e.g. CONCIERGE"
                                error={!!formErrors.complaintL1AssigneeRole}
                                helperText={formErrors.complaintL1AssigneeRole}
                            />
                            <TextField
                                fullWidth
                                label="L2 Support Assignee Role"
                                value={settings?.complaintL2AssigneeRole || ""}
                                onChange={handleChange("complaintL2AssigneeRole")}
                                variant="outlined"
                                placeholder="e.g. MANAGER"
                                error={!!formErrors.complaintL2AssigneeRole}
                                helperText={formErrors.complaintL2AssigneeRole}
                            />
                        </Box>
                    </Grid>
                </Grid>
            </Paper>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
            >
                <Alert
                    onClose={() => setSnackbar({ ...snackbar, open: false })}
                    severity={snackbar.severity}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default BuildingSettings;
