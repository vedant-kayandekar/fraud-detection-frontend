import React, { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import HistorySidebar from './components/HistorySidebar';

/**
 * Root App component with routing and state management.
 * Stores analysisData and jobId for background model comparison polling.
 */
export default function App() {
  const [analysisData, setAnalysisData] = useState(null);
  const [jobId, setJobId] = useState(null);
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

  return (
    <div className="relative min-h-screen bg-[#0f1117]">
      <HistorySidebar onLoadResult={handleLoadHistory} />

      <Routes>
        <Route path="/" element={<Home onResult={handleResult} />} />
        <Route
          path="/dashboard"
          element={
            <Dashboard
              data={analysisData}
              onReset={handleReset}
              jobId={jobId}
            />
          }
        />
      </Routes>
    </div>
  );
}
