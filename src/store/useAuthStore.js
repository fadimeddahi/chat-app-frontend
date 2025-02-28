import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useAuthStore = create((set) => ({
  user: null,
  isSigningUp: false,
  isLoggingIn: false,
  isUpdatingProfile: false,

  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const response = await axiosInstance.get("auth/check");
      console.log("User from API:", response.data.user); // Log to debug
  
      // Ensure the user object includes profilePicture
      if (!response.data.user?.profilePicture) {
        console.warn("profilePicture is missing in checkAuth response");
      }
  
      set({ user: response.data.user });
    } catch (error) {
      console.error("Auth check failed:", error);
      set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },
  

  signup: async (data) => {
    set({ isSigningUp: true });

    try {
      const response = await axiosInstance.post("auth/signup", data )
      toast.success("Account created successfully");
      console.log(response.data)
      set({ user: response.data });
    } catch (error) {
     toast.error(error.response.data.message);
      console.log(error.response.data.message);
    } finally {
      set({ isSigningUp: false });
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });

    try {
      const response = await axiosInstance.post("auth/login", data);
      toast.success("Logged in successfully");
      set({ user: response.data });
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isLoggingIn: false });
    }
  },

  updateProfile: async (data) => {
    set({ isUpdatingProfile: true });
    try {
      const response = await axiosInstance.put("/auth/update", data);
      set({ user: response.data.user });
      console.log(data)
      toast.success("Profile updated successfully");
    } catch (error) {
      console.error("Error in update profile:", error);
      toast.error(error.response?.data?.message || "An error occurred");
    } finally {
      set({ isUpdatingProfile: false });
    }
  },
  
  
  
  logout: async () => {
    console.log("hh")
    try {
      await axiosInstance.post("auth/logout");
      console.log("Logged out successfully");
      set({ user: null });
      toast.success("Logged out successfully");
    } catch (error) {
      toast.error("An error occurred");
    }
  },
}));
