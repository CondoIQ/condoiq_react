import axiosInstance from "./axiosInstance";

const API_URL = "http://localhost:8080/api/residents";

//Get All Building Residents
export const getAllBuildingResidents = async(buildingId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/buildingid`, {
            params: { buildingId },
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data.message || "Failed to fetch residents."
            );
        } else {
            throw new Error("Unable to connect to the server.");
        }
    }
}

// Get Residents by Unit ID
export const getResidentsByUnitId = async (unitId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/unitid`, {
            params: { unitId },
        });
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data.message || "Failed to fetch residents."
            );
        } else {
            throw new Error("Unable to connect to the server.");
        }
    }
};

// Create Resident
export const createResident = async (residentData) => {
    try {
        const response = await axiosInstance.post(`${API_URL}/create`, residentData);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data.message || "Failed to create resident."
            );
        } else {
            throw new Error("Unable to connect to the server.");
        }
    }
};

// Create Resident User Account
export const createResidentUserAccount = async (userAccountData) => {
    try {
        const response = await axiosInstance.post(
            `${API_URL}/createResidentUserAccount`,
            userAccountData
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data.message || "Failed to create user account."
            );
        } else {
            throw new Error("Unable to connect to the server.");
        }
    }
};

// Update Resident
export const updateResident = async (residentData) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/update`, residentData);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data.message || "Failed to update resident."
            );
        } else {
            throw new Error("Unable to connect to the server.");
        }
    }
};

// Delete Resident User Account
export const deleteResidentUserAccount = async (userAccountData) => {
    try {
        const response = await axiosInstance.put(
            `${API_URL}/deleteResidentUserAccount`,
            userAccountData
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(
                error.response.data.message || "Failed to remove user account."
            );
        } else {
            throw new Error("Unable to connect to the server.");
        }
    }
};

export default {
    getResidentsByUnitId,
    createResident,
    createResidentUserAccount,
    updateResident,
    deleteResidentUserAccount,
};
