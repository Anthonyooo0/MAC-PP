import React, { useState, useRef, useCallback } from 'react';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES, getFileType, uploadPunchListAttachment } from '../supabase';
import { PunchListAttachment } from '../types';

interface AttachmentUploaderProps {
  projectId: number;
  itemId: string;
  currentCount: number;
  maxAttachments?: number;
  userEmail: string;
  onUploadComplete: (attachment: PunchListAttachment) => void;
  onError?: (error: string) => void;
  compact?: boolean;
}

export const AttachmentUploader: React.FC<AttachmentUploaderProps> = ({
  projectId,
  itemId,
  currentCount,
  maxAttachments = 5,
  userEmail,
  onUploadComplete,
  onError,
  compact = false
}) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpload = currentCount < maxAttachments;

  const handleError = (message: string) => {
    setError(message);
    onError?.(message);
    setTimeout(() => setError(null), 5000);
  };

  const processFile = useCallback(async (file: File) => {
    if (!canUpload) {
      handleError(`Maximum ${maxAttachments} attachments allowed`);
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      handleError('File size exceeds 25MB limit');
      return;
    }

    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      handleError('Invalid file type. Use images (jpg, png, gif, webp) or videos (mp4, mov, webm)');
      return;
    }

    setUploading(true);
    setProgress(10);
    setError(null);

    // Simulate progress (since Supabase doesn't provide upload progress easily)
    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + 10, 90));
    }, 200);

    const result = await uploadPunchListAttachment(projectId, itemId, file);

    clearInterval(progressInterval);

    if ('error' in result) {
      setUploading(false);
      setProgress(0);
      handleError(result.error);
      return;
    }

    setProgress(100);

    const attachment: PunchListAttachment = {
      id: Math.random().toString(36).substr(2, 9),
      url: result.url,
      type: getFileType(file.type),
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedBy: userEmail
    };

    setTimeout(() => {
      setUploading(false);
      setProgress(0);
      onUploadComplete(attachment);
    }, 300);
  }, [projectId, itemId, canUpload, maxAttachments, userEmail, onUploadComplete]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
    // Reset input so same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  if (!canUpload && !uploading) {
    return (
      <div className="text-xs text-slate-400 italic">
        Max {maxAttachments} attachments reached
      </div>
    );
  }

  if (compact) {
    return (
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />
        {uploading ? (
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span>{progress}%</span>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
            disabled={!canUpload}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add Photo/Video
          </button>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        onChange={handleFileSelect}
        className="hidden"
        disabled={uploading}
      />

      {uploading ? (
        <div className="border-2 border-blue-200 bg-blue-50 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-1">
                <span className="text-blue-700 font-medium">Uploading...</span>
                <span className="text-blue-600">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-blue-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500 transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-blue-400 bg-blue-50'
              : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'
          }`}
        >
          <svg className="w-8 h-8 mx-auto text-slate-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-slate-600 font-medium">
            {dragOver ? 'Drop file here' : 'Click or drag to upload'}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Images or videos up to 25MB ({currentCount}/{maxAttachments})
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {error}
        </div>
      )}
    </div>
  );
};
