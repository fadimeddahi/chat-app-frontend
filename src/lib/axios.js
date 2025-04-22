// lib/axios.js
import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.MODE === "development" 
    ? "http://localhost:5000/api"  // Make sure this includes "/api"
    : "/api",
  withCredentials: true, // Critical for cookie handling
  headers: {
    "Content-Type": "application/json"
  }
});