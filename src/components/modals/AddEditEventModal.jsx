import React, { useState, useEffect, useRef } from 'react';
import { localStorageManager } from '../../services/localStorageManager.js';
import { nativeBridge } from '../../services/nativeBridge.js';

const MAX_FILES = 10;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

export default function AddEditEventModal({
  isOpen,
  editEvent,
  onSave,
  onClose,
  onOpenDatePicker,
  showToast
}) {
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [location, setLocation] = useState('');
  const [remarks, setRemarks] = useState('');
  
  // Attachments: array of { id, file, name, size, type, localDataUrl, displayUrl, relativePath, fileUri, isNew }
  const [attachments, setAttachments] = useState([]);
  const [removedExistingAttachments, setRemovedExistingAttachments] = useState([]);
  const [confirmDeleteAtt, setConfirmDeleteAtt] = useState(null); // attachment object to confirm deletion
  const [isSaving, setIsSaving] = useState(false);
  const [savingProgressSummary, setSavingProgressSummary] = useState('');

  const fileInputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  // Sync state when modal opens or editEvent changes
  useEffect(() => {
    if (isOpen) {
      if (editEvent) {
        setName(editEvent.name || '');
        setStartDate(editEvent.startDate || new Date().toISOString().split('T')[0]);
        setEndDate(editEvent.endDate || editEvent.startDate || new Date().toISOString().split('T')[0]);
        setLocation(editEvent.location || '');
        setRemarks(editEvent.remarks || '');
        setAttachments(
          (editEvent.attachments || []).map((att, idx) => ({
            ...att,
            id: att.id || `att_${idx}_${Date.now()}`,
            isNew: false
          }))
        );
      } else {
        // Reset form for fresh create
        setName('');
        const today = new Date().toISOString().split('T')[0];
        setStartDate(today);
        setEndDate(today);
        setLocation('');
        setRemarks('');
        setAttachments([]);
      }
      setRemovedExistingAttachments([]);
      setConfirmDeleteAtt(null);
      setIsSaving(false);
      setSavingProgressSummary('');
    }
  }, [isOpen, editEvent]);

  if (!isOpen) return null;

  // Format file size nicely (e.g., "2.4 MB" or "450 KB")
  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return '';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  // Process incoming files from file picker or drag-drop
  const handleFilesSelected = (fileList) => {
    const filesArray = Array.from(fileList);
    if (!filesArray.length) return;

    // Check Max 10 Files Constraint
    const currentCount = attachments.length;
    const availableSlots = MAX_FILES - currentCount;

    if (availableSlots <= 0) {
      showToast?.(`Maximum limit of ${MAX_FILES} attachments reached per event.`, 'error');
      nativeBridge.triggerHaptic('warning');
      return;
    }

    const filesToProcess = filesArray.slice(0, availableSlots);
    if (filesArray.length > availableSlots) {
      showToast?.(`Only ${availableSlots} more file(s) could be added (max ${MAX_FILES}).`, 'info');
    }

    const newAttachments = [];

    filesToProcess.forEach((file) => {
      // Check 10 MB per file limit
      if (file.size > MAX_FILE_SIZE_BYTES) {
        showToast?.(`"${file.name}" exceeds the 10 MB limit (${(file.size / (1024 * 1024)).toFixed(2)} MB).`, 'error');
        nativeBridge.triggerHaptic('warning');
        return;
      }

      const tempId = `new_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const isImg = file.type.startsWith('image/');

      const itemObj = {
        id: tempId,
        file,
        name: file.name,
        size: file.size,
        type: file.type || 'application/octet-stream',
        localDataUrl: null,
        displayUrl: null,
        relativePath: null,
        fileUri: null,
        isNew: true
      };

      // Generate instant preview for UI
      if (isImg) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setAttachments((prev) =>
            prev.map((att) => (att.id === tempId ? { ...att, localDataUrl: e.target.result, displayUrl: e.target.result } : att))
          );
        };
        reader.readAsDataURL(file);
      }

      newAttachments.push(itemObj);
    });

    if (newAttachments.length > 0) {
      setAttachments((prev) => [...prev, ...newAttachments]);
      nativeBridge.triggerHaptic('light');
    }
  };

  const handleConfirmRemoveAttachment = () => {
    if (!confirmDeleteAtt) return;
    const attId = confirmDeleteAtt.id;
    const target = attachments.find((a) => a.id === attId);
    if (target && !target.isNew) {
      setRemovedExistingAttachments((prev) => [...prev, target]);
    }
    setAttachments((prev) => prev.filter((a) => a.id !== attId));
    setConfirmDeleteAtt(null);
    nativeBridge.triggerHaptic('light');
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    if (e.dataTransfer?.files?.length) {
      handleFilesSelected(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      showToast?.('Please add event title', 'error');
      nativeBridge.triggerHaptic('warning');
      return;
    }

    if (!location.trim()) {
      showToast?.('Please add event location', 'error');
      nativeBridge.triggerHaptic('warning');
      return;
    }

    if (endDate < startDate) {
      showToast?.('End date cannot be earlier than start date', 'error');
      nativeBridge.triggerHaptic('warning');
      return;
    }

    setIsSaving(true);
    nativeBridge.triggerHaptic('light');

    // Clean up any files the user deleted from existing event attachments
    if (removedExistingAttachments.length > 0) {
      for (const removedAtt of removedExistingAttachments) {
        await localStorageManager.deleteFile(removedAtt);
      }
    }

    const finalAttachments = [];

    // Save each new attachment directly to device "EventSchedule" directory
    for (let i = 0; i < attachments.length; i++) {
      const att = attachments[i];
      if (att.isNew && att.file) {
        setSavingProgressSummary(`Saving "${att.name}" (${i + 1}/${attachments.length})...`);
        try {
          const savedMeta = await localStorageManager.saveFile(att.file);
          finalAttachments.push(savedMeta);
        } catch (saveErr) {
          console.error(`Error saving ${att.name}:`, saveErr);
          showToast?.(`Could not save "${att.name}": ${saveErr.message}`, 'error');
        }
      } else {
        // Retain already stored attachment metadata
        finalAttachments.push({
          id: att.id,
          name: att.name,
          storedFileName: att.storedFileName,
          relativePath: att.relativePath,
          directoryType: att.directoryType,
          fileUri: att.fileUri,
          displayUrl: att.displayUrl || att.localDataUrl,
          type: att.type,
          size: att.size,
          createdAt: att.createdAt || new Date().toISOString()
        });
      }
    }

    const eventPayload = {
      ...(editEvent?.id ? { id: editEvent.id } : {}),
      name: name.trim(),
      startDate,
      endDate,
      location: location.trim(),
      remarks: remarks.trim(),
      attachments: finalAttachments
    };

    setIsSaving(false);
    onSave(eventPayload);
  };

  return (
    <>
      <div className="modal-overlay active" role="dialog" aria-modal="true" onClick={onClose}>
        <div className="modal-dialog modal-event-dialog" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <div className="modal-title-wrap">
              <h2 className="modal-title">{editEvent ? 'Edit Event' : 'Create New Event'}</h2>
            </div>
            <button type="button" className="btn-modal-close" onClick={onClose} aria-label="Close modal">
              <svg viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="modal-form-scrollable">
            <div className="modal-body" style={{ gap: '16px' }}>
              {/* 1. Event Title */}
              <div className="form-group">
                <label className="form-label">
                  Event Title <span className="text-danger">*</span>
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="add event title"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              {/* 2. Date Range Pickers */}
              <div className="form-row-2">
                <div className="form-group">
                  <label className="form-label">
                    Start Date (From) <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    className="picker-trigger-btn"
                    onClick={() =>
                      onOpenDatePicker(
                        'startDate',
                        startDate,
                        (val) => {
                          setStartDate(val);
                          if (endDate < val) setEndDate(val);
                        },
                        'Select Start Date'
                      )
                    }
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{startDate}</span>
                  </button>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    End Date (To) <span className="text-danger">*</span>
                  </label>
                  <button
                    type="button"
                    className="picker-trigger-btn"
                    onClick={() =>
                      onOpenDatePicker('endDate', endDate, (val) => setEndDate(val), 'Select End Date')
                    }
                  >
                    <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                    <span>{endDate}</span>
                  </button>
                </div>
              </div>

              {/* 3. Location / Venue (Must) */}
              <div className="form-group">
                <label className="form-label">
                  Location <span className="text-danger">*</span>
                </label>
                <div className="input-icon-wrap">
                  <svg
                    className="input-icon"
                    viewBox="0 0 24 24"
                    fill="none"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                  <input
                    type="text"
                    className="form-input with-icon"
                    placeholder="add event location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* 4. Remarks / Description (Optional) */}
              <div className="form-group">
                <label className="form-label">
                  Remarks <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>(Optional)</span>
                </label>
                <textarea
                  className="form-textarea"
                  rows="3"
                  placeholder="add remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                ></textarea>
              </div>

              {/* 5. Upload Attachments Section (Minimal & Clean) */}
              <div className="form-group attachments-section">
                <div className="attachments-header">
                  <label className="form-label" style={{ marginBottom: 0 }}>
                    Attachments <span className="text-muted" style={{ fontWeight: 'normal', fontSize: '0.8rem' }}>(Optional)</span>
                  </label>
                  <span className="attachments-counter">
                    {attachments.length} / {MAX_FILES}
                  </span>
                </div>

                {/* Drag & Drop Upload Zone */}
                {attachments.length < MAX_FILES && (
                  <div
                    className={`file-dropzone ${isDragOver ? 'drag-over' : ''}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      style={{ display: 'none' }}
                      multiple
                      accept="*/*"
                      onChange={(e) => {
                        if (e.target.files) {
                          handleFilesSelected(e.target.files);
                          e.target.value = '';
                        }
                      }}
                    />
                    <div className="dropzone-icon">
                      <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="17 8 12 3 7 8"></polyline>
                        <line x1="12" y1="3" x2="12" y2="15"></line>
                      </svg>
                    </div>
                    <div className="dropzone-text">
                      <strong>Select files</strong> or drag here
                    </div>
                    <div className="dropzone-subtext">Images, Videos, PDFs, Audios, Docs (Max 10 MB)</div>
                  </div>
                )}

                {/* Attachments Preview: Images/Videos in Grid, PDFs/Docs in Complete Rows */}
                {attachments.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* Visual Media (Images & Videos) Grid */}
                    {attachments.some((att) => att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/i) || att.type?.startsWith('video/') || att.name?.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v)$/i)) && (
                      <div className="attachments-preview-grid">
                        {attachments
                          .filter((att) => att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/i) || att.type?.startsWith('video/') || att.name?.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v)$/i))
                          .map((att) => {
                            const isImg = att.type?.startsWith('image/') || att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/i);
                            const isVid = att.type?.startsWith('video/') || att.name?.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v)$/i);

                            return (
                              <div key={att.id} className="attachment-preview-card">
                                <button
                                  type="button"
                                  className="btn-remove-attachment"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteAtt(att);
                                  }}
                                  title="Remove file"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>

                                {isImg && (att.displayUrl || att.localDataUrl) ? (
                                  <div className="preview-img-wrap">
                                    <img src={att.displayUrl || att.localDataUrl} alt={att.name} className="preview-thumbnail" />
                                  </div>
                                ) : isVid ? (
                                  <div className="preview-doc-wrap other-doc" style={{ backgroundColor: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa' }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                      <polygon points="23 7 16 12 23 17 23 7"></polygon>
                                      <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                                    </svg>
                                  </div>
                                ) : null}

                                <div className="preview-info">
                                  <div className="preview-filename" title={att.name}>
                                    {att.name}
                                  </div>
                                  <div className="preview-meta">
                                    <span>{formatFileSize(att.size)}</span>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* PDF and Document Files (Rendered as Complete Rows) */}
                    {attachments.some((att) => !att.type?.startsWith('image/') && !att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/i) && !att.type?.startsWith('video/') && !att.name?.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v)$/i)) && (
                      <div className="detail-docs-list">
                        {attachments
                          .filter((att) => !att.type?.startsWith('image/') && !att.name?.match(/\.(jpg|jpeg|png|webp|gif|svg|bmp|ico|heic)$/i) && !att.type?.startsWith('video/') && !att.name?.match(/\.(mp4|webm|mkv|mov|avi|3gp|m4v)$/i))
                          .map((att) => {
                            const isPdf = att.type === 'application/pdf' || att.name?.toLowerCase().endsWith('.pdf');
                            const isAud = att.type?.startsWith('audio/') || att.name?.match(/\.(mp3|wav|m4a|aac|ogg|flac|opus|wma)$/i);

                            return (
                              <div key={att.id} className="detail-doc-card" style={{ position: 'relative', paddingRight: '44px' }}>
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
                                  <div className="doc-card-name" title={att.name}>
                                    {att.name}
                                  </div>
                                  <div className="doc-card-meta">
                                    <span>{formatFileSize(att.size)}</span>
                                    {isPdf && <span style={{ color: '#ef4444', fontWeight: 600 }}>PDF Document</span>}
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  className="btn-remove-attachment"
                                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setConfirmDeleteAtt(att);
                                  }}
                                  title="Remove file"
                                >
                                  <svg viewBox="0 0 24 24" fill="none" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                  </svg>
                                </button>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Saving Progress Status Banner */}
              {isSaving && (
                <div className="uploading-banner">
                  <div className="spinner-small"></div>
                  <span>{savingProgressSummary || 'Saving files to EventSchedule folder...'}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={onClose} disabled={isSaving}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="spinner-small"></div> Saving...
                  </>
                ) : editEvent ? (
                  'Save Changes'
                ) : (
                  'Create Event'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Confirmation Dialog for Removing Attachment */}
      {confirmDeleteAtt && (
        <div className="modal-overlay active modal-center-overlay" role="dialog" aria-modal="true" onClick={() => setConfirmDeleteAtt(null)}>
          <div className="modal-dialog modal-confirm-dialog" style={{ maxWidth: '360px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Remove File</h2>
              <button type="button" className="btn-close-modal" onClick={() => setConfirmDeleteAtt(null)} aria-label="Close">
                <svg viewBox="0 0 24 24" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            </div>
            <div className="modal-body" style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
              <p>Are you sure you want to delete <strong>"{confirmDeleteAtt.name}"</strong>?</p>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" onClick={() => setConfirmDeleteAtt(null)}>
                Cancel
              </button>
              <button type="button" className="btn btn-danger" onClick={handleConfirmRemoveAttachment}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}



