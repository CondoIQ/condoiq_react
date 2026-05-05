import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    IconButton,
    Tooltip,
    CircularProgress,
    FormControlLabel,
    Switch,
    Alert,
} from "@mui/material";
import { Cancel, CheckCircle, Pending, Edit, Assignment, ReportProblem } from "@mui/icons-material";
import complaintService from "../../../services/complaintService";
import { useAuth } from "../../../hooks/useAuth";
import { getUserId } from "../../../services/authService";

const ComplaintList = ({ onEdit, onViewDetails, refreshTrigger = 0 }) => {
    const { getBuildingId, isAdmin, isBuildingManager, isSecurity } = useAuth();
    const buildingId = getBuildingId();
    const userId = getUserId();

    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAll, setShowAll] = useState(false); // Default to active only

    const fetchComplaints = async () => {
        setLoading(true);
        setError("");
        try {
            let data = [];
            if (isAdmin() || isBuildingManager() || isSecurity()) {
                if (showAll) {
                    data = await complaintService.getAllComplaints(buildingId);
                } else {
                    data = await complaintService.getActiveComplaints(buildingId);
                }
            } else {
                // Resident view - Fetch by Creator (User ID)
                data = await complaintService.getComplaintsByCreator(userId);
                // Client-side filter for active/history if needed, or just show all for resident?
                // Logic: Resident usually sees all their complaints. 
                // If we want to support "Active Only" for resident, we filter here.
                if (!showAll) {
                    data = data.filter(c => c.status !== 'RESOLVED' && c.status !== 'CLOSED' && c.status !== 'CANCELLED');
                }
            }
            setComplaints(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchComplaints();
    }, [showAll, buildingId, userId, refreshTrigger]);

    const handleCancel = async (complaintId) => {
        if (!window.confirm("Are you sure you want to cancel this complaint?")) return;
        try {
            // userName is passed as null or blank as per backend requirement (or fetch from auth if needed)
            // Backend signature: cancelComplaint(userId, userName, complianId)
            // We'll pass "User" string or null if not strictly validated by backend logic beyond logging
            await complaintService.cancelComplaint(userId, "User", complaintId);
            fetchComplaints();
        } catch (err) {
            alert(err.message || "Cancellation failed");
        }
    };

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
            default:
                break;
        }
        return <Chip label={status} color={color} size="small" icon={icon} />;
    };

    const getPriorityChip = (priority) => {
        let color = "default";
        switch (priority) {
            case "HIGH": color = "error"; break;
            case "MEDIUM": color = "warning"; break;
            case "LOW": color = "success"; break;
            default: break;
        }
        return <Chip label={priority} color={color} size="small" variant="outlined" />;
    }

    return (
        <Paper sx={{ p: 3, borderRadius: 3, width: "100%", overflow: "hidden" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    {(isAdmin() || isBuildingManager() || isSecurity()) ? "Building Complaints" : "My Complaints"}
                </Typography>
                <FormControlLabel
                    control={<Switch checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />}
                    label="Show History (Closed/Resolved)"
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : complaints.length === 0 ? (
                <Alert severity="info">No complaints found.</Alert>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Title</TableCell>
                                <TableCell>Category</TableCell>
                                <TableCell>Priority</TableCell>
                                <TableCell>Status</TableCell>
                                <TableCell>Date Created</TableCell>
                                <TableCell>Created By</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {complaints.map((complaint) => (
                                <TableRow
                                    key={complaint.complainId}
                                    hover
                                    onClick={() => onViewDetails && onViewDetails(complaint)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{complaint.title}</TableCell>
                                    <TableCell>{complaint.category}</TableCell>
                                    <TableCell>{getPriorityChip(complaint.priority)}</TableCell>
                                    <TableCell>{getStatusChip(complaint.status)}</TableCell>
                                    <TableCell>{new Date(complaint.createdAt).toLocaleDateString()}</TableCell>
                                    <TableCell>
                                        <Box display="flex" flexDirection="column">
                                            <Typography variant="body2">{complaint.createdByName || "User"}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Unit: {complaint.submitterUnitId || "N/A"}
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1} onClick={(e) => e.stopPropagation()}>
                                            <Tooltip title="View Details">
                                                <IconButton size="small" onClick={() => onViewDetails && onViewDetails(complaint)}>
                                                    <Assignment fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {(isAdmin() || isBuildingManager() || isSecurity() || complaint.createdBy === userId) && (
                                                <Tooltip title="Edit">
                                                    <IconButton size="small" color="primary" onClick={() => onEdit && onEdit(complaint)}>
                                                        <Edit fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}

                                            {complaint.status !== "RESOLVED" && complaint.status !== "CLOSED" && complaint.status !== "CANCELLED" && (
                                                <Tooltip title="Cancel Complaint">
                                                    <IconButton size="small" color="error" onClick={() => handleCancel(complaint.complainId)}>
                                                        <Cancel fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            )}
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
        </Paper>
    );
};

export default ComplaintList;
