// src/App.jsx
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUser } from './redux/slices/authSlice';

import DeveloperDashboard from './pages/developer/DeveloperDashboard';
import HotelAdminDashboard from './pages/hotelAdmin/HotelAdminDashboard';
import CashierDashboard from './pages/cashier/CashierDashboard';

import Login from './pages/Login';
import NotFound from './pages/NotFound';
import Spinner from './components/Spinner.jsx';
import { toast, Toaster } from 'react-hot-toast';
const App = () => {
  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchUser());
  }, [dispatch]);

  if (isLoading) return <Spinner />;

  return (
    <>


      <Toaster position="top-center" reverseOrder={false} />
      <Router>
        <Routes>
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

          {/* Authenticated Routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ? (
                <RoleBasedDashboard role={user?.role} />
              ) : (
                <Navigate to="/login" />
              )
            }
          />
          <Route path='/' element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} />

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
};

// 👇 This function redirects user to role-specific dashboard
const RoleBasedDashboard = ({ role }) => {
  switch (role) {
    case 'developer':
      return <DeveloperDashboard />;
    case 'hotel_admin':
      return <HotelAdminDashboard />;
    case 'cashier':
      return <CashierDashboard />;
    default:
      return <Navigate to="/login" />;
  }
};

export default App;
