import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Trash2, CheckCircle2, Camera, MapPin, Tag } from 'lucide-react';

export default function ImageUploader({ onAnalyze, loading, onLoadBenchmark, initialCity = 'Karad' }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cityName, setCityName] = useState(initialCity);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const fileInputRef = useRef(null);
  const cameraInputRef = useRef(null);

  const handleFilesAdded = (filesArr) => {
    setSelectedFiles((prev) => [...prev, ...filesArr]);
    // Generate object URLs for previews
    const newUrls = filesArr.map((f) => URL.createObjectURL(f));
    setPreviewUrls((prev) => [...prev, ...newUrls]);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      handleFilesAdded(Array.from(e.target.files));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files) {
      handleFilesAdded(Array.from(e.dataTransfer.files));
    }
  };

  const handleRemove = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviewUrls((prev) => {
      URL.revokeObjectURL(prev[index]);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleClearAll = () => {
    previewUrls.forEach((url) => URL.revokeObjectURL(url));
    setSelectedFiles([]);
    setPreviewUrls([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (cameraInputRef.current) cameraInputRef.current.value = '';
  };

  const handleTriggerAnalyze = () => {
    if (selectedFiles.length > 0) {
      onAnalyze(selectedFiles, cityName);
    }
  };

  // Helper to create synthetic demo sample image files for 1-click Demo Mode testing
  const createDemoSampleFile = (type, filename, colorHex) => {
    const canvas = document.createElement('canvas');
    canvas.width = 224;
    canvas.height = 224;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 224, 224);

    // Waste shape
    ctx.fillStyle = colorHex;
    if (type === 'bottle') {
      ctx.beginPath();
      ctx.roundRect(80, 50, 64, 130, [10, 10, 5, 5]);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(95, 30, 34, 20); // cap
    } else if (type === 'can') {
      ctx.beginPath();
      ctx.roundRect(75, 40, 74, 140, [12]);
      ctx.fill();
    } else if (type === 'box') {
      ctx.beginPath();
      ctx.roundRect(50, 60, 124, 100, [6]);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(112, 112, 55, 0, Math.PI * 2);
      ctx.fill();
    }

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], filename, { type: 'image/jpeg' });
        handleFilesAdded([file]);
      }
    }, 'image/jpeg');
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.6rem' }}>
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
            <h3 style={{ fontSize: '1.15rem', color: 'var(--text-primary)' }}>2. Waste Image Intake & City Tagging</h3>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
              Tag images with your City name to save records and discover nearest recyclers
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
            <Trash2 size={13} /> Clear All ({selectedFiles.length})
          </button>
        )}
      </div>

      {/* City Name Tagging Field */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.8rem 1rem',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-400)', fontSize: '0.85rem', fontWeight: 600 }}>
          <Tag size={15} />
          <span>City / Municipality Name:</span>
        </div>
        <div style={{ flex: 1, minWidth: '160px', position: 'relative' }}>
          <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="e.g. Karad, Satara, Kolhapur, Pune..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 0.75rem 0.45rem 2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)',
              fontSize: '0.85rem',
              outline: 'none'
            }}
          />
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          (Images will be saved under this city for future recycler searches)
        </span>
      </div>

      {/* Drop Zone & File Pickers */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.12)'}`,
          borderRadius: '12px',
          padding: '1.75rem 1.25rem',
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
          accept="image/png, image/jpeg, image/jpg, image/webp"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        {/* Native mobile camera capture */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />

        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.6rem',
          color: 'var(--cyan-400)'
        }}>
          <ImageIcon size={22} />
        </div>

        <p style={{ fontSize: '0.92rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Drag & drop waste images, or <span style={{ color: 'var(--emerald-400)' }}>browse files</span>
        </p>
        <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          Supports JPG, PNG, WEBP (Single or Bulk batch up to 100 images)
        </p>

        {/* Camera Quick Button for Mobile / Tablet */}
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); cameraInputRef.current?.click(); }}
            style={{
              padding: '0.4rem 0.8rem',
              borderRadius: '8px',
              border: '1px solid rgba(16, 185, 129, 0.4)',
              background: 'rgba(16, 185, 129, 0.12)',
              color: 'var(--emerald-400)',
              fontSize: '0.78rem',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <Camera size={13} /> Capture with Camera
          </button>
        </div>
      </div>

      {/* 1-Click Demo Mode Samples */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.6rem 0.8rem',
        borderRadius: '8px',
        background: 'rgba(99, 102, 241, 0.08)',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <span style={{ fontSize: '0.76rem', color: 'var(--indigo-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} /> <strong>Demo Mode Samples:</strong>
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => createDemoSampleFile('bottle', 'demo_plastic_bottle.jpg', '#3b82f6')}
            style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            + Plastic Bottle
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('can', 'demo_aluminum_can.jpg', '#94a3b8')}
            style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            + Soda Can
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('box', 'demo_cardboard_box.jpg', '#d97706')}
            style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            + Cardboard Box
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('organic', 'demo_vegetable_peels.jpg', '#10b981')}
            style={{ padding: '3px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer' }}
          >
            + Organic Food
          </button>
        </div>
      </div>

      {/* Selected Previews with Thumbnails */}
      {selectedFiles.length > 0 && (
        <div style={{
          maxHeight: '180px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))',
          gap: '0.6rem',
          marginBottom: '1rem'
        }}>
          {selectedFiles.map((file, idx) => (
            <div
              key={idx}
              style={{
                position: 'relative',
                borderRadius: '8px',
                overflow: 'hidden',
                background: 'rgba(0, 0, 0, 0.4)',
                border: '1px solid var(--border-glass)',
                padding: '4px'
              }}
            >
              {previewUrls[idx] ? (
                <img
                  src={previewUrls[idx]}
                  alt={file.name}
                  style={{ width: '100%', height: '70px', objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <div style={{ height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={20} />
                </div>
              )}
              <div style={{
                fontSize: '0.7rem',
                color: 'var(--text-primary)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                padding: '2px 4px'
              }}>
                {file.name}
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleRemove(idx); }}
                style={{
                  position: 'absolute',
                  top: '6px',
                  right: '6px',
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.85)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '11px'
                }}
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
          style={{ flex: 1, minWidth: '220px', opacity: (loading || selectedFiles.length === 0) ? 0.6 : 1 }}
        >
          {loading ? (
            <span>MobileNetV2 Neural Inference...</span>
          ) : (
            <>
              <CheckCircle2 size={16} /> Analyze {selectedFiles.length} Image{selectedFiles.length !== 1 ? 's' : ''} for {cityName || 'City'}
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onLoadBenchmark}
          disabled={loading}
          style={{ minWidth: '180px' }}
          title="Simulate 100-item Karad waste survey benchmark according to PRD Section 10"
        >
          <Sparkles size={15} color="var(--amber-400)" />
          <span>Load PRD Benchmark</span>
        </button>
      </div>
    </div>
  );
}

