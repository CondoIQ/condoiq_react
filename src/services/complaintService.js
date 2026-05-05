import axiosInstance from "./axiosInstance";

const complaintService = {
  getComplaintById: async (complaintId) => {
    const response = await axiosInstance.get(`/api/complaints/complaintid`, {
      params: { complaintId },
    });
    return response.data;
  },

  getActiveComplaints: async (buildingId) => {
    const response = await axiosInstance.get(`/api/complaints/allactive/buildingid`, {
      params: { buildingId },
    });
    return response.data;
  },

  getAllComplaints: async (buildingId) => {
    const response = await axiosInstance.get(`/api/complaints/allcomplaints/buildingid`, {
      params: { buildingId },
    });
    return response.data;
  },

  getComplaintsByResident: async (residentId) => {
    const response = await axiosInstance.get(`/api/complaints/residentid`, {
      params: { residentId },
    });
    return response.data;
  },

  getComplaintsByCreator: async (userId) => {
    const response = await axiosInstance.get(`/api/complaints/mycomplaints`, {
      params: { userId },
    });
    return response.data;
  },

  getComplaintsByUnit: async (unitId) => {
    const response = await axiosInstance.get(`/api/complaints/unit/unitid`, {
      params: { unitId },
    });
    return response.data;
  },

  createComplaint: async (complaintData) => {
    const response = await axiosInstance.post(`/api/complaints/create`, complaintData);
    return response.data;
  },

  updateComplaint: async (complaintData) => {
    const response = await axiosInstance.put(`/api/complaints/update`, complaintData);
    return response.data;
  },

  cancelComplaint: async (userId, userName, complianId) => {
    const response = await axiosInstance.put(`/api/complaints/cancel`, null, {
      params: { userId, userName, complianId },
    });
    return response.data;
  },
};

export default complaintService;
