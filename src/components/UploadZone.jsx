import React, { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, Loader2 } from 'lucide-react';

const STAGE_ICONS = {
  uploading: '📤',
  processing: '🧹',
  features: '🔬',
  models: '🤖',
  charts: '📊',
  complete: '✅',
};

/**
 * Drag-and-drop CSV upload component with pipeline progress.
 */
export default function UploadZone({ onResult, onError }) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [stageMessage, setStageMessage] = useState('');
  const [error, setError] = useState(null);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) validateAndSet(droppedFile);
  }, []);

  const handleFileInput = useCallback((e) => {
    const selected = e.target.files[0];
    if (selected) validateAndSet(selected);
  }, []);

  const validateAndSet = (f) => {
    setError(null);
    if (!f.name.toLowerCase().endsWith('.csv')) {
      setError('Only CSV files are accepted.');
      return;
    }
    if (f.size > 50 * 1024 * 1024) {
      setError('File size exceeds 50MB limit.');
      return;
    }
    setFile(f);
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setProgress(5);
    setStageMessage('Starting upload...');
    setError(null);

    try {
      const { analyzeCSV } = await import('../lib/api');
      const result = await analyzeCSV(file, null, (update) => {
        setProgress(update.progress || 0);
        setStageMessage(
          `${STAGE_ICONS[update.stage] || '⏳'} ${update.message || 'Processing...'}`
        );
      });
      onResult(result);
    } catch (err) {
      const msg = err.message || 'Upload failed';
      setError(msg);
      if (onError) onError(msg);
    } finally {
      setUploading(false);
    }
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="w-full max-w-2xl mx-auto" id="upload-zone">
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-2xl p-12 text-center
          transition-all duration-300 cursor-pointer
          ${isDragging
            ? 'border-accent bg-accent/10 scale-[1.02]'
            : 'border-dark-border hover:border-accent/50 hover:bg-dark-card/50'
          }
          ${uploading ? 'pointer-events-none opacity-70' : ''}
        `}
        onClick={() => !uploading && document.getElementById('csv-input').click()}
      >
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          className="hidden"
        />

        {uploading ? (
          <div className="space-y-4 animate-fade-in">
            <Loader2 className="w-12 h-12 text-accent mx-auto animate-spin" />
            <p className="text-lg font-semibold text-white">{stageMessage}</p>
            <div className="w-full bg-dark-border rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-purple-500 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">{progress}%</p>
          </div>
        ) : file ? (
          <div className="space-y-4 animate-fade-in">
            <FileText className="w-12 h-12 text-accent mx-auto" />
            <div>
              <p className="text-lg font-semibold text-white">{file.name}</p>
              <p className="text-sm text-gray-400">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpload(); }}
              className="px-8 py-3 bg-gradient-to-r from-accent to-purple-600 text-white font-semibold
                         rounded-xl hover:opacity-90 transition-all duration-200 shadow-lg shadow-accent/25"
              id="analyze-button"
            >
              🔍 Analyze for Fraud
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="block mx-auto text-sm text-gray-500 hover:text-gray-300 mt-2"
            >
              Choose a different file
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-accent/10 rounded-2xl flex items-center justify-center">
              <Upload className="w-8 h-8 text-accent" />
            </div>
            <div>
              <p className="text-lg font-semibold text-white">
                Drop your CSV file here
              </p>
              <p className="text-sm text-gray-400 mt-1">
                or click to browse • Max 50MB
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-fraud/10 border border-fraud/30 rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-fraud flex-shrink-0" />
          <p className="text-sm text-fraud">{error}</p>
        </div>
      )}
    </div>
  );
}
