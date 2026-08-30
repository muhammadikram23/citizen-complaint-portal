import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { FeedbackModal } from '../components/FeedbackModal';
import { PlusCircle, Star, MessageSquare, CheckCircle2, Search } from 'lucide-react';

export const MyComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [filteredComplaints, setFilteredComplaints] = useState([]);
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [feedbackTarget, setFeedbackTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get('/complaints/mine');
      const list = res.data.complaints || [];
      setComplaints(list);
      setFilteredComplaints(list);
    } catch (err) {
      console.error('Error fetching my complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  useEffect(() => {
    let result = [...complaints];

    if (activeTab !== 'All') {
      result = result.filter((c) => c.status.toLowerCase() === activeTab.toLowerCase());
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.area.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    setFilteredComplaints(result);
  }, [activeTab, searchQuery, complaints]);

  const handleFeedbackSubmit = async (complaintId, rating, comment) => {
    await api.patch(`/complaints/${complaintId}/feedback`, {
      feedbackRating: rating,
      feedbackComment: comment,
    });
    setSuccessMessage('Thank you. Your resolution rating has been submitted.');
    setTimeout(() => setSuccessMessage(''), 4000);
    fetchMyComplaints();
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Municipal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950 font-serif">
              My filed complaints
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Track municipal progress, review official remarks, and evaluate completed repairs.
            </p>
          </div>
        </div>

        <Link
          to="/complaints/new"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <PlusCircle className="h-4 w-4" strokeWidth={1.75} />
          Report another issue
        </Link>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-slate-200 p-1 rounded text-xs font-medium self-start">
          {['All', 'Pending', 'In Progress', 'Resolved'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1.5 rounded transition-colors ${
                activeTab === tab
                  ? 'bg-white text-slate-950 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" strokeWidth={1.75} />
          <input
            type="text"
            placeholder="Filter by keyword or area..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 text-xs"
          />
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="py-12 text-center text-xs text-slate-500">
          Loading your complaint records...
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-300 rounded space-y-3">
          <div className="text-sm font-semibold text-slate-900">
            No complaints found
          </div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? 'No complaints match your current search filter.'
              : 'You have not submitted any complaints in this category.'}
          </p>
          <Link to="/complaints/new" className="btn-primary text-xs inline-flex items-center gap-1.5 mt-1">
            <PlusCircle className="h-3.5 w-3.5" strokeWidth={1.75} />
            File a complaint
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => (
            <div
              key={c._id}
              className={`bg-white border rounded p-5 space-y-4 ${
                c.status === 'Resolved' && c.feedbackPending
                  ? 'border-amber-300 ring-1 ring-amber-200'
                  : 'border-slate-300'
              }`}
            >
              {/* Top row */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {c.category}
                    </span>
                    <PriorityBadge priority={c.priority} score={c.priorityScore} />
                    <StatusBadge status={c.status} />
                  </div>
                  <h2 className="text-base font-bold text-slate-950">
                    <Link to={`/complaints/${c._id}`} className="hover:underline">
                      {c.title}
                    </Link>
                  </h2>
                  <div className="text-slate-500 text-xs flex items-center gap-3">
                    <span>Area: <strong className="text-slate-800 font-medium">{c.area}</strong></span>
                    <span>&bull;</span>
                    <span>Filed: {new Date(c.createdAt).toLocaleDateString()}</span>
                    <span>&bull;</span>
                    <span>Upvotes: <strong>{c.upvotes}</strong></span>
                  </div>
                </div>

                <div className="shrink-0">
                  <Link
                    to={`/complaints/${c._id}`}
                    className="btn-secondary text-xs"
                  >
                    View details
                  </Link>
                </div>
              </div>

              {/* Photo Proof */}
              {c.imageUrl && c.imageUrl.trim() !== '' && (
                <div className="relative h-44 w-full overflow-hidden rounded border border-slate-200 bg-slate-100">
                  <img
                    src={c.imageUrl}
                    alt={c.title}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.parentElement.style.display = 'none';
                    }}
                  />
                </div>
              )}

              {/* Description */}
              <p className="text-xs text-slate-700 leading-relaxed">
                {c.description}
              </p>

              {/* Official Officer Remark */}
              {c.officerRemark && (
                <div className="bg-slate-50 border border-slate-200 rounded p-3 text-xs space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <MessageSquare className="h-3.5 w-3.5 text-slate-700" strokeWidth={1.75} />
                    Official officer remark
                  </div>
                  <p className="text-slate-700 italic">
                    "{c.officerRemark}"
                  </p>
                </div>
              )}

              {/* Resolution Feedback Prompt */}
              {c.status === 'Resolved' && c.feedbackPending && (
                <div className="bg-amber-50 border border-amber-300 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-bold text-amber-950 flex items-center gap-1.5">
                      <Star className="h-4 w-4 text-amber-600 fill-amber-600" strokeWidth={1.75} />
                      Resolution verification pending
                    </div>
                    <p className="text-amber-900 text-xs mt-0.5">
                      Has this issue been resolved adequately? Please submit your satisfaction rating.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFeedbackTarget(c)}
                    className="btn-primary text-xs shrink-0 self-start sm:self-auto"
                  >
                    Rate resolution
                  </button>
                </div>
              )}

              {/* Submitted Citizen Feedback Display */}
              {c.feedbackGiven && (
                <div className="bg-emerald-50 border border-emerald-200 rounded p-3 text-xs flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="font-semibold text-emerald-950 flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
                      Citizen satisfaction rating: {c.feedbackRating} / 5 stars
                    </div>
                    {c.feedbackComment && (
                      <div className="text-slate-600 italic">"{c.feedbackComment}"</div>
                    )}
                  </div>
                  <span className="text-xs text-emerald-800 font-medium">
                    Feedback recorded
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

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

export default MyComplaints;
