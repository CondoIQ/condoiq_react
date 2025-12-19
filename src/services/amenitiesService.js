import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_URL = "http://localhost:8080/api/amenities";

// Get All Amenities per Building
export const getAllAmenities = async (buildingId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/buildingid`, {
      params: { buildingId },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Getting Amenities Failed!"
      );
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Get Amenities by ID
export const getAmenityById = async (amenityId) => {
  try {
    const response = await axiosInstance.get(`${API_URL}/amenityid`, {
      params: { amenityId },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Getting Amenities Failed!"
      );
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// createAmenity

export const createAmenity = async (amenityData) => {
  try {
    const response = await axiosInstance.post(`${API_URL}/create`, amenityData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Creation failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export const updateAmenity = async (amenityData) => {
  try {
    const response = await axiosInstance.put(`${API_URL}/update`, amenityData);
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
  getAllAmenities,
  getAmenityById,
  createAmenity,
  updateAmenity,
};
