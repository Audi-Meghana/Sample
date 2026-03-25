import { Routes, Route } from "react-router-dom";
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import Cases from "./pages/doctor/Cases";
import GeneAnalysis from "./pages/doctor/GeneAnalysis";
import Profile from "./pages/doctor/Profile";
import ConsultationHistory from "./pages/doctor/ConsultationHistory";
import DoctorChatbot from "./pages/doctor/DoctorChatbot";

import LandingPage from "./pages/Landing/LandingPage";


export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />



      {/* Doctor Routes */}
     
      <Route path="/dashboard" element={<DoctorDashboard />} />
      <Route path="/cases" element={<Cases />} />
      <Route path="/gene-analysis" element={<GeneAnalysis />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/chat-bot" element={<DoctorChatbot />} />
      <Route path="/history" element={<ConsultationHistory />} />

      
      
    </Routes>
  );
}