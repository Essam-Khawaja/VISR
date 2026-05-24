import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LandingPage } from "./pages/LandingPage";
import { DashboardPage } from "./pages/DashboardPage";
import { OnboardingPage } from "./pages/OnboardingPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/features" element={<LandingPage />} />
        <Route path="/how-it-works" element={<LandingPage />} />
        <Route path="/pricing" element={<LandingPage />} />
      </Routes>
    </BrowserRouter>
  );
}