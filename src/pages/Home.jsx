import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';
import { PlusCircle, Search, ArrowRight, ShieldCheck, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

export const Home = () => {
  const [stats, setStats] = useState({
    total: 0,
    inProgress: 0,
    resolved: 0,
    critical: 0,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPublicData = async () => {
      try {
        const res = await api.get('/complaints?limit=6');
        const list = res.data.complaints || [];
        setRecentComplaints(list);

        const total = res.data.total || list.length;
        const inProgress = list.filter((c) => c.status === 'In Progress').length;
        const resolved = list.filter((c) => c.status === 'Resolved').length;
        const critical = list.filter((c) => c.priority === 'Critical').length;

        setStats({ total, inProgress, resolved, critical });
      } catch (err) {
        console.error('Error loading public feed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPublicData();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8">
      {/* Official Civic Hero Card */}
      <section className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-9 space-y-5 shadow-soft">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <div className="p-3 rounded-2xl bg-emerald-50/60 border border-emerald-200/60 shrink-0 self-start sm:self-auto shadow-soft">
            <img src={logo} alt="Municipal Seal Logo" className="h-16 sm:h-20 w-auto object-contain shrink-0" />
          </div>
          <div className="space-y-1.5">
            <h1 className="text-xl sm:text-3xl font-bold text-slate-950 tracking-tight">
              Citizen Complaint & Operations Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              Report municipal infrastructure problems directly to municipal field teams. Track ongoing maintenance and verify repairs in your neighborhood in real time.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/complaints/new"
            className="btn-primary"
          >
            <PlusCircle className="h-4 w-4" strokeWidth={2} />
            Report a complaint
          </Link>
          <Link
            to="/complaints"
            className="btn-secondary"
          >
            <Search className="h-4 w-4" strokeWidth={1.75} />
            Browse all complaints
          </Link>
          <Link
            to="/login"
            className="btn-secondary"
          >
            Sign in to portal
          </Link>
        </div>
      </section>

      {/* Operational Metrics Cards */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3.5 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Total logged</span>
            <Activity className="h-3.5 w-3.5 text-slate-400" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-slate-950 mt-1 font-sans">
            {loading ? '-' : stats.total}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Active repairs</span>
            <span className="h-2 w-2 rounded-full bg-blue-500"></span>
          </div>
          <div className="text-2xl font-bold text-blue-900 mt-1 font-sans">
            {loading ? '-' : stats.inProgress}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Resolved</span>
            <CheckCircle className="h-3.5 w-3.5 text-emerald-600" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-sans">
            {loading ? '-' : stats.resolved}
          </div>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-emerald-900/10 shadow-soft hover:shadow-soft-md transition-all">
          <div className="text-xs font-medium text-slate-500 flex items-center justify-between">
            <span>Critical priority</span>
            <AlertTriangle className="h-3.5 w-3.5 text-red-600" strokeWidth={1.75} />
          </div>
          <div className="text-2xl font-bold text-red-900 mt-1 font-sans">
            {loading ? '-' : stats.critical}
          </div>
        </div>
      </section>

      {/* Recent Complaints Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-emerald-900/10 pb-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-950">
              Recent complaints feed
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">
              Live reports filed by residents across municipal sectors
            </p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 hover:underline"
          >
            <span>View full registry</span>
            <ArrowRight className="h-3 w-3" strokeWidth={2} />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-500 bg-white border border-emerald-900/10 rounded-2xl shadow-soft">
            Loading recent complaints...
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="p-8 text-center bg-white border border-emerald-900/10 rounded-2xl text-xs text-slate-600 space-y-3 shadow-soft">
            <div>No complaints currently recorded in the registry.</div>
            <Link to="/complaints/new" className="btn-primary text-xs inline-flex items-center gap-1.5">
              <PlusCircle className="h-3.5 w-3.5" strokeWidth={2} />
              Report the first issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-emerald-900/10 rounded-2xl p-5 flex flex-col justify-between space-y-3.5 shadow-soft hover:shadow-soft-md hover:border-emerald-600/30 transition-all"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium bg-emerald-50 text-emerald-900 px-2.5 py-0.5 rounded-full border border-emerald-200/70">
                      {item.category}
                    </span>
                    <PriorityBadge priority={item.priority} score={item.priorityScore} />
                  </div>

                  {item.imageUrl && item.imageUrl.trim() !== '' && (
                    <div className="relative h-36 w-full overflow-hidden rounded-xl border border-emerald-900/10 bg-emerald-50/30">
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
                      className="font-bold text-slate-950 hover:text-emerald-700 hover:underline text-sm block leading-snug"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2.5 border-t border-emerald-900/10 flex items-center justify-between text-xs text-slate-500">
                  <span className="truncate max-w-[140px]" title={item.area}>
                    Area: <strong className="text-slate-700 font-medium">{item.area}</strong>
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Explanation Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-emerald-900/10">
        <div className="bg-white p-5 border border-emerald-900/10 rounded-2xl space-y-1.5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-950">Dynamic priority calculation</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Priorities calculate continuously based on community upvotes and days open. Urgent reports automatically surface first for municipal officers.
          </p>
        </div>

        <div className="bg-white p-5 border border-emerald-900/10 rounded-2xl space-y-1.5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-950">Duplicate report detection</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            When reporting a problem, the system matches your locality and description against active complaints, letting you upvote existing issues directly.
          </p>
        </div>

        <div className="bg-white p-5 border border-emerald-900/10 rounded-2xl space-y-1.5 shadow-soft">
          <h3 className="text-sm font-bold text-slate-950">Resolution feedback loop</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Once an officer marks a complaint resolved, the reporting citizen submits a 1 to 5 star rating to evaluate repair quality on site.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
