import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import HistorySidebar from './components/HistorySidebar';
import { getToken, logout } from './lib/api';

/**
 * Root App component with routing and state management.
 * Stores analysisData and jobId for background model comparison polling.
 */
export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [jobId, setJobId] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getToken());
  const navigate = useNavigate();

  const handleResult = (data) => {
    setAnalysisData(data);
    setJobId(data.job_id || null);
    navigate('/dashboard');
  };

  const handleReset = () => {
    setAnalysisData(null);
    setJobId(null);
    navigate('/');
  };

  const handleLoadHistory = (data) => {
    setAnalysisData(data);
    setJobId(null); // History entries don't have active background jobs
    navigate('/dashboard');
  };

  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    navigate('/');
  };

  const handleLogout = () => {
    logout();
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <div className="relative min-h-screen bg-surface">
      {isAuthenticated && (
        <HistorySidebar 
          onLoadResult={handleLoadHistory} 
          onLogout={handleLogout} 
        />
      )}

      <Routes>
        <Route path="/" element={<Home onResult={handleResult} isAuthenticated={isAuthenticated} />} />
        <Route path="/login" element={<Login onLoginSuccess={handleLoginSuccess} />} />
        
        {/* Protected Route */}
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <Dashboard
                data={analysisData}
                onReset={handleReset}
                jobId={jobId}
              />
            ) : (
              <Login onLoginSuccess={handleLoginSuccess} />
            )
          }
        />
        
        {/* Fallback */}
        <Route path="*" element={<Home onResult={handleResult} isAuthenticated={isAuthenticated} />} />
      </Routes>
    </div>
  );
}
