/**
 * MobileUpload.jsx — Phone-side document upload page for QR handoff.
 *
 * Mounted at /mobile-upload/:token (React Router path, no /dhanvantari prefix —
 * BrowserRouter basename handles that). The QR code encodes the full URL:
 *   http://<KIOSK_LAN_HOST>:<PORT>/dhanvantari/mobile-upload/<token>
 *
 * Security: token is validated server-side on every request. No patient data
 * is ever returned or displayed on this page — it is intentionally anonymous.
 *
 * Styled with inline styles only — no Tailwind dependency — for fast loading
 * on lower-end mobile devices over local WiFi.
 */
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

// When the phone opens this page via the QR code, window.location.hostname is the
// kiosk's LAN IP (e.g. 192.168.0.107). Use that to build the backend API URL so
// fetch calls from the phone reach the correct machine, not localhost.
const _viteApiUrl = import.meta.env.VITE_API_URL;
const _backendPort = import.meta.env.VITE_BACKEND_PORT || '8000';
const API_BASE = _viteApiUrl
  ? _viteApiUrl
  : `http://${window.location.hostname}:${_backendPort}/api`;

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function validateToken(token) {
  const res = await fetch(`${API_BASE}/mobile-upload/${token}`);
  return res.json();
}

async function uploadFile(token, file, onProgress) {
  return new Promise((resolve, reject) => {
    const fd = new FormData();
    fd.append('file', file);

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `${API_BASE}/mobile-upload/${token}/document`);
    // No Authorization header — token in URL is the only credential.

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
    };

    xhr.onload = () => {
      let data;
      try { data = JSON.parse(xhr.responseText); } catch (_) { data = {}; }
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(data);
      } else {
        reject(new Error(data?.error || `Upload failed (HTTP ${xhr.status})`));
      }
    };

    xhr.onerror = () => reject(new Error('Network error — check WiFi connection'));
    xhr.send(fd);
  });
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const S = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0f172a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    color: '#f1f5f9',
    boxSizing: 'border-box',
  },
  card: {
    background: 'rgba(255,255,255,0.06)',
    backdropFilter: 'blur(12px)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '24px',
    padding: '32px 24px',
    width: '100%',
    maxWidth: '420px',
    textAlign: 'center',
    boxSizing: 'border-box',
  },
  logo: {
    fontSize: '40px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#f1f5f9',
    margin: '0 0 6px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#94a3b8',
    margin: '0 0 28px',
    lineHeight: 1.5,
  },
  // Big tap-target button
  uploadBtn: (color, hovered) => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
    padding: '18px 16px',
    borderRadius: '16px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '17px',
    fontWeight: '700',
    marginBottom: '12px',
    background: hovered ? (color === 'blue' ? '#2563eb' : '#0d9488') : (color === 'blue' ? '#3b82f6' : '#14b8a6'),
    color: '#fff',
    transition: 'background 0.15s ease, transform 0.1s ease',
    transform: hovered ? 'scale(0.98)' : 'scale(1)',
    letterSpacing: '0.01em',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  }),
  progressBar: (pct) => ({
    height: '6px',
    borderRadius: '3px',
    background: '#1e293b',
    marginTop: '16px',
    overflow: 'hidden',
    position: 'relative',
  }),
  progressFill: (pct) => ({
    height: '100%',
    width: `${pct}%`,
    background: 'linear-gradient(90deg, #3b82f6, #06b6d4)',
    borderRadius: '3px',
    transition: 'width 0.2s ease',
  }),
  statusBox: (type) => ({
    marginTop: '20px',
    padding: '16px',
    borderRadius: '14px',
    background: type === 'success' ? 'rgba(16,185,129,0.15)' : type === 'error' ? 'rgba(239,68,68,0.15)' : 'rgba(99,102,241,0.15)',
    border: `1px solid ${type === 'success' ? 'rgba(16,185,129,0.4)' : type === 'error' ? 'rgba(239,68,68,0.4)' : 'rgba(99,102,241,0.4)'}`,
    color: type === 'success' ? '#6ee7b7' : type === 'error' ? '#fca5a5' : '#c7d2fe',
    fontSize: '15px',
    lineHeight: 1.5,
  }),
  errorPage: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f172a 0%, #3b1a1a 100%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '32px 20px',
    fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
    textAlign: 'center',
    color: '#fca5a5',
  },
  errorIcon: { fontSize: '56px', marginBottom: '16px' },
  errorTitle: { fontSize: '22px', fontWeight: '700', marginBottom: '10px', color: '#f1f5f9' },
  errorMsg:   { fontSize: '15px', color: '#94a3b8', lineHeight: 1.6, maxWidth: '320px' },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    margin: '4px 0 12px',
    color: '#475569',
    fontSize: '12px',
    fontWeight: '600',
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
  },
  dividerLine: { flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' },
};

// ─── Hidden file inputs ────────────────────────────────────────────────────────

function HiddenInput({ inputRef, accept, capture }) {
  return (
    <input
      ref={inputRef}
      type="file"
      accept={accept}
      capture={capture}
      style={{ display: 'none' }}
    />
  );
}

// ─── Main component ────────────────────────────────────────────────────────────

