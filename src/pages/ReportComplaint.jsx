import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { DuplicateWarning } from '../components/DuplicateWarning';
import { AlertCircle, CheckCircle2, ArrowLeft, Send, Upload, X } from 'lucide-react';

const CATEGORIES = ['Road', 'Garbage', 'Water', 'Electricity', 'Other'];

export const ReportComplaint = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    category: 'Road',
    area: '',
    description: '',
  });

  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [imageUrlInput, setImageUrlInput] = useState('');

  const [duplicates, setDuplicates] = useState([]);
  const [duplicateCheckDismissed, setDuplicateCheckDismissed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Duplicate Check effect: Checks title, description, category, and area
  useEffect(() => {
    if (
      !formData.title.trim() ||
      !formData.category ||
      !formData.area.trim() ||
      formData.area.trim().length < 2
    ) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/complaints/check-duplicate', {
          title: formData.title.trim(),
          description: formData.description.trim(),
          category: formData.category,
          area: formData.area.trim(),
        });
        const matches = res.data.matches || [];
        setDuplicates(matches);
        setDuplicateCheckDismissed(false);
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.title, formData.description, formData.category, formData.area]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file exceeds the 5MB size limit.');
        return;
      }
      setSelectedFile(file);
      setFilePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (filePreview) {
      URL.revokeObjectURL(filePreview);
      setFilePreview(null);
    }
  };

  const handleUpvoteDuplicate = async (complaintId) => {
    try {
      await api.patch(`/complaints/${complaintId}/upvote`);
      setSuccess('Existing complaint upvoted successfully. Thank you for helping prioritize this issue.');
      setTimeout(() => {
        navigate('/complaints/mine');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upvote duplicate complaint.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.title || !formData.category || !formData.area || !formData.description) {
      setError('Please fill in title, category, area, and description.');
      return;
    }

    setLoading(true);
    try {
      if (selectedFile) {
        // Multipart FormData upload with Multer
        const multipartData = new FormData();
        multipartData.append('title', formData.title);
        multipartData.append('category', formData.category);
        multipartData.append('area', formData.area);
        multipartData.append('description', formData.description);
        multipartData.append('photo', selectedFile);

        await api.post('/complaints', multipartData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        // Standard JSON submission
        await api.post('/complaints', {
          ...formData,
          imageUrl: imageUrlInput.trim(),
        });
      }

      setSuccess('Complaint reported successfully. Assigned status: Pending review.');
      setTimeout(() => {
        navigate('/complaints/mine');
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to dashboard
        </Link>
        <div className="flex items-center gap-4">
          <img src={logo} alt="Municipal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950 font-serif">
              Report a complaint
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Submit details regarding municipal service breakdowns for field inspection and dispatch.
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-3.5 rounded bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {success && (
        <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{success}</span>
        </div>
      )}

      {/* Duplicate Detection Warning */}
      {!duplicateCheckDismissed && duplicates.length > 0 && (
        <DuplicateWarning
          duplicates={duplicates}
          onUpvote={handleUpvoteDuplicate}
          onDismiss={() => setDuplicateCheckDismissed(true)}
        />
      )}

      {/* Submission Form */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-300 rounded p-6 sm:p-8 space-y-5 shadow-xs">
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
              placeholder="e.g. Sector G-9"
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

        {/* Photo Upload */}
        <div>
          <label className="label-text">Photo proof (optional)</label>
          
          {filePreview ? (
            <div className="relative inline-block mt-1">
              <img
                src={filePreview}
                alt="Upload preview"
                className="h-36 w-auto max-w-full rounded border border-slate-300 object-cover"
              />
              <button
                type="button"
                onClick={handleRemoveFile}
                className="absolute -top-2 -right-2 bg-red-700 text-white p-1 rounded-full hover:bg-red-800 shadow-xs"
                title="Remove photo"
              >
                <X className="h-3.5 w-3.5" strokeWidth={1.75} />
              </button>
              <div className="text-xs text-slate-500 mt-1">
                {selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(0)} KB)
              </div>
            </div>
          ) : (
            <div className="mt-1 space-y-2">
              <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded p-4 hover:border-slate-800 cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                <Upload className="h-5 w-5 text-slate-500 mb-1" strokeWidth={1.75} />
                <span className="text-xs font-semibold text-slate-800">
                  Select image from device
                </span>
                <span className="text-xs text-slate-500">
                  PNG, JPG, WebP up to 5MB
                </span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              <div className="text-xs text-slate-400 text-center">
                or provide an image URL:
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

        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          <Link to="/dashboard" className="btn-secondary text-xs">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary text-xs inline-flex items-center gap-2"
          >
            <Send className="h-3.5 w-3.5" strokeWidth={1.75} />
            {loading ? 'Submitting complaint...' : 'Submit complaint'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportComplaint;
