import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { DuplicateWarning } from '../components/DuplicateWarning';
import { compressImage } from '../utils/imageCompressor';
import {
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Send,
  Upload,
  X,
  ShieldAlert,
  Image as ImageIcon,
  Loader2,
} from 'lucide-react';

const CATEGORIES = ['Road', 'Garbage', 'Water', 'Electricity', 'Other'];

export const ReportComplaint = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Road',
    area: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [fileSizeInfo, setFileSizeInfo] = useState('');
  const [compressing, setCompressing] = useState(false);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [duplicates, setDuplicates] = useState([]);
  const [duplicateCheckDismissed, setDuplicateCheckDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [dailyQuota, setDailyQuota] = useState({ limit: 5, usedToday: 0, remaining: 5 });

  const fetchDailyQuota = async () => {
    try {
      const res = await api.get('/complaints/daily-quota');
      if (res.data) {
        setDailyQuota({
          limit: res.data.limit || 5,
          usedToday: res.data.usedToday || 0,
          remaining: res.data.remaining !== undefined ? res.data.remaining : 5,
        });
      }
    } catch (err) {
      console.warn('Daily quota lookup warning:', err);
    }
  };

  useEffect(() => {
    fetchDailyQuota();
  }, []);

  // Duplicate Check effect
  useEffect(() => {
    const hasEnoughText =
      formData.title.trim().length >= 3 || formData.description.trim().length >= 8;

    if (!hasEnoughText || duplicateCheckDismissed) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/complaints/check-duplicate', {
          title: formData.title,
          description: formData.description,
          category: formData.category,
          area: formData.area,
        });
        setDuplicates(res.data.duplicates || []);
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }, 450);

    return () => clearTimeout(timer);
  }, [formData, duplicateCheckDismissed]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setDuplicateCheckDismissed(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate type
    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (PNG, JPG, JPEG, WebP).');
      return;
    }

    // Size limit: 10MB before compression
    if (file.size > 10 * 1024 * 1024) {
      setError('Selected image exceeds 10MB limit. Please choose a smaller photo.');
      return;
    }

    setError('');
    setCompressing(true);

    try {
      const origKb = Math.round(file.size / 1024);
      // Auto-compress image on canvas to max 1280px for instant upload
      const compressedDataUrl = await compressImage(file, 1280, 1280, 0.82);
      setSelectedFile(file);
      setFilePreview(compressedDataUrl);

      // Estimate compressed size from base64 length
      const compressedKb = Math.round((compressedDataUrl.length * 3) / 4 / 1024);
      setFileSizeInfo(`${file.name} (${origKb} KB → ${compressedKb} KB optimized)`);
    } catch (compressErr) {
      console.warn('Compression fallback to direct reader:', compressErr);
      // Fallback
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedFile(file);
        setFilePreview(reader.result);
        setFileSizeInfo(`${file.name} (${Math.round(file.size / 1024)} KB)`);
      };
      reader.readAsDataURL(file);
    } finally {
      setCompressing(false);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setFileSizeInfo('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleUpvoteDuplicate = async (complaintId) => {
    try {
      await api.patch(`/complaints/${complaintId}/upvote`);
      setSuccess('Duplicate upvoted successfully. Navigating to the issue detail...');
      setTimeout(() => {
        navigate(`/complaints/${complaintId}`);
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upvote duplicate complaint.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title.trim() || !formData.description.trim() || !formData.area.trim()) {
      setError('Please provide title, area, and description.');
      return;
    }

    setLoading(true);

    try {
      let finalImageUrl = imageUrlInput.trim();

      // If a file was selected and compressed, send data URL
      if (filePreview) {
        finalImageUrl = filePreview;
      }

      await api.post('/complaints', {
        title: formData.title.trim(),
        category: formData.category,
        area: formData.area.trim(),
        description: formData.description.trim(),
        imageUrl: finalImageUrl,
      });

      setSuccess('Complaint reported successfully. Assigned status: Pending review.');
      setTimeout(() => {
        navigate('/complaints/mine');
      }, 1200);
    } catch (err) {
      console.error('Submit complaint error:', err);
      setError(
        err.response?.data?.message ||
          'Failed to submit complaint. If you attached a large photo, please try a smaller image.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-white border border-emerald-900/10 shadow-soft shrink-0">
            <img src={logo} alt="Municipal Logo" className="h-12 sm:h-14 w-auto object-contain shrink-0" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
              Report a complaint
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Submit details regarding municipal service breakdowns for field inspection and dispatch.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2.5 shadow-soft">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2.5 shadow-soft">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{success}</span>
        </div>
      )}

      {/* Daily Submission Limit / Quota Banner */}
      <div
        className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-soft ${
          dailyQuota.remaining === 0
            ? 'bg-red-50 border-red-300 text-red-950'
            : dailyQuota.remaining === 1
            ? 'bg-amber-50 border-amber-300 text-amber-950'
            : 'bg-emerald-50/60 border-emerald-200/80 text-emerald-950'
        }`}
      >
        <div className="flex items-center gap-2.5">
          <ShieldAlert
            className={`h-4 w-4 shrink-0 ${
              dailyQuota.remaining === 0
                ? 'text-red-700'
                : dailyQuota.remaining === 1
                ? 'text-amber-700'
                : 'text-emerald-700'
            }`}
            strokeWidth={1.75}
          />
          <div>
            <span className="font-semibold">Daily Submission Quota: </span>
            <span>
              {dailyQuota.remaining > 0 ? (
                <>
                  You have{' '}
                  <strong className="font-bold">
                    {dailyQuota.remaining} of {dailyQuota.limit}
                  </strong>{' '}
                  complaint submissions remaining for today.
                </>
              ) : (
                <strong className="font-bold">
                  Daily limit of {dailyQuota.limit} reports reached. Please try again tomorrow.
                </strong>
              )}
            </span>
          </div>
        </div>

        <span
          className={`font-semibold px-3 py-1 rounded-full text-xs border shrink-0 text-center ${
            dailyQuota.remaining === 0
              ? 'bg-red-100 text-red-900 border-red-300'
              : 'bg-white text-emerald-900 border-emerald-300'
          }`}
        >
          {dailyQuota.remaining} / {dailyQuota.limit} remaining
        </span>
      </div>

      {/* Duplicate Detection Warning */}
      {!duplicateCheckDismissed && duplicates.length > 0 && (
        <DuplicateWarning
          duplicates={duplicates}
          onUpvote={handleUpvoteDuplicate}
          onDismiss={() => setDuplicateCheckDismissed(true)}
        />
      )}

      {/* Submission Form Card */}
      <form onSubmit={handleSubmit} className="bg-white border border-emerald-900/10 rounded-2xl p-6 sm:p-8 space-y-5 shadow-soft">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label-text">Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className="input-field"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-text">Area or locality name</label>
            <input
              type="text"
              name="area"
              value={formData.area}
              onChange={handleChange}
              placeholder="e.g. Sector G-9, Blue Area"
              className="input-field"
              required
            />
          </div>
        </div>

        <div>
          <label className="label-text">Complaint title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Broken water pipe leaking into street"
            className="input-field"
            maxLength={120}
            required
          />
        </div>

        <div>
          <label className="label-text">Detailed description</label>
          <textarea
            name="description"
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe the exact location, severity, duration of the issue, and any hazards..."
            className="input-field resize-y"
            required
          />
        </div>

        {/* Photo Upload & Preview Section */}
        <div>
          <label className="label-text">Photo proof of issue (optional)</label>

          {compressing ? (
            <div className="p-6 rounded-2xl border border-emerald-900/10 bg-emerald-50/30 flex items-center justify-center gap-2 text-xs text-emerald-800 font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
              <span>Optimizing and preparing photo...</span>
            </div>
          ) : filePreview ? (
            <div className="relative inline-block mt-2">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-900/10 shadow-soft max-w-sm">
                <img
                  src={filePreview}
                  alt="Upload preview"
                  className="max-h-52 w-auto object-cover"
                />
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  className="absolute top-2 right-2 bg-red-600 text-white p-1.5 rounded-full hover:bg-red-700 shadow-md transition-colors"
                  title="Remove photo"
                >
                  <X className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
              <div className="text-[11px] text-slate-500 font-medium mt-1.5 flex items-center gap-1">
                <ImageIcon className="h-3 w-3 text-emerald-700" />
                <span>{fileSizeInfo}</span>
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-2">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-900/20 rounded-2xl p-5 hover:border-emerald-600 cursor-pointer bg-emerald-50/20 hover:bg-emerald-50/50 transition-colors">
                <Upload className="h-6 w-6 text-emerald-600 mb-1.5" strokeWidth={1.75} />
                <span className="text-xs font-semibold text-slate-800">
                  Select image from device or take a photo
                </span>
                <span className="text-xs text-slate-500 mt-0.5">
                  PNG, JPG, WebP (auto-optimized for instant dispatch)
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="text-xs text-slate-400 text-center font-medium">
                or provide an external image URL:
              </div>

              <input
                type="url"
                value={imageUrlInput}
                onChange={(e) => setImageUrlInput(e.target.value)}
                placeholder="https://example.com/photo.jpg"
                className="input-field text-xs"
              />
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-emerald-900/10 flex items-center justify-between">
          <Link to="/dashboard" className="btn-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading || compressing || dailyQuota.remaining === 0}
            className="btn-primary text-xs inline-flex items-center gap-2"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
            {loading
              ? 'Submitting complaint...'
              : dailyQuota.remaining === 0
              ? 'Daily quota limit reached'
              : 'Submit complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportComplaint;
