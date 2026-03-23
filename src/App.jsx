import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import HistorySidebar from './components/HistorySidebar';

/**
 * Root App component with routing and state management.
 */
export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const navigate = useNavigate();

  const handleResult = (data) => {
    setAnalysisData(data);
    navigate('/dashboard');
  };

  const handleReset = () => {
    setAnalysisData(null);
    navigate('/');
  };

  const handleLoadHistory = (data) => {
    setAnalysisData(data);
    navigate('/dashboard');
  };

  return (
    <div className="relative min-h-screen bg-[#0f1117]">
      <HistorySidebar onLoadResult={handleLoadHistory} />

      <Routes>
        <Route path="/" element={<Home onResult={handleResult} />} />
        <Route
          path="/dashboard"
          element={<Dashboard data={analysisData} onReset={handleReset} />}
        />
      </Routes>
    </div>
  );
}
