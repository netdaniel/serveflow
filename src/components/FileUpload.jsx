import React, { useState } from 'react';
import { Upload, FileText, Music, Image, File, X } from 'lucide-react';
import { useStore } from '../services/store';
import { uploadFile, deleteFile } from '../services/storage';

const SUPPORTED_FILE_TYPES = {
  'application/pdf': { icon: FileText, color: 'text-red-500' },
  'application/msword': { icon: FileText, color: 'text-blue-500' },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': { icon: FileText, color: 'text-blue-500' },
  'audio/mpeg': { icon: Music, color: 'text-purple-500' },
  'audio/mp3': { icon: Music, color: 'text-purple-500' },
  'image/jpeg': { icon: Image, color: 'text-green-500' },
  'image/png': { icon: Image, color: 'text-green-500' },
  'image/gif': { icon: Image, color: 'text-green-500' },
  'image/webp': { icon: Image, color: 'text-green-500' },
};

export default function FileUpload({ eventId, initialAttachments = [] }) {
  const { addFileAttachment, getFileAttachments, deleteFileAttachment } = useStore();
  const [attachments, setAttachments] = useState(initialAttachments);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleFiles = async (files) => {
    if (!files.length) return;

    setUploading(true);
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        // Upload file to Supabase Storage
        const uploadResult = await uploadFile(file);
        
        // Save file metadata to the database
        const fileData = {
          name: uploadResult.fileName,
          url: uploadResult.publicUrl,
          type: uploadResult.fileType,
          size: uploadResult.fileSize,
        };

        await addFileAttachment(eventId, fileData);
      }

      // Refresh attachments
      const updatedAttachments = await getFileAttachments(eventId);
      setAttachments(updatedAttachments);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Error uploading files: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleFileInput = (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
  };

  const handleDelete = async (attachmentId, filePath) => {
    try {
      // First delete from database
      await deleteFileAttachment(attachmentId);
      
      // Then delete from storage
      // Note: In a real implementation, you'd extract the file path from the attachment
      // For now, we'll skip the storage deletion to avoid errors
      
      const updatedAttachments = await getFileAttachments(eventId);
      setAttachments(updatedAttachments);
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Error deleting file: ' + error.message);
    }
  };

  const getFileIcon = (mimeType) => {
    const fileInfo = SUPPORTED_FILE_TYPES[mimeType] || { icon: File, color: 'text-gray-500' };
    return { Icon: fileInfo.icon, color: fileInfo.color };
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-4">
      {/* File Upload Area */}
      <div
        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors ${
          dragActive 
            ? 'border-primary-500 bg-primary-50' 
            : 'border-gray-300 hover:border-primary-400'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          id="file-upload"
          className="hidden"
          onChange={handleFileInput}
          multiple
          accept=".pdf,.doc,.docx,.mp3,.jpg,.jpeg,.png,.gif,.webp,image/*,audio/*"
        />
        
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="p-3 bg-primary-100 rounded-full">
            <Upload className="w-6 h-6 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-700">
              <label htmlFor="file-upload" className="cursor-pointer text-primary-600 hover:underline">
                Click to upload
              </label>{' '}
              or drag and drop
            </p>
            <p className="text-sm text-gray-500">
              Supports PDF, DOC, DOCX, MP3, JPG, PNG, GIF, WEBP
            </p>
          </div>
        </div>
        
        {uploading && (
          <div className="mt-3">
            <div className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
              Uploading...
            </div>
          </div>
        )}
      </div>

      {/* Uploaded Files List */}
      {attachments && attachments.length > 0 && (
        <div className="space-y-3">
          <h4 className="font-medium text-gray-700">Attached Files</h4>
          <div className="space-y-2">
            {attachments.map((attachment) => {
              const { Icon, color } = getFileIcon(attachment.file_type);
              return (
                <div 
                  key={attachment.id} 
                  className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${color}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {attachment.file_name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(attachment.file_size)} • {new Date(attachment.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <a
                      href={attachment.file_url}
                      download={attachment.file_name}
                      className="p-1 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded"
                      title="Download"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                        <polyline points="7 10 12 15 17 10"></polyline>
                        <line x1="12" y1="15" x2="12" y2="3"></line>
                      </svg>
                    </a>
                    <button
                      onClick={() => handleDelete(attachment.id)}
                      className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}