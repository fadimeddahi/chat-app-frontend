import { create } from "zustand";
import { axiosInstance } from "../lib/axios";


export const useAuthStore = create((set) => ({
    user: null,
    isSigningUp: false,
    isLoggingIn: false,
    isUpdatingProfile: false,
    
    isCheckingAuth: true,

    checkAuth: async () => {
        try {
            const response = await axiosInstance.get("auth/check");

            set({ user: response.data });
        } catch (error) {
            set({ user: null });
        } finally {
            set({ isCheckingAuth: false });
        }
    },

    signup: async (data) => {
        set({ isSigningUp: true });

        try {
            const response = await axiosInstance.post("auth/signup", data);

            set({ user: response.data });
        } catch (error) {
            console.error(error);
        } finally {
            set({ isSigningUp: false });
        }
    },


}));

