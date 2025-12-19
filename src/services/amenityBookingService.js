import axiosInstance from "./axiosInstance";

const API_URL = "http://localhost:8080/api/amenitybookings";

// Get all bookings for a building
export const getAllBuildingBookings = async (buildingId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/buildingid`, {
            params: { buildingId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch building bookings");
    }
};

// Get upcoming bookings for a building
export const getAllUpcomingBuildingBookings = async (buildingId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/upcoming/buildingid`, {
            params: { buildingId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch upcoming building bookings");
    }
};

// Get all bookings for an amenity
export const getAllAmenityBookings = async (amenityId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/amenityid`, {
            params: { amenityId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch amenity bookings");
    }
};

// Get upcoming bookings for an amenity
export const getAllUpcomingAmenityBookings = async (amenityId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/upcoming/amenityid`, {
            params: { amenityId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch upcoming amenity bookings");
    }
};

// Get all bookings for a resident
export const getAllBookingsByResident = async (residentId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/residentid`, {
            params: { residentId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch resident bookings");
    }
};

// Get upcoming bookings for a resident
export const getAllUpcomingBookingsByResident = async (residentId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/upcoming/residentid`, {
            params: { residentId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch upcoming resident bookings");
    }
};

// Get all bookings for a unit
export const getAllBookingsByUnit = async (unitId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/unitid`, {
            params: { unitId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch unit bookings");
    }
};

// Get upcoming bookings for a unit
export const getAllUpcomingBookingsByUnit = async (unitId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/upcoming/unitid`, {
            params: { unitId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch upcoming unit bookings");
    }
};

// Get booking by ID
export const getBookingByBookingId = async (bookingId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/bookingid`, {
            params: { bookingId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch booking details");
    }
};

// Create a new booking
export const createBooking = async (bookingData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/create`, bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to create booking");
    }
};

// Update a booking
export const updateBooking = async (bookingData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/update`, bookingData);
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to update booking");
    }
};

// Check slot availability
export const isSlotAvailable = async (amenityId, bookingDate, startTime, endTime) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/check-availability`, {
            params: { amenityId, bookingDate, startTime, endTime },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to check availability");
    }
};

// Get bookings by date range
export const getBookingsByDateRange = async (amenityId, start, end) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/date-range`, {
            params: { amenityId, start, end },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to fetch bookings by date range");
    }
};

// Cancel a booking
export const cancelBooking = async (bookingId) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/cancel`, null, {
            params: { bookingId },
        });
        return response.data;
    } catch (error) {
        throw new Error(error.response?.data?.message || "Failed to cancel booking");
    }
};

export default {
    getAllBuildingBookings,
    getAllUpcomingBuildingBookings,
    getAllAmenityBookings,
    getAllUpcomingAmenityBookings,
    getAllBookingsByResident,
    getAllUpcomingBookingsByResident,
    getAllBookingsByUnit,
    getAllUpcomingBookingsByUnit,
    getBookingByBookingId,
    createBooking,
    updateBooking,
    isSlotAvailable,
    getBookingsByDateRange,
    cancelBooking,
};
