import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const trustAPI = {
  getTrustScore: async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/trust/${userId}`);
    return response.data;
  },

  getTrustDistribution: async () => {
    const response = await axios.get(`${API_URL}/api/trust/admin/distribution`);
    return response.data;
  },

  getUsersByTrustLevel: async (level: string) => {
    const response = await axios.get(`${API_URL}/api/trust/level/${level}`);
    return response.data;
  },
};
