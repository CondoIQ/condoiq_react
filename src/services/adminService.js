import axios from "axios";

const API_URL = "http://localhost:8080/api/admin";
const API_URL_ONBOARD = "http://localhost:8080/api/onboardingcode";

export const adminLogin = async (username, password) => {
  try {
    const response = await axios.post(`${API_URL}/login`, {
      username,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export const createAdmin = async (form) => {
  try {
    const response = await axios.post(`${API_URL}/create`, form);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Login failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export const createOnboardingBuildingCode = async (form) => {
  try {
    const response = await axios.post(`${API_URL_ONBOARD}/create`, form);
    console.log("Response from createOnboardingBuildingCode:", response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error;
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export default {
  adminLogin,
  createAdmin,
  createOnboardingBuildingCode,
};
