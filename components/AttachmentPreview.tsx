import React from 'react';
import { PunchListAttachment } from '../types';

interface AttachmentPreviewProps {
  attachments: PunchListAttachment[];
  onDelete?: (attachmentId: string) => void;
  onView: (attachment: PunchListAttachment) => void;
  readonly?: boolean;
  compact?: boolean;
}

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({
  attachments,
  onDelete,
  onView,
  readonly = false,
  compact = false
}) => {
  if (!attachments || attachments.length === 0) {
    return null;
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="relative group"
          >
            <button
              onClick={() => onView(attachment)}
              className="w-12 h-12 rounded-lg overflow-hidden bg-slate-100 border border-slate-200 hover:border-blue-400 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400"
            >
              {attachment.type === 'image' ? (
                <img
                  src={attachment.url}
                  alt={attachment.fileName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-800">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              )}
            </button>
            {!readonly && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(attachment.id);
                }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-xs font-bold hover:bg-red-600"
              >
                &times;
              </button>
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
      {attachments.map((attachment) => (
        <div
          key={attachment.id}
          className="relative group rounded-lg overflow-hidden border border-slate-200 bg-white shadow-sm hover:shadow-md transition-all"
        >
          <button
            onClick={() => onView(attachment)}
            className="w-full aspect-video bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-inset"
          >
            {attachment.type === 'image' ? (
              <img
                src={attachment.url}
                alt={attachment.fileName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-700 to-slate-900">
                <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
            )}
          </button>

          {/* File info overlay */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
            <p className="text-xs text-white truncate font-medium">{attachment.fileName}</p>
            <p className="text-[10px] text-white/70">{formatFileSize(attachment.fileSize)}</p>
          </div>

          {/* Delete button */}
          {!readonly && onDelete && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(attachment.id);
              }}
              className="absolute top-2 right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-sm font-bold hover:bg-red-600 shadow-lg"
            >
              &times;
            </button>
          )}

          {/* Type badge */}
          <div className="absolute top-2 left-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
              attachment.type === 'video'
                ? 'bg-purple-500 text-white'
                : 'bg-blue-500 text-white'
            }`}>
              {attachment.type}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};
