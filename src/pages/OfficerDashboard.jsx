import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { generateWeeklyReportPdf } from '../utils/generateWeeklyReportPdf';
import {
  Download,
  Search,
  RefreshCw,
  Star,
  FileText,
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
      setAiSummary(res.data.summary);
      setAiStats(res.data.stats);
    } catch (err) {
      console.error('Error loading AI briefing:', err);
      setAiSummary('Daily briefing could not be generated. Please inspect live complaints table.');
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

  // Export Complaints to CSV
  const handleExportCSV = async () => {
    setDownloadingCsv(true);
    try {
      const params = new URLSearchParams();
      if (category !== 'All') params.append('category', category);
      if (status !== 'All') params.append('status', status);
      if (priority !== 'All') params.append('priority', priority);
      if (search.trim()) params.append('search', search.trim());

      const res = await api.get(`/complaints/export?${params.toString()}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `complaints_export_${new Date().toISOString().slice(0, 10)}.csv`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('CSV Export Error:', err);
      alert('Failed to generate CSV export.');
    } finally {
      setDownloadingCsv(false);
    }
  };

  // Generate and download complete executive weekly operations PDF report
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
        <div className="flex items-center gap-4">
          <img src={logo} alt="Municipal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0" />
          <div>
            <div className="text-xs font-semibold text-gray-500 mb-0.5">
              Officer operations center
            </div>
            <h1 className="text-2xl sm:text-3xl text-gray-950">
              Municipal complaints management
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
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
            <Download className="h-4 w-4 text-gray-600" strokeWidth={1.5} />
            {downloadingCsv ? 'Generating CSV...' : 'Download CSV report'}
          </button>
        </div>
      </div>

      {/* AI Daily Briefing Card */}
      <section className="bg-white border border-gray-300 rounded p-5 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-lg text-gray-950 font-serif">
              Operations daily briefing
            </h2>
            <span className="text-xs text-gray-500">
              Synthesized from active tickets and municipal response SLAs
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadWeeklyReport}
              disabled={generatingPdf}
              className="btn-secondary text-xs min-h-[36px] py-1 px-2.5 inline-flex items-center gap-1.5"
              title="Download complete executive weekly operations PDF summary report"
            >
              <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
              {generatingPdf ? 'Generating PDF...' : 'Download PDF summary'}
            </button>

            <button
              onClick={fetchAiBriefing}
              disabled={loadingAi}
              className="btn-secondary text-xs min-h-[36px] py-1 px-2.5 inline-flex items-center gap-1.5"
              title="Refresh briefing with latest metrics"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} strokeWidth={1.5} />
              Refresh briefing
            </button>
          </div>
        </div>

        {loadingAi ? (
          <div className="py-3 text-xs text-gray-500">
            Synthesizing operational briefing...
          </div>
        ) : (
          <p className="max-w-none w-full text-xs sm:text-sm text-gray-800 leading-relaxed bg-gray-50 p-4 rounded border border-gray-200">
            {aiSummary}
          </p>
        )}

        {/* Operational Statistics Grid */}
        {aiStats && (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-1 font-sans">
            <div className="bg-gray-50 p-3 rounded border border-gray-200">
              <div className="text-[11px] font-medium text-gray-500">Total logged</div>
              <div className="text-xl font-bold text-gray-950 mt-0.5">
                {aiStats.totalComplaints}
              </div>
            </div>

            <div className="bg-red-50 p-3 rounded border border-red-200">
              <div className="text-[11px] font-semibold text-red-900">Critical priority</div>
              <div className="text-xl font-bold text-red-950 mt-0.5">
                {aiStats.criticalCount}
              </div>
            </div>

            <div className="bg-amber-50 p-3 rounded border border-amber-200">
              <div className="text-[11px] font-semibold text-amber-900">Overdue (&gt;3 days)</div>
              <div className="text-xl font-bold text-amber-950 mt-0.5">
                {aiStats.overdueCount}
              </div>
            </div>

            <div className="bg-emerald-50 p-3 rounded border border-emerald-200">
              <div className="text-[11px] font-semibold text-emerald-900">Resolved this week</div>
              <div className="text-xl font-bold text-emerald-950 mt-0.5">
                {aiStats.resolvedThisWeek}
              </div>
            </div>

            <div className="bg-blue-50 p-3 rounded border border-blue-200 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-blue-900">Avg citizen rating</div>
              <div className="text-xl font-bold text-blue-950 mt-0.5 flex items-center gap-1">
                {aiStats.avgCitizenRating > 0 ? `${aiStats.avgCitizenRating} / 5` : 'N/A'}
                {aiStats.avgCitizenRating > 0 && <Star className="h-3.5 w-3.5 fill-blue-800 text-blue-800" />}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Filter Bar */}
      <section className="bg-white border border-gray-300 rounded overflow-hidden">
        <div className="p-4 border-b border-gray-200 space-y-3 bg-gray-50/50">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* Search */}
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" strokeWidth={1.5} />
              <input
                type="text"
                placeholder="Search ticket title, area, or description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="input-field pl-9 text-xs"
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
                className="input-field text-xs font-medium text-gray-900"
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
            <span className="text-gray-500">Filter priority:</span>
            {PRIORITIES.map((p) => (
              <button
                key={p}
                onClick={() => setPriority(p)}
                className={`px-2.5 py-0.5 rounded text-xs transition-colors ${
                  priority === p
                    ? 'bg-slate-900 text-white font-semibold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {p}
              </button>
            ))}
            <span className="ml-auto text-xs text-gray-500">
              Showing {complaints.length} records
            </span>
          </div>
        </div>

        {/* Mobile View: Stacked Cards */}
        <div className="md:hidden divide-y divide-gray-200">
          {loadingComplaints ? (
            <div className="p-8 text-center text-xs text-gray-500">
              Loading complaints data...
            </div>
          ) : complaints.length === 0 ? (
            <div className="p-8 text-center text-xs text-gray-500">
              No complaint records found matching active filters.
            </div>
          ) : (
            complaints.map((item) => (
              <div key={item._id} className="p-4 space-y-2.5 bg-white">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
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
                    className="font-bold text-gray-950 text-sm hover:underline block font-sans"
                  >
                    {item.title}
                  </Link>
                  <div className="text-xs text-gray-500 mt-0.5">
                    Area: <strong className="text-gray-800 font-medium">{item.area}</strong> &bull; Upvotes: <strong className="text-gray-900">{item.upvotes}</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between text-xs">
                  <span className="text-gray-500">
                    {item.createdBy?.name || 'Citizen'} &bull; {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                  <Link
                    to={`/officer/complaints/${item._id}`}
                    className="btn-primary text-xs min-h-[36px] py-1 px-3"
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
              <tr className="bg-gray-100 border-b border-gray-300 text-gray-700 font-semibold">
                <th className="py-2.5 px-4">Complaint & Area</th>
                <th className="py-2.5 px-4">Category</th>
                <th className="py-2.5 px-4">Priority score</th>
                <th className="py-2.5 px-4">Status</th>
                <th className="py-2.5 px-4">Upvotes</th>
                <th className="py-2.5 px-4">Filed by / Date</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loadingComplaints ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-gray-500">
                    Loading municipal registry records...
                  </td>
                </tr>
              ) : complaints.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-xs text-gray-500">
                    No complaint records found matching active filters.
                  </td>
                </tr>
              ) : (
                complaints.map((item) => (
                  <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 max-w-xs">
                      <Link
                        to={`/officer/complaints/${item._id}`}
                        className="font-semibold text-gray-950 hover:underline block truncate"
                        title={item.title}
                      >
                        {item.title}
                      </Link>
                      <div className="text-gray-500 text-[11px] mt-0.5">
                        Area: <span className="text-gray-800 font-medium">{item.area}</span>
                      </div>
                      {item.officerRemark && (
                        <div className="text-gray-600 italic truncate text-[11px] mt-0.5" title={item.officerRemark}>
                          Remark: "{item.officerRemark}"
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {item.category}
                      </span>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <PriorityBadge priority={item.priority} score={item.priorityScore} />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap font-semibold text-gray-900">
                      {item.upvotes}
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-gray-600">
                      <div className="font-medium text-gray-800">
                        {item.createdBy?.name || 'Citizen'}
                      </div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString()}
                      </div>
                    </td>

                    <td className="py-3 px-4 whitespace-nowrap text-right">
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
