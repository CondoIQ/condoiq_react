import React, { useState, useEffect } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box, Paper, Typography, CircularProgress, Alert } from "@mui/material";
import amenityBookingService from "../../../services/amenityBookingService";
import { useAuth } from "../../../hooks/useAuth";

const localizer = momentLocalizer(moment);

const AmenityBookingCalendar = ({ onViewDetails, refreshTrigger = 0 }) => {
    const { getBuildingId } = useAuth();
    const buildingId = getBuildingId();

    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const data = await amenityBookingService.getAllBuildingBookings(buildingId);
                if (Array.isArray(data)) {
                    const formattedEvents = data.map((b) => ({
                        id: b.bookingId,
                        title: `${b.amenityName || "Unknown Amenity"} - Unit ${b.unitNumber || b.unitId || "N/A"}`,
                        start: new Date(`${b.bookingDate}T${b.startTime}`),
                        end: new Date(`${b.bookingDate}T${b.endTime}`),
                        resource: b,
                        status: b.status,
                    }));
                    setEvents(formattedEvents);
                }
            } catch (err) {
                setError("Failed to load calendar events.");
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, [buildingId, refreshTrigger]);

    const eventStyleGetter = (event) => {
        let backgroundColor = "#3174ad";
        if (event.status === "CANCELLED") backgroundColor = "#f44336";
        if (event.status === "PENDING_PAYMENT") backgroundColor = "#ff9800";
        if (event.status === "CONFIRMED") backgroundColor = "#4caf50";

        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    return (
        <Paper sx={{ p: 3, height: 700, borderRadius: 3 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
                Booking Calendar
            </Typography>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                    <CircularProgress />
                </Box>
            ) : (
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    eventPropGetter={eventStyleGetter}
                    views={['month', 'week', 'day', 'agenda']}
                    defaultView="month"
                    onSelectEvent={(event) => onViewDetails && onViewDetails(event.resource)}
                />
            )}
        </Paper>
    );
};

export default AmenityBookingCalendar;
