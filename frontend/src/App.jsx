import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { LoginRegister, PasswordReset, ChangePassword } from "./pages/AllPages";
import { AuthProvider } from './contexts/AuthContext';
import Header from "./components/Header";
import NotFound from './components/NotFound';
import Footer from "./components/Footer";
import MissionsDashboard from './components/MissionsDashboard';
import ProjectsDashboard from './components/ProjectsDashboard';

function App() {
  return (
    <AuthProvider>
      <>
        <Header />
        <Routes>
          <Route path='/' element={<LoginRegister />} />
          <Route path='/dashboard/missions' element={<MissionsDashboard />} />
          <Route path='/dashboard/projects' element={<ProjectsDashboard />} />
          <Route path='/login/' element={<LoginRegister />} />
          <Route path='/forgot-password/' element={<PasswordReset />} />
          <Route path='/change-password/' element={<ChangePassword />} />
          <Route path='*' element={<NotFound />} />
        </Routes>
        <Footer />
        <div id="popup-root"></div>
      </>
    </AuthProvider>
  );
}

export default App;