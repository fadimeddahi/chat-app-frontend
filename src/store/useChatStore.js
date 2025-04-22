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
      // Create temp message with temp ID to display immediately
      const tempMessage = {
        ...messageData,
        tempId: Date.now().toString(), // Create a temporary ID
        sender: useAuthStore.getState().user._id,
        receiver: selectedUser._id,
        createdAt: new Date().toISOString()
      };
      
      // Update local state immediately for sender
      set(state => ({
        messages: [...state.messages, tempMessage]
      }));
      
      // Then send to server
      const res = await axiosInstance.post(
        `/messages/send/${selectedUser._id}`,
        messageData
      );
      
      // You could update the temporary message with the real one if needed
      return res.data;
    } catch (error) {
      console.error("Message send error:", error);
      throw error;
    }
  },

  subscribeToMessages: () => {
    const { selectedUser } = get();
    if (!selectedUser) return;
  
    const socket = useAuthStore.getState().socket;
  
    const handleNewMessage = (newMessage) => {
      const isMessageFromSelectedUser = newMessage.senderId === selectedUser._id;
  
      // Prevent duplicates
      const messageExists = get().messages.some(msg => msg._id === newMessage._id);
  
      if (isMessageFromSelectedUser && !messageExists) {
        set((state) => ({
          messages: [...state.messages, newMessage],
        }));
      }
    };
  
    socket.on("newMessage", handleNewMessage);
  
    // Return a cleanup function to remove the listener
    return () => {
      socket.off("newMessage", handleNewMessage);
    };
  },
  

  setSelectedUser: (selectedUser) => set*({ selectedUser }),
}));

