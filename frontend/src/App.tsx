import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import TitlePage from './pages/TitlePage';
import LoginPage from './pages/LoginPage';
import WorldCreator from './pages/WorldCreator';
import AIWizard from './pages/AIWizard';
import WorldBookEditor from './pages/WorldBookEditor';
import CharacterEditor from './pages/CharacterEditor';
import VideoPlayer from './pages/VideoPlayer';
import StorePage from './pages/StorePage';
import Backpack from './pages/Backpack';
import CharacterLibrary from './pages/CharacterLibrary';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  if (!isLoggedIn) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<TitlePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<ProtectedRoute><WorldCreator /></ProtectedRoute>} />
        <Route path="/ai-wizard" element={<ProtectedRoute><AIWizard /></ProtectedRoute>} />
        <Route path="/editor/:id" element={<ProtectedRoute><WorldBookEditor /></ProtectedRoute>} />
        <Route path="/character-editor/:id?" element={<ProtectedRoute><CharacterEditor /></ProtectedRoute>} />
        <Route path="/play/:worldbookId" element={<VideoPlayer />} />
        <Route path="/store" element={<StorePage />} />
        <Route path="/backpack" element={<ProtectedRoute><Backpack /></ProtectedRoute>} />
        <Route path="/characters" element={<CharacterLibrary />} />
      </Routes>
    </BrowserRouter>
  );
}
