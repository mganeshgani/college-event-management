import { useRef, useState, useCallback } from 'react';
import { PhotoIcon, XMarkIcon, ArrowUpTrayIcon } from '@heroicons/react/24/outline';
import { uploadImageToCloudinary } from '../../services/cloudinaryService';

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
}

const ACCEPTED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_SIZE_MB = 5;

export default function ImageUpload({ value, onChange, label = 'Poster Image' }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [dragging, setDragging] = useState(false);

  const processFile = useCallback(
    async (file: File) => {
      setError('');

      if (!ACCEPTED_TYPES.includes(file.type)) {
        setError('Only JPG, PNG, WebP, or GIF images are allowed.');
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setError(`Image must be smaller than ${MAX_SIZE_MB}MB.`);
        return;
      }

      setUploading(true);
      setProgress(0);
      try {
        const url = await uploadImageToCloudinary(file, setProgress);
        onChange(url);
      } catch (err: any) {
        setError(err.message || 'Upload failed. Please try again.');
      } finally {
        setUploading(false);
      }
    },
    [onChange]
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemove = () => {
    onChange('');
    setError('');
    setProgress(0);
  };

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label} (optional)</label>

      {/* Preview */}
      {value && !uploading && (
        <div className="mb-3 relative group w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700" style={{ maxHeight: '220px' }}>
          <img
            src={value}
            alt="Poster preview"
            className="w-full object-cover"
            style={{ maxHeight: '220px' }}
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove image"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="absolute bottom-2 right-2 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg px-3 py-1.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ArrowUpTrayIcon className="w-3.5 h-3.5" />
            Change
          </button>
        </div>
      )}

      {/* Upload zone */}
      {!value && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && inputRef.current?.click()}
          className={`w-full border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
            ${dragging
              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-gray-50 dark:hover:bg-gray-800/50'
            }
            ${uploading ? 'cursor-not-allowed opacity-70' : ''}
          `}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <ArrowUpTrayIcon className="w-8 h-8 text-blue-500 animate-bounce" />
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Uploading… {progress}%</p>
              <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-500 dark:text-gray-400">
              <PhotoIcon className="w-10 h-10" />
              <p className="text-sm font-medium">
                Drag & drop an image, or <span className="text-blue-600 dark:text-blue-400 underline">browse</span>
              </p>
              <p className="text-xs">JPG, PNG, WebP, GIF — max {MAX_SIZE_MB}MB</p>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(',')}
        className="hidden"
        onChange={handleFileChange}
      />

      {/* Error */}
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      {/* URL fallback */}
      <div className="mt-3">
        <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
          Or paste an image URL directly
        </label>
        <input
          type="url"
          value={value}
          onChange={(e) => { setError(''); onChange(e.target.value); }}
          placeholder="https://example.com/poster.jpg"
          className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );
}
