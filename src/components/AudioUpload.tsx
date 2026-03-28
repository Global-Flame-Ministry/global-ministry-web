import React, { useState, useRef } from 'react';
import { Upload, X, Music, Loader2 } from 'lucide-react';

const CLOUD_NAME = 'dveeb0yop';
const UPLOAD_PRESET = 'gfm_uploads';

interface AudioUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const AudioUpload: React.FC<AudioUploadProps> = ({
  value,
  onChange,
  label = 'Audio'
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadToCloudinary = async (file: File) => {
    // Validate file type
    if (!file.type.startsWith('audio/')) {
      alert('Please select an audio file (MP3, WAV, etc.)');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', UPLOAD_PRESET);
      formData.append('folder', 'global-flame-ministry/audio');
      formData.append('resource_type', 'video'); // Cloudinary uses "video" for audio

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`,
        { method: 'POST', body: formData }
      );

      const data = await response.json();

      if (data.secure_url) {
        onChange(data.secure_url);
      } else {
        alert('Upload failed. Please try again.');
      }
    } catch {
      alert('Upload failed. Please check your connection.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadToCloudinary(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadToCloudinary(file);
  };

  return (
    <div>
      <label className="block text-xs font-bold uppercase tracking-widest text-slate-500 mb-2">
        {label}
      </label>

      {/* Audio Player Preview */}
      {value && !isUploading && (
        <div className="mb-3 p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-fuchsia-600" />
              <span className="text-sm font-medium text-slate-700">
                Audio uploaded
              </span>
            </div>
            <button
              type="button"
              onClick={() => onChange('')}
              className="text-red-500 hover:text-red-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <audio controls className="w-full">
            <source src={value} />
          </audio>
        </div>
      )}

      {/* Upload Area */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onClick={() => !isUploading && fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 ${
            isDragging
              ? 'border-fuchsia-500 bg-fuchsia-50'
              : 'border-slate-200 hover:border-fuchsia-400 hover:bg-slate-50'
          } ${isUploading ? 'cursor-not-allowed' : ''}`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-fuchsia-500 animate-spin" />
              <p className="text-sm font-medium text-slate-600">
                Uploading audio...
              </p>
              <p className="text-xs text-slate-400">
                Large files may take a moment
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
                <Upload className="w-6 h-6 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-700">
                  Click to upload audio
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  MP3, WAV, M4A up to 200MB
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Change audio button */}
      {value && !isUploading && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-2 flex items-center gap-2 text-xs font-bold text-fuchsia-600 hover:text-fuchsia-800 uppercase tracking-widest transition-colors"
        >
          <Music className="w-3.5 h-3.5" />
          Change Audio File
        </button>
      )}

      {/* Hidden file input — audio only */}
      <input
        ref={fileInputRef}
        type="file"
        accept="audio/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Manual URL fallback */}
      <div className="mt-3">
        <p className="text-xs text-slate-400 mb-1">
          Or paste an audio URL directly:
        </p>
        <input
          type="url"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://example.com/sermon.mp3"
          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs outline-none focus:border-fuchsia-500 transition-all text-slate-600 placeholder:text-slate-300"
        />
      </div>
    </div>
  );
};

export default AudioUpload;