import { useState, useRef, useCallback, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../lib/api';
import type { UserSettings } from '../lib/types';
import ErrorMessage from '../components/ErrorMessage';
import LoadingSpinner from '../components/LoadingSpinner';
import { ImageUp, Upload, X, Info } from 'lucide-react';

export default function UploadImage() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [aiSettings, setAiSettings] = useState<UserSettings | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('/settings').then((res) => setAiSettings(res.data)).catch(() => {});
  }, []);

  const handleFile = useCallback((f: File) => {
    if (!f.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      setError('File too large (max 10MB)');
      return;
    }
    setError('');
    setFile(f);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(f);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const f = e.dataTransfer.files[0];
      if (f) handleFile(f);
    },
    [handleFile]
  );

  const clearFile = () => {
    setFile(null);
    setPreview(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async () => {
    if (!file) return;
    setError('');
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      await api.post('/quizzes/generate-from-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to generate quiz');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Generate Quiz</h1>
        <div className="bg-white rounded-xl border border-gray-200 p-12">
          <LoadingSpinner message="Analyzing image and generating quiz..." />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Generate Quiz</h1>

      {error && (
        <div className="mb-4">
          <ErrorMessage message={error} />
        </div>
      )}

      {!preview ? (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`bg-white rounded-xl border-2 border-dashed p-6 md:p-10 lg:p-12 text-center cursor-pointer transition-colors ${
            dragOver ? 'border-indigo-400 bg-indigo-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <ImageUp className="w-10 h-10 md:w-11 md:h-11 lg:w-12 lg:h-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Upload an image</h2>
          <p className="text-sm text-gray-500 mb-4">
            Drag and drop an image here, or click to browse
          </p>
          <p className="text-xs text-gray-400">PNG, JPG, WebP, GIF up to 10MB</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="relative mb-4">
            <img
              src={preview}
              alt="Upload preview"
              className="w-full max-h-64 object-contain rounded-lg bg-gray-100"
            />
            <button
              onClick={clearFile}
              className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-sm border border-gray-200 hover:bg-gray-50 cursor-pointer"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>
          <p className="text-sm text-gray-600 mb-4">
            <span className="font-medium">{file?.name}</span>
            {' '}&mdash; {((file?.size || 0) / 1024).toFixed(1)} KB
          </p>
          <button
            onClick={handleSubmit}
            className="flex items-center justify-center gap-2 w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            Generate Quiz from Image
          </button>
        </div>
      )}

      {aiSettings && !aiSettings.has_api_key && (
        <div className="mt-6 flex items-start gap-3 bg-blue-50 rounded-xl p-4">
          <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
          <p className="text-sm text-blue-700">
            Using mock AI for demonstration.{' '}
            <Link to="/settings" className="font-semibold underline hover:text-blue-800">
              Add your API key
            </Link>{' '}
            in Settings to generate real AI quizzes from your images.
          </p>
        </div>
      )}

      {aiSettings && aiSettings.has_api_key && (
        <div className="mt-6 bg-green-50 rounded-xl p-4">
          <p className="text-sm text-green-700">
            <span className="font-semibold">AI Connected:</span> Using {aiSettings.ai_provider === 'claude' ? 'Claude' : 'OpenAI'} to analyze your images and generate quizzes.
          </p>
        </div>
      )}
    </div>
  );
}
