import React, { useState, useEffect } from 'react';
import { localStorageManager } from '../../services/localStorageManager.js';
import { nativeBridge } from '../../services/nativeBridge.js';
import { formatReadableDate } from '../../utils/dateFormatter.js';
import InAppDocumentViewerModal from './InAppDocumentViewerModal.jsx';

export default function EventDetailModal({
  isOpen,
  event,
  onClose,
  onEdit,
  onDelete,
  showToast
}) {
  const [activeViewerFile, setActiveViewerFile] = useState(null); // { name, url, type, size }
  const [fileStatuses, setFileStatuses] = useState({}); // { [attId]: { exists: boolean, displayUrl: string } }

  // Check file existence on device storage whenever modal opens
  useEffect(() => {
    let isMounted = true;

    async function checkAttachments() {
      if (!isOpen || !event?.attachments?.length) {
        setFileStatuses({});
        return;
      }

      const statusMap = {};
      for (const att of event.attachments) {
        const attId = att.id;
        const checkRes = await localStorageManager.verifyFileExists(att);
        statusMap[attId] = checkRes;
      }

      if (isMounted) {
        setFileStatuses(statusMap);
      }
    }

    checkAttachments();

    return () => {
      isMounted = false;
    };
  }, [isOpen, event]);

  if (!isOpen || !event) return null;

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  const attachments = event.attachments || [];

  const isVideoFile = (att) =>
    att.type?.startsWith('video/') ||
    att.name?.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v|wmv)$/i);

  const isImageFile = (att) =>
    att.type?.startsWith('image/') ||
    att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/i);

  const isAudioFile = (att) =>
    att.type?.startsWith('audio/') ||
    att.name?.match(/\.(mp3|wav|m4a|aac|ogg|flac|opus|wma)$/i);

  const visualAttachments = attachments.filter((att) => isImageFile(att) || isVideoFile(att));
  const otherAttachments = attachments.filter((att) => !isImageFile(att) && !isVideoFile(att));

  return (
    <>
      <div className="modal-overlay active" role="dialog" aria-modal="true" style={{ zIndex: 100 }} onClick={onClose}>
        <div className="modal-dialog modal-detail-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="modal-header" style={{ padding: '16px 20px' }}>
            <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 800 }}>Event Details</h2>
            <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div className="modal-body modal-form-scrollable" style={{ gap: '18px', padding: '18px 20px' }}>
            {/* 1. Title */}
            <div className="detail-field-group">
              <span className="detail-field-label">EVENT TITLE</span>
              <h1 className="detail-event-title-main">{event.name}</h1>
            </div>

            {/* 2. From Date & To Date */}
            <div className="detail-dates-grid">
              <div className="detail-date-box">
                <span className="detail-date-box-label">FROM DATE</span>
                <div className="detail-date-box-value">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{formatReadableDate(event.startDate)}</span>
                </div>
              </div>

              <div className="detail-date-box">
                <span className="detail-date-box-label">TO DATE</span>
                <div className="detail-date-box-value">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                    <line x1="16" y1="2" x2="16" y2="6"></line>
                    <line x1="8" y1="2" x2="8" y2="6"></line>
                    <line x1="3" y1="10" x2="21" y2="10"></line>
                  </svg>
                  <span>{formatReadableDate(event.endDate || event.startDate)}</span>
                </div>
              </div>
            </div>

            {/* 3. Location */}
            {event.location ? (
              <div className="detail-field-group">
                <span className="detail-field-label">LOCATION</span>
                <div className="detail-location-val">
                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <span>{event.location}</span>
                </div>
              </div>
            ) : null}

            {/* 4. Remarks / Description */}
            <div className="detail-field-group">
              <span className="detail-field-label">REMARKS & DESCRIPTION</span>
              <div className="detail-remarks-box-clean">
                {event.remarks ? event.remarks : <span className="text-muted" style={{ fontStyle: 'italic' }}>No remarks provided.</span>}
              </div>
            </div>

            {/* 5. Attached Media & Documents */}
            {attachments.length > 0 && (
              <div className="detail-field-group">
                <span className="detail-field-label">ATTACHED FILES ({attachments.length})</span>

                {/* Images & Videos Gallery */}
                {visualAttachments.length > 0 && (
                  <div className="detail-media-gallery" style={{ marginTop: '8px' }}>
                    {visualAttachments.map((mediaAtt, idx) => {
                      const attId = mediaAtt.id || idx;
                      const status = fileStatuses[attId];
                      const isMissing = status && !status.exists;
                      const fileSrc = status?.displayUrl || mediaAtt.displayUrl || mediaAtt.localDataUrl;
                      const isVid = isVideoFile(mediaAtt);

                      if (isMissing) {
                        return (
                          <div
                            key={attId}
                            className="media-gallery-item media-offline-item"
                            title="File deleted from device storage"
                          >
                            <div className="media-offline-content">
                              <svg
                                className="media-offline-icon"
                                viewBox="0 0 24 24"
                                fill="none"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                              <span className="media-offline-text" style={{ color: '#ef7d86' }}>File deleted</span>
                            </div>
                            <div className="media-overlay-info">
                              <span className="media-title">{mediaAtt.name}</span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={attId}
                          className="media-gallery-item"
                          onClick={() => {
                            if (!fileSrc) return;
                            // Show images and videos in the clean in-app previewer with red close button
                            setActiveViewerFile({
                              name: mediaAtt.name,
                              url: fileSrc,
                              type: mediaAtt.type || (isVid ? 'video/mp4' : 'image/jpeg'),
                              size: mediaAtt.size
                            });
                          }}
                        >
                          {isVid ? (
                            <div style={{ width: '100%', height: '100%', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#000000' }}>
                              <video
                                src={fileSrc}
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                preload="metadata"
                              />
                              <div style={{ position: 'absolute', width: '38px', height: '38px', borderRadius: '50%', backgroundColor: 'rgba(0,0,0,0.7)', border: '1px solid var(--accent-gold)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                                <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: '16px', height: '16px', marginLeft: '2px' }}>
                                  <polygon points="5 3 19 12 5 21 5 3"></polygon>
                                </svg>
                              </div>
                            </div>
                          ) : (
                            <img
                              src={fileSrc}
                              alt={mediaAtt.name}
                              className="media-gallery-thumb"
                              loading="lazy"
                            />
                          )}
                          <div className="media-overlay-info">
                            <span className="media-title">{mediaAtt.name}</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Documents, Audio & PDF Files */}
                {otherAttachments.length > 0 && (
                  <div className="detail-docs-list" style={{ marginTop: '8px' }}>
                    {otherAttachments.map((docAtt, idx) => {
                      const attId = docAtt.id || idx;
                      const status = fileStatuses[attId];
                      const isMissing = status && !status.exists;
                      const isPdf = docAtt.type === 'application/pdf' || docAtt.name?.toLowerCase().endsWith('.pdf');
                      const isAud = isAudioFile(docAtt);
                      const fileLink = status?.displayUrl || docAtt.displayUrl || docAtt.localDataUrl;

                      return (
                        <div
                          key={attId}
                          className={`detail-doc-card ${!isMissing ? 'clickable-doc-card' : ''}`}
                          onClick={async () => {
                            if (isMissing || !fileLink) {
                              showToast?.('File has been deleted from device storage', 'warning');
                              return;
                            }
                            // Open PDFs and documents using mobile device's default viewer app (Google Drive PDF, Adobe Acrobat, etc.)
                            try {
                              await localStorageManager.openFileWithNativeApp({
                                ...docAtt,
                                displayUrl: fileLink,
                                fileUri: status?.fileUri || docAtt.fileUri
                              });
                            } catch (e) {
                              console.error('Error opening with native app:', e);
                              showToast?.('Could not open file with device viewer', 'error');
                            }
                          }}
                        >
                          <div className={`doc-card-icon ${isPdf ? 'pdf' : isAud ? 'audio' : 'generic'}`}>
                            {isPdf ? (
                              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <text x="6" y="18" fill="currentColor" fontSize="6" fontWeight="bold">PDF</text>
                              </svg>
                            ) : isAud ? (
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M9 18V5l12-2v13"></path>
                                <circle cx="6" cy="18" r="3"></circle>
                                <circle cx="18" cy="16" r="3"></circle>
                              </svg>
                            ) : (
                              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                              </svg>
                            )}
                          </div>
                          <div className="doc-card-info">
                            <div className="doc-card-name" title={docAtt.name}>
                              {docAtt.name}
                            </div>
                            <div className="doc-card-meta">
                              <span>{formatFileSize(docAtt.size)}</span>
                              {isMissing ? (
                                <span className="badge-inapp-open" style={{ backgroundColor: 'rgba(224, 108, 117, 0.2)', color: '#ff8b94' }}>
                                  Deleted from storage
                                </span>
                              ) : (
                                <span className="badge-inapp-open">Tap to open</span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Clearly Visible Action Buttons */}
          <div className="modal-footer detail-modal-footer">
            <button
              type="button"
              className="btn btn-detail-delete"
              onClick={() => onDelete(event)}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              </svg>
              Delete
            </button>
            <button
              type="button"
              className="btn btn-detail-edit"
              onClick={() => onEdit(event)}
            >
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
              Edit
            </button>
          </div>
        </div>
      </div>

      {/* In-App Document & Media Viewer Modal (Images, PDFs, Docs) */}
      <InAppDocumentViewerModal
        isOpen={Boolean(activeViewerFile)}
        file={activeViewerFile}
        onClose={() => setActiveViewerFile(null)}
      />
    </>
  );
}
