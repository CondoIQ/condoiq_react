import React, { useState, useRef } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    Divider,
    TextField,
    Chip,
    Alert,
    CircularProgress,
} from "@mui/material";
import {
    Event,
    AccessTime,
    Person,
    Home,
    Notes,
    Info,
    CheckCircle,
    Cancel,
    History,
} from "@mui/icons-material";
import amenityBookingService from "../../../services/amenityBookingService";
import { useAuth } from "../../../hooks/useAuth";
import { getUserId, getFirstName, getLastName } from "../../../services/authService";

const AmenityBookingDetailsDialog = ({ open, onClose, booking, onUpdate }) => {
    const { isAdmin, isBuildingManager } = useAuth();
    const userId = getUserId();
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Local state to handle optimistic updates without fetching parent
    const [currentBooking, setCurrentBooking] = useState(booking);

    // Update local state when prop changes
    React.useEffect(() => {
        setCurrentBooking(booking);
    }, [booking]);

    if (!currentBooking) return null;

    const getStatusChip = (status) => {
        let color = "default";
        switch (status) {
            case "CONFIRMED": color = "success"; break;
            case "PENDING_PAYMENT":
            case "PENDING_APPROVAL": color = "warning"; break;
            case "CANCELLED":
            case "REJECTED": color = "error"; break;
            case "COMPLETED": color = "info"; break;
            default: break;
        }
        return <Chip label={status} color={color} size="small" />;
    };

    const formatNote = (text) => {
        const firstName = getFirstName();
        const lastName = getLastName();
        const date = new Date().toLocaleString();
        return `${firstName} ${lastName} [${date}]: ${text}`;
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        const formattedNote = formatNote(note);
        await updateBookingWithNote(currentBooking.status, formattedNote, false);
    };

    const handleConfirm = () => {
        if (!note.trim()) {
            setError("Notes are required for confirmation.");
            return;
        }
        const formattedNote = formatNote(`Status changed to CONFIRMED. Note: ${note}`);
        updateBookingWithNote("CONFIRMED", formattedNote, true);
    };

    const handleReject = () => {
        if (!note.trim()) {
            setError("Notes are required for rejection.");
            return;
        }
        const formattedNote = formatNote(`Status changed to REJECTED. Reason: ${note}`);
        updateBookingWithNote("REJECTED", formattedNote, true);
    };

    const updateBookingWithNote = async (newStatus, newNoteEntry, closeOnSuccess = false) => {
        setLoading(true);
        setError("");
        try {
            // Append new note to existing notes
            const existingNotes = currentBooking.notes || "";
            const separator = existingNotes ? "\n\n" : "";
            const updatedNotes = `${existingNotes}${separator}${newNoteEntry}`;

            const updatePayload = {
                bookingId: currentBooking.bookingId,
                amenityId: currentBooking.amenityId,
                bookingDate: currentBooking.bookingDate,
                startTime: currentBooking.startTime,
                endTime: currentBooking.endTime,
                notes: updatedNotes,
                status: newStatus,
                updatedBy: userId,
            };

            await amenityBookingService.updateBooking(updatePayload);
            setNote(""); // Clear note input

            // Immediate update of local state
            setCurrentBooking(prev => ({
                ...prev,
                status: newStatus,
                notes: updatedNotes
            }));

            // Notify parent to refresh list background
            if (onUpdate) onUpdate();

            if (closeOnSuccess) {
                onClose();
            }
        } catch (err) {
            setError(err.message || "Failed to update booking");
        } finally {
            setLoading(false);
        }
    };

    // Helper to render notes with styled system text
    const renderNotes = (notesText) => {
        if (!notesText) return "No notes available.";

        // Split by double newline to separate entries
        return notesText.split("\n\n").map((entry, index) => {
            // Check for the pattern "Name Name [Date]: "
            const match = entry.match(/^(.+? \[\d{1,2}\/\d{1,2}\/\d{4}, .+?\]: )(.+)$/);
            if (match) {
                const [, header, content] = match;
                return (
                    <Box key={index} mb={1}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {header}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {content}
                        </Typography>
                    </Box>
                );
            }
            // Fallback for old notes or different format
            return (
                <Box key={index} mb={1}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                        {entry}
                    </Typography>
                </Box>
            );
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    Booking Details
                    <Typography variant="caption" display="block" color="text.secondary">
                        ID: {currentBooking.bookingId}
                    </Typography>
                </Box>
                {getStatusChip(currentBooking.status)}
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {/* Left Column: Key Info */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info fontSize="small" /> Amenity Information
                        </Typography>
                        <Box sx={{ ml: 3, mb: 2 }}>
                            <Typography variant="body1" fontWeight={500}>{currentBooking.amenityName}</Typography>
                        </Box>

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Event fontSize="small" /> Date & Time
                        </Typography>
                        <Box sx={{ ml: 3, mb: 2 }}>
                            <Typography variant="body2">Date: {currentBooking.bookingDate}</Typography>
                            <Typography variant="body2">Time: {currentBooking.startTime} - {currentBooking.endTime}</Typography>
                        </Box>

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" /> Resident Details
                        </Typography>
                        <Box sx={{ ml: 3, mb: 2 }}>
                            <Typography variant="body2">Name: {currentBooking.bookedByResident || currentBooking.residentId}</Typography>
                            <Typography variant="body2">Unit: {currentBooking.unitNumber || currentBooking.unitId}</Typography>
                        </Box>

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <History fontSize="small" /> Audit
                        </Typography>
                        <Box sx={{ ml: 3 }}>
                            <Typography variant="caption" display="block">Created By: {currentBooking.createdByName}</Typography>
                            <Typography variant="caption" display="block">Updated By: {currentBooking.updatedByName}</Typography>
                        </Box>
                    </Grid>

                    {/* Right Column: Notes & Actions */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Notes fontSize="small" /> Notes History
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                height: "250px",
                                overflowY: "auto",
                                mb: 2,
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            {renderNotes(currentBooking.notes)}
                        </Box>

                        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                            Add Note
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Type a note..."
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <Box display="flex" justifyContent="flex-end">
                                <Button variant="contained" size="small" onClick={handleAddNote} disabled={loading || !note.trim()}>
                                    Add Note Only
                                </Button>
                            </Box>
                        </Box>

                        {(isAdmin() || isBuildingManager()) && (currentBooking.status === "PENDING_APPROVAL" || currentBooking.status === "PENDING_PAYMENT") && (
                            <Box mt={3} p={2} border="1px dashed #bdbdbd" borderRadius={1} bgcolor="#fff8e1">
                                <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                                    Admin Approval Actions
                                </Typography>
                                <Typography variant="caption" display="block" color="text.secondary" mb={2}>
                                    Please ensure you have entered a reason/note above before taking action.
                                </Typography>
                                <Box display="flex" gap={2} justifyContent="flex-end">
                                    <Button
                                        variant="outlined"
                                        color="error"
                                        startIcon={<Cancel />}
                                        onClick={handleReject}
                                        disabled={loading}
                                    >
                                        Reject
                                    </Button>
                                    <Button
                                        variant="contained"
                                        color="success"
                                        startIcon={<CheckCircle />}
                                        onClick={handleConfirm}
                                        disabled={loading}
                                    >
                                        Confirm
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default AmenityBookingDetailsDialog;
