import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage/HomePage";
import TutorialPage from "./pages/TutorialPage/TutorialPage";
import LoginPage from "./pages/LoginPage/LoginPage";
import BasePage from "./pages/BasePage/BasePage";
import Arena from "./pages/Arena/ArenaPage/Arena";
import AttackPage from "./pages/Arena/AttackPage/AttackPage";
import Tournament from "./pages/Tournament/Tournament";
import ReplayPage from "./pages/Arena/ReplayPage/ReplayPage";
import { useAuth } from "./context/AuthContext";
import { MusicProvider } from "./context/MusicContext";
import GlobalLayout from "./pages/Layout/Layout";

function PrivateRoute({ children }) {
  const { isAuth, loading } = useAuth();
  if (loading) return null;
  return isAuth ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <MusicProvider>
      <GlobalLayout>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><HomePage /></PrivateRoute>} />

          <Route path="/tutorial" element={<PrivateRoute><TutorialPage /></PrivateRoute>} />
          
          <Route path="/base" element={<PrivateRoute><BasePage /></PrivateRoute>} />

          <Route path="/arena" element={<PrivateRoute><Arena /></PrivateRoute>} />
          <Route path="/attack/:username" element={<PrivateRoute><AttackPage /></PrivateRoute>} />
          <Route path="/replay" element={<PrivateRoute><ReplayPage /></PrivateRoute>} />

          <Route path="/tournament" element={<PrivateRoute><Tournament /></PrivateRoute>} />
        </Routes>
      </GlobalLayout>
    </MusicProvider>
  );
}