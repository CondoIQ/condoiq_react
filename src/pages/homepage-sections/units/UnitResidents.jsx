import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Typography,
    Button,
    CircularProgress,
    Alert,
    List,
    ListItem,
    ListItemText,
    ListItemAvatar,
    Avatar,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    FormControlLabel,
    Switch,
    Grid,
    MenuItem,
    Divider,
} from "@mui/material";
import {
    Add as AddIcon,
    Person as PersonIcon,
    Delete as DeleteIcon,
    Edit as EditIcon,
    AccountCircle as AccountIcon,
    PersonOff as PersonOffIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import residentService from "../../../services/residentService";
import { useAuth } from "../../../hooks/useAuth";
import { getUserId } from "../../../services/authService";

import userAccountService from "../../../services/userAccountService";

const UnitResidents = ({ unit }) => {
    const { getBuildingId } = useAuth();
    const buildingId = getBuildingId();

    const [residents, setResidents] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Create/Edit Dialog State
    const [openCreate, setOpenCreate] = useState(false);
    const [creating, setCreating] = useState(false);
    const [createError, setCreateError] = useState("");
    const [formErrors, setFormErrors] = useState({});
    const [isEditing, setIsEditing] = useState(false);
    const [editResidentId, setEditResidentId] = useState(null);

    // Email Validation State
    const [emailStatus, setEmailStatus] = useState(""); // 'checking', 'available', 'taken', ''
    const [emailHelperText, setEmailHelperText] = useState("");

    // Create User Account State
    const [openAccountDialog, setOpenAccountDialog] = useState(false);
    const [selectedResident, setSelectedResident] = useState(null);
    const [accountPassword, setAccountPassword] = useState("");
    const [accountError, setAccountError] = useState("");
    const [creatingAccount, setCreatingAccount] = useState(false);

    // Refs for Create/Edit Form
    const firstNameRef = useRef();
    const lastNameRef = useRef();
    const emailRef = useRef();
    const phoneRef = useRef();
    const dobRef = useRef();
    const genderRef = useRef();
    const residentTypeRef = useRef();
    const isOwnerRef = useRef();
    const isActiveRef = useRef();

    useEffect(() => {
        if (unit?.unitId) {
            fetchResidents();
        }

    }, [unit]);

    const fetchResidents = async () => {
        try {
            setLoading(true);
            setError("");
            const data = await residentService.getResidentsByUnitId(unit.unitId);
            setResidents(data || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const checkEmail = async () => {
        const email = emailRef.current?.value?.trim();
        if (!email) return;

        // If editing and email hasn't changed, don't check
        if (isEditing) {
            const currentResident = residents.find(r => r.residentId === editResidentId);
            if (currentResident && currentResident.email === email) {
                setEmailStatus("");
                setEmailHelperText("");
                return;
            }
        }

        // Basic format check before API call
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            setEmailStatus("invalid");
            setEmailHelperText("Invalid email format");
            return;
        }

        setEmailStatus("checking");
        setEmailHelperText("Checking availability...");

        try {
            const isUsed = await userAccountService.checkEmailAvailability(email);

            if (!isUsed) {
                setEmailStatus("available");
                setEmailHelperText("Email is available");
            } else {
                setEmailStatus("taken");
                setEmailHelperText("User with this email already exists");
            }
        } catch (err) {
            console.error("Email check failed", err);
            setEmailStatus("taken");
            setEmailHelperText("User with this email already exists");
        }
    };

    const validateForm = () => {
        const errors = {};
        if (!firstNameRef.current?.value?.trim()) errors.firstName = "Required";
        if (!lastNameRef.current?.value?.trim()) errors.lastName = "Required";
        if (!emailRef.current?.value?.trim()) errors.email = "Required";

        if (emailStatus === "taken") {
            errors.email = "Email already exists";
        }
        if (emailStatus === "invalid") {
            errors.email = "Invalid email format";
        }

        if (!phoneRef.current?.value?.trim()) errors.phone = "Required";
        if (!dobRef.current?.value) errors.dob = "Required";
        if (!genderRef.current?.value) errors.gender = "Required";
        if (!residentTypeRef.current?.value) errors.residentType = "Required";

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleOpenCreate = () => {
        setIsEditing(false);
        setEditResidentId(null);
        setOpenCreate(true);
        setCreateError("");
        setFormErrors({});
        setEmailStatus("");
        setEmailHelperText("");
        // Reset refs manually if needed, or rely on Dialog unmount/remount if key changes (but here we reuse)
        // Since we use refs, we need to clear them when opening for create
        setTimeout(() => {
            if (firstNameRef.current) firstNameRef.current.value = "";
            if (lastNameRef.current) lastNameRef.current.value = "";
            if (emailRef.current) emailRef.current.value = "";
            if (phoneRef.current) phoneRef.current.value = "";
            if (dobRef.current) dobRef.current.value = "";
            if (genderRef.current) genderRef.current.value = "";
            if (residentTypeRef.current) residentTypeRef.current.value = "Permanent";
            if (isOwnerRef.current) isOwnerRef.current.checked = false;
            if (isActiveRef.current) isActiveRef.current.checked = true;
        }, 0);
    };

    const handleOpenEdit = (resident) => {
        setIsEditing(true);
        setEditResidentId(resident.residentId);
        setOpenCreate(true);
        setCreateError("");
        setFormErrors({});
        setEmailStatus("");
        setEmailHelperText("");

        setTimeout(() => {
            if (firstNameRef.current) firstNameRef.current.value = resident.firstName;
            if (lastNameRef.current) lastNameRef.current.value = resident.lastName;
            if (emailRef.current) emailRef.current.value = resident.email;
            if (phoneRef.current) phoneRef.current.value = resident.phoneNumber;
            // Format date for input type="date" (YYYY-MM-DD)
            if (dobRef.current && resident.dateOfBirth) {
                const date = new Date(resident.dateOfBirth);
                dobRef.current.value = date.toISOString().split('T')[0];
            }
            if (genderRef.current) genderRef.current.value = resident.gender;
            if (residentTypeRef.current) residentTypeRef.current.value = resident.residentType;
            if (isOwnerRef.current) isOwnerRef.current.checked = resident.isOwner;
            if (isActiveRef.current) isActiveRef.current.checked = resident.isActive;
        }, 0);
    };

    const handleSave = async () => {
        setCreateError("");
        if (!validateForm()) return;

        setCreating(true);
        try {
            const userId = getUserId();
            const payload = {
                buildingId,
                unitId: unit.unitId,
                unitNumber: unit.unitNumber,
                firstName: firstNameRef.current.value.trim(),
                lastName: lastNameRef.current.value.trim(),
                email: emailRef.current.value.trim(),
                phoneNumber: phoneRef.current.value.trim(),
                dateOfBirth: dobRef.current.value,
                gender: genderRef.current.value,
                residentType: residentTypeRef.current.value,
                isOwner: !!isOwnerRef.current?.checked,
                isActive: !!isActiveRef.current?.checked,
                updatedBy: userId,
            };

            if (isEditing) {
                payload.residentId = editResidentId;
                // For update, we might need createdBy/createdAt from original, but usually backend handles or ignores.
                // Backend updateResident merges fields.
                const updatedResident = await residentService.updateResident(payload);
                setResidents((prev) => prev.map(r => r.residentId === updatedResident.residentId ? updatedResident : r));
            } else {
                payload.createdBy = userId;
                const newResident = await residentService.createResident(payload);
                setResidents((prev) => [...prev, newResident]);
            }
            setOpenCreate(false);
        } catch (err) {
            setCreateError(err.message);
        } finally {
            setCreating(false);
        }
    };

    const handleOpenAccountDialog = (resident) => {
        setSelectedResident(resident);
        setAccountPassword("");
        setAccountError("");
        setOpenAccountDialog(true);
    };

    const handleCreateAccount = async () => {
        if (!accountPassword) {
            setAccountError("Password is required");
            return;
        }

        setCreatingAccount(true);
        setAccountError("");

        try {
            const userId = getUserId();
            const payload = {
                residentId: selectedResident.residentId,
                createUserAccount: true,
                removeUserAccount: false,
                passwordHash: accountPassword,
                updatedBy: userId
            };

            const updatedResident = await residentService.createResidentUserAccount(payload);

            setResidents(prev => prev.map(r =>
                r.residentId === updatedResident.residentId ? updatedResident : r
            ));

            setOpenAccountDialog(false);
        } catch (err) {
            setAccountError(err.message);
        } finally {
            setCreatingAccount(false);
        }
    };

    const handleRemoveUserAccount = async (resident) => {
        if (!window.confirm(`Are you sure you want to remove the user account for ${resident.firstName} ${resident.lastName}?`)) {
            return;
        }

        try {
            const userId = getUserId();
            const payload = {
                residentId: resident.residentId,
                createUserAccount: false,
                removeUserAccount: true,
                updatedBy: userId
            };

            const updatedResident = await residentService.deleteResidentUserAccount(payload);
            setResidents(prev => prev.map(r =>
                r.residentId === updatedResident.residentId ? updatedResident : r
            ));
        } catch (err) {
            alert(err.message);
        }
    };

    return (
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                mb={2}
            >
                <Typography variant="h6">Residents ({residents.length})</Typography>
                <Button
                    startIcon={<AddIcon />}
                    variant="outlined"
                    size="small"
                    onClick={handleOpenCreate}
                >
                    Add Resident
                </Button>
            </Box>

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <Alert severity="error">{error}</Alert>
            ) : residents.length === 0 ? (
                <Alert severity="info">No residents found for this unit.</Alert>
            ) : (
                <List sx={{ overflow: "auto", flex: 1 }}>
                    {residents.map((resident) => (
                        <React.Fragment key={resident.residentId}>
                            <ListItem
                                alignItems="flex-start"
                                secondaryAction={
                                    <Box>
                                        {!resident.userAccountStatus ? (
                                            <IconButton
                                                edge="end"
                                                aria-label="create account"
                                                onClick={() => handleOpenAccountDialog(resident)}
                                                title="Create User Account"
                                                sx={{ mr: 1 }}
                                            >
                                                <AccountIcon color="primary" />
                                            </IconButton>
                                        ) : (
                                            <IconButton
                                                edge="end"
                                                aria-label="remove account"
                                                onClick={() => handleRemoveUserAccount(resident)}
                                                title="Remove User Account"
                                                sx={{ mr: 1 }}
                                            >
                                                <PersonOffIcon color="error" />
                                            </IconButton>
                                        )}
                                        <IconButton
                                            edge="end"
                                            aria-label="edit"
                                            onClick={() => handleOpenEdit(resident)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                    </Box>
                                }
                            >
                                <ListItemAvatar>
                                    <Avatar sx={{ bgcolor: "primary.main" }}>
                                        <PersonIcon />
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={
                                        <Typography variant="subtitle1" fontWeight={600}>
                                            {resident.firstName} {resident.lastName}
                                            {resident.isOwner && (
                                                <Typography
                                                    component="span"
                                                    variant="caption"
                                                    sx={{
                                                        ml: 1,
                                                        bgcolor: "warning.light",
                                                        color: "warning.dark",
                                                        px: 0.8,
                                                        py: 0.2,
                                                        borderRadius: 1,
                                                        fontWeight: 600,
                                                    }}
                                                >
                                                    OWNER
                                                </Typography>
                                            )}
                                        </Typography>
                                    }
                                    secondary={
                                        <React.Fragment>
                                            <Typography
                                                component="span"
                                                variant="body2"
                                                color="text.primary"
                                            >
                                                {resident.email}
                                            </Typography>
                                            {" — " + resident.phoneNumber}
                                            <br />
                                            <Typography component="span" variant="caption">
                                                Type: {resident.residentType} | Status:{" "}
                                                {resident.isActive ? "Active" : "Inactive"}
                                                {resident.userAccountStatus && (
                                                    <Typography component="span" variant="caption" color="success.main" sx={{ ml: 1, fontWeight: 'bold' }}>
                                                        | Account Active
                                                    </Typography>
                                                )}
                                            </Typography>
                                        </React.Fragment>
                                    }
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </React.Fragment>
                    ))}
                </List>
            )}

            {/* Create/Edit Dialog */}
            <Dialog
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                fullWidth
                maxWidth="sm"
            >
                <DialogTitle>{isEditing ? "Edit Resident" : "Add Resident"}</DialogTitle>
                <DialogContent>
                    {createError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {createError}
                        </Alert>
                    )}
                    <Box component="form" sx={{ mt: 1 }}>
                        <TextField
                            fullWidth
                            label="First Name"
                            inputRef={firstNameRef}
                            error={!!formErrors.firstName}
                            helperText={formErrors.firstName}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Last Name"
                            inputRef={lastNameRef}
                            error={!!formErrors.lastName}
                            helperText={formErrors.lastName}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            inputRef={emailRef}
                            onBlur={checkEmail}
                            error={!!formErrors.email || emailStatus === "taken" || emailStatus === "invalid"}
                            helperText={formErrors.email || emailHelperText}
                            color={emailStatus === "available" ? "success" : "primary"}
                            focused={emailStatus === "available"}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Phone Number"
                            inputRef={phoneRef}
                            error={!!formErrors.phone}
                            helperText={formErrors.phone}
                            margin="normal"
                        />
                        <TextField
                            fullWidth
                            label="Date of Birth"
                            type="date"
                            InputLabelProps={{ shrink: true }}
                            inputRef={dobRef}
                            error={!!formErrors.dob}
                            helperText={formErrors.dob}
                            margin="normal"
                        />
                        <TextField
                            select
                            fullWidth
                            label="Gender"
                            inputRef={genderRef}
                            defaultValue=""
                            error={!!formErrors.gender}
                            helperText={formErrors.gender}
                            margin="normal"
                        >
                            <MenuItem value="Male">Male</MenuItem>
                            <MenuItem value="Female">Female</MenuItem>
                            <MenuItem value="Other">Other</MenuItem>
                        </TextField>
                        <TextField
                            select
                            fullWidth
                            label="Resident Type"
                            inputRef={residentTypeRef}
                            defaultValue="Permanent"
                            error={!!formErrors.residentType}
                            helperText={formErrors.residentType}
                            margin="normal"
                        >
                            <MenuItem value="Permanent">Permanent</MenuItem>
                            <MenuItem value="Temporary">Temporary</MenuItem>
                        </TextField>
                        <FormControlLabel
                            control={<Switch inputRef={isOwnerRef} />}
                            label="Is Owner"
                            sx={{ mt: 1, display: 'block' }}
                        />
                        <FormControlLabel
                            control={<Switch inputRef={isActiveRef} defaultChecked />}
                            label="Is Active"
                            sx={{ mt: 1, display: 'block' }}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenCreate(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleSave}
                        disabled={creating || emailStatus === "taken" || emailStatus === "checking"}
                    >
                        {creating ? (isEditing ? "Saving..." : "Adding...") : (isEditing ? "Save" : "Add")}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create Account Dialog */}
            <Dialog
                open={openAccountDialog}
                onClose={() => setOpenAccountDialog(false)}
                fullWidth
                maxWidth="xs"
            >
                <DialogTitle>Create User Account</DialogTitle>
                <DialogContent>
                    <Typography variant="body2" sx={{ mb: 2 }}>
                        Create a login account for <strong>{selectedResident?.firstName} {selectedResident?.lastName}</strong>.
                    </Typography>
                    {accountError && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {accountError}
                        </Alert>
                    )}
                    <TextField
                        fullWidth
                        label="Password"
                        type="password"
                        value={accountPassword}
                        onChange={(e) => setAccountPassword(e.target.value)}
                        margin="normal"
                        autoFocus
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenAccountDialog(false)}>Cancel</Button>
                    <Button
                        variant="contained"
                        onClick={handleCreateAccount}
                        disabled={creatingAccount}
                    >
                        {creatingAccount ? "Creating..." : "Create Account"}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default UnitResidents;
