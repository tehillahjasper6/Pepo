import { create } from 'zustand';
import { apiClient } from '@/lib/apiClient';

interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  conversationId: string;
  giveawayId?: string;
  content: string;
  createdAt: string;
  readAt?: string;
}

interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
  unreadCount: number;
  giveawayId?: string;
}

interface MessagesState {
  conversations: Conversation[];
  messages: Message[];
  currentConversationId: string | null;
  isLoading: boolean;
  error: string | null;

  fetchConversations: () => Promise<void>;
  fetchMessages: (conversationId: string) => Promise<void>;
  sendMessage: (recipientId: string, content: string, giveawayId?: string) => Promise<void>;
  setCurrentConversationId: (id: string | null) => void;
  clearError: () => void;
}

export const useMessages = create<MessagesState>((set, get) => ({
  conversations: [],
  messages: [],
  currentConversationId: null,
  isLoading: false,
  error: null,

  fetchConversations: async () => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getConversations();
      set({ conversations: data.conversations || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch conversations', isLoading: false });
    }
  },

  fetchMessages: async (conversationId) => {
    set({ isLoading: true, error: null });
    try {
      const data = await apiClient.getMessages(conversationId);
      set({ messages: data.messages || [], currentConversationId: conversationId, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch messages', isLoading: false });
    }
  },

  sendMessage: async (recipientId, content, giveawayId) => {
    set({ isLoading: true, error: null });
    try {
      await apiClient.sendMessage(recipientId, content, giveawayId);
      // Optionally re-fetch messages for the conversation after sending
      if (get().currentConversationId) {
        await get().fetchMessages(get().currentConversationId);
      }
      set({ isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to send message', isLoading: false });
      throw error;
    }
  },

  setCurrentConversationId: (id) => set({ currentConversationId: id }),
  clearError: () => set({ error: null }),
}));


