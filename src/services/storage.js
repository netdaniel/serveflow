import { supabase } from './supabase';

// File upload utility functions
export const uploadFile = async (file, bucketName = 'event-documents') => {
  // Create bucket if it doesn't exist (first time setup)
  // Note: In practice, buckets are usually created in the Supabase dashboard
  // This is just for reference - you'd typically create the bucket manually
  
  const fileName = `${Date.now()}-${file.name}`;
  
  const { data, error } = await supabase.storage
    .from(bucketName)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    console.error('Upload error:', error);
    throw error;
  }

  // Get public URL for the uploaded file
  const { data: publicUrlData } = supabase.storage
    .from(bucketName)
    .getPublicUrl(fileName);

  return {
    path: data.path,
    publicUrl: publicUrlData.publicUrl,
    fileName: file.name,
    fileSize: file.size,
    fileType: file.type
  };
};

export const deleteFile = async (filePath, bucketName = 'event-documents') => {
  const { error } = await supabase.storage
    .from(bucketName)
    .remove([filePath]);

  if (error) {
    console.error('Delete error:', error);
    throw error;
  }
};

export const listFiles = async (bucketName = 'event-documents', path = '') => {
  const { data, error } = await supabase.storage
    .from(bucketName)
    .list(path);

  if (error) {
    console.error('List error:', error);
    return [];
  }

  return data || [];
};