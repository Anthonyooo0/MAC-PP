import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://kmddumljaqqeykgxepvr.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImttZGR1bWxqYXFxZXlrZ3hlcHZyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg1Nzg2NjYsImV4cCI6MjA4NDE1NDY2Nn0.HWPMphCyJqnPMcutfc4wnu-9dpa7diM0WMuBfPXlbLg';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket for punch list attachments
const STORAGE_BUCKET = 'punch-list-attachments';

// Max file size: 25MB
export const MAX_FILE_SIZE = 25 * 1024 * 1024;

// Allowed file types
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
export const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime', 'video/webm'];
export const ALLOWED_FILE_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

// Upload file to Supabase Storage
export const uploadPunchListAttachment = async (
  projectId: number,
  itemId: string,
  file: File
): Promise<{ url: string; path: string } | { error: string }> => {
  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return { error: `File size exceeds 25MB limit` };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return { error: `File type not supported. Use images (jpg, png, gif, webp) or videos (mp4, mov, webm)` };
  }

  // Generate unique filename with timestamp
  const timestamp = Date.now();
  const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const filePath = `${projectId}/${itemId}/${timestamp}-${sanitizedName}`;

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    return { error: error.message };
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(data.path);

  return { url: urlData.publicUrl, path: data.path };
};

// Delete file from Supabase Storage
export const deletePunchListAttachment = async (
  filePath: string
): Promise<{ success: boolean; error?: string }> => {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    return { success: false, error: error.message };
  }

  return { success: true };
};

// Helper to determine file type
export const getFileType = (mimeType: string): 'image' | 'video' => {
  return ALLOWED_VIDEO_TYPES.includes(mimeType) ? 'video' : 'image';
};
