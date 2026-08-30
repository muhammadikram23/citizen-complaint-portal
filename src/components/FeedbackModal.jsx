import React, { useState } from 'react';
import { Star, X } from 'lucide-react';

export const FeedbackModal = ({ complaint, isOpen, onClose, onSubmit }) => {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !complaint) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!rating || rating < 1 || rating > 5) {
      setError('Please select a rating between 1 and 5 stars.');
      return;
    }

    setSubmitting(true);
    setError('');
    try {
      await onSubmit(complaint._id, rating, comment.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50">
      <div className="bg-white border border-slate-300 rounded max-w-lg w-full p-6 shadow-md space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div>
            <h2 className="text-base font-bold text-slate-950">
              Rate complaint resolution
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Ticket: {complaint.title}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">
              Satisfaction score (1 to 5 stars)
            </label>
            <div className="flex items-center gap-2 mt-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setRating(star)}
                  className={`p-2 rounded border transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center ${
                    rating >= star
                      ? 'bg-amber-50 border-amber-300 text-amber-600'
                      : 'bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100'
                  }`}
                  aria-label={`Rate ${star} star`}
                >
                  <Star
                    className="h-5 w-5"
                    strokeWidth={1.75}
                    fill={rating >= star ? 'currentColor' : 'none'}
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-slate-700 ml-2">
                {rating === 5 && 'Excellent resolution'}
                {rating === 4 && 'Good resolution'}
                {rating === 3 && 'Acceptable'}
                {rating === 2 && 'Inadequate fix'}
                {rating === 1 && 'Problem not solved'}
              </span>
            </div>
          </div>

          <div>
            <label className="label-text">
              Comments on municipal response (optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="State any observations regarding the quality or completeness of the repair work..."
              className="input-field text-xs resize-y"
            />
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs"
            >
              {submitting ? 'Submitting...' : 'Submit resolution rating'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default FeedbackModal;
