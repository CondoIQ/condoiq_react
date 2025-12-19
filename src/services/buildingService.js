import axios from "axios";
import axiosInstance from "./axiosInstance";

const API_URL = "http://localhost:8080/api/building";

//buidingIdAvailability
export const checkBuildingIdAvailability = async (buildingId) => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/getbuildingid?buildingId=${buildingId}`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Check failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Building Name Availability
export const checkBuildingNameAvailability = async (buildingName) => {
  try {
    const response = await axiosInstance.get(
      `${API_URL}/buildingname/${buildingName}`
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Check failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Creat Building
export const createBuilding = async (buildingData) => {
  try {
    const response = await axiosInstance.post(
      `${API_URL}/createbuilding`,
      buildingData
    );
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Creation failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

// Get All Buildings
export const getAllBuildings = async () => {
  try {
    const response = await axiosInstance.get(`${API_URL}/allbuilding`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(
        error.response.data.message || "Getting Building Failed!"
      );
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export default {
  checkBuildingIdAvailability,
  createBuilding,
  getAllBuildings,
  checkBuildingNameAvailability,
};
