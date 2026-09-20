import React, { useState, useEffect, useRef } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import pdfWorker from 'pdfjs-dist/build/pdf.worker.mjs?url';
import { backButtonManager } from '../../utils/backButtonManager.js';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

/**
 * High-performance Offline Canvas PDF Viewer for Mobile & Desktop
 */
function PdfCanvasViewer({ fileUrl, zoomLevel = 1, onError }) {
  const [numPages, setNumPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [renderError, setRenderError] = useState(null);
  const canvasRef = useRef(null);
  const pdfDocRef = useRef(null);
  const renderTaskRef = useRef(null);

  // Load PDF Document
  useEffect(() => {
    let isCancelled = false;
    setIsLoading(true);
    setRenderError(null);

    async function loadPdf() {
      try {
        if (!fileUrl) throw new Error('No PDF source URL available');

        const loadingTask = pdfjsLib.getDocument({
          url: fileUrl,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.0.379/cmaps/',
          cMapPacked: true
        });

        const doc = await loadingTask.promise;
        if (isCancelled) return;

        pdfDocRef.current = doc;
        setNumPages(doc.numPages);
        setCurrentPage(1);
        setIsLoading(false);
      } catch (err) {
        console.error('Error loading PDF:', err);
        if (!isCancelled) {
          setRenderError(err.message || 'Failed to parse PDF document');
          setIsLoading(false);
          onError?.(err);
        }
      }
    }

    loadPdf();

    return () => {
      isCancelled = true;
      if (pdfDocRef.current?.destroy) {
        pdfDocRef.current.destroy();
      }
    };
  }, [fileUrl]);

  // Render Current Page on Canvas
  useEffect(() => {
    if (!pdfDocRef.current || !canvasRef.current || isLoading) return;

    let isCancelled = false;

    async function renderPage() {
      try {
        if (renderTaskRef.current) {
          renderTaskRef.current.cancel();
        }

        const page = await pdfDocRef.current.getPage(currentPage);
        if (isCancelled) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const context = canvas.getContext('2d');
        const viewport = page.getViewport({ scale: zoomLevel * 1.5 }); // 1.5x base scale for crisp mobile text

        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport
        };

        const task = page.render(renderContext);
        renderTaskRef.current = task;
        await task.promise;
      } catch (err) {
        if (err.name !== 'RenderingCancelledException') {
          console.error('Page render error:', err);
        }
      }
    }

    renderPage();

    return () => {
      isCancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
      }
    };
  }, [currentPage, zoomLevel, isLoading]);

  if (renderError) {
    return (
      <div className="inapp-viewer-error">
        <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <h4>Could not render PDF</h4>
        <p>The PDF file is safely stored in your <strong>EventSchedule</strong> folder.</p>
      </div>
    );
  }

  return (
    <div className="pdf-canvas-container">
      {isLoading && (
        <div className="pdf-loading-spinner-wrap">
          <div className="spinner-large"></div>
          <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Rendering PDF...</span>
        </div>
      )}

      {!isLoading && numPages > 1 && (
        <div className="pdf-pagination-bar">
          <button
            type="button"
            className="btn-pdf-nav"
            disabled={currentPage <= 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            title="Previous Page"
          >
            ◀
          </button>
          <span>Page {currentPage} of {numPages}</span>
          <button
            type="button"
            className="btn-pdf-nav"
            disabled={currentPage >= numPages}
            onClick={() => setCurrentPage((p) => Math.min(p + 1, numPages))}
            title="Next Page"
          >
            ▶
          </button>
        </div>
      )}

      <div className="pdf-canvas-wrapper" style={{ display: isLoading ? 'none' : 'block' }}>
        <canvas ref={canvasRef} className="pdf-page-canvas" />
      </div>
    </div>
  );
}

