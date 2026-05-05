import React, { useState, useEffect, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Box,
    Alert,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Autocomplete,
    Typography,
    Divider
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import complaintService from "../../../services/complaintService";
import unitService from "../../../services/unitService";
import residentService from "../../../services/residentService";
import rolesService from "../../../services/rolesService";
import amenitiesService from "../../../services/amenitiesService";
import { getUserId } from "../../../services/authService";

const ComplaintDialog = ({ open, onClose, complaint, onComplaintSaved }) => {
    const { isAdmin, isBuildingManager, isSecurity, getBuildingId, getUnitId, getFirstName, getLastName } = useAuth();
    const buildingId = getBuildingId();
    const userId = getUserId();
    const userUnitId = getUnitId(); // Get user's unit ID for defaults

    const [loading, setLoading] = useState(false); // Save loading
    const [fetchLoading, setFetchLoading] = useState(false); // Initial data loading
    const [error, setError] = useState("");

    // Reference Data States
    const [units, setUnits] = useState([]);
    const [residents, setResidents] = useState([]);
    const [roles, setRoles] = useState([]);
    const [amenities, setAmenities] = useState([]);

    // Form Control State (Only for fields affecting layout/logic)
    const [category, setCategory] = useState("UNIT");
    const [categoryId, setCategoryId] = useState("");
    const [priority, setPriority] = useState("MEDIUM");
    const [status, setStatus] = useState("OPEN");
    const [assignedToRole, setAssignedToRole] = useState("");
    const [assignedToUserId, setAssignedToUserId] = useState("");
    const [assignedToUserName, setAssignedToUserName] = useState("");
    const [targetResident, setTargetResident] = useState(null); // For Autocomplete value matching

    // Refs for text fields (Performance Optimization)
    const titleRef = useRef();
    const descriptionRef = useRef();
    const notesRef = useRef();
    const resolutionNotesRef = useRef();
    const submitterUnitIdRef = useRef();

    const isEditMode = !!complaint;
    const canManage = isAdmin() || isBuildingManager() || isSecurity();

    // Fetch Reference Data (Run once on mount of parent, or when buildingId changes)
    useEffect(() => {
        let mounted = true;
        const fetchData = async () => {
            try {
                if (mounted) setFetchLoading(true);
                // Fetch all data in parallel
                const promises = [
                    unitService.getAllUnits(buildingId),
                    residentService.getAllBuildingResidents(buildingId),
                    rolesService.getAllRoles(),
                    amenitiesService.getAllAmenities(buildingId)
                ];

                const [unitsData, residentsData, rolesData, amenitiesData] = await Promise.all(promises);

                if (mounted) {
                    setUnits(unitsData || []);
                    setResidents(residentsData || []);
                    setRoles(rolesData || []);
                    const amList = Array.isArray(amenitiesData?.data) ? amenitiesData.data : (Array.isArray(amenitiesData) ? amenitiesData : []);
                    setAmenities(amList);
                }
            } catch (err) {
                console.error("Failed to fetch reference data", err);
            } finally {
                if (mounted) setFetchLoading(false);
            }
        };

        if (buildingId) {
            fetchData();
        }
        return () => { mounted = false; };
    }, [buildingId]);
    // Dependency on buildingId only - prevents re-fetching on every dialog open

    // Populate Form on Open/Edit
    useEffect(() => {
        if (open) {
            setError("");

            // Set State Values
            if (complaint) {
                setCategory(complaint.category || "UNIT");
                setCategoryId(complaint.categoryId || "");
                setPriority(complaint.priority || "MEDIUM");
                setStatus(complaint.status || "OPEN");
                setAssignedToRole(complaint.assignedToRole || "");
                setAssignedToUserId(complaint.assignedToUserId || "");
                setAssignedToUserName(complaint.assignedToUserName || "");
            } else {
                // Default Values
                setCategory("UNIT");
                setCategoryId("");
                setPriority("MEDIUM");
                setStatus("OPEN");
                setAssignedToRole("");
                setAssignedToUserId("");
                setAssignedToUserName("");
            }

            // Set Ref Values (wait for render)
            setTimeout(() => {
                if (titleRef.current) titleRef.current.value = complaint?.title || "";
                if (descriptionRef.current) descriptionRef.current.value = complaint?.description || "";
                if (notesRef.current) notesRef.current.value = complaint?.notes || "";
                if (resolutionNotesRef.current) resolutionNotesRef.current.value = complaint?.resolutionNotes || "";

                // Admin Submitter Unit ID defaults
                if (submitterUnitIdRef.current) {
                    submitterUnitIdRef.current.value = complaint?.submitterUnitId || (canManage ? "" : userUnitId || "");
                }
            }, 50);
        }
    }, [open, complaint, canManage, userUnitId]);


    const handleCategoryChange = (e) => {
        setCategory(e.target.value);
        setCategoryId(""); // Reset target when scope changes
    };

    const handleAssigneeChange = (event, newValue) => {
        if (newValue) {
            setAssignedToUserId(newValue.residentId || newValue.userId);
            setAssignedToUserName(`${newValue.firstName} ${newValue.lastName}`);
        } else {
            setAssignedToUserId("");
            setAssignedToUserName("");
        }
    };

    const handleSave = async () => {
        setError("");

        const titleVal = titleRef.current?.value;
        const descVal = descriptionRef.current?.value;
        const noteVal = notesRef.current?.value;
        const resNoteVal = resolutionNotesRef.current?.value;
        const subUnitVal = submitterUnitIdRef.current?.value;

        // Validation
        if (!titleVal || !descVal || !category) {
            setError("Title, Description, and Category are required.");
            return;
        }

        if (category === "UNIT" && !categoryId) {
            setError("Please select the Unit you are reporting.");
            return;
        }
        if (category === "RESIDENT" && !categoryId) {
            setError("Please select the Resident you are reporting.");
            return;
        }
        if (category === "AMENITY" && !categoryId) {
            setError("Please select the Amenity.");
            return;
        }

        if ((status === "RESOLVED" || status === "CLOSED") && !resNoteVal) {
            setError("Resolution Notes are required when closing or resolving a ticket.");
            return;
        }

        if ((assignedToUserId && !assignedToUserName) || (!assignedToUserId && assignedToUserName)) {
            setError("Assigned User ID and Name must both be populated.");
            return;
        }

        setLoading(true);
        try {
            const payload = {
                title: titleVal,
                description: descVal,
                category,
                categoryId,
                priority,
                status,
                notes: noteVal,
                resolutionNotes: resNoteVal,
                submitterUnitId: subUnitVal,
                assignedToRole,
                assignedToUserId,
                assignedToUserName,
                buildingId
            };

            // For BUILDING and OTHER category, target ID is the building ID
            if (payload.category === "BUILDING" || payload.category === "OTHER") {
                payload.categoryId = buildingId;
            }

            if (isEditMode) {
                payload.complainId = complaint.complainId;
                payload.updatedBy = userId;
                payload.updatedByName = getFirstName() + " " + getLastName();
                await complaintService.updateComplaint(payload);
            } else {
                payload.createdBy = userId;
                payload.createdByName = getFirstName() + " " + getLastName();
                payload.updatedBy = userId;
                payload.updatedByName = getFirstName() + " " + getLastName();
                // Default sub unit if empty for resident
                if (!payload.submitterUnitId && !canManage) {
                    payload.submitterUnitId = userUnitId;
                }

                await complaintService.createComplaint(payload);
            }

            onComplaintSaved();
            onClose();
        } catch (err) {
            setError(err.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle>{isEditMode ? "Edit Complaint" : "New Complaint"}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>

                    {/* Category Selection */}
                    <Box display="flex" gap={2}>
                        <FormControl fullWidth>
                            <InputLabel>Category (Scope)</InputLabel>
                            <Select
                                value={category}
                                label="Category (Scope)"
                                onChange={handleCategoryChange}
                            >
                                <MenuItem value="UNIT">Unit (Neighbor/Noise)</MenuItem>
                                <MenuItem value="RESIDENT">Resident</MenuItem>
                                <MenuItem value="AMENITY">Amenity</MenuItem>
                                <MenuItem value="BUILDING">Building / Common Area</MenuItem>
                                <MenuItem value="OTHER">Other</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Dynamic Target Dropdown */}
                        {category === "UNIT" && (
                            <FormControl fullWidth>
                                <InputLabel>Target Unit</InputLabel>
                                <Select
                                    value={categoryId}
                                    label="Target Unit"
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    {units.map(u => (
                                        <MenuItem key={u.unitId} value={u.unitId}>Unit {u.unitId}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {category === "RESIDENT" && (
                            <FormControl fullWidth>
                                <InputLabel>Target Resident</InputLabel>
                                <Select
                                    value={categoryId}
                                    label="Target Resident"
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    {residents.map(r => (
                                        <MenuItem key={r.residentId} value={r.residentId}>{r.firstName} {r.lastName} (Unit {r.unitId})</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}

                        {category === "AMENITY" && (
                            <FormControl fullWidth>
                                <InputLabel>Target Amenity</InputLabel>
                                <Select
                                    value={categoryId}
                                    label="Target Amenity"
                                    onChange={(e) => setCategoryId(e.target.value)}
                                >
                                    {amenities.map(a => (
                                        <MenuItem key={a.amenityId} value={a.amenityId}>{a.amenityName}</MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        )}
                    </Box>


                    <TextField
                        label="Subject / Title"
                        inputRef={titleRef}
                        fullWidth
                        required
                        placeholder="e.g. Loud music from Apt 402"
                    />

                    <TextField
                        label="Description of Issue"
                        inputRef={descriptionRef}
                        multiline
                        rows={3}
                        fullWidth
                        required
                    />

                    <FormControl fullWidth>
                        <InputLabel>Priority</InputLabel>
                        <Select
                            value={priority}
                            label="Priority"
                            onChange={(e) => setPriority(e.target.value)}
                        >
                            <MenuItem value="LOW">Low</MenuItem>
                            <MenuItem value="MEDIUM">Medium</MenuItem>
                            <MenuItem value="HIGH">High</MenuItem>
                        </Select>
                    </FormControl>

                    {/* Admin Only Fields */}
                    {canManage && (
                        <>
                            <Divider textAlign="left" sx={{ my: 1 }}><Typography variant="caption">Admin Handling</Typography></Divider>

                            <Box display="flex" gap={2}>
                                <FormControl fullWidth>
                                    <InputLabel>Status</InputLabel>
                                    <Select
                                        value={status}
                                        label="Status"
                                        onChange={(e) => setStatus(e.target.value)}
                                    >
                                        <MenuItem value="OPEN">Open</MenuItem>
                                        <MenuItem value="ASSIGNED">Assigned</MenuItem>
                                        <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                                        <MenuItem value="RESOLVED">Resolved</MenuItem>
                                        <MenuItem value="CLOSED">Closed</MenuItem>
                                        <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                    </Select>
                                </FormControl>

                                <FormControl fullWidth>
                                    <InputLabel>Assigned Role</InputLabel>
                                    <Select
                                        value={assignedToRole}
                                        label="Assigned Role"
                                        onChange={(e) => setAssignedToRole(e.target.value)}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {roles.map(role => (
                                            <MenuItem key={role.roleId || role} value={role.name || role}>{role.name || role}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>

                            <Autocomplete
                                options={residents}
                                getOptionLabel={(option) => `${option.firstName} ${option.lastName} (${option.role || 'User'})`}
                                value={residents.find(r => r.residentId === assignedToUserId) || null}
                                onChange={handleAssigneeChange}
                                renderInput={(params) => <TextField {...params} label="Assign To Specific User" helperText="Overrides Role assignment if set" />}
                            />

                            <TextField
                                label="Submitter Unit ID"
                                inputRef={submitterUnitIdRef}
                                fullWidth
                                helperText="Optional for Admin submissions"
                            />

                            <TextField
                                label="Resolution Notes"
                                inputRef={resolutionNotesRef}
                                multiline
                                rows={2}
                                fullWidth
                            // Note: Required validation handled in handleSave logic
                            />
                            <TextField
                                label="Internal Notes"
                                inputRef={notesRef}
                                multiline
                                rows={2}
                                fullWidth
                            />
                        </>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleSave} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : "Save"}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ComplaintDialog;
