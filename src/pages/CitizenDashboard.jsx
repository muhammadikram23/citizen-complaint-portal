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
  const [dailyQuota, setDailyQuota] = useState({ limit: 5, usedToday: 0, remaining: 5 });

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
    fetchMyComplaints();
    fetchDailyQuota();
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
      {/* Header with prominent Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-white border border-emerald-900/10 shadow-soft shrink-0">
            <img src={logo} alt="Municipal Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl text-slate-950 font-bold">
              Citizen service dashboard
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Welcome back, {user?.name || 'Citizen'}. Track and manage your neighborhood service reports.
            </p>
          </div>
        </div>

        <Link
          to="/complaints/new"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs sm:text-sm"
        >
          <PlusCircle className="h-4 w-4" strokeWidth={2} />
          Report a complaint
        </Link>
      </div>

      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2.5 shadow-soft">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Pending Satisfaction Feedback Banner */}
      {pendingFeedbackComplaints.length > 0 && (
        <div className="rounded-2xl border border-amber-300/80 bg-amber-50/90 p-5 space-y-2.5 shadow-soft">
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
                className="btn-primary text-xs py-1.5 px-3.5"
              >
                Rate resolution: {c.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Overview Stat Counters (including remaining daily quota) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white border border-emerald-900/10 rounded-2xl p-4 sm:p-5 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs text-slate-500 font-medium">Pending review</div>
          <div className="text-2xl font-bold text-slate-950 mt-1">
            {loading ? '-' : pendingCount}
          </div>
        </div>

        <div className="bg-white border border-emerald-900/10 rounded-2xl p-4 sm:p-5 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs text-slate-500 font-medium">In active progress</div>
          <div className="text-2xl font-bold text-blue-900 mt-1">
            {loading ? '-' : inProgressCount}
          </div>
        </div>

        <div className="bg-white border border-emerald-900/10 rounded-2xl p-4 sm:p-5 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs text-slate-500 font-medium">Resolved issues</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1">
            {loading ? '-' : resolvedCount}
          </div>
        </div>

        <div className="bg-white border border-emerald-900/10 rounded-2xl p-4 sm:p-5 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs text-slate-500 font-medium">Daily quota left</div>
          <div className="text-2xl font-bold text-slate-950 mt-1 flex items-baseline gap-1">
            <span>{loading ? '-' : dailyQuota.remaining}</span>
            <span className="text-xs font-normal text-slate-500">/ {dailyQuota.limit} today</span>
          </div>
        </div>
      </div>

      {/* Main Action Tiles */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/complaints/new"
          className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 hover:border-emerald-600/30 hover:shadow-soft-md transition-all flex flex-col justify-between shadow-soft group"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                <PlusCircle className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-bold text-slate-950">Report a problem</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Submit a new complaint regarding potholes, broken pipes, garbage, or outages.
            </p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 group-hover:text-emerald-800 mt-2 block">
            File report &rarr;
          </span>
        </Link>

        <Link
          to="/complaints/mine"
          className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 hover:border-emerald-600/30 hover:shadow-soft-md transition-all flex flex-col justify-between shadow-soft group"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <FileText className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-bold text-slate-950">My complaints</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Review progress status, officer response remarks, and historical resolutions.
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 group-hover:text-blue-800 mt-2 block">
            View my records ({complaints.length}) &rarr;
          </span>
        </Link>

        <Link
          to="/complaints"
          className="bg-white border border-emerald-900/10 rounded-2xl p-5 space-y-3 hover:border-emerald-600/30 hover:shadow-soft-md transition-all flex flex-col justify-between shadow-soft group"
        >
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-700 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                <Search className="h-5 w-5" strokeWidth={1.75} />
              </div>
              <h2 className="text-sm font-bold text-slate-950">Browse public feed</h2>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              Inspect active issues in your area and upvote complaints to increase urgency.
            </p>
          </div>
          <span className="text-xs font-semibold text-purple-700 group-hover:text-purple-800 mt-2 block">
            Explore registry &rarr;
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