export default function MobileUpload() {
  const { token } = useParams();

  const [validating, setValidating]   = useState(true);
  const [tokenValid, setTokenValid]   = useState(false);
  const [tokenError, setTokenError]   = useState('');

  const [uploading,  setUploading]    = useState(false);
  const [progress,   setProgress]     = useState(0);
  const [uploaded,   setUploaded]     = useState(false);
  const [uploadError, setUploadError] = useState('');

  const [hoverCamera, setHoverCamera] = useState(false);
  const [hoverFile,   setHoverFile]   = useState(false);

  const cameraRef = useRef(null);
  const fileRef   = useRef(null);

  // ── Validate token on mount ──────────────────────────────────────────────────
  useEffect(() => {
    if (!token) {
      setTokenError('No upload token found in this link. Please scan the QR code again.');
      setValidating(false);
      return;
    }
    validateToken(token)
      .then((data) => {
        if (data?.valid) {
          setTokenValid(true);
        } else {
          const reason = data?.reason;
          if (reason === 'expired') {
            setTokenError('This link has expired. Please ask kiosk staff to generate a new QR code.');
          } else if (reason === 'not_found') {
            setTokenError('This link is not valid. Please scan the QR code shown on the kiosk screen.');
          } else {
            setTokenError('This upload link is no longer active. Please ask kiosk staff for assistance.');
          }
        }
      })
      .catch(() => {
        setTokenError('Could not reach the kiosk server. Make sure your phone is on the same WiFi network.');
      })
      .finally(() => setValidating(false));
  }, [token]);

  // ── Handle file selection from either input ──────────────────────────────────
  const handleFile = async (file) => {
    if (!file) return;
    setUploadError('');
    setUploading(true);
    setProgress(0);
    try {
      await uploadFile(token, file, setProgress);
      setUploaded(true);
      setProgress(100);
    } catch (err) {
      const msg = err.message || 'Upload failed. Please try again.';
      setUploadError(
        msg.toLowerCase().includes('10 mb') || msg.toLowerCase().includes('large')
          ? 'File is too large (max 10 MB). Please compress or crop the image and try again.'
          : msg
      );
    } finally {
      setUploading(false);
    }
  };

  // Wire the hidden inputs to the handler
  const wireInput = (ref) => {
    if (!ref.current) return;
    ref.current.onchange = (e) => handleFile(e.target.files?.[0]);
  };
  useEffect(() => { wireInput(cameraRef); wireInput(fileRef); });

  // ── Loading state ────────────────────────────────────────────────────────────
  if (validating) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={S.logo}>🏥</div>
          <p style={{ color: '#94a3b8', fontSize: '16px', margin: 0 }}>Verifying link…</p>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ──────────────────────────────────────────────────
  if (!tokenValid) {
    return (
      <div style={S.errorPage}>
        <div style={S.errorIcon}>⏱️</div>
        <h1 style={S.errorTitle}>Link Not Available</h1>
        <p style={S.errorMsg}>{tokenError}</p>
      </div>
    );
  }

  // ── Success state ────────────────────────────────────────────────────────────
  if (uploaded) {
    return (
      <div style={S.page}>
        <div style={S.card}>
          <div style={{ fontSize: '52px', marginBottom: '12px' }}>✅</div>
          <h1 style={S.title}>Document Uploaded!</h1>
          <p style={{ ...S.subtitle, marginBottom: 0 }}>
            Your document is being processed by the kiosk. You can close this tab and return to the kiosk screen.
          </p>
        </div>
      </div>
    );
  }

  // ── Upload UI ────────────────────────────────────────────────────────────────
  return (
    <div style={S.page}>
      <HiddenInput inputRef={cameraRef} accept="image/*" capture="environment" />
      <HiddenInput inputRef={fileRef}   accept="image/*,.pdf" capture={undefined} />

      <div style={S.card}>
        <div style={S.logo}>🏥</div>
        <h1 style={S.title}>Upload Document</h1>
        <p style={S.subtitle}>
          Upload a prescription, lab report, or medical record to share with the kiosk.
        </p>

        {/* Take Photo */}
        <button
          id="mobile-upload-camera-btn"
          style={S.uploadBtn('blue', hoverCamera)}
          onMouseEnter={() => setHoverCamera(true)}
          onMouseLeave={() => setHoverCamera(false)}
          onTouchStart={() => setHoverCamera(true)}
          onTouchEnd={() => setHoverCamera(false)}
          onClick={() => cameraRef.current?.click()}
          disabled={uploading}
          aria-label="Take a photo with your camera"
        >
          <span style={{ fontSize: '22px' }}>📷</span>
          <span>Take Photo</span>
        </button>

        <div style={S.divider}>
          <div style={S.dividerLine} />
          <span>or</span>
          <div style={S.dividerLine} />
        </div>

        {/* Choose from files */}
        <button
          id="mobile-upload-file-btn"
          style={S.uploadBtn('teal', hoverFile)}
          onMouseEnter={() => setHoverFile(true)}
          onMouseLeave={() => setHoverFile(false)}
          onTouchStart={() => setHoverFile(true)}
          onTouchEnd={() => setHoverFile(false)}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          aria-label="Choose a file from your gallery or files"
        >
          <span style={{ fontSize: '22px' }}>🗂</span>
          <span>Choose from Gallery / Files</span>
        </button>

        {/* Progress */}
        {uploading && (
          <>
            <div style={S.progressBar(progress)}>
              <div style={S.progressFill(progress)} />
            </div>
            <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '8px' }}>
              {progress < 100 ? `Uploading… ${progress}%` : 'Processing via OCR…'}
            </p>
          </>
        )}

        {/* Error */}
        {uploadError && !uploading && (
          <div style={S.statusBox('error')}>
            <strong>Upload failed</strong>
            <br />
            {uploadError}
            <br />
            <button
              onClick={() => setUploadError('')}
              style={{ marginTop: '10px', background: 'none', border: '1px solid rgba(239,68,68,0.5)', color: '#fca5a5', borderRadius: '8px', padding: '6px 14px', cursor: 'pointer', fontSize: '13px' }}
            >
              Try Again
            </button>
          </div>
        )}

        <p style={{ marginTop: '20px', fontSize: '12px', color: '#475569' }}>
          Max file size: 10 MB · Images or PDF only
        </p>
      </div>
    </div>
  );
}
