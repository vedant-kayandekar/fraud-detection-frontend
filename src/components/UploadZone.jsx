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
 * Drag-and-drop CSV upload component — Sentinel Amber design.
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
            : 'border-accent/40 bg-surface-container-low hover:border-accent/70 hover:bg-surface-container'
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
            <p className="text-lg font-semibold text-ink">{stageMessage}</p>
            <div className="w-full bg-surface-container-highest rounded-full h-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent to-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${Math.max(progress, 5)}%` }}
              />
            </div>
            <p className="text-xs text-on-surface-variant">{progress}%</p>
          </div>
        ) : file ? (
          <div className="space-y-4 animate-fade-in">
            <FileText className="w-12 h-12 text-accent mx-auto" />
            <div>
              <p className="text-lg font-semibold text-ink">{file.name}</p>
              <p className="text-sm text-on-surface-variant">{formatSize(file.size)}</p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); handleUpload(); }}
              className="px-8 py-3 bg-ink text-white font-medium
                         rounded-lg hover:bg-ink/90 transition-all duration-200 shadow-ambient"
              id="analyze-button"
            >
              🔍 Analyze for Fraud
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setFile(null); }}
              className="block mx-auto text-sm text-on-surface-variant hover:text-ink mt-2"
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
              <p className="text-lg font-semibold text-ink">
                Drop your CSV file here
              </p>
              <p className="text-sm text-on-surface-variant mt-2">
                Ensure your data matches the standard transaction schema for optimal detection accuracy.
              </p>
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); document.getElementById('csv-input').click(); }}
              className="px-6 py-2.5 border border-outline-variant text-ink rounded-lg hover:bg-surface-container transition-colors text-sm"
            >
              Browse files
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-fraud-container rounded-xl flex items-center gap-3 animate-fade-in">
          <AlertCircle className="w-5 h-5 text-fraud flex-shrink-0" />
          <p className="text-sm text-fraud">{error}</p>
        </div>
      )}
    </div>
  );
}
