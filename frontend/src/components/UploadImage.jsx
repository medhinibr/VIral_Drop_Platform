import React, { useState, useRef } from 'react';
import { apiService } from '../services/api';
import { UploadCloud, Image as ImageIcon, Loader2, CheckCircle2 } from 'lucide-react';

const UploadImage = ({ onUploadSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setError(null);
    const reader = new FileReader();
    reader.onload = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
    
    // Auto upload on select
    handleUpload(file);
  };

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', file);

    try {
      const result = await apiService.uploadImage(formData);
      if (onUploadSuccess) {
        onUploadSuccess(result.imageUrl);
      }
    } catch (err) {
      setError(err?.error || 'Failed to upload image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div 
        onClick={() => fileInputRef.current?.click()}
        className={`relative border-2 border-dashed ${error ? 'border-red-500' : 'border-museum-dark/20 hover:border-museum-dark/40'} bg-museum-paper/50 p-8 flex flex-col items-center justify-center cursor-pointer transition-colors duration-300 group min-h-[300px]`}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept="image/*" 
          onChange={handleFileChange}
        />
        
        {loading ? (
          <div className="flex flex-col items-center space-y-4 text-museum-dark">
            <Loader2 className="w-10 h-10 animate-spin" />
            <p className="text-sm font-medium tracking-wide uppercase">Archiving...</p>
          </div>
        ) : previewUrl ? (
          <div className="relative w-full h-full flex flex-col items-center space-y-4">
            <div className="w-48 h-48 border border-museum-dark/10 p-2 shadow-lg bg-white rotate-2 group-hover:rotate-0 transition-transform duration-500">
              <img src={previewUrl} alt="Preview" className="w-full h-full object-cover filter grayscale hover:grayscale-0 transition-all duration-700" />
            </div>
            <div className="absolute inset-0 bg-white/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300 backdrop-blur-sm">
              <p className="text-sm font-medium tracking-wide text-museum-dark bg-white px-4 py-2 uppercase border border-museum-dark/10 shadow-xl">
                Replace Exhibit
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center text-center space-y-4 text-museum-text/60 group-hover:text-museum-dark transition-colors duration-300">
            <div className="w-16 h-16 rounded-full bg-white border border-museum-dark/10 flex items-center justify-center shadow-sm group-hover:shadow-md transition-shadow duration-300 mb-2">
              <UploadCloud className="w-8 h-8" />
            </div>
            <div>
              <p className="font-serif text-xl text-museum-dark mb-1">Submit Artifact</p>
              <p className="text-xs uppercase tracking-wider">Click to browse or drag and drop</p>
            </div>
            <p className="text-xs text-museum-text/40 pt-4 border-t border-museum-dark/10 w-full">PNG, JPG, WEBP • Max 5MB</p>
          </div>
        )}
      </div>
      
      {error && (
        <p className="text-red-600 text-sm mt-3 font-medium bg-red-50 p-3 border-l-2 border-red-600 flex items-center">
          <span className="mr-2">⚠</span> {error}
        </p>
      )}
    </div>
  );
};

export default UploadImage;