export default function InAppDocumentViewerModal({
  isOpen,
  file, // { name, url, type, size, relativePath }
  onClose
}) {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [loadError, setLoadError] = useState(false);

  // Close only this viewer modal when Android hardware back button is pressed
  useEffect(() => {
    if (!isOpen) return;
    const unregister = backButtonManager.register(() => {
      onClose?.();
    }, 70); // Higher priority than Event Details modal (40)
    return () => unregister();
  }, [isOpen, onClose]);

  if (!isOpen || !file) return null;

  const fileName = (file.name || '').toLowerCase();
  const fileType = (file.type || '').toLowerCase();

  const isPdf = fileType === 'application/pdf' || fileName.endsWith('.pdf');
  const isImage = fileType.startsWith('image/') || fileName.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/);
  const isVideo = fileType.startsWith('video/') || fileName.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v|wmv)$/);
  const isAudio = fileType.startsWith('audio/') || fileName.match(/\.(mp3|wav|m4a|aac|ogg|flac|opus|wma)$/);
  const isText = fileType.startsWith('text/') || fileName.match(/\.(txt|csv|json|log|md|xml|html|js|css)$/);

  const fileUrl = file.url || file.displayUrl || file.fileUri || file.localDataUrl;

  const handleZoomIn = () => setZoomLevel((z) => Math.min(z + 0.25, 3));
  const handleZoomOut = () => setZoomLevel((z) => Math.max(z - 0.25, 0.5));
  const handleResetZoom = () => setZoomLevel(1);

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const getBadgeType = () => {
    if (isPdf) return 'PDF';
    if (isImage) return 'IMAGE';
    if (isVideo) return 'VIDEO';
    if (isAudio) return 'AUDIO';
    if (isText) return 'TEXT';
    return 'FILE';
  };

  return (
    <div
      className="inapp-viewer-overlay"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div className="inapp-viewer-container" onClick={(e) => e.stopPropagation()}>
        {/* Top Navigation Bar */}
        <div className="inapp-viewer-header">
          <div className="inapp-viewer-title-wrap">
            <span className="inapp-viewer-badge">{getBadgeType()}</span>
            <span className="inapp-viewer-title" title={file.name}>
              {file.name}
            </span>
          </div>

          <div className="inapp-viewer-actions">
            {isPdf && (
              <div className="inapp-zoom-controls">
                <button type="button" className="btn-zoom" onClick={handleZoomOut} title="Zoom Out">
                  −
                </button>
                <button type="button" className="btn-zoom-text" onClick={handleResetZoom}>
                  {Math.round(zoomLevel * 100)}%
                </button>
                <button type="button" className="btn-zoom" onClick={handleZoomIn} title="Zoom In">
                  +
                </button>
              </div>
            )}

            {/* Red Circle Close Button with White Cross (Small in radius) */}
            <button
              type="button"
              className="btn-inapp-close"
              onClick={onClose}
              aria-label="Close Viewer"
              title="Close"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* In-App Content Body */}
        <div className="inapp-viewer-body">
          {isVideo ? (
            <div className="inapp-video-wrapper">
              <video
                src={fileUrl}
                controls
                autoPlay
                playsInline
                className="inapp-video-player"
                onError={() => setLoadError(true)}
              >
                Your browser does not support playing this video file.
              </video>
            </div>
          ) : isAudio ? (
            <div className="inapp-audio-wrapper">
              <div className="audio-visual-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="var(--accent-gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '40px', height: '40px' }}>
                  <path d="M9 18V5l12-2v13"></path>
                  <circle cx="6" cy="18" r="3"></circle>
                  <circle cx="18" cy="16" r="3"></circle>
                </svg>
              </div>
              <h3 style={{ color: 'var(--text-primary)', textAlign: 'center', fontSize: '1.1rem' }}>{file.name}</h3>
              <audio
                src={fileUrl}
                controls
                autoPlay
                style={{ width: '90%', maxWidth: '450px' }}
                onError={() => setLoadError(true)}
              >
                Your browser does not support audio playback.
              </audio>
            </div>
          ) : isPdf ? (
            <PdfCanvasViewer
              fileUrl={fileUrl}
              zoomLevel={zoomLevel}
              onError={() => setLoadError(true)}
            />
          ) : isImage ? (
            <div className="inapp-image-wrapper">
              <img
                src={fileUrl}
                alt={file.name}
                className="inapp-preview-img"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : isText ? (
            <div className="inapp-text-wrapper">
              <iframe
                src={fileUrl}
                title={file.name}
                className="inapp-text-frame"
                onError={() => setLoadError(true)}
              />
            </div>
          ) : (
            <div className="inapp-generic-doc-box">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
              </svg>
              <h3>{file.name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
                Size: {formatFileSize(file.size)}
              </p>
              <div style={{ backgroundColor: 'var(--bg-surface-elevated)', padding: '10px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                📁 Saved in <strong>Documents/EventSchedule</strong>
              </div>
            </div>
          )}

          {loadError && !isPdf && (
            <div className="inapp-viewer-error">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <h4>Unable to preview file</h4>
              <p>The file is saved in your device's <strong>EventSchedule</strong> folder.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
