import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const feedbackAPI = {
  submitFeedback: async (receiverId: string, giveawayId: string, feedback: Record<string, unknown>) => {
    const response = await axios.post(`${API_URL}/api/feedback`, {
      receiverId,
      giveawayId,
      ...feedback,
    });
    return response.data;
  },

  getGivenFeedback: async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/feedback/given/${userId}`);
    return response.data;
  },

  getReceivedFeedback: async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/feedback/received/${userId}`);
    return response.data;
  },

  getFeedbackStats: async (userId: string) => {
    const response = await axios.get(`${API_URL}/api/feedback/stats/${userId}`);
    return response.data;
  },
};
