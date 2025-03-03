import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create((set, get) => ({
  messages: [],
  users: [],
  selectedUser: null,
  isUsersLoading: false,
  isMessagesLoading: false,
  onlineUsers: [],

  getUsers: async () => {
    set({ isUsersLoading: true });
    try {
      const res = await axiosInstance.get("/messages/users");
      set({ users: res.data.users });
    } catch (error) {
      console.error("User fetch error:", error);
    } finally {
      set({ isUsersLoading: false });
    }
  },

  getMessages: async (userId) => {
    set({ isMessagesLoading: true });
    try {
      const res = await axiosInstance.get(`/messages/${userId}`);
      set({ messages: res.data.messages });
    } catch (error) {
      console.error("Message load error:", error);
    } finally {
      set({ isMessagesLoading: false });
    }
  },

  sendMessage: async (messageData) => {
    try {
      const { selectedUser } = get();
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      
      set(state => ({
        messages: [...state.messages, {
          ...res.data,
          senderId: {
            _id: res.data.senderId,
            profilePicture: res.data.senderProfilePicture
          },
          image: res.data.image
        }]
      }));
    } catch (error) {
      console.error("Message send error:", error);
      throw error;
    }
  },

  subscribeToMessages: () => {
    const socket = useAuthStore.getState().socket;
    if (!socket) return () => {};

    const messageHandler = (newMessage) => {
      set(state => {
        if (state.messages.some(msg => msg._id === newMessage._id)) return state;
        return { messages: [...state.messages, newMessage] };
      });
    };

    socket.on("newMessage", messageHandler);
    
    return () => {
      socket.off("newMessage", messageHandler);
    };
  },

  setSelectedUser: (selectedUser) => set({ selectedUser }),
}));