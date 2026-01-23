import React, { useEffect, useCallback } from 'react';
import { PunchListAttachment } from '../types';

interface AttachmentLightboxProps {
  attachment: PunchListAttachment;
  allAttachments?: PunchListAttachment[];
  onClose: () => void;
  onNavigate?: (attachment: PunchListAttachment) => void;
}

export const AttachmentLightbox: React.FC<AttachmentLightboxProps> = ({
  attachment,
  allAttachments = [],
  onClose,
  onNavigate
}) => {
  const currentIndex = allAttachments.findIndex(a => a.id === attachment.id);
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allAttachments.length - 1;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowLeft' && hasPrev && onNavigate) {
      onNavigate(allAttachments[currentIndex - 1]);
    } else if (e.key === 'ArrowRight' && hasNext && onNavigate) {
      onNavigate(allAttachments[currentIndex + 1]);
    }
  }, [onClose, hasPrev, hasNext, onNavigate, allAttachments, currentIndex]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [handleKeyDown]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/50">
        <div className="flex items-center gap-3">
          <span className={`text-xs font-bold uppercase px-2 py-1 rounded ${
            attachment.type === 'video'
              ? 'bg-purple-500 text-white'
              : 'bg-blue-500 text-white'
          }`}>
            {attachment.type}
          </span>
          <div className="text-white">
            <p className="font-medium text-sm">{attachment.fileName}</p>
            <p className="text-xs text-white/60">
              {formatFileSize(attachment.fileSize)} | Uploaded {formatDate(attachment.uploadedAt)}
            </p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-center justify-center p-4 relative">
        {/* Previous button */}
        {hasPrev && onNavigate && (
          <button
            onClick={() => onNavigate(allAttachments[currentIndex - 1])}
            className="absolute left-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        )}

        {/* Media content */}
        <div className="max-w-full max-h-full flex items-center justify-center">
          {attachment.type === 'image' ? (
            <img
              src={attachment.url}
              alt={attachment.fileName}
              className="max-w-full max-h-[calc(100vh-120px)] object-contain rounded-lg shadow-2xl"
            />
          ) : (
            <video
              src={attachment.url}
              controls
              autoPlay
              className="max-w-full max-h-[calc(100vh-120px)] rounded-lg shadow-2xl"
            >
              Your browser does not support video playback.
            </video>
          )}
        </div>

        {/* Next button */}
        {hasNext && onNavigate && (
          <button
            onClick={() => onNavigate(allAttachments[currentIndex + 1])}
            className="absolute right-4 w-12 h-12 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors z-10"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        )}
      </div>

      {/* Footer with counter */}
      {allAttachments.length > 1 && (
        <div className="text-center py-3 text-white/60 text-sm">
          {currentIndex + 1} of {allAttachments.length}
        </div>
      )}

      {/* Click outside to close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
      />
    </div>
  );
};
