import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const fraudAPI = {
  getPendingReviews: async () => {
    const response = await axios.get(`${API_URL}/api/admin/fraud/pending`);
    return response.data;
  },

  resolveFlag: async (flagId: string, data: Record<string, unknown>) => {
    const response = await axios.post(`${API_URL}/api/admin/fraud/${flagId}/resolve`, data);
    return response.data;
  },

  getFraudStats: async () => {
    const response = await axios.get(`${API_URL}/api/admin/fraud/stats`);
    return response.data;
  },

  checkUserFraudStatus: async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/admin/fraud/user/${userId}`);
    return response.data;
  },
};
