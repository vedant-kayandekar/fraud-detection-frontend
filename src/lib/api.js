const API_BASE = import.meta.env.VITE_BACKEND_URL || '';

// Helper to get auth token
export const getToken = () => localStorage.getItem('finlens_token');

/**
 * Authenticate user and get JWT session.
 */
export async function login(email, password) {
  const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Login failed');
  }
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('finlens_token', data.access_token);
  }
  return data;
}

/**
 * Register a new user and get JWT session.
 */
export async function signup(email, password) {
  const res = await fetch(`${API_BASE}/api/v1/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Signup failed');
  }
  const data = await res.json();
  if (data.access_token) {
    localStorage.setItem('finlens_token', data.access_token);
  }
  return data;
}

/**
 * Log out the active user.
 */
export function logout() {
  localStorage.removeItem('finlens_token');
}

/**
 * Upload CSV for full fraud analysis.
 * Returns dashboard JSON after XGBoost fast-path completes.
 * Background models accessible via pollComparison().
 *
 * @param {File} file - CSV file to upload
 * @param {string|null} userId - Optional user ID for history
 * @param {function} onProgress - Progress callback ({stage, progress, message})
 * @returns {Promise<object>} Analysis results including job_id
 */
export async function analyzeCSV(file, onProgress = null) {
  const formData = new FormData();
  formData.append('file', file);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/api/v1/analyze`);
    xhr.timeout = 300000;
    
    const token = getToken();
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        const pct = Math.round((e.loaded / e.total) * 30);
        onProgress({ stage: 'uploading', progress: pct, message: 'Uploading file...' });
      }
    };

    xhr.onloadstart = () => {
      if (onProgress) onProgress({ stage: 'uploading', progress: 0, message: 'Starting upload...' });
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const data = JSON.parse(xhr.responseText);
          if (onProgress) onProgress({ stage: 'complete', progress: 100, message: 'Dashboard ready!' });
          resolve(data);
        } catch (e) {
          reject(new Error('Failed to parse server response'));
        }
      } else {
        let detail = 'Analysis failed';
        try { detail = JSON.parse(xhr.responseText).detail || detail; } catch {}
        reject(new Error(detail));
      }
    };

    xhr.onerror = () => reject(new Error('Network error'));
    xhr.ontimeout = () => reject(new Error('Request timed out'));

    // Messages for different progress stages
    const stages = [
      { at: 35, stage: 'processing', msg: '🧹 Cleaning data...' },
      { at: 50, stage: 'features', msg: '🔬 Engineering fraud signals...' },
      { at: 65, stage: 'models', msg: '🤖 Running XGBoost fast-path...' },
      { at: 80, stage: 'shap', msg: '🧠 Computing SHAP explanations...' },
      { at: 90, stage: 'charts', msg: '📊 Building dashboard...' },
    ];

    let currentProgress = 30;
    let progressInterval = null;

    xhr.upload.onload = () => {
      if (onProgress) {
        // Start a smooth ticking progress bar from 35 -> 95
        currentProgress = 35;
        progressInterval = setInterval(() => {
          // Slow down as we get closer to 95 (never reaches 100 until server responds)
          const remaining = 95 - currentProgress;
          const increment = Math.max(0.3, remaining * 0.03);
          currentProgress = Math.min(95, currentProgress + increment);

          const stageInfo = [...stages].reverse().find(s => currentProgress >= s.at) || stages[0];
          onProgress({ stage: stageInfo.stage, progress: Math.round(currentProgress), message: stageInfo.msg });
        }, 1000);
      }
    };

    // When the server actually responds, clear the interval and snap to 100
    const originalOnload = xhr.onload;
    xhr.onload = (e) => {
      if (progressInterval) clearInterval(progressInterval);
      originalOnload.call(xhr, e);
    };
    xhr.onerror = (() => {
      const orig = xhr.onerror;
      return (e) => {
        if (progressInterval) clearInterval(progressInterval);
        reject(new Error('Network error'));
      };
    })();
    xhr.ontimeout = (() => {
      return () => {
        if (progressInterval) clearInterval(progressInterval);
        reject(new Error('Request timed out'));
      };
    })();

    xhr.send(formData);
  });
}

/**
 * Poll background model comparison results.
 * Calls onUpdate every 3 seconds until status === 'complete'.
 *
 * @param {string} jobId - Job ID from analyze response
 * @param {function} onUpdate - Called with comparison data on each poll
 * @param {function} onComplete - Called with final comparison data when all models done
 * @returns {function} Cleanup function to stop polling
 */
export function pollComparison(jobId, onUpdate, onComplete) {
  const interval = setInterval(async () => {
    try {
      const res = await fetch(`${API_BASE}/api/v1/comparison/${jobId}`);
      if (!res.ok) return;
      const data = await res.json();

      onUpdate(data);

      if (data.status === 'complete' || data.status === 'expired') {
        clearInterval(interval);
        if (onComplete) onComplete(data);
      }
    } catch (err) {
      console.error('Comparison poll error:', err);
    }
  }, 3000);

  // Auto-stop after 2 minutes
  const timeout = setTimeout(() => clearInterval(interval), 120000);

  return () => {
    clearInterval(interval);
    clearTimeout(timeout);
  };
}

/**
 * Predict fraud for a single transaction.
 * @param {object} transaction - Transaction fields
 * @returns {Promise<object>} Prediction result
 */
export async function predictSingle(transaction) {
  const response = await fetch(`${API_BASE}/api/v1/predict-single`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(transaction),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || 'Prediction failed');
  }
  return response.json();
}

/**
 * Get analysis history for authenticated user.
 * @returns {Promise<Array>} History entries
 */
export async function getHistory() {
  const token = getToken();
  if (!token) return [];

  const response = await fetch(`${API_BASE}/api/v1/history`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch history');
  const data = await response.json();
  return data.history;
}
