import axiosInstance from "./axiosInstance";

const API_URL = "/api/buildingsettings";

export const getBuildingSettings = async (buildingId) => {
    try {
        const response = await axiosInstance.get(`${API_URL}/buildingid`,
            {
                params: {
                    buildingId: buildingId,
                }
            }
        );
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "Failed to fetch building settings");
        } else {
            throw new Error("Unable to connect to the server");
        }
    }
};

export const updateBuildingSettings = async (settings) => {
    try {
        const response = await axiosInstance.put(`${API_URL}/update`, settings);
        return response.data;
    } catch (error) {
        if (error.response) {
            throw new Error(error.response.data.message || "Failed to update building settings");
        } else {
            throw new Error("Unable to connect to the server");
        }
    }
};

export default {
    getBuildingSettings,
    updateBuildingSettings,
};
