import React, { useEffect } from "react";
import "./index.css";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import Settings from "./pages/Settings";
import Profile from "./pages/Profile";
import { Routes, Route } from "react-router-dom";
import { Loader } from "lucide-react";
import { useAuthStore } from "./store/useAuthStore";
import { Toaster } from "react-hot-toast";

const App = () => {
   const { user, checkAuth, isCheckingAuth } = useAuthStore();

   useEffect(() => {
       console.log(user);
       checkAuth();
       console.log(user);

   }, []);

   if (isCheckingAuth) {
       return (
           <div className="flex justify-center items-center h-screen">
               <Loader size={64} className="animate-spin" />
           </div>
       );
   }


   return (
       <div>
           <Navbar />
           <Routes>
               <Route path="/" element={user ? <Home /> : <Login />} />
               <Route path="/signup" element={!user ? <Signup /> : <Home />} />
               <Route path="/login" element={!user ? <Login /> : <Home />} />
               <Route path="/settings" element={user ? <Settings /> : <Login />} />
               <Route path="/profile" element={<Profile />} />
           </Routes>

           <Toaster />


       </div>
   );
};

export default App;
