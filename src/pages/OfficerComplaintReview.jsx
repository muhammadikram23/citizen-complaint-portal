import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { StatusHistoryTimeline } from '../components/StatusHistoryTimeline';
import {
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Save,
  MapPin,
  Calendar,
  Star,
  ExternalLink,
} from 'lucide-react';

const STATUS_OPTIONS = ['Pending', 'In Progress', 'Resolved'];

export const OfficerComplaintReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Officer Form state
  const [selectedStatus, setSelectedStatus] = useState('Pending');
  const [officerRemark, setOfficerRemark] = useState('');
  const [updating, setUpdating] = useState(false);

  const fetchComplaint = async () => {
    try {
      const res = await api.get(`/complaints/${id}`);
      const data = res.data.complaint;
      setComplaint(data);
      setSelectedStatus(data.status);
      setOfficerRemark(data.officerRemark || '');
    } catch (err) {
      setError(err.response?.data?.message || 'Complaint record not found.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    setError('');
    fetchComplaint();
  }, [id]);

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);
    setError('');
    setSuccess('');

    try {
      const res = await api.patch(`/complaints/${id}/status`, {
        status: selectedStatus,
        officerRemark: officerRemark.trim(),
      });

      setComplaint(res.data.complaint);
      setSuccess(
        selectedStatus === 'Resolved'
          ? 'Complaint marked as resolved. Citizen satisfaction rating prompt has been triggered.'
          : 'Complaint status and remarks updated successfully.'
      );
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update complaint status.');
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs text-slate-500 bg-white border border-emerald-900/10 rounded-2xl shadow-soft">
        Loading complaint review details...
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="p-8 bg-white border border-emerald-900/10 rounded-2xl text-center space-y-3 shadow-soft">
          <AlertCircle className="h-8 w-8 text-red-600 mx-auto" strokeWidth={1.75} />
          <h2 className="text-base font-bold text-slate-900">Unable to load complaint</h2>
          <p className="text-xs text-slate-500">{error || 'Record does not exist.'}</p>
          <Link to="/officer/dashboard" className="btn-primary text-xs inline-block">
            Return to operations dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
      {/* Top back navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/officer/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-emerald-800 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={1.75} />
          Back to officer dashboard
        </Link>
        <Link
          to={`/complaints/${complaint._id}`}
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1"
        >
          Public view
          <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
        </Link>
      </div>

      {success && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 font-medium flex items-center gap-2.5 shadow-soft">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 font-medium flex items-center gap-2.5 shadow-soft">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={1.75} />
          <span>{error}</span>
        </div>
      )}

      {/* Officer Decision & Status Update Panel */}
      <section className="bg-white border border-emerald-600/40 rounded-3xl p-6 sm:p-7 space-y-4 shadow-soft">
        <div className="flex items-center gap-2.5 border-b border-emerald-900/10 pb-3.5">
          <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
            <ShieldCheck className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-950">
              Officer resolution decision
            </h2>
            <span className="text-xs text-slate-500 font-medium">
              Ticket ID: {complaint._id}
            </span>
          </div>
        </div>

        <form onSubmit={handleStatusUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="label-text">Lifecycle status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="input-field font-semibold text-xs sm:text-sm"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Setting to <strong>Resolved</strong> prompts the reporting citizen for a satisfaction rating.
              </p>
            </div>

            <div>
              <label className="label-text">Current dynamic priority</label>
              <div className="p-2.5 bg-emerald-50/30 border border-emerald-900/10 rounded-xl flex items-center justify-between min-h-[42px]">
                <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
                <span className="text-xs text-slate-600 font-medium">
                  Upvotes: <strong className="text-slate-900">{complaint.upvotes}</strong>
                </span>
              </div>
            </div>
          </div>

          <div>
            <label className="label-text">Official officer remark</label>
            <textarea
              rows={3}
              value={officerRemark}
              onChange={(e) => setOfficerRemark(e.target.value)}
              placeholder="e.g. Maintenance crew dispatched. Repairs completed and inspected on site."
              className="input-field resize-y text-xs"
            />
            <p className="text-xs text-slate-500 mt-1">
              This remark will be visible to the reporting citizen and included in CSV exports.
            </p>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={updating}
              className="btn-primary text-xs inline-flex items-center gap-2"
            >
              <Save className="h-4 w-4" strokeWidth={1.75} />
              {updating ? 'Updating status...' : 'Update complaint status'}
            </button>
          </div>
        </form>
      </section>

      {/* Complaint Details Card */}
      <article className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-soft">
        <div className="border-b border-emerald-900/10 pb-4 space-y-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-medium bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
              {complaint.category}
            </span>
            <PriorityBadge priority={complaint.priority} score={complaint.priorityScore} />
            <StatusBadge status={complaint.status} />
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-slate-950">{complaint.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1 font-medium">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5 text-emerald-700" strokeWidth={1.75} />
              {complaint.area}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
              Filed: {new Date(complaint.createdAt).toLocaleString()}
            </span>
            {complaint.createdBy?.name && (
              <span>Citizen: {complaint.createdBy.name} ({complaint.createdBy.email})</span>
            )}
          </div>
        </div>

        <div className="space-y-1">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Citizen issue description
          </h3>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">
            {complaint.description}
          </p>
        </div>

        {complaint.imageUrl && complaint.imageUrl.trim() !== '' && (
          <div className="space-y-1">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Attached photo proof
            </h3>
            <img
              src={complaint.imageUrl}
              alt={complaint.title}
              className="max-h-80 rounded-2xl border border-emerald-900/10 object-cover shadow-soft"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          </div>
        )}

        {/* Citizen Feedback Inspection */}
        {complaint.feedbackGiven && (
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-xs space-y-1 shadow-soft">
            <div className="font-bold text-emerald-950 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-amber-500 fill-amber-500" strokeWidth={1.75} />
              Citizen satisfaction rating: {complaint.feedbackRating} / 5 stars
            </div>
            {complaint.feedbackComment && (
              <p className="text-slate-700 italic">
                "{complaint.feedbackComment}"
              </p>
            )}
          </div>
        )}

        {/* Status History & Audit Trail Timeline */}
        {complaint.statusHistory && complaint.statusHistory.length > 0 && (
          <div className="pt-4 border-t border-emerald-900/10">
            <StatusHistoryTimeline history={complaint.statusHistory} />
          </div>
        )}
      </article>
    </div>
  );
};

export default OfficerComplaintReview;
