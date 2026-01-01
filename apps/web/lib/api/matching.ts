import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const matchingAPI = {
  getRecommendations: async (userId: string, limit: number = 10) => {
    const response = await axios.get(`${API_URL}/api/matching/recommendations/${userId}`, {
      params: { limit },
    });
    return response.data;
  },

  getMatchScore: async (userId: string, giveawayId: string) => {
    const response = await axios.get(`${API_URL}/api/matching/score/${userId}/${giveawayId}`);
    return response.data;
  },

  getTrendingGiveaways: async (limit: number = 5) => {
    const response = await axios.get(`${API_URL}/api/matching/trending`, { params: { limit } });
    return response.data;
  },
};
