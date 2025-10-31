import axios from "axios";

const API_URL = "http://localhost:8080/api/roles";

// Get All Roles
export const getAllRoles = async () => {
  try {
    const response = await axios.get(`${API_URL}/getallroles`);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || "Getting Roles Failed!");
    } else {
      throw new Error("unable to connect to the server");
    }
  }
};

export default {
  getAllRoles,
};
