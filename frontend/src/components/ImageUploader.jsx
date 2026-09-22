import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, Sparkles, Trash2, CheckCircle2, Camera, MapPin, Tag, Loader2, Target, Layers } from 'lucide-react';
import CameraModal from './CameraModal';

export default function ImageUploader({
  onAnalyze,
  onDetectObjects,
  onRunPhase2Demo,
  detectedObjects,
  scenePreviewUrl,
  loading,
  onLoadBenchmark,
  initialCity = 'Karad'
}) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [cityName, setCityName] = useState(initialCity);
  const [dragOver, setDragOver] = useState(false);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
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

  const handleTriggerDetectObjects = () => {
    if (selectedFiles.length > 0 && onDetectObjects) {
      onDetectObjects(selectedFiles[0], cityName);
    }
  };

  // Phase 2: Create Multi-Object Waste Scene containing Plastic, Metal, Paper, and Cardboard
  const createPhase2MultiScene = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    
    // Background
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, 400, 400);

    // Subtle grid divider lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(200, 0); ctx.lineTo(200, 400);
    ctx.moveTo(0, 200); ctx.lineTo(400, 200);
    ctx.stroke();

    // 1. Quadrant 1 (Top-Left): Object 1 -> Plastic Bottle
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    ctx.roundRect(65, 45, 75, 120, [12]);
    ctx.fill();
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(85, 25, 35, 20); // cap

    // 2. Quadrant 2 (Top-Right): Object 2 -> Metal Can
    const metalGrad = ctx.createLinearGradient(250, 0, 350, 0);
    metalGrad.addColorStop(0, '#64748b');
    metalGrad.addColorStop(0.3, '#cbd5e1');
    metalGrad.addColorStop(0.5, '#ffffff');
    metalGrad.addColorStop(0.7, '#cbd5e1');
    metalGrad.addColorStop(1, '#475569');
    ctx.fillStyle = metalGrad;
    ctx.beginPath();
    ctx.roundRect(260, 35, 80, 135, [14]);
    ctx.fill();

    // 3. Quadrant 3 (Bottom-Left): Object 3 -> Paper Document
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.roundRect(50, 235, 100, 130, [4]);
    ctx.fill();
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 3;
    for (let y = 255; y < 345; y += 16) {
      ctx.beginPath();
      ctx.moveTo(65, y);
      ctx.lineTo(135, y);
      ctx.stroke();
    }

    // 4. Quadrant 4 (Bottom-Right): Object 4 -> Cardboard Box
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.roundRect(245, 240, 115, 120, [6]);
    ctx.fill();
    ctx.fillStyle = '#78350f';
    ctx.fillRect(245, 295, 115, 10); // tape line

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'phase2_multi_object_waste_scene.jpg', { type: 'image/jpeg' });
        handleFilesAdded([file]);
        if (onDetectObjects) {
          onDetectObjects(file, cityName);
        }
      }
    }, 'image/jpeg');
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

    // Waste shape & optical material signature
    if (type === 'bottle') {
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.roundRect(80, 50, 64, 130, [10, 10, 5, 5]);
      ctx.fill();
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(95, 30, 34, 20); // cap
    } else if (type === 'can' || type === 'metal') {
      // Metallic specular highlight gradient
      const metalGrad = ctx.createLinearGradient(75, 0, 150, 0);
      metalGrad.addColorStop(0, '#64748b');
      metalGrad.addColorStop(0.3, '#cbd5e1');
      metalGrad.addColorStop(0.5, '#ffffff'); // bright metallic reflection
      metalGrad.addColorStop(0.7, '#cbd5e1');
      metalGrad.addColorStop(1, '#475569');
      ctx.fillStyle = metalGrad;
      ctx.beginPath();
      ctx.roundRect(75, 40, 74, 140, [12]);
      ctx.fill();
    } else if (type === 'box') {
      ctx.fillStyle = colorHex;
      ctx.beginPath();
      ctx.roundRect(50, 60, 124, 100, [6]);
      ctx.fill();
      // tape line
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 6;
      ctx.strokeRect(50, 105, 124, 1);
    } else if (type === 'wood') {
      // Timber wood planks with cellulose grain lines
      ctx.fillStyle = '#b45309';
      ctx.fillRect(45, 45, 134, 134);
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      for (let y = 55; y < 175; y += 18) {
        ctx.beginPath();
        ctx.moveTo(45, y);
        ctx.lineTo(179, y);
        ctx.stroke();
      }
    } else if (type === 'organic') {
      // Organic vegetable / fruit peel with high bio-chroma
      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.ellipse(100, 110, 50, 65, Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.ellipse(125, 120, 35, 45, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = colorHex;
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
    <div className="glass-panel" style={{ padding: 'clamp(1rem, 2.5vw, 1.5rem)' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem', flexWrap: 'wrap', gap: '0.6rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            background: 'rgba(6, 182, 212, 0.15)',
            padding: '0.5rem',
            borderRadius: '10px',
            color: 'var(--cyan-400)',
            display: 'flex',
            flexShrink: 0
          }}>
            <UploadCloud size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: 'clamp(1rem, 2vw, 1.15rem)', color: 'var(--text-primary)', fontWeight: 700 }}>
              2. Waste Image Intake & City Tagging
            </h3>
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
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#f87171',
              fontSize: '0.78rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              padding: '0.35rem 0.65rem',
              borderRadius: '8px',
              minHeight: '32px'
            }}
          >
            <Trash2 size={13} /> Clear All ({selectedFiles.length})
          </button>
        )}
      </div>

      {/* City Name Tagging Field */}
      <div style={{
        marginBottom: '1rem',
        padding: '0.75rem 0.9rem',
        borderRadius: '10px',
        background: 'rgba(255, 255, 255, 0.02)',
        border: '1px solid var(--border-glass)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--cyan-400)', fontSize: '0.82rem', fontWeight: 600, flexShrink: 0 }}>
          <Tag size={14} />
          <span>City / Municipality:</span>
        </div>
        <div style={{ flex: '1 1 180px', position: 'relative' }}>
          <MapPin size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="e.g. Karad, Satara, Kolhapur, Pune..."
            value={cityName}
            onChange={(e) => setCityName(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem 0.75rem 0.5rem 2rem',
              borderRadius: '8px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(0, 0, 0, 0.3)',
              color: 'var(--text-primary)',
              fontSize: '16px', // Prevents iOS auto-zoom
              outline: 'none'
            }}
          />
        </div>
      </div>

      {/* Drop Zone & File Pickers */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${dragOver ? 'var(--emerald-400)' : 'rgba(255, 255, 255, 0.14)'}`,
          borderRadius: '12px',
          padding: 'clamp(1.25rem, 3vw, 1.75rem) 1rem',
          textAlign: 'center',
          cursor: 'pointer',
          background: dragOver ? 'rgba(16, 185, 129, 0.06)' : 'rgba(0, 0, 0, 0.18)',
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
          width: '44px',
          height: '44px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 0.5rem',
          color: 'var(--cyan-400)'
        }}>
          <ImageIcon size={22} />
        </div>

        <p style={{ fontSize: 'clamp(0.85rem, 2vw, 0.92rem)', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
          Drag & drop waste images, or <span style={{ color: 'var(--emerald-400)' }}>browse files</span>
        </p>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Supports JPG, PNG, WEBP (Single or Bulk batch up to 100 images)
        </p>

        {/* Camera Quick Button for Live Camera / Webcam */}
        <div style={{ marginTop: '0.75rem' }}>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                setIsCameraOpen(true);
              } else {
                cameraInputRef.current?.click();
              }
            }}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              border: '1px solid rgba(16, 185, 129, 0.45)',
              background: 'rgba(16, 185, 129, 0.16)',
              color: 'var(--emerald-400)',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              minHeight: '40px',
              touchAction: 'manipulation'
            }}
          >
            <Camera size={16} /> Capture with Camera
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
          <Sparkles size={13} /> <strong>1-Click Samples:</strong>
        </span>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={() => createDemoSampleFile('can', 'demo_aluminum_can.jpg', '#94a3b8')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '32px' }}
          >
            + Metal Can
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('organic', 'demo_vegetable_peels.jpg', '#10b981')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '32px' }}
          >
            + Bio Waste
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('wood', 'demo_wooden_crate.jpg', '#b45309')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '32px' }}
          >
            + Wood
          </button>
          <button
            type="button"
            onClick={createPhase2MultiScene}
            style={{
              padding: '5px 11px',
              borderRadius: '8px',
              fontSize: '0.74rem',
              fontWeight: 700,
              background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(59, 130, 246, 0.22) 100%)',
              border: '1px solid rgba(6, 182, 212, 0.5)',
              color: 'var(--cyan-400)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              minHeight: '32px'
            }}
            title="Phase 2 Multi-Object Scene: Plastic + Metal + Paper + Cardboard"
          >
            <Target size={13} />
            <span>⚡ Phase 2: Multi-Object Scene</span>
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('box', 'demo_cardboard_box.jpg', '#d97706')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '32px' }}
          >
            + Cardboard
          </button>
          <button
            type="button"
            onClick={() => createDemoSampleFile('bottle', 'demo_plastic_bottle.jpg', '#3b82f6')}
            style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '0.72rem', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border-glass)', color: 'var(--text-secondary)', cursor: 'pointer', minHeight: '32px' }}
          >
            + Plastic
          </button>
        </div>
      </div>

      {/* Phase 2: Neural Bounding Box Scene Viewfinder Overlay */}
      {detectedObjects && detectedObjects.length > 0 && scenePreviewUrl && (
        <div style={{
          marginBottom: '1.25rem',
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(0, 0, 0, 0.45)',
          border: '1px solid rgba(6, 182, 212, 0.35)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '0.75rem',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.88rem', fontWeight: 700, color: 'var(--cyan-400)' }}>
              <Target size={17} />
              <span>Phase 2: Localized Waste Detection ({detectedObjects.length} Objects)</span>
            </div>
            <span style={{ fontSize: '0.74rem', color: 'var(--emerald-400)', fontWeight: 600, background: 'rgba(16, 185, 129, 0.15)', padding: '2px 8px', borderRadius: '6px' }}>
              ✓ Bounding Boxes Verified
            </span>
          </div>

          <div style={{
            position: 'relative',
            maxWidth: '380px',
            margin: '0 auto',
            borderRadius: '8px',
            overflow: 'hidden',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.5)'
          }}>
            <img
              src={scenePreviewUrl}
              alt="Detected Waste Scene"
              style={{ width: '100%', height: 'auto', display: 'block' }}
            />
            {detectedObjects.map((obj, i) => {
              const [ymin, xmin, ymax, xmax] = obj.bbox;
              const colorMap = {
                plastic: '#38bdf8',
                metal: '#94a3b8',
                paper: '#f59e0b',
                cardboard: '#d97706'
              };
              const color = colorMap[obj.waste_type] || '#10b981';
              return (
                <div
                  key={i}
                  style={{
                    position: 'absolute',
                    top: `${ymin * 100}%`,
                    left: `${xmin * 100}%`,
                    width: `${(xmax - xmin) * 100}%`,
                    height: `${(ymax - ymin) * 100}%`,
                    border: `2.5px solid ${color}`,
                    borderRadius: '6px',
                    backgroundColor: `${color}25`,
                    boxShadow: `0 0 10px ${color}88`,
                    display: 'flex',
                    alignItems: 'flex-start',
                    padding: '2px 4px',
                    pointerEvents: 'none'
                  }}
                >
                  <span style={{
                    background: color,
                    color: '#0f172a',
                    fontSize: '9px',
                    fontWeight: 800,
                    padding: '1px 5px',
                    borderRadius: '3px',
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em'
                  }}>
                    {obj.name}: {obj.waste_type} ({Math.round(obj.confidence * 100)}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected Previews with Thumbnails */}
      {selectedFiles.length > 0 && (
        <div style={{
          maxHeight: '180px',
          overflowY: 'auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))',
          gap: '0.5rem',
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
                  style={{ width: '100%', height: '65px', objectFit: 'cover', borderRadius: '6px' }}
                />
              ) : (
                <div style={{ height: '65px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
                  <ImageIcon size={20} />
                </div>
              )}
              <div style={{
                fontSize: '0.68rem',
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
                  width: '20px',
                  height: '20px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.85)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '12px'
                }}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
        {/* Phase 2: Detect Objects Button */}
        <button
          type="button"
          className="btn-primary"
          disabled={loading || selectedFiles.length === 0}
          onClick={handleTriggerDetectObjects}
          style={{
            flex: '1 1 200px',
            minHeight: '44px',
            background: 'linear-gradient(135deg, #0284c7 0%, #0891b2 100%)',
            opacity: (loading || selectedFiles.length === 0) ? 0.6 : 1
          }}
          title="Detect multi-objects (Object 1: Plastic, Object 2: Metal, Object 3: Paper, Object 4: Cardboard)"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin-animation" />
              <span>Detecting Objects...</span>
            </>
          ) : (
            <>
              <Target size={16} />
              <span>Detect Objects (Phase 2)</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary"
          disabled={loading || selectedFiles.length === 0}
          onClick={handleTriggerAnalyze}
          style={{
            flex: '1 1 180px',
            minHeight: '44px',
            opacity: (loading || selectedFiles.length === 0) ? 0.6 : 1
          }}
        >
          {loading ? (
            <>
              <Loader2 size={16} className="spin-animation" />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={16} />
              <span>Batch ({selectedFiles.length})</span>
            </>
          )}
        </button>

        <button
          type="button"
          className="btn-secondary"
          onClick={onLoadBenchmark}
          disabled={loading}
          style={{ flex: '1 1 140px', minHeight: '44px' }}
          title="Simulate 100-item Karad waste survey benchmark according to PRD Section 10"
        >
          <Sparkles size={15} color="var(--amber-400)" />
          <span>PRD Benchmark</span>
        </button>
      </div>

      {/* Live Camera Viewfinder Modal */}
      <CameraModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onPhotoCaptured={(file) => handleFilesAdded([file])}
      />
    </div>
  );
}

