import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { FeedbackModal } from '../components/FeedbackModal';
import { StatusHistoryTimeline } from '../components/StatusHistoryTimeline';
import {
  ArrowLeft,
  ThumbsUp,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ComplaintDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user, isOfficer } = useAuth();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');
  const [feedbackOpen, setFeedbackOpen] = useState(false);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      setComplaint(res.data.complaint);
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetail();
  }, [id]);

  const handleUpvote = async () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to upvote civic complaints.' } });
      return;
    }

    try {
      const res = await api.patch(`/complaints/${id}/upvote`);
      setComplaint(res.data.complaint);
      setActionSuccess('Complaint upvoted successfully.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upvote complaint.');
      setTimeout(() => setError(''), 4000);
    }
  };

  const handleFeedbackSubmit = async (complaintId, rating, comment) => {
    await api.patch(`/complaints/${complaintId}/feedback`, {
      feedbackRating: rating,
      feedbackComment: comment,
    });
    setActionSuccess('Thank you. Your resolution rating has been recorded.');
    setTimeout(() => setActionSuccess(''), 4000);
    fetchDetail();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500">
        Loading complaint record...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-6 bg-white border border-slate-300 rounded text-center space-y-3">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" strokeWidth={1.75} />
          <h2 className="text-base font-bold text-slate-900">Complaint record not found</h2>
          <p className="text-xs text-slate-500">{error || 'The requested ticket could not be retrieved.'}</p>
          <Link to="/complaints" className="btn-primary text-xs inline-block">
            Back to public feed
          </Link>
        </div>
      </div>
    );
  }

  const isOwner =
    user &&
    complaint.createdBy &&
    (complaint.createdBy._id === user.id ||
      complaint.createdBy === user.id ||
      complaint.createdBy._id === user._id);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Back button & Officer review link */}
      <div className="flex items-center justify-between">
        <Link
          to="/complaints"
          className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-950 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to public feed
        </Link>

        {isOfficer && (
          <Link
            to={`/officer/complaints/${complaint._id}`}
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            Officer resolution controls
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
          </Link>
        )}
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Detail Document Card */}
      <article className="bg-white border border-gray-300 rounded p-6 sm:p-8 space-y-6 shadow-xs">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-200 pb-5">
          <div className="flex items-start gap-4">
            <img src={logo} alt="Municipal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0 mt-0.5" />
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-medium bg-gray-100 text-gray-800 px-2.5 py-0.5 rounded border border-gray-200">
                  {complaint.category}
                </span>
                <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
                <StatusBadge status={complaint.status} />
              </div>

              <h1 className="text-xl sm:text-2xl font-bold text-gray-950 font-serif leading-tight">
                {complaint.title}
              </h1>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
                  {complaint.area}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
                  {new Date(complaint.createdAt).toLocaleString()}
                </span>
                {complaint.createdBy?.name && (
                  <span>Filed by: {complaint.createdBy.name}</span>
                )}
              </div>
            </div>
          </div>

          <div className="shrink-0">
            <button
              type="button"
              onClick={handleUpvote}
              className="btn-secondary text-xs inline-flex items-center gap-1.5"
            >
              <ThumbsUp className="h-3.5 w-3.5 text-slate-700" strokeWidth={1.75} />
              Upvote complaint ({complaint.upvotes})
            </button>
          </div>
        </div>

        {/* Issue Description */}
        <div className="space-y-1.5">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Issue description
          </h2>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {/* Photo Proof */}
        {complaint.imageUrl && complaint.imageUrl.trim() !== '' && (
          <div className="space-y-1.5">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Attached photo proof
            </h2>
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="max-h-80 rounded border border-slate-300 object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Priority Formula Assessment */}
        <div className="bg-slate-50 border border-slate-200 rounded p-4 text-xs space-y-1">
          <div className="font-semibold text-slate-900">
            Priority calculation: {complaint.priority} ({complaint.priorityScore} points)
          </div>
          <p className="text-slate-600 text-xs leading-relaxed">
            Formula: Score = (upvotes &times; 2) + days open &rarr; ({complaint.upvotes} &times; 2) + {complaint.daysSinceCreated || 0} = <strong className="text-slate-900">{complaint.priorityScore}</strong> points.
          </p>
        </div>

        {/* Officer Response Section */}
        <div className="space-y-3 pt-4 border-t border-slate-200">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Municipal department response
          </h2>

          {complaint.officerRemark ? (
            <div className="bg-slate-50 border border-slate-200 rounded p-4 space-y-1">
              <div className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-slate-700" strokeWidth={1.75} />
                Official officer remark
              </div>
              <p className="text-xs text-slate-700 italic">
                "{complaint.officerRemark}"
              </p>
              <div className="text-[11px] text-slate-400 pt-1">
                Last updated: {new Date(complaint.updatedAt).toLocaleString()}
              </div>
            </div>
          ) : (
            <div className="p-3 rounded border border-slate-200 text-xs text-slate-500">
              No official officer remark has been posted yet. Status remains {complaint.status}.
            </div>
          )}
        </div>

        {/* Citizen Feedback Section */}
        {complaint.status === 'Resolved' && (
          <div className="space-y-3 pt-4 border-t border-slate-200">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Citizen satisfaction verification
            </h2>

            {complaint.feedbackGiven ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded p-4 space-y-1">
                <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" strokeWidth={1.75} />
                  Citizen resolution rating: {complaint.feedbackRating} / 5 stars
                </div>
                {complaint.feedbackComment && (
                  <p className="text-xs text-slate-700 italic">
                    "{complaint.feedbackComment}"
                  </p>
                )}
              </div>
            ) : isOwner ? (
              <div className="bg-amber-50 border border-amber-300 rounded p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-amber-950">You reported this issue</div>
                  <p className="text-amber-900 text-xs mt-0.5">
                    Please verify if the municipal repair was adequate.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeedbackOpen(true)}
                  className="btn-primary text-xs shrink-0"
                >
                  Rate resolution
                </button>
              </div>
            ) : (
              <div className="text-xs text-slate-500">
                Awaiting resolution rating from the reporting citizen.
              </div>
            )}
          </div>
        )}

        {/* Status History & Audit Trail Timeline */}
        {complaint.statusHistory && complaint.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-slate-200">
            <StatusHistoryTimeline history={complaint.statusHistory} />
          </div>
        )}
      </article>

      {/* Feedback Modal */}
      <FeedbackModal
        complaint={complaint}
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default ComplaintDetail;
