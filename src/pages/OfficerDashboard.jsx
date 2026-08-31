import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { generateWeeklyReportPdf } from '../utils/generateWeeklyReportPdf';
import { downloadComplaintsAsCSV } from '../utils/csvExporter';
import {
  Download,
  Search,
  RefreshCw,
  Star,
  FileText,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

const CATEGORIES = ['All', 'Road', 'Garbage', 'Water', 'Electricity', 'Other'];
const STATUSES = ['All', 'Pending', 'In Progress', 'Resolved'];
const PRIORITIES = ['All', 'Critical', 'High', 'Medium', 'Low'];

export const OfficerDashboard = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loadingComplaints, setLoadingComplaints] = useState(true);

  // AI Briefing State
  const [aiSummary, setAiSummary] = useState('');
  const [aiStats, setAiStats] = useState(null);
  const [loadingAi, setLoadingAi] = useState(true);

  // Filters & Search
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [status, setStatus] = useState('All');
  const [priority, setPriority] = useState('All');
  const [sortBy, setSortBy] = useState('priority');

  const [downloadingCsv, setDownloadingCsv] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  // Fetch AI Daily Briefing
  const fetchAiBriefing = async () => {
    setLoadingAi(true);
    try {
      const res = await api.post('/ai/officer-summary');
      if (res.data) {
        setAiSummary(res.data.summary || '');
        setAiStats(res.data.stats || null);
      }
    } catch (err) {
      console.warn('AI briefing API notice:', err.message);
      // Fallback rule-based synthesis if backend AI route is busy
      const active = complaints.filter((c) => c.status !== 'Resolved').length;
      const critical = complaints.filter((c) => c.priority === 'Critical').length;
      setAiSummary(
        `Operational briefing: A total of ${complaints.length} civic complaints are recorded across municipal sectors (${active} active tickets, ${critical} critical priority). Maintenance crews are dispatched according to dynamic citizen upvotes.`
      );
    } finally {
      setLoadingAi(false);
    }
  };

  // Fetch Filtered Complaints Table
  const fetchComplaints = async () => {
    setLoadingComplaints(true);
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
      console.error('Error fetching officer complaints:', err);
    } finally {
      setLoadingComplaints(false);
    }
  };

  useEffect(() => {
    fetchAiBriefing();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchComplaints();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, category, status, priority, sortBy]);

  // CSV Export with server query and client fallback
  const handleExportCSV = async () => {
    setDownloadingCsv(true);
    const filename = `municipal-complaints-${new Date().toISOString().slice(0, 10)}.csv`;
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);
      if (priority !== 'All') params.append('priority', priority);
      if (search.trim()) params.append('search', search.trim());
      if (sortBy) params.append('sortBy', sortBy);

      const queryString = params.toString();
      const exportUrl = queryString ? `/complaints/export?${queryString}` : '/complaints/export';

      const res = await api.get(exportUrl, { responseType: 'blob' });
      const blob = new Blob([res.data], { type: 'text/csv;charset=utf-8;' });
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.warn('Server CSV route fallback to client-side exporter:', err);
      // Fail-safe client export using currently filtered dataset
      downloadComplaintsAsCSV(complaints, filename);
    } finally {
      setDownloadingCsv(false);
    }
  };

  // PDF Executive Summary Report
  const handleDownloadWeeklyReport = async () => {
    setGeneratingPdf(true);
    try {
      await generateWeeklyReportPdf({
        logoUrl: logo,
        officerName: user?.name,
        officerEmail: user?.email,
        aiSummary,
        aiStats,
        complaints,
      });
    } catch (err) {
      console.error('Error generating weekly PDF summary:', err);
      alert('Failed to generate PDF summary report. Please try again.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  // Derive operational statistics with fallback to live complaints
  const liveRatedComplaints = complaints.filter((c) => c.feedbackGiven && c.feedbackRating);
  const liveAvgRating =
    liveRatedComplaints.length > 0
      ? (
          liveRatedComplaints.reduce((acc, c) => acc + Number(c.feedbackRating), 0) /
          liveRatedComplaints.length
        ).toFixed(1)
      : null;

  const totalActive =
    aiStats?.totalActive ??
    aiStats?.activeCount ??
    (aiStats?.pendingCount !== undefined && aiStats?.inProgressCount !== undefined
      ? aiStats.pendingCount + aiStats.inProgressCount
      : complaints.filter((c) => c.status !== 'Resolved').length);

  const pendingCount =
    aiStats?.pendingCount ??
    aiStats?.pending ??
    complaints.filter((c) => c.status === 'Pending').length;

  const inProgressCount =
    aiStats?.inProgressCount ??
    aiStats?.inProgress ??
    complaints.filter((c) => c.status === 'In Progress').length;

  const resolvedCount =
    aiStats?.resolvedCount ??
    aiStats?.resolved ??
    complaints.filter((c) => c.status === 'Resolved').length;

  const citizenRating =
    aiStats?.avgCitizenRating > 0
      ? aiStats.avgCitizenRating
      : aiStats?.averageCitizenRating > 0
      ? aiStats.averageCitizenRating
      : liveAvgRating;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-emerald-900/10 pb-5">
        <div className="flex items-center gap-4">
          <div className="p-2 rounded-2xl bg-white border border-emerald-900/10 shadow-soft shrink-0">
            <img src={logo} alt="Municipal Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0" />
          </div>
          <div>
            <div className="text-xs font-semibold text-emerald-800 mb-0.5 uppercase tracking-wider">
              Officer operations center
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-950">
              Municipal complaints management
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Triage civic tickets, assign field teams, and review automated dynamic priority ranking.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start sm:self-auto flex-wrap">
          <button
            type="button"
            onClick={handleExportCSV}
            disabled={downloadingCsv}
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
            title="Download CSV report of currently filtered records"
          >
            <Download className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
            {downloadingCsv ? 'Generating CSV...' : 'Download CSV report'}
          </button>
        </div>
      </div>

      {/* AI Daily Briefing Card */}
      <section className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-7 space-y-4 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-900/10 pb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-950">
              Operations daily briefing
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Synthesized from active tickets and municipal response SLAs
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleDownloadWeeklyReport}
              disabled={generatingPdf}
              className="btn-secondary text-xs min-h-[38px] py-1.5 px-3.5 inline-flex items-center gap-1.5"
              title="Download complete executive weekly operations PDF summary report"
            >
              <FileText className="h-3.5 w-3.5 text-emerald-700" strokeWidth={1.75} />
              {generatingPdf ? 'Generating PDF...' : 'Download PDF summary'}
            </button>

            <button
              onClick={fetchAiBriefing}
              disabled={loadingAi}
              className="btn-secondary text-xs min-h-[38px] py-1.5 px-3.5 inline-flex items-center gap-1.5"
              title="Refresh briefing with latest metrics"
            >
              <RefreshCw className={`h-3.5 w-3.5 text-slate-700 ${loadingAi ? 'animate-spin' : ''}`} strokeWidth={1.75} />
              Refresh briefing
            </button>
          </div>
        </div>

        {loadingAi ? (
          <div className="py-4 text-xs text-slate-500 font-medium flex items-center gap-2">
            <RefreshCw className="h-3.5 w-3.5 text-emerald-600 animate-spin" />
            <span>Synthesizing operational briefing...</span>
          </div>
        ) : (
          <p className="max-w-none w-full text-xs sm:text-sm text-slate-800 leading-relaxed bg-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-soft">
            {aiSummary ||
              `Operational briefing: A total of ${complaints.length} complaints are logged across municipal sectors (${totalActive} active, ${pendingCount} pending triage, ${inProgressCount} under repair).`}
          </p>
        )}

        {/* Operational Statistics Grid - ALWAYS Rendered with Live & Derived Data */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 font-sans">
          <div className="p-3.5 rounded-2xl bg-white border border-emerald-900/10 shadow-soft">
            <div className="text-[11px] text-slate-500 font-medium">Total active</div>
            <div className="text-xl font-bold text-slate-950 mt-0.5">
              {loadingComplaints && loadingAi ? '...' : totalActive}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-900/10 shadow-soft">
            <div className="text-[11px] text-slate-500 font-medium">Pending triage</div>
            <div className="text-xl font-bold text-amber-900 mt-0.5">
              {loadingComplaints && loadingAi ? '...' : pendingCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-900/10 shadow-soft">
            <div className="text-[11px] text-slate-500 font-medium">In repair</div>
            <div className="text-xl font-bold text-blue-900 mt-0.5">
              {loadingComplaints && loadingAi ? '...' : inProgressCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-900/10 shadow-soft">
            <div className="text-[11px] text-slate-500 font-medium">Resolved</div>
            <div className="text-xl font-bold text-emerald-900 mt-0.5">
              {loadingComplaints && loadingAi ? '...' : resolvedCount}
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white border border-emerald-900/10 shadow-soft col-span-2 sm:col-span-1">
            <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
              <span>Citizen rating</span>
              <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-xl font-bold text-slate-950 mt-0.5">
              {citizenRating ? `${citizenRating}/5` : 'N/A'}
            </div>
          </div>
        </div>
      </section>

      {/* Complaints Management Table Section */}
      <section className="bg-white border border-emerald-900/10 rounded-3xl overflow-hidden shadow-soft">
        <div className="p-5 border-b border-emerald-900/10 space-y-3.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-400" strokeWidth={1.75} />
              <input
                type="text"
                placeholder="Search ticket title, area, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-10 text-xs"
              />
            </div>

            {/* Category */}
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

            {/* Status */}
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

            {/* Priority Sort */}
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="input-field text-xs font-medium"
              >
                <option value="priority">Sort: Highest priority</option>
                <option value="newest">Sort: Newest first</option>
                <option value="upvotes">Sort: Most upvoted</option>
                <option value="oldest">Sort: Oldest first</option>
              </select>
            </div>
          </div>

          {/* Priority Quick Filter */}
          <div className="flex items-center gap-2 flex-wrap text-xs pt-1">
            <span className="text-slate-500 font-medium">Filter priority:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  priority === p
                    ? 'bg-emerald-600 text-white font-semibold shadow-soft'
                    : 'bg-emerald-50/50 text-slate-700 hover:bg-emerald-100/60 border border-emerald-900/10'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="ml-auto text-xs text-slate-500 font-medium">
              Showing {complaints.length} records
            </span>
          </div>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden divide-y divide-emerald-900/10">
          {loadingComplaints ? (
            <div className="p-8 text-center text-xs text-slate-500">
              Loading complaints data...
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-500">
              No complaint records found matching active filters.
            </div>
          ) : (
            complaints.map((item) => (
              <div key={item._id} className="p-5 space-y-3 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-medium bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                    {item.category}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <PriorityBadge priority={item.priority} score={item.priorityScore} />
                    <StatusBadge status={item.status} />
                  </div>
                </div>

                <div>
                  <Link
                    to={`/officer/complaints/${item._id}`}
                    className="font-bold text-slate-950 text-sm hover:text-emerald-700 hover:underline block"
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Area: <strong className="text-slate-800 font-medium">{item.area}</strong> &bull; Upvotes: <strong className="text-slate-900">{item.upvotes}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    {item.createdBy?.name || 'Citizen'} &bull; {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/officer/complaints/${item._id}`}
                    className="btn-primary text-xs min-h-[36px] py-1 px-3.5"
                  >
                    Review & resolve
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Desktop View: Dense Data Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-50/40 border-b border-emerald-900/10 text-slate-700 font-semibold">
                <th className="py-3 px-4">Complaint & Area</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Priority tier</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Upvotes</th>
                <th className="py-3 px-4">Filed by / Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-emerald-900/10">
              {loadingComplaints ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-slate-500">
                    Loading municipal registry records...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-slate-500">
                    No complaint records found matching active filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="py-3.5 px-4 max-w-xs">
                      <Link
                        to={`/officer/complaints/${item._id}`}
                        className="font-semibold text-slate-950 hover:text-emerald-700 hover:underline block truncate"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      <div className="text-slate-500 text-[11px] mt-0.5">
                        Area: <span className="text-slate-800 font-medium">{item.area}</span>
                      </div>
                      {item.officerRemark && (
                        <div className="text-slate-600 italic truncate text-[11px] mt-0.5" title={item.officerRemark}>
                          Remark: "{item.officerRemark}"
                        </div>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <span className="text-[11px] font-medium bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityBadge priority={item.priority} score={item.priorityScore} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap font-semibold text-slate-900">
                      {item.upvotes}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-600">
                      <div className="font-medium text-slate-800">
                        {item.createdBy?.name || 'Citizen'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <Link
                        to={`/officer/complaints/${item._id}`}
                        className="btn-primary text-xs min-h-[34px] py-1 px-3"
                      >
                        Review & resolve
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default OfficerDashboard;
