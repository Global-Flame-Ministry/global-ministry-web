import React, { useState, useRef, useCallback } from 'react';
import { ImageIcon, Upload, X, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { mediaApi } from '../api/mediaApi';

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  /** Tighter layout for use inside modal forms. */
  compact?: boolean;
  /** Notifies the parent when an upload starts/finishes. */
  onUploadingChange?: (uploading: boolean) => void;
}

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ACCEPTED_EXT   = 'JPG, PNG, WEBP';

type UploadState = 'idle' | 'uploading' | 'success' | 'error';

const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  label = 'Image',
  compact = false,
  onUploadingChange,
}) => {
  const [state, setState]       = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // ── Core upload logic ────────────────────────────────────────────────────
  const uploadFile = useCallback(async (file: File) => {
    // Validate type
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setErrorMsg(`Unsupported file type. Please use ${ACCEPTED_EXT}.`);
      setState('error');
      return;
    }
    // Validate size
    if (file.size > MAX_BYTES) {
      setErrorMsg('File is too large. Maximum size is 10 MB.');
      setState('error');
      return;
    }

    setState('uploading');
    setProgress(0);
    setErrorMsg('');
    onUploadingChange?.(true);

    // Upload through the backend which relays to Cloudinary
    try {
      const res = await mediaApi.uploadFile(file, undefined, (p) => setProgress(p));
      const url: string | undefined = res.data?.data?.url;
      if (!url) {
        setErrorMsg('Upload failed. Please try again.');
        setState('error');
        return;
      }
      onChange(url);
      setState('success');
      setProgress(100);
    } catch (err) {
      const message = (err as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;
      setErrorMsg(message || 'Upload failed. Please try again.');
      setState('error');
    } finally {
      onUploadingChange?.(false);
    }
  }, [onChange, onUploadingChange]);

  // ── File input change ────────────────────────────────────────────────────
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    // Reset input so the same file can be re-selected after removal
    e.target.value = '';
  };

  // ── Drag events ──────────────────────────────────────────────────────────
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Visually signal a valid drop target
    e.dataTransfer.dropEffect = 'copy';
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // Only fire when leaving the drop zone itself, not child elements
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

  // ── Remove ───────────────────────────────────────────────────────────────
  const handleRemove = () => {
    onChange(null);
    setState('idle');
    setProgress(0);
    setErrorMsg('');
  };

  const openPicker = () => inputRef.current?.click();

  const zoneClass = `relative rounded-xl border-2 border-dashed
    transition-all duration-200 cursor-pointer
    ${isDragging
      ? 'border-fuchsia-500 bg-fuchsia-50 dark:bg-fuchsia-900/20 scale-[1.01]'
      : state === 'error'
        ? 'border-red-400 bg-red-50 dark:bg-red-900/10'
        : 'border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 hover:border-fuchsia-400 hover:bg-fuchsia-50 dark:hover:bg-fuchsia-900/10'
    } ${state === 'uploading' ? 'pointer-events-none' : ''}`;

  const progressBar = (
    <div className={`w-full bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden
      ${compact ? 'max-w-[10rem] h-1' : 'max-w-xs h-1.5'}`}>
      <div
        className="h-full bg-fuchsia-500 rounded-full transition-all duration-300"
        style={{ width: `${progress}%` }}
      />
    </div>
  );

  return (
    <div className="space-y-2">
      {label && (
        <p className="text-[10px] font-black uppercase tracking-widest
          text-slate-500 dark:text-slate-400">
          {label}
        </p>
      )}

      {/* Hidden file input — kept mounted in every state so "Change" works */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        onChange={handleFileChange}
        className="hidden"
      />

      {value && state !== 'uploading' ? (
        // ── Preview state (uploaded / pre-existing URL) ──────────────────
        <div className="space-y-2">
          <div className="relative rounded-xl overflow-hidden border
            border-slate-200 dark:border-slate-700 bg-slate-100
            dark:bg-slate-800 group">
            <img
              src={value}
              alt="Uploaded"
              loading="lazy"
              className={`w-full object-cover ${compact ? 'h-28' : 'h-48'}`}
            />
            <div className="absolute top-2 left-2 flex items-center gap-1.5
              bg-emerald-500 text-white px-2.5 py-1 rounded-full text-[10px]
              font-black uppercase tracking-widest">
              <CheckCircle2 className="w-3 h-3" /> Uploaded
            </div>
            {!compact && (
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 p-1.5 bg-red-500 hover:bg-red-600
                  text-white rounded-full transition-colors opacity-0
                  group-hover:opacity-100"
                title="Remove image"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
          {compact && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={openPicker}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800
                  hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700
                  dark:text-slate-200 text-[11px] font-black uppercase
                  tracking-widest rounded-lg transition-colors"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="flex-1 py-2 bg-red-50 dark:bg-red-900/20
                  hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600
                  dark:text-red-400 text-[11px] font-black uppercase
                  tracking-widest rounded-lg transition-colors"
              >
                Remove
              </button>
            </div>
          )}
        </div>
      ) : (
        // ── Drop zone (idle / uploading / error states) ──────────────────
        <div
          onDragEnter={handleDragEnter}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => state !== 'uploading' && openPicker()}
          className={zoneClass}
        >
          {compact ? (
            <div className="flex flex-col items-center justify-center py-4 px-4 text-center">
              {state === 'uploading' ? (
                <>
                  <Loader2 className="w-6 h-6 text-fuchsia-500 animate-spin mb-2" />
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mb-2">
                    Uploading… {progress}%
                  </p>
                  {progressBar}
                </>
              ) : (
                <>
                  <div className={`w-9 h-9 rounded-full flex items-center
                    justify-center mb-2 transition-colors ${
                      isDragging
                        ? 'bg-fuchsia-100 dark:bg-fuchsia-800/40'
                        : 'bg-slate-100 dark:bg-slate-700'
                    }`}>
                    {isDragging
                      ? <Upload className="w-4 h-4 text-fuchsia-500" />
                      : <ImageIcon className="w-4 h-4 text-slate-400 dark:text-slate-500" />
                    }
                  </div>
                  <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                    {isDragging ? 'Drop to upload' : `Click or drop image · ${ACCEPTED_EXT} · max 10 MB`}
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 px-6 text-center">
              {state === 'uploading' ? (
                <>
                  <Loader2 className="w-10 h-10 text-fuchsia-500 animate-spin mb-4" />
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-3">
                    Uploading... {progress}%
                  </p>
                  {progressBar}
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
                      openPicker();
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
                      : <ImageIcon className="w-7 h-7 text-slate-400 dark:text-slate-500" />
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
                        {ACCEPTED_EXT} — max 10 MB
                      </p>
                      <button
                        type="button"
                        onClick={e => { e.stopPropagation(); openPicker(); }}
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
          )}
        </div>
      )}

      {/* Inline error under the zone for compact/modal usage */}
      {compact && state === 'error' && (
        <p className="flex items-center gap-1.5 text-xs font-medium text-red-600 dark:text-red-400">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" /> {errorMsg}
        </p>
      )}

      {/* Helper text (full-size only) */}
      {!compact && state === 'idle' && (
        <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center">
          You can also drag and drop a file directly onto the area above.
        </p>
      )}
    </div>
  );
};

export default ImageUpload;
