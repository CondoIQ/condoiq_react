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
    Autocomplete,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import { useAuth } from "../../../hooks/useAuth";
import amenityBookingService from "../../../services/amenityBookingService";
import amenitiesService from "../../../services/amenitiesService";
import residentService from "../../../services/residentService";
import { getUserId } from "../../../services/authService";

const AmenityBookingDialog = ({ open, onClose, amenity, booking, onBookingCreated }) => {
    const { isAdmin, isBuildingManager, getBuildingId, getUnitId } = useAuth();
    const buildingId = getBuildingId();
    const userId = getUserId();
    const unitId = getUnitId();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [residents, setResidents] = useState([]);
    const [selectedResident, setSelectedResident] = useState(null);
    const [fetchedAmenity, setFetchedAmenity] = useState(null);
    const [status, setStatus] = useState("");

    const activeAmenity = amenity || fetchedAmenity;

    // Form Refs
    const dateRef = useRef();
    const startTimeRef = useRef();
    const endTimeRef = useRef();
    const notesRef = useRef();

    // Fetch residents for Admin/Manager
    useEffect(() => {
        if ((isAdmin() || isBuildingManager()) && open) {
            const fetchResidents = async () => {
                try {
                    const data = await residentService.getAllBuildingResidents(buildingId);
                    setResidents(data || []);
                } catch (err) {
                    console.error("Failed to fetch residents", err);
                }
            };
            fetchResidents();
        }
    }, [open, isAdmin, isBuildingManager, buildingId]);

    // Fetch amenity if editing and not provided
    useEffect(() => {
        if (booking && !amenity && open) {
            const fetchAmenity = async () => {
                try {
                    const data = await amenitiesService.getAmenityById(booking.amenityId);
                    setFetchedAmenity(data);
                } catch (err) {
                    setError("Failed to load amenity details.");
                }
            };
            fetchAmenity();
        }
    }, [booking, amenity, open]);

    // Pre-fill form if editing
    useEffect(() => {
        if (booking && open) {
            // Wait for refs to be ready
            setTimeout(() => {
                if (dateRef.current) dateRef.current.value = booking.bookingDate;
                if (startTimeRef.current) startTimeRef.current.value = booking.startTime;
                if (endTimeRef.current) endTimeRef.current.value = booking.endTime;
                if (notesRef.current) notesRef.current.value = booking.notes || "";
            }, 100);
            setStatus(booking.status);
            // If admin, we might want to set selectedResident, but it's complex to match object. 
            // For now, we disable resident change on edit.
        }
    }, [booking, open]);

    const validateBooking = (startDateTime, endDateTime) => {
        const now = new Date();
        // Only check past dates for NEW bookings or if date changed
        if (!booking && startDateTime < now) return "Cannot book in the past.";
        if (endDateTime <= startDateTime) return "End time must be after start time.";

        if (!activeAmenity) return null;

        const durationHours = (endDateTime - startDateTime) / (1000 * 60 * 60);

        if (activeAmenity.minBookingDuration && durationHours < activeAmenity.minBookingDuration) {
            return `Minimum booking duration is ${activeAmenity.minBookingDuration} hours.`;
        }
        if (activeAmenity.maxBookingDuration && durationHours > activeAmenity.maxBookingDuration) {
            return `Maximum booking duration is ${activeAmenity.maxBookingDuration} hours.`;
        }

        if (activeAmenity.openingTime && activeAmenity.closingTime) {
            const startString = startDateTime.toTimeString().slice(0, 5);
            const endString = endDateTime.toTimeString().slice(0, 5);

            if (startString < activeAmenity.openingTime || endString > activeAmenity.closingTime) {
                return `Booking must be between ${activeAmenity.openingTime} and ${activeAmenity.closingTime}.`;
            }
        }

        return null;
    };

    const handleBook = async () => {
        setError("");
        setLoading(true);

        try {
            const dateVal = dateRef.current.value;
            const startVal = startTimeRef.current.value;
            const endVal = endTimeRef.current.value;

            if (!dateVal || !startVal || !endVal) {
                throw new Error("Please fill in all date and time fields.");
            }

            const startDateTime = new Date(`${dateVal}T${startVal}`);
            const endDateTime = new Date(`${dateVal}T${endVal}`);

            const validationError = validateBooking(startDateTime, endDateTime);
            if (validationError) throw new Error(validationError);

            // Check availability if time changed or new booking
            // Optimization: Only check if values changed from original booking
            let checkAvailability = true;
            if (booking && booking.bookingDate === dateVal && booking.startTime === startVal && booking.endTime === endVal) {
                checkAvailability = false;
            }

            if (checkAvailability && activeAmenity) {
                const isAvailable = await amenityBookingService.isSlotAvailable(
                    activeAmenity.amenityId,
                    dateVal,
                    startVal,
                    endVal
                );
                if (isAvailable === false) {
                    throw new Error("Selected slot is not available.");
                }
            }

            if (booking) {
                // Update existing booking
                const updatePayload = {
                    bookingId: booking.bookingId,
                    amenityId: booking.amenityId, // Required by backend usually?
                    bookingDate: dateVal,
                    startTime: startVal,
                    endTime: endVal,
                    notes: notesRef.current.value,
                    status: status, // Admin can change status
                    updatedBy: userId,
                };

                // If admin is updating status, we pass it. 
                // If resident is updating, status usually resets to pending if they change time? 
                // For now, keep status unless Admin changes it.
                if (!isAdmin() && !isBuildingManager()) {
                    // If resident changes time, maybe reset approval? 
                    // Requirement not specified, keeping simple.
                    updatePayload.status = booking.status;
                }

                await amenityBookingService.updateBooking(updatePayload);
            } else {
                // Create new booking
                let targetResidentId = userId;
                let targetUnitId = null;

                if ((isAdmin() || isBuildingManager()) && selectedResident) {
                    targetResidentId = selectedResident.residentId;
                    targetUnitId = selectedResident.unitId;
                } else {
                    targetUnitId = unitId;
                }

                // Status Logic: Price > 0 OR Requires Approval -> PENDING_PAYMENT (or APPROVAL)
                let initialStatus = "CONFIRMED";
                if (activeAmenity.price > 0) {
                    initialStatus = "PENDING_PAYMENT";
                } else if (activeAmenity.requiresApproval) {
                    initialStatus = "PENDING_APPROVAL"
                }

                const bookingData = {
                    amenityId: activeAmenity.amenityId,
                    buildingId: buildingId,
                    residentId: targetResidentId,
                    unitId: targetUnitId,
                    bookingDate: dateVal,
                    startTime: startVal,
                    endTime: endVal,
                    notes: notesRef.current.value,
                    status: initialStatus,
                    createdBy: userId,
                    updatedBy: userId,
                };

                await amenityBookingService.createBooking(bookingData);
            }

            onBookingCreated();
            onClose();
        } catch (err) {
            setError(err.message || "Operation failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{booking ? "Edit Booking" : `Book ${activeAmenity?.amenityName}`}</DialogTitle>
            <DialogContent>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Box component="form" sx={{ mt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {/* Admin: Select Resident (Only on Create) */}
                    {!booking && (isAdmin() || isBuildingManager()) && (
                        <Autocomplete
                            options={residents}
                            getOptionLabel={(option) => `${option.firstName} ${option.lastName} (Unit ${option.unitNumber})`}
                            value={selectedResident}
                            onChange={(e, newValue) => setSelectedResident(newValue)}
                            renderInput={(params) => <TextField {...params} label="Book for Resident (Optional)" />}
                        />
                    )}

                    {/* Admin: Status Update (Only on Edit) */}
                    {booking && (isAdmin() || isBuildingManager()) && (
                        <FormControl fullWidth>
                            <InputLabel>Status</InputLabel>
                            <Select
                                value={status}
                                label="Status"
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <MenuItem value="CONFIRMED">Confirmed</MenuItem>
                                <MenuItem value="PENDING_PAYMENT">Pending Payment/Approval</MenuItem>
                                <MenuItem value="CANCELLED">Cancelled</MenuItem>
                                <MenuItem value="REJECTED">Rejected</MenuItem>
                            </Select>
                        </FormControl>
                    )}

                    <TextField
                        label="Date"
                        type="date"
                        inputRef={dateRef}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        required
                    />

                    <Box display="flex" gap={2}>
                        <TextField
                            label="Start Time"
                            type="time"
                            inputRef={startTimeRef}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                        />
                        <TextField
                            label="End Time"
                            type="time"
                            inputRef={endTimeRef}
                            InputLabelProps={{ shrink: true }}
                            fullWidth
                            required
                        />
                    </Box>

                    {activeAmenity?.minBookingDuration > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            Min Duration: {activeAmenity.minBookingDuration}h
                        </Typography>
                    )}
                    {activeAmenity?.maxBookingDuration > 0 && (
                        <Typography variant="caption" color="text.secondary">
                            Max Duration: {activeAmenity.maxBookingDuration}h
                        </Typography>
                    )}

                    <TextField
                        label={isAdmin() || isBuildingManager() ? "Admin Notes" : "Notes"}
                        multiline
                        rows={3}
                        inputRef={notesRef}
                        fullWidth
                        placeholder="Special requests or purpose..."
                    />

                    {!booking && (activeAmenity?.requiresApproval || activeAmenity?.price > 0) && (
                        <Alert severity="info">
                            {activeAmenity.price > 0
                                ? `This amenity has a fee of $${activeAmenity.price}. Booking will be pending payment/approval.`
                                : "This amenity requires approval. Your booking will be pending until approved."}
                        </Alert>
                    )}
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Cancel</Button>
                <Button onClick={handleBook} variant="contained" disabled={loading}>
                    {loading ? <CircularProgress size={24} /> : (booking ? "Update Booking" : "Confirm Booking")}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default AmenityBookingDialog;
