import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { FeedbackModal } from '../components/FeedbackModal';
import {
  PlusCircle,
  FileText,
  Search,
  Star,
  CheckCircle2,
} from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get('/complaints/mine');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Error fetching citizen complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  const handleFeedbackSubmit = async (complaintId, rating, comment) => {
    await api.patch(`/complaints/${complaintId}/feedback`, {
      feedbackRating: rating,
      feedbackComment: comment,
    });
    setSuccessMessage('Thank you. Your resolution rating has been submitted.');
    setTimeout(() => setSuccessMessage(''), 4000);
    fetchMyComplaints();
  };

  // Check if any resolved complaint needs verification
  const pendingFeedbackComplaints = complaints.filter(
    (c) => c.status === 'Resolved' && c.feedbackPending
  );

  const pendingCount = complaints.filter((c) => c.status === 'Pending').length;
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved').length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-gray-200 pb-4">
        <img src={logo} alt="Municipal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0" />
        <div>
          <h1 className="text-xl sm:text-2xl text-gray-950">
            Citizen service dashboard
          </h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Welcome back, {user?.name || 'Citizen'}. Track and manage your neighborhood service reports.
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pending Satisfaction Feedback Banner */}
      {pendingFeedbackComplaints.length > 0 && (
        <div className="rounded border border-amber-300 bg-amber-50/90 p-4 space-y-2">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-amber-700 fill-amber-700" strokeWidth={1.75} />
            <h2 className="text-sm font-bold text-amber-950">
              Resolution verification requested
            </h2>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Municipal officers marked {pendingFeedbackComplaints.length} of your reported complaints as resolved. Please verify if the repairs meet your satisfaction.
          </p>
          <div className="pt-1 flex flex-wrap gap-2">
            {pendingFeedbackComplaints.map((c) => (
              <button
                key={c._id}
                type="button"
                onClick={() => setFeedbackTarget(c)}
                className="btn-primary text-xs min-h-[36px] py-1 px-3"
              >
                Rate resolution: {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overview Stat Counters */}
      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-300 rounded p-4">
          <div className="text-xs text-slate-500 font-medium">Pending review</div>
          <div className="text-2xl font-bold text-slate-950 mt-1">
            {loading ? '-' : pendingCount}
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded p-4">
          <div className="text-xs text-slate-500 font-medium">In active progress</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {loading ? '-' : inProgressCount}
          </div>
        </div>

        <div className="bg-white border border-slate-300 rounded p-4">
          <div className="text-xs text-slate-500 font-medium">Resolved issues</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {loading ? '-' : resolvedCount}
          </div>
        </div>
      </div>

      {/* Main Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/complaints/new"
          className="bg-white border border-slate-300 rounded p-5 space-y-2 hover:border-slate-400 transition-colors flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5 text-slate-900" strokeWidth={1.75} />
              <h2 className="text-sm font-bold text-slate-950">Report a problem</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a new complaint regarding potholes, broken pipes, garbage, or outages.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-900 mt-2 block">
            File report
          </span>
        </Link>

        <Link
          to="/complaints/mine"
          className="bg-white border border-slate-300 rounded p-5 space-y-2 hover:border-slate-400 transition-colors flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-slate-900" strokeWidth={1.75} />
              <h2 className="text-sm font-bold text-slate-950">My complaints</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review progress status, officer response remarks, and historical resolutions.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-900 mt-2 block">
            View my records ({complaints.length})
          </span>
        </Link>

        <Link
          to="/complaints"
          className="bg-white border border-slate-300 rounded p-5 space-y-2 hover:border-slate-400 transition-colors flex flex-col justify-between"
        >
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Search className="h-5 w-5 text-slate-900" strokeWidth={1.75} />
              <h2 className="text-sm font-bold text-slate-950">Browse public feed</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect active issues in your area and upvote complaints to increase urgency.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-900 mt-2 block">
            Explore registry
          </span>
        </Link>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        complaint={feedbackTarget}
        isOpen={!!feedbackTarget}
        onClose={() => setFeedbackTarget(null)}
        onSubmit={handleFeedbackSubmit}
      />
    </div>
  );
};

export default CitizenDashboard;
