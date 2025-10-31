import axios from "axios";

const API_URL = "http://localhost:8080/api/useraccount";

// check Username Availability
export const checkEmailAvailability = async (username) => {
  try {
    const response = await axios.get(`${API_URL}/checkusername`, {
      params: { username },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Check failed");
    } else {
      throw new Error("Unable to connect to the server");
    }
  }
};

// Create User Account
export const createUserAccount = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/createuser`, userData);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Creation failed");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};
export default {
  checkEmailAvailability,
  createUserAccount,
};
