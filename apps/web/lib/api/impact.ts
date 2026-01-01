import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const impactAPI = {
  getUserImpact: async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/impact/user/${userId}`);
    return response.data;
  },

  getLeaderboard: async (limit: number = 10) => {
    const response = await axios.get(`${API_URL}/api/impact/leaderboard`, { params: { limit } });
    return response.data;
  },

  getPlatformImpact: async () => {
    const response = await axios.get(`${API_URL}/api/impact/platform`);
    return response.data;
  },

  getImpactByCategory: async (category: string) => {
    const response = await axios.get(`${API_URL}/api/impact/category/${category}`);
    return response.data;
  },

  getMonthlyReport: async (year: number, month: number) => {
    const response = await axios.get(`${API_URL}/api/impact/report/${year}/${month}`);
    return response.data;
  },
};
