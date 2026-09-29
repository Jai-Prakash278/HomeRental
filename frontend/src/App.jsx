import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomeList from './pages/HomeList';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import HostHomesList from './pages/HostHomesList';
import HomeForm from './pages/HomeForm';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import PropertyDetail from './pages/PropertyDetail';
import GuestDashboard from './pages/GuestDashboard';
import HostBookings from './pages/HostBookings';
import HostDashboard from './pages/HostDashboard';
import Favorites from './pages/Favorites';
import LandingPage from './pages/LandingPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/explore" element={<HomeList />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/trips" element={<ProtectedRoute allowedRoles={['guest']}><GuestDashboard /></ProtectedRoute>} />
        <Route path="/favorites" element={<ProtectedRoute allowedRoles={['guest']}><Favorites /></ProtectedRoute>} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/host/dashboard" element={<ProtectedRoute allowedRoles={['host']}><HostDashboard /></ProtectedRoute>} />
        <Route path="/host/homes" element={<ProtectedRoute allowedRoles={['host']}><HostHomesList /></ProtectedRoute>} />
        <Route path="/host/addHome" element={<ProtectedRoute allowedRoles={['host']}><HomeForm /></ProtectedRoute>} />
        <Route path="/host/edit-home/:id" element={<ProtectedRoute allowedRoles={['host']}><HomeForm /></ProtectedRoute>} />
        <Route path="/host/bookings" element={<ProtectedRoute allowedRoles={['host']}><HostBookings /></ProtectedRoute>} />
      </Routes>
    </>
  );
}

export default App;
