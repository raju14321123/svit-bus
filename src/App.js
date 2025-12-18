import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import LandingPage from './pages/LandingPage';
import StudentLogin from './pages/StudentLogin';
import StudentDash from './pages/StudentDash';
import DriverPortal from './pages/DriverPortal';
import DriverDash from './pages/DriverDash'; // Ensure this file exists
import AdminDash from './pages/AdminDash';
import AdminReset from './pages/AdminReset';
import DriverReset from './pages/DriverReset';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* STUDENT ROUTES */}
        <Route path="/student" element={<StudentLogin />} />
        <Route path="/student-map" element={<StudentDash />} />

        {/* DRIVER ROUTES */}
        <Route path="/driver" element={<DriverPortal />} />
        {/* Change this path to match your navigate('/driver-panel') */}
        <Route path="/driver-panel" element={<DriverDash />} /> 
        <Route path="/driver-reset" element={<DriverReset />} />

        {/* ADMIN ROUTES */}
        <Route path="/admin" element={<AdminDash />} /> {/* Your AdminDash has its own login screen inside */}
        <Route path="/admin-reset" element={<AdminReset />} />
      </Routes>
    </Router>
  );
}

export default App;