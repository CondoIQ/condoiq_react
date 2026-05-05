import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    Box,
    Grid,
    TextField,
    Chip,
    Alert,
    Divider,
} from "@mui/material";
import {
    ReportProblem,
    Person,
    Home,
    Notes,
    Info,
    CheckCircle,
    Cancel,
    Pending,
    Assignment,
    History,
    Event
} from "@mui/icons-material";
import complaintService from "../../../services/complaintService";
import { useAuth } from "../../../hooks/useAuth";
import { getUserId, getFirstName, getLastName } from "../../../services/authService";

const ComplaintDetailsDialog = ({ open, onClose, complaint, onUpdate }) => {
    const { isAdmin, isBuildingManager, isSecurity } = useAuth();
    const userId = getUserId();
    const [note, setNote] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Local state for optimistic updates
    const [currentComplaint, setCurrentComplaint] = useState(complaint);

    useEffect(() => {
        setCurrentComplaint(complaint);
    }, [complaint]);

    if (!currentComplaint) return null;

    const getStatusChip = (status) => {
        let color = "default";
        let icon = null;
        switch (status) {
            case "RESOLVED":
                color = "success";
                icon = <CheckCircle fontSize="small" />;
                break;
            case "CLOSED":
                color = "default";
                icon = <CheckCircle fontSize="small" />;
                break;
            case "IN_PROGRESS":
                color = "info";
                icon = <Pending fontSize="small" />;
                break;
            case "ASSIGNED":
                color = "primary";
                icon = <Assignment fontSize="small" />;
                break;
            case "OPEN":
                color = "warning";
                icon = <ReportProblem fontSize="small" />;
                break;
            case "CANCELLED":
                color = "error";
                icon = <Cancel fontSize="small" />;
                break;
            default: break;
        }
        return <Chip label={status} color={color} size="small" icon={icon} />;
    };

    const formatNote = (text) => {
        const firstName = getFirstName();
        const lastName = getLastName();
        const date = new Date().toLocaleString();
        return `${firstName} ${lastName} [${date}]: ${text}`;
    };

    const handleAddNote = async () => {
        if (!note.trim()) return;
        setLoading(true);
        setError("");
        try {
            const formattedNote = formatNote(note);
            const existingNotes = currentComplaint.notes || "";
            const separator = existingNotes ? "\n\n" : "";
            const updatedNotes = `${existingNotes}${separator}${formattedNote}`;

            const payload = {
                ...currentComplaint,
                notes: updatedNotes,
                updatedBy: userId,
                updatedByName: `${getFirstName()} ${getLastName()}`
            };

            await complaintService.updateComplaint(payload);

            setCurrentComplaint(prev => ({
                ...prev,
                notes: updatedNotes,
                updatedBy: userId,
                updatedByName: `${getFirstName()} ${getLastName()}`
            }));

            setNote("");
            if (onUpdate) onUpdate();

        } catch (err) {
            setError(err.message || "Failed to add note.");
        } finally {
            setLoading(false);
        }
    };

    const renderNotes = (notesText) => {
        if (!notesText) return <Typography variant="body2" color="text.secondary">No notes available.</Typography>;

        return notesText.split("\n\n").map((entry, index) => {
            const match = entry.match(/^(.+? \[\d{1,2}\/\d{1,2}\/\d{4}, .+?\]: )(.+)$/);
            if (match) {
                const [, header, content] = match;
                return (
                    <Box key={index} mb={1.5}>
                        <Typography variant="caption" display="block" sx={{ fontWeight: 600, color: 'primary.main' }}>
                            {header}
                        </Typography>
                        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                            {content}
                        </Typography>
                    </Box>
                );
            }
            return (
                <Box key={index} mb={1.5}>
                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>{entry}</Typography>
                </Box>
            );
        });
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
            <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Box>
                    Complaint Details
                    <Typography variant="caption" display="block" color="text.secondary">
                        ID: {currentComplaint.complainId}
                    </Typography>
                </Box>
                {getStatusChip(currentComplaint.status)}
            </DialogTitle>
            <DialogContent dividers>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

                <Grid container spacing={3}>
                    {/* Left Column: Info */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Info fontSize="small" /> Complaint Info
                        </Typography>
                        <Box sx={{ ml: 3, mb: 2 }}>
                            <Typography variant="subtitle1" fontWeight={600}>{currentComplaint.title}</Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>{currentComplaint.description}</Typography>

                            <Box display="flex" gap={2} mb={1}>
                                <Typography variant="body2"><strong>Category:</strong> {currentComplaint.category}</Typography>
                                <Typography variant="body2"><strong>Target ID:</strong> {currentComplaint.categoryId}</Typography>
                            </Box>
                            <Box display="flex" gap={2}>
                                <Typography variant="body2"><strong>Priority:</strong> {currentComplaint.priority}</Typography>
                            </Box>
                        </Box>

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Person fontSize="small" /> Created By
                        </Typography>
                        <Box sx={{ ml: 3, mb: 2 }}>
                            <Typography variant="body2"><strong>Name:</strong> {currentComplaint.createdByName || "N/A"}</Typography>
                            <Typography variant="body2"><strong>Unit:</strong> {currentComplaint.submitterUnitId || "N/A"}</Typography>
                            <Typography variant="caption" display="block" color="text.secondary" mt={0.5}>
                                Date: {new Date(currentComplaint.createdAt).toLocaleString()}
                            </Typography>
                        </Box>

                        {(currentComplaint.assignedToUserName || currentComplaint.assignedToRole) && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <Assignment fontSize="small" /> Assignment
                                </Typography>
                                <Box sx={{ ml: 3, mb: 2 }}>
                                    {currentComplaint.assignedToRole && <Typography variant="body2"><strong>Role:</strong> {currentComplaint.assignedToRole}</Typography>}
                                    {currentComplaint.assignedToUserName && <Typography variant="body2"><strong>User:</strong> {currentComplaint.assignedToUserName}</Typography>}
                                </Box>
                            </>
                        )}

                        {/* Resolution Notes - Visible to All if present */}
                        {currentComplaint.resolutionNotes && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="subtitle2" color="success.main" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                    <CheckCircle fontSize="small" /> Resolution
                                </Typography>
                                <Box sx={{ ml: 3, mb: 2, p: 2, bgcolor: '#e8f5e9', borderRadius: 1 }}>
                                    <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                                        {currentComplaint.resolutionNotes}
                                    </Typography>
                                </Box>
                            </>
                        )}
                    </Grid>

                    {/* Right Column: Notes History */}
                    <Grid item xs={12} md={6}>
                        <Typography variant="subtitle2" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Notes fontSize="small" /> Notes & History
                        </Typography>
                        <Box
                            sx={{
                                p: 2,
                                bgcolor: "#f5f5f5",
                                borderRadius: 1,
                                height: "300px",
                                overflowY: "auto",
                                mb: 2,
                                border: '1px solid #e0e0e0'
                            }}
                        >
                            {renderNotes(currentComplaint.notes)}
                        </Box>

                        <Typography variant="figure" color="text.secondary" gutterBottom sx={{ fontSize: '0.875rem' }}>
                            Add Note / Update
                        </Typography>
                        <Box display="flex" flexDirection="column" gap={2}>
                            <TextField
                                size="small"
                                fullWidth
                                multiline
                                rows={2}
                                placeholder="Type a note... (Automatically timestamped)"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                            />
                            <Box display="flex" justifyContent="flex-end">
                                <Button
                                    variant="contained"
                                    size="small"
                                    onClick={handleAddNote}
                                    disabled={loading || !note.trim()}
                                >
                                    Add Note
                                </Button>
                            </Box>
                        </Box>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="inherit">Close</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ComplaintDetailsDialog;
