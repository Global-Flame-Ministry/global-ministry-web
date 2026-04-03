import React, { useState, useRef } from 'react';
import { Upload, X, Loader, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const CLOUDINARY_CLOUD_NAME = 'dveeb0yop';
const CLOUDINARY_UPLOAD_PRESET = 'gfm_uploads';

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Image',
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const inputRef                      = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file.');
      return;
    }

    // Validate file size — 10MB max
    if (file.size > 10 * 1024 * 1024) {
      setError('Image must be under 10MB.');
      return;
    }

    setError(null);
    setIsUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
      formData.append('folder', 'gfm');

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        { method: 'POST', body: formData }
      );

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      onChange(data.secure_url);
    } catch {
      setError('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
      // Reset input so same file can be re-selected
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const handleRemove = () => {
    onChange('');
    setError(null);
  };

  return (
    <div>
      <label className="text-xs font-bold uppercase tracking-widest mb-1.5 block text-slate-600 dark:text-zinc-400">
        {label}
      </label>

      {/* Preview — shown when image is uploaded */}
      {value ? (
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-white/10">
          <img
            src={value}
            alt="Uploaded"
            className="w-full h-40 object-cover"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80
              text-white rounded-lg transition-colors backdrop-blur-sm"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        /* Upload zone — shown when no image */
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={isUploading}
          className={`w-full flex flex-col items-center justify-center gap-3
            py-8 border-2 border-dashed rounded-xl transition-all
            ${isUploading
              ? 'border-fuchsia-300 bg-fuchsia-50/50 cursor-wait'
              : 'border-slate-200 hover:border-fuchsia-400 hover:bg-fuchsia-50/30 cursor-pointer dark:border-white/10 dark:hover:border-fuchsia-500/50'
            }`}
        >
          {isUploading ? (
            <>
              <Loader className="w-6 h-6 text-fuchsia-500 animate-spin" />
              <span className="text-xs font-bold uppercase tracking-widest text-fuchsia-500">
                Uploading...
              </span>
            </>
          ) : (
            <>
              <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/10
                flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-slate-400" />
              </div>
              <div className="text-center">
                <span className="text-xs font-bold uppercase tracking-widest
                  text-slate-500 dark:text-zinc-400 block mb-1">
                  Click to select image
                </span>
                <span className="text-[10px] text-slate-400 dark:text-zinc-600">
                  JPG, PNG, WEBP — max 10MB
                </span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600
                hover:bg-fuchsia-500 text-white rounded-lg transition-colors">
                <Upload className="w-3.5 h-3.5" />
                <span className="text-xs font-bold uppercase tracking-widest">
                  Choose File
                </span>
              </div>
            </>
          )}
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Error */}
      {error && (
        <p className="text-xs text-red-500 mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
};

export default ImageUpload;