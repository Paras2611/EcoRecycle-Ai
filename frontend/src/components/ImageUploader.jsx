import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Trash2, CheckCircle2 } from 'lucide-react';

export default function ImageUploader({ onAnalyze, loading, onLoadBenchmark }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    if (e.target.files) {
      const filesArr = Array.from(e.target.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      const filesArr = Array.from(e.dataTransfer.files);
      setSelectedFiles((prev) => [...prev, ...filesArr]);
    }
  };

  const handleRemove = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearAll = () => {
    setSelectedFiles([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleTriggerAnalyze = () => {
    if (selectedFiles.length > 0) {
      onAnalyze(selectedFiles);
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            padding: '0.5rem',
            borderRadius: '8px',
            color: 'var(--cyan-400)',
            display: 'flex'
          }}>
            <UploadCloud size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>2. Waste Image Intake</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              Upload local waste photos or load simulated area batch
            </p>
          </div>
        </div>

        {selectedFiles.length > 0 && (
          <button
            type="button"
            onClick={handleClearAll}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '0.8rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.3rem'
            }}
          >
            <Trash2 size={13} /> Clear ({selectedFiles.length})
          </button>
        )}
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.12)'}`,
          borderRadius: '12px',
          padding: '2rem 1.5rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(16, 185, 129, 0.06)' : 'rgba(0, 0, 0, 0.15)',
          transition: 'all 0.2s ease',
          marginBottom: '1rem'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/png, image/jpeg, image/jpg"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{
          width: '50px',
          height: '50px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.75rem',
          color: 'var(--cyan-400)'
        }}>
          <ImageIcon size={24} />
        </div>

        <p style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.3rem' }}>
          Drag & drop waste images here, or <span style={{ color: 'var(--emerald-400)' }}>browse files</span>
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Supports JPG, JPEG, PNG (Single or Bulk batch up to 100 images)
        </p>
      </div>

      {/* Selected previews */}
      {selectedFiles.length > 0 && (
        <div style={{
          maxHeight: '140px',
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem',
          marginBottom: '1rem',
          paddingRight: '0.4rem'
        }}>
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.4rem 0.7rem',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.04)',
                fontSize: '0.82rem'
              }}
            >
              <span style={{ color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '80%' }}>
                📄 {file.name} ({(file.size / 1024).toFixed(1)} KB)
              </span>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                style={{ background: 'transparent', border: 'none', color: '#f87171', cursor: 'pointer' }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
        <button
          type="button"
          className="btn-primary"
          disabled={loading || selectedFiles.length === 0}
          onClick={handleTriggerAnalyze}
          style={{ flex: 1, opacity: (loading || selectedFiles.length === 0) ? 0.6 : 1 }}
        >
          {loading ? (
            <span>Processing Model Inference...</span>
          ) : (
            <>
              <CheckCircle2 size={16} /> Analyze Uploaded Images ({selectedFiles.length})
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onLoadBenchmark}
          disabled={loading}
          title="Simulate 100-item Karad waste survey benchmark according to PRD Section 10"
        >
          <Sparkles size={15} color="var(--amber-400)" />
          <span>Load PRD Benchmark (100 Items)</span>
        </button>
      </div>
    </div>
  );
}
