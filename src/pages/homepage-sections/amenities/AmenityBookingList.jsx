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
    Button,
} from "@mui/material";
import { Cancel, CheckCircle, Pending, Edit, ThumbUp, ThumbDown } from "@mui/icons-material";
import amenityBookingService from "../../../services/amenityBookingService";
import { useAuth } from "../../../hooks/useAuth";
import { getUserId } from "../../../services/authService";

const AmenityBookingList = ({ type = "resident", onEdit, onViewDetails, refreshTrigger = 0 }) => {
    const { getBuildingId, isAdmin, isBuildingManager, getUnitId } = useAuth();
    const buildingId = getBuildingId();
    const userId = getUserId();
    const unitId = getUnitId();

    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [showAll, setShowAll] = useState(false); // Default to upcoming only

    const fetchBookings = async () => {
        setLoading(true);
        setError("");
        try {
            let data = [];
            if (type === "admin" && (isAdmin() || isBuildingManager())) {
                if (showAll) {
                    data = await amenityBookingService.getAllBuildingBookings(buildingId);
                } else {
                    data = await amenityBookingService.getAllUpcomingBuildingBookings(buildingId);
                }
            } else {
                // Resident view - Fetch by Unit ID to see all unit bookings
                if (showAll) {
                    data = await amenityBookingService.getAllBookingsByUnit(unitId);
                } else {
                    data = await amenityBookingService.getAllUpcomingBookingsByUnit(unitId);
                }
            }
            setBookings(Array.isArray(data) ? data : []);
        } catch (err) {
            setError(err.message || "Failed to fetch bookings");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, [showAll, type, buildingId, unitId, refreshTrigger]);

    const handleCancel = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this booking?")) return;
        try {
            await amenityBookingService.cancelBooking(bookingId);
            fetchBookings(); // Refresh list
        } catch (err) {
            alert(err.message || "Cancellation failed");
        }
    };

    const getStatusChip = (status) => {
        let color = "default";
        let icon = null;
        switch (status) {
            case "CONFIRMED":
                color = "success";
                icon = <CheckCircle fontSize="small" />;
                break;
            case "PENDING_PAYMENT":
            case "PENDING_APPROVAL":
                color = "warning";
                icon = <Pending fontSize="small" />;
                break;
            case "CANCELLED":
            case "REJECTED":
                color = "error";
                icon = <Cancel fontSize="small" />;
                break;
            case "COMPLETED":
                color = "info";
                break;
            default:
                break;
        }
        return <Chip label={status} color={color} size="small" icon={icon} />;
    };

    return (
        <Paper sx={{ p: 3, borderRadius: 3, width: "100%", overflow: "hidden" }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                <Typography variant="h6" fontWeight={600}>
                    {type === "admin" ? "All Building Bookings" : "My Unit Bookings"}
                </Typography>
                <FormControlLabel
                    control={<Switch checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />}
                    label="Show All (History)"
                />
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {loading ? (
                <Box display="flex" justifyContent="center" p={4}>
                    <CircularProgress />
                </Box>
            ) : bookings.length === 0 ? (
                <Alert severity="info">No bookings found.</Alert>
            ) : (
                <TableContainer>
                    <Table size="small">
                        <TableHead>
                            <TableRow>
                                <TableCell>Amenity</TableCell>
                                <TableCell>Date</TableCell>
                                <TableCell>Time</TableCell>
                                {type === "admin" && <TableCell>Resident (Unit)</TableCell>}
                                <TableCell>Status</TableCell>
                                <TableCell>Notes</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {bookings.map((booking) => (
                                <TableRow
                                    key={booking.bookingId}
                                    hover
                                    onClick={() => onViewDetails && onViewDetails(booking)}
                                    sx={{ cursor: "pointer" }}
                                >
                                    <TableCell>{booking.amenityName}</TableCell>
                                    <TableCell>{booking.bookingDate}</TableCell>
                                    <TableCell>{booking.startTime} - {booking.endTime}</TableCell>
                                    {type === "admin" && (
                                        <TableCell>
                                            {booking.bookedByResident || booking.residentId}
                                            {booking.unitNumber ? ` (Unit ${booking.unitNumber})` : ""}
                                        </TableCell>
                                    )}
                                    <TableCell>{getStatusChip(booking.status)}</TableCell>
                                    <TableCell sx={{ maxWidth: 200, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                        <Tooltip title={booking.notes || ""}>
                                            <span>{booking.notes}</span>
                                        </Tooltip>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box display="flex" justifyContent="flex-end" gap={1} onClick={(e) => e.stopPropagation()}>
                                            {/* Edit / View Details */}
                                            <Tooltip title="Edit">
                                                <IconButton size="small" color="primary" onClick={() => onEdit && onEdit(booking)}>
                                                    <Edit fontSize="small" />
                                                </IconButton>
                                            </Tooltip>

                                            {/* Cancel */}
                                            {booking.status !== "CANCELLED" && booking.status !== "COMPLETED" && booking.status !== "REJECTED" && (
                                                <Tooltip title="Cancel Booking">
                                                    <IconButton size="small" color="error" onClick={() => handleCancel(booking.bookingId)}>
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

export default AmenityBookingList;
