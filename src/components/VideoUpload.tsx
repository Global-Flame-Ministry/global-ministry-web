import React, { useState, useRef, useCallback } from 'react';
import { Film, Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { mediaApi } from '../api/mediaApi';
import type { MediaUploadResult } from '../api/mediaApi';

interface VideoUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  onUploaded?: (result: MediaUploadResult) => void;
  label?: string;
}

const MAX_BYTES = 100 * 1024 * 1024; // 100 MB
const ACCEPTED_TYPES = ['video/mp4', 'video/webm', 'video/ogg'];
const ACCEPTED_EXT = 'MP4, WEBM, OGG';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const VideoUpload: React.FC<VideoUploadProps> = ({
  value,
  onChange,
  onUploaded,
  label = 'Video',
}) => {
  const [state, setState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const uploadFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported file type. Please use ${ACCEPTED_EXT}.`);
      setState('error');
      return;
    }
    if (file.size > MAX_BYTES) {
      setErrorMsg('File is too large. Maximum size is 100 MB.');
      setState('error');
      return;
    }

    setState('uploading');
    setProgress(0);
    setErrorMsg('');

    // Upload through the backend which relays to Cloudinary
    try {
      const res = await mediaApi.uploadFile(file, undefined, (p) => setProgress(p));
      const result = res.data?.data;
      if (!result?.url) {
        setErrorMsg('Upload failed. Please try again.');
        setState('error');
        return;
      }
      onChange(result.url);
      onUploaded?.(result);
      setState('success');
      setProgress(100);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErrorMsg(message || 'Upload failed. Please try again.');
      setState('error');
    }
  }, [onChange, onUploaded]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = '';
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) uploadFile(file);
  };

  const handleRemove = () => {
    onChange(null);
    setState('idle');
    setProgress(0);
    setErrorMsg('');
  };

  // ── Render: preview state (uploaded / pre-existing URL) ───────────────
  if (value && state !== 'uploading') {
    return (
      <div className="space-y-2">
        {label && (
          <p className="text-[10px] font-black uppercase tracking-widest
            text-slate-500 dark:text-slate-400">
            {label}
          </p>
        )}
        <div className="relative rounded-xl overflow-hidden border
          border-slate-200 dark:border-slate-700 bg-slate-100
          dark:bg-slate-800 group">
          <video
            src={value}
            controls
            muted
            preload="metadata"
            className="w-full h-48 object-cover bg-black"
          />
          <div className="absolute top-2 left-2 flex items-center gap-1.5
            bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px]
            font-black uppercase tracking-widest">
            <CheckCircle2 className="w-3 h-3" /> Uploaded
          </div>
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600
              text-white rounded-full transition-colors opacity-0
              group-hover:opacity-100"
            title="Remove video"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }

  // ── Render: drop zone (idle / error states) ─────────────────────────────
  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[10px] font-black uppercase tracking-widest
          text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => state !== 'uploading' && inputRef.current?.click()}
        className={`relative rounded-xl border-2 border-dashed
          transition-all duration-200 cursor-pointer
          ${isDragging
            ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 scale-[1.01]'
            : state === 'error'
              ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
              : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10'
          } ${state === 'uploading' ? 'pointer-events-none' : ''}`}
      >
        <div className="flex flex-col items-center justify-center py-10 px-6 text-center">

          {state === 'uploading' ? (
            <>
              <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-4" />
              <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                Uploading... {progress}%
              </p>
              <div className="w-full max-w-xs bg-slate-200 dark:bg-slate-700
                rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-fuchsia-500 rounded-full transition-all
                    duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </>
          ) : state === 'error' ? (
            <>
              <AlertCircle className="w-10 h-10 text-red-500 mb-3" />
              <p className="text-sm font-bold text-red-600 dark:text-red-400 mb-1">
                Upload Failed
              </p>
              <p className="text-xs text-red-500 dark:text-red-400 mb-4">
                {errorMsg}
              </p>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setState('idle');
                  inputRef.current?.click();
                }}
                className="px-4 py-2 bg-fuchsia-600 hover:bg-fuchsia-500
                  text-white text-xs font-black uppercase tracking-widest
                  rounded-lg transition-colors"
              >
                Try Again
              </button>
            </>
          ) : (
            <>
              <div className={`w-14 h-14 rounded-full flex items-center
                justify-center mb-4 transition-colors ${
                  isDragging
                    ? 'bg-fuchsia-100 dark:bg-fuchsia-800/40'
                    : 'bg-slate-100 dark:bg-slate-700'
                }`}>
                {isDragging
                  ? <Upload className="w-7 h-7 text-fuchsia-500" />
                  : <Film className="w-7 h-7 text-slate-400 dark:text-slate-500" />
                }
              </div>

              {isDragging ? (
                <p className="text-sm font-black text-fuchsia-600
                  dark:text-fuchsia-400 uppercase tracking-widest">
                  Drop to upload
                </p>
              ) : (
                <>
                  <p className="text-xs font-black text-slate-600
                    dark:text-slate-300 uppercase tracking-widest mb-1">
                    Drag & Drop or Click to Select
                  </p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 mb-5">
                    {ACCEPTED_EXT} — max 100 MB
                  </p>
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); inputRef.current?.click(); }}
                    className="flex items-center gap-2 px-5 py-2.5
                      bg-fuchsia-600 hover:bg-fuchsia-500 text-white text-xs
                      font-black uppercase tracking-widest rounded-lg
                      transition-colors"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    Choose File
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>

      {state === 'idle' && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
          You can also drag and drop a file directly onto the area above.
        </p>
      )}
    </div>
  );
};

export default VideoUpload;