import axios from "axios";

const API_URL = "http://localhost:8080/api/building";

export const createBuilding = async (form) => {
  try {
    const response = await axios.post(`${API_UTL}/create`, form);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw error;
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};
