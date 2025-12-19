import axiosInstance from "./axiosInstance";

const API_URL = "http://localhost:8080/api/unit";

// Get All Units per building

export const getAllUnits = async (buildingId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/buildingid`, {
      params: { buildingId },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Getting Units Failed!");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Get Unit By ID
export const getUnitById = async (unitId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/unitid`, {
      params: { unitId },
    });
    return response.data || null;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Getting Unit Failed!");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Create Unit
export const createUnit = async (unitData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/create`, unitData);
    return response.data;
  } catch (error) {
    if (error.reponse) {
      throw new Error(error.response.data.message || "Creation failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Update Unit
export const updateUnit = async (unitData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/update`, unitData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Update failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export default {
  getAllUnits,
  getUnitById,
  createUnit,
  updateUnit,
};
