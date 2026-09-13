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
 * Styled with inline styles only for fast, reliable loading on mobile devices over local WiFi.
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

// ─── SVG Icons ────────────────────────────────────────────────────────────────

function CameraIcon({ size = 20, color = '#ffffff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function FolderIcon({ size = 20, color = '#ffffff' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg width="42" height="42" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="3.5" y="7.5" width="21" height="16" rx="4" fill="#ffffff" stroke="#0284c7" strokeWidth="2.2" />
      <path d="M10 7.5V5.5C10 4.4 10.9 3.5 12 3.5H16C17.1 3.5 18 4.4 18 5.5V7.5" stroke="#0284c7" strokeWidth="2.2" strokeLinecap="round" />
      {/* Medical Cross */}
      <path d="M14 11.5V19.5M10 15.5H18" stroke="#ef4444" strokeWidth="2.8" strokeLinecap="round" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

// ─── Header ───────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      width: '100%',
      maxWidth: '420px',
      marginBottom: '24px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          background: '#ffffff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          padding: '5px',
          boxSizing: 'border-box',
        }}>
          <img
            src={`${import.meta.env.BASE_URL}logo.png`}
            alt="Dhanvantri Logo"
            style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
        </div>
        <div>
          <h1 style={{
            fontSize: '19px',
            fontWeight: '800',
            color: '#0f172a',
            margin: 0,
            lineHeight: 1.2,
            letterSpacing: '-0.01em',
          }}>
            Dhanvantri
          </h1>
          <p style={{
            fontSize: '13px',
            fontWeight: '600',
            color: '#0284c7',
            margin: '2px 0 0',
            lineHeight: 1.2,
          }}>
            Clinical Document Portal
          </p>
        </div>
      </div>
      {/* Note: Top-right ABDM Compliant badge deliberately omitted per instructions */}
    </header>
  );
}

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

// ─── Main Component ────────────────────────────────────────────────────────────

