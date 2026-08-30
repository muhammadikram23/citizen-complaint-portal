import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { Search, ThumbsUp, PlusCircle, AlertCircle, CheckCircle2 } from 'lucide-react';

const CATEGORIES = ['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Other'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const BrowseComplaints = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters & Sorting state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('newest');

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);
      if (priority !== 'All') params.append('priority', priority);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const res = await api.get(`/complaints?${params.toString()}`);
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error('Error browsing complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      fetchComplaints();
    }, 300);
    return () => clearTimeout(debounceTimer);
  }, [search, category, status, priority, sortBy]);

  const handleUpvote = async (complaintId) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { message: 'Please sign in to upvote civic complaints.' } });
      return;
    }

    setActionError('');
    setActionSuccess('');

    try {
      const res = await api.patch(`/complaints/${complaintId}/upvote`);
      const updated = res.data.complaint;

      setComplaints((prev) =>
        prev.map((item) => (item._id === complaintId ? updated : item))
      );
      setActionSuccess('Upvote recorded. Priority score updated.');
      setTimeout(() => setActionSuccess(''), 3000);
    } catch (err) {
      setActionError(err.response?.data?.message || 'Failed to upvote complaint.');
      setTimeout(() => setActionError(''), 4000);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Municipal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-950 font-serif">
              Public complaints registry
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Search active reports, review resolution timelines, and upvote issues in your area.
            </p>
          </div>
        </div>

        <Link
          to="/complaints/new"
          className="btn-primary inline-flex items-center gap-2 self-start sm:self-auto text-xs"
        >
          <PlusCircle className="h-4 w-4" strokeWidth={1.75} />
          Report a complaint
        </Link>
      </div>

      {actionError && (
        <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={1.75} />
          <span>{actionError}</span>
        </div>
      )}

      {actionSuccess && (
        <div className="p-3 rounded bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-300 rounded p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Keyword Search */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" strokeWidth={1.75} />
            <input
              type="text"
              placeholder="Search title, description, or area..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-9 text-xs"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="input-field text-xs"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  Category: {c}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="input-field text-xs"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  Status: {s}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input-field text-xs"
            >
              <option value="newest">Sort: Newest first</option>
              <option value="priority">Sort: Highest priority</option>
              <option value="upvotes">Sort: Most upvoted</option>
              <option value="oldest">Sort: Oldest first</option>
            </select>
          </div>
        </div>

        {/* Priority Quick Filter Pills */}
        <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
          <span className="text-slate-500 mr-1">
            Priority tier:
          </span>
          {PRIORITIES.map((p) => (
            <button
              key={p}
              onClick={() => setPriority(p)}
              className={`px-2.5 py-1 rounded text-xs transition-colors ${
                priority === p
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {p}
            </button>
          ))}
          <span className="ml-auto text-xs text-slate-500">
            Showing {complaints.length} results
          </span>
        </div>
      </div>

      {/* Complaint Grid Feed */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-500">
          Loading civic complaint registry...
        </div>
      ) : complaints.length === 0 ? (
        <div className="p-12 text-center bg-white border border-slate-300 rounded space-y-2">
          <div className="text-sm font-semibold text-slate-900">No complaints found</div>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or category filter to view other reports.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {complaints.map((item) => {
            const hasUserUpvoted =
              user && item.upvotedBy && item.upvotedBy.includes(user.id || user._id);

            return (
              <div
                key={item._id}
                className="bg-white border border-slate-300 rounded p-4 flex flex-col justify-between hover:border-slate-400 transition-colors space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      {item.category}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <PriorityBadge priority={item.priority} score={item.priorityScore} />
                      <StatusBadge status={item.status} />
                    </div>
                  </div>

                  {/* Photo Proof */}
                  {item.imageUrl && item.imageUrl.trim() !== '' && (
                    <div className="relative h-40 w-full overflow-hidden rounded border border-slate-200 bg-slate-100">
                      <img
                        src={item.imageUrl}
                        alt={item.title}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.parentElement.style.display = 'none';
                        }}
                      />
                    </div>
                  )}

                  <div>
                    <Link
                      to={`/complaints/${item._id}`}
                      className="font-bold text-slate-950 hover:underline text-sm leading-snug line-clamp-1 block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-3 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  {item.officerRemark && (
                    <div className="bg-slate-50 border border-slate-200 p-2 rounded text-xs text-slate-700">
                      <span className="font-semibold text-slate-900">Officer:</span> "{item.officerRemark}"
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <div className="text-xs text-slate-500 truncate max-w-[130px]" title={item.area}>
                    {item.area}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/complaints/${item._id}`}
                      className="btn-secondary text-xs min-h-[34px] py-1 px-2.5"
                    >
                      Details
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleUpvote(item._id)}
                      disabled={hasUserUpvoted}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium min-h-[34px] transition-colors border ${
                        hasUserUpvoted
                          ? 'bg-blue-50 text-blue-900 border-blue-200 cursor-default'
                          : 'bg-slate-100 text-slate-800 hover:bg-slate-900 hover:text-white border-slate-300'
                      }`}
                      title={hasUserUpvoted ? 'You have already upvoted this complaint' : 'Upvote complaint'}
                    >
                      <ThumbsUp className="h-3 w-3" strokeWidth={1.75} />
                      {item.upvotes}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BrowseComplaints;
