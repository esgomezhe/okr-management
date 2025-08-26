import React, { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginRegister, PasswordReset, ChangePassword } from "./pages/AllPages";
import { AuthProvider } from './contexts/AuthContext';
import Header from "./components/Header";
import NotFound from './components/NotFound';
import Footer from "./components/Footer";
import MissionsDashboard from './components/MissionsDashboard';
import ProjectsDashboard from './components/ProjectsDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthCleanup } from './hooks/useAuthCleanup';
import { ensureCsrfToken } from './utils/apiServices';
import ProjectDetailsPage from './pages/ProjectDetailsPage';

function AppContent() {
  useAuthCleanup();

  return (
    <>
      <Header />
      <Routes>
        <Route path='/' element={<LoginRegister />} />
        <Route path='/dashboard/missions' element={
          <ProtectedRoute>
            <MissionsDashboard />
          </ProtectedRoute>
        } />
        <Route path='/dashboard/projects' element={
          <ProtectedRoute>
            <ProjectsDashboard />
          </ProtectedRoute>
        } />

        <Route path='/dashboard/projects/:projectId' element={
  <ProtectedRoute>
    <ProjectDetailsPage />
  </ProtectedRoute>
} />

        <Route path='/login/' element={<LoginRegister />} />
        <Route path='/forgot-password/' element={<PasswordReset />} />
        <Route path='/change-password/' element={<ChangePassword />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Footer />
      <div id="popup-root"></div>
    </>
  );
}

function App() {
  useEffect(() => {
    ensureCsrfToken();
  }, []);

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;