export default function MobileUpload() {
  const { token } = useParams();

  const [validating, setValidating]   = useState(true);
  const [tokenValid, setTokenValid]   = useState(false);
  const [tokenError, setTokenError]   = useState('');

  const [uploading,  setUploading]    = useState(false);
  const [progress,   setProgress]     = useState(0);
  const [uploaded,   setUploaded]     = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [closeNotice, setCloseNotice] = useState(false);

  const [hoverCamera, setHoverCamera] = useState(false);
  const [hoverFile,   setHoverFile]   = useState(false);
  const [hoverAnother, setHoverAnother] = useState(false);
  const [hoverClose,  setHoverClose]  = useState(false);

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

  // Wire hidden inputs to handler
  const wireInput = (ref) => {
    if (!ref.current) return;
    ref.current.onchange = (e) => handleFile(e.target.files?.[0]);
  };
  useEffect(() => {
    wireInput(cameraRef);
    wireInput(fileRef);
  });

  const handleCloseWindow = () => {
    try {
      window.close();
    } catch (_) {}
    setCloseNotice(true);
  };

  // ── Page styles ──────────────────────────────────────────────────────────────
  const pageStyle = {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '24px 16px 40px',
    fontFamily: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
    boxSizing: 'border-box',
  };

  const cardStyle = {
    background: '#ffffff',
    borderRadius: '24px',
    boxShadow: '0 12px 36px -4px rgba(0, 0, 0, 0.06), 0 4px 12px -2px rgba(0, 0, 0, 0.03)',
    border: '1px solid #f1f5f9',
    width: '100%',
    maxWidth: '420px',
    overflow: 'hidden',
    boxSizing: 'border-box',
    textAlign: 'center',
  };

  const cardAccent = {
    height: '4px',
    width: '100%',
    background: 'linear-gradient(90deg, #0284c7 0%, #10b981 100%)',
  };

  // ── Loading state ────────────────────────────────────────────────────────────
  if (validating) {
    return (
      <div style={pageStyle}>
        <Header />
        <div style={cardStyle}>
          <div style={cardAccent} />
          <div style={{ padding: '48px 24px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '18px',
              background: '#f0f9ff',
              border: '1px solid #e0f2fe',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px',
            }}>
              <BriefcaseIcon />
            </div>
            <p style={{ color: '#64748b', fontSize: '15px', fontWeight: '600', margin: 0 }}>
              Verifying link…
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Invalid / expired token ──────────────────────────────────────────────────
  if (!tokenValid) {
    return (
      <div style={pageStyle}>
        <Header />
        <div style={cardStyle}>
          <div style={{ height: '4px', width: '100%', background: '#ef4444' }} />
          <div style={{ padding: '36px 24px' }}>
            <div style={{
              width: '68px',
              height: '68px',
              margin: '0 auto 18px',
              background: '#fef2f2',
              borderRadius: '18px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '32px',
            }}>
              ⏱️
            </div>
            <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#0f172a', margin: '0 0 10px' }}>
              Link Not Available
            </h2>
            <p style={{ fontSize: '14px', color: '#64748b', lineHeight: 1.6, margin: 0 }}>
              {tokenError}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Success state (Matches Image 2) ──────────────────────────────────────────
  if (uploaded) {
    return (
      <div style={pageStyle}>
        <Header />

        <div style={cardStyle}>
          <div style={cardAccent} />
          <div style={{ padding: '36px 24px 28px' }}>
            {/* Green rounded success badge */}
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '22px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 22px',
              boxShadow: '0 10px 24px rgba(16, 185, 129, 0.3)',
            }}>
              <CheckmarkIcon />
            </div>

            <h2 style={{
              fontSize: '23px',
              fontWeight: '800',
              color: '#0f172a',
              margin: '0 0 12px',
              letterSpacing: '-0.02em',
            }}>
              Document Uploaded!
            </h2>

            <p style={{
              fontSize: '14px',
              color: '#64748b',
              lineHeight: 1.55,
              margin: '0 0 28px',
              padding: '0 4px',
            }}>
              Your document is being processed by the kiosk. You can close this tab and return to the kiosk screen.
            </p>

            {/* Upload Another Document button */}
            <button
              id="mobile-upload-another-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                width: '100%',
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                fontSize: '16px',
                fontWeight: '700',
                background: hoverAnother ? '#0274ae' : '#0284c7',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(2, 132, 199, 0.28)',
                transition: 'all 0.15s ease',
                marginBottom: '12px',
              }}
              onMouseEnter={() => setHoverAnother(true)}
              onMouseLeave={() => setHoverAnother(false)}
              onTouchStart={() => setHoverAnother(true)}
              onTouchEnd={() => setHoverAnother(false)}
              onClick={() => {
                setUploaded(false);
                setProgress(0);
                setUploadError('');
              }}
            >
              <CameraIcon size={20} color="#ffffff" />
              <span>Upload Another Document</span>
            </button>

            {/* Close Window button */}
            <button
              id="mobile-upload-close-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '15px',
                borderRadius: '16px',
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
                fontSize: '15px',
                fontWeight: '700',
                background: hoverClose ? '#e2e8f0' : '#f1f5f9',
                color: '#334155',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={() => setHoverClose(true)}
              onMouseLeave={() => setHoverClose(false)}
              onTouchStart={() => setHoverClose(true)}
              onTouchEnd={() => setHoverClose(false)}
              onClick={handleCloseWindow}
            >
              Close Window
            </button>

            {closeNotice && (
              <p style={{ marginTop: '12px', fontSize: '13px', color: '#64748b' }}>
                You can now safely close this browser tab.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ── Main Upload UI (Matches Image 1) ─────────────────────────────────────────
  return (
    <div style={pageStyle}>
      <HiddenInput inputRef={cameraRef} accept="image/*" capture="environment" />
      <HiddenInput inputRef={fileRef}   accept="image/*,.pdf" capture={undefined} />

      <Header />

      <div style={cardStyle}>
        <div style={cardAccent} />
        <div style={{ padding: '32px 24px 28px' }}>
          {/* Medical briefcase icon */}
          <div style={{
            width: '68px',
            height: '68px',
            borderRadius: '18px',
            background: '#f0f9ff',
            border: '1px solid #e0f2fe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <BriefcaseIcon />
          </div>

          <h2 style={{
            fontSize: '24px',
            fontWeight: '800',
            color: '#0f172a',
            margin: '0 0 10px',
            letterSpacing: '-0.02em',
          }}>
            Upload Document
          </h2>

          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '0 0 26px',
            lineHeight: 1.5,
            padding: '0 6px',
          }}>
            Upload a prescription, lab report, or medical record to share with the kiosk.
          </p>

          {/* Button 1: Take Photo */}
          <button
            id="mobile-upload-camera-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              background: hoverCamera ? '#0274ae' : '#0284c7',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(2, 132, 199, 0.3)',
              transition: 'all 0.15s ease',
              opacity: uploading ? 0.7 : 1,
            }}
            onMouseEnter={() => setHoverCamera(true)}
            onMouseLeave={() => setHoverCamera(false)}
            onTouchStart={() => setHoverCamera(true)}
            onTouchEnd={() => setHoverCamera(false)}
            onClick={() => cameraRef.current?.click()}
            disabled={uploading}
            aria-label="Take a photo with your camera"
          >
            <CameraIcon size={20} color="#ffffff" />
            <span>Take Photo</span>
          </button>

          {/* Divider: OR */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            margin: '16px 0',
          }}>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
            <span style={{
              color: '#94a3b8',
              fontSize: '12px',
              fontWeight: '700',
              letterSpacing: '0.06em',
            }}>
              OR
            </span>
            <div style={{ flex: 1, height: '1px', background: '#e2e8f0' }} />
          </div>

          {/* Button 2: Choose from Gallery / Files */}
          <button
            id="mobile-upload-file-btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '700',
              background: hoverFile ? '#047857' : '#059669',
              color: '#ffffff',
              boxShadow: '0 4px 14px rgba(5, 150, 105, 0.3)',
              transition: 'all 0.15s ease',
              opacity: uploading ? 0.7 : 1,
            }}
            onMouseEnter={() => setHoverFile(true)}
            onMouseLeave={() => setHoverFile(false)}
            onTouchStart={() => setHoverFile(true)}
            onTouchEnd={() => setHoverFile(false)}
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            aria-label="Choose a file from your gallery or files"
          >
            <FolderIcon size={20} color="#ffffff" />
            <span>Choose from Gallery / Files</span>
          </button>

          {/* Upload Progress */}
          {uploading && (
            <div style={{ marginTop: '20px' }}>
              <div style={{
                height: '8px',
                borderRadius: '4px',
                background: '#f1f5f9',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
              }}>
                <div style={{
                  height: '100%',
                  width: `${progress}%`,
                  background: 'linear-gradient(90deg, #0284c7, #10b981)',
                  borderRadius: '4px',
                  transition: 'width 0.2s ease',
                }} />
              </div>
              <p style={{ color: '#64748b', fontSize: '13px', marginTop: '10px', fontWeight: '600' }}>
                {progress < 100 ? `Uploading… ${progress}%` : 'Processing via OCR…'}
              </p>
            </div>
          )}

          {/* Upload Error */}
          {uploadError && !uploading && (
            <div style={{
              marginTop: '20px',
              padding: '14px 16px',
              borderRadius: '14px',
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#991b1b',
              fontSize: '14px',
              lineHeight: 1.5,
              textAlign: 'center',
            }}>
              <strong style={{ fontWeight: '700' }}>Upload failed</strong>
              <div style={{ marginTop: '4px', fontSize: '13px', color: '#b91c1c' }}>
                {uploadError}
              </div>
              <button
                onClick={() => setUploadError('')}
                style={{
                  marginTop: '10px',
                  background: '#ffffff',
                  border: '1px solid #fca5a5',
                  color: '#b91c1c',
                  borderRadius: '8px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {/* File size disclaimer */}
          <p style={{
            marginTop: '24px',
            marginBottom: 0,
            fontSize: '13px',
            color: '#64748b',
            fontWeight: '500',
          }}>
            Max file size: 10 MB · Images or PDF only
          </p>
        </div>
      </div>
      {/* Note: Bottom compliance footer deliberately omitted per instructions */}
    </div>
  );
}
