import React, { useState, useRef, useEffect } from 'react';
import { X, Camera, RefreshCw, Check, AlertCircle, FlipHorizontal } from 'lucide-react';

export default function CameraModal({ isOpen, onClose, onPhotoCaptured }) {
  if (!isOpen) return null;

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' for rear, 'user' for front
  const [error, setError] = useState(null);
  const [capturedCount, setCapturedCount] = useState(0);
  const [flashEffect, setFlashEffect] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') handleClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const stopCameraStream = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  };

  const startCameraStream = async (mode = facingMode) => {
    stopCameraStream();
    setIsInitializing(true);
    setError(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera access is not supported by your browser or requires HTTPS.');
      setIsInitializing(false);
      return;
    }

    try {
      const constraints = {
        video: {
          facingMode: mode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsInitializing(false);
    } catch (err) {
      console.warn('Camera error with mode', mode, err);
      // Fallback try without facingMode constraint if rear camera failed
      try {
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
        streamRef.current = fallbackStream;
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream;
          await videoRef.current.play();
        }
        setIsInitializing(false);
      } catch (fallbackErr) {
        setError('Unable to access camera. Please ensure camera permissions are granted in browser settings.');
        setIsInitializing(false);
      }
    }
  };

  useEffect(() => {
    startCameraStream(facingMode);
    return () => {
      stopCameraStream();
    };
  }, [facingMode]);

  const handleToggleFacingMode = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Visual shutter flash effect
    setFlashEffect(true);
    setTimeout(() => setFlashEffect(false), 200);

    canvas.toBlob(
      (blob) => {
        if (blob) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
          const file = new File([blob], `waste_photo_${timestamp}.jpg`, { type: 'image/jpeg' });
          onPhotoCaptured(file);
          setCapturedCount((prev) => prev + 1);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const handleClose = () => {
    stopCameraStream();
    onClose();
  };

  return (
    <div
      onClick={handleClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.85)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(0.5rem, 2vw, 1.25rem)',
        overflowY: 'auto',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '560px',
          borderRadius: '16px',
          background: 'rgba(15, 23, 42, 0.98)',
          border: '1px solid rgba(16, 185, 129, 0.35)',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.8)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid var(--border-glass)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.3)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div
              style={{
                background: 'rgba(16, 185, 129, 0.15)',
                padding: '0.45rem',
                borderRadius: '8px',
                color: 'var(--emerald-400)',
                display: 'flex',
              }}
            >
              <Camera size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', color: 'var(--text-primary)', fontWeight: 700 }}>
                Live Camera Capture
              </h3>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Point camera at plastic, paper, organic or e-waste items
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            aria-label="Close camera"
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              minWidth: '38px',
              minHeight: '38px',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Viewfinder Container */}
        <div
          style={{
            position: 'relative',
            background: '#000000',
            width: '100%',
            aspectRatio: '4 / 3',
            overflow: 'hidden',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Shutter Flash Animation */}
          {flashEffect && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#ffffff',
                opacity: 0.8,
                zIndex: 20,
                pointerEvents: 'none',
                transition: 'opacity 0.2s ease',
              }}
            />
          )}

          {/* Viewfinder Grid Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: '10%',
              border: '1px dashed rgba(255, 255, 255, 0.25)',
              borderRadius: '12px',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          />

          {/* Live Video Feed */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              transform: facingMode === 'user' ? 'scaleX(-1)' : 'none',
            }}
          />

          {/* Loading Indicator */}
          {isInitializing && (
            <div
              style={{
                position: 'absolute',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                color: 'var(--emerald-400)',
                zIndex: 15,
              }}
            >
              <RefreshCw size={26} className="spin-animation" />
              <span style={{ fontSize: '0.82rem', color: '#ffffff' }}>Starting camera...</span>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div
              style={{
                position: 'absolute',
                inset: '1.5rem',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: '0.75rem',
                padding: '1.25rem',
                background: 'rgba(15, 23, 42, 0.95)',
                borderRadius: '12px',
                border: '1px solid rgba(239, 68, 68, 0.4)',
                color: '#f87171',
                zIndex: 25,
              }}
            >
              <AlertCircle size={32} />
              <p style={{ fontSize: '0.88rem', lineHeight: 1.4 }}>{error}</p>
              <button
                type="button"
                onClick={() => startCameraStream(facingMode)}
                className="btn-secondary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.8rem', gap: '4px' }}
              >
                <RefreshCw size={13} /> Try Again
              </button>
            </div>
          )}

          {/* Captured Photos Counter Badge */}
          {capturedCount > 0 && (
            <div
              style={{
                position: 'absolute',
                top: '12px',
                left: '12px',
                zIndex: 15,
                background: 'rgba(16, 185, 129, 0.85)',
                color: '#ffffff',
                padding: '3px 9px',
                borderRadius: '9999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.5)',
              }}
            >
              <Check size={12} /> {capturedCount} photo{capturedCount !== 1 ? 's' : ''} added
            </div>
          )}
        </div>

        {/* Shutter & Controls Bar */}
        <div
          style={{
            padding: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.4)',
            gap: '1rem',
          }}
        >
          {/* Flip Camera Button */}
          <button
            type="button"
            onClick={handleToggleFacingMode}
            disabled={isInitializing || !!error}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: '10px',
              border: '1px solid var(--border-glass)',
              background: 'rgba(255, 255, 255, 0.06)',
              color: 'var(--text-secondary)',
              cursor: (isInitializing || !!error) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '0.78rem',
              minHeight: '44px',
              touchAction: 'manipulation',
            }}
            title="Switch between front and back camera"
          >
            <FlipHorizontal size={16} />
            <span>Switch</span>
          </button>

          {/* Big Shutter Snap Button */}
          <button
            type="button"
            onClick={handleCapturePhoto}
            disabled={isInitializing || !!error}
            aria-label="Capture photo"
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: (isInitializing || !!error)
                ? 'rgba(255,255,255,0.2)'
                : 'linear-gradient(135deg, var(--emerald-400), var(--emerald-600))',
              border: '4px solid #ffffff',
              boxShadow: '0 0 20px rgba(16, 185, 129, 0.6)',
              cursor: (isInitializing || !!error) ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'transform 0.15s ease',
              touchAction: 'manipulation',
            }}
            onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.92)'; }}
            onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
          >
            <Camera size={26} color="#ffffff" />
          </button>

          {/* Finish & Done Button */}
          <button
            type="button"
            onClick={handleClose}
            className="btn-primary"
            style={{
              padding: '0.55rem 1rem',
              fontSize: '0.85rem',
              minHeight: '44px',
              gap: '4px',
              touchAction: 'manipulation',
            }}
          >
            <span>Done</span>
          </button>
        </div>
      </div>
    </div>
  );
}
