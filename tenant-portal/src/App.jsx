import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import TenantDashboard from './components/dashboard/TenantDashboard';
import ApplicationForm from './components/applications/ApplicationForm';
import ApplicationStatus from './components/applications/ApplicationStatus';
import MaintenanceRequestForm from './components/maintenance/MaintenanceRequestForm';
import MaintenanceList from './components/maintenance/MaintenanceList';
import MessageThread from './components/messages/MessageThread';
import PaymentHistory from './components/payments/PaymentHistory';
import LeaseDocuments from './components/documents/LeaseDocuments';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userData) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('tenantToken', userData.token);
    localStorage.setItem('tenantUser', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('tenantToken');
    localStorage.removeItem('tenantUser');
  };

  // Check for existing token on mount
  React.useEffect(() => {
    const token = localStorage.getItem('tenantToken');
    const userData = localStorage.getItem('tenantUser');
    if (token && userData) {
      // Validate token with backend in production
      // For now, restore user data from localStorage
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
  }, []);

  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Public Routes */}
          <Route
            path="/login"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" /> :
                <Login onLogin={handleLogin} />
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" /> :
                <Register onRegister={handleLogin} />
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
            element={
              isAuthenticated ?
                <TenantDashboard user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/application"
            element={
              isAuthenticated ?
                <ApplicationForm user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/application/status"
            element={
              isAuthenticated ?
                <ApplicationStatus user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/maintenance/new"
            element={
              isAuthenticated ?
                <MaintenanceRequestForm user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/maintenance"
            element={
              isAuthenticated ?
                <MaintenanceList user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/messages"
            element={
              isAuthenticated ?
                <MessageThread user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/payments"
            element={
              isAuthenticated ?
                <PaymentHistory user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />
          <Route
            path="/documents"
            element={
              isAuthenticated ?
                <LeaseDocuments user={user} onLogout={handleLogout} /> :
                <Navigate to="/login" />
            }
          />

          {/* Default Route */}
          <Route
            path="/"
            element={
              isAuthenticated ?
                <Navigate to="/dashboard" /> :
                <Navigate to="/login" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
