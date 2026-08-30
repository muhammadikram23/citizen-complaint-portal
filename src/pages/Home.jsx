import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import logo from '../assets/logo.png';
import { PriorityBadge } from '../components/PriorityBadge';
import { StatusBadge } from '../components/StatusBadge';

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
        setRecentComplaints(list.slice(0, 6));

        const total = res.data.count || list.length;
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
      {/* Official Civic Hero */}
      <section className="bg-white border border-gray-300 rounded p-6 sm:p-8 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <img src={logo} alt="Municipal Seal Logo" className="h-20 sm:h-24 w-auto object-contain shrink-0 self-start sm:self-auto" />
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl text-gray-950">
              Citizen Complaint & Operations Portal
            </h1>
            <p className="text-gray-700">
              Report municipal infrastructure problems directly to municipal field teams. Track ongoing maintenance and verify repairs in your neighborhood.
            </p>
          </div>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <Link
            to="/complaints/new"
            className="btn-primary"
          >
            Report a complaint
          </Link>
          <Link
            to="/complaints"
            className="btn-secondary"
          >
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

      {/* Operational Metrics */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded border border-gray-300">
          <div className="text-xs font-medium text-gray-500">Total complaints logged</div>
          <div className="text-2xl font-bold text-gray-950 mt-1 font-sans">
            {loading ? '-' : stats.total}
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-gray-300">
          <div className="text-xs font-medium text-gray-500">Under active repair</div>
          <div className="text-2xl font-bold text-blue-900 mt-1 font-sans">
            {loading ? '-' : stats.inProgress}
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-gray-300">
          <div className="text-xs font-medium text-gray-500">Successfully resolved</div>
          <div className="text-2xl font-bold text-emerald-900 mt-1 font-sans">
            {loading ? '-' : stats.resolved}
          </div>
        </div>

        <div className="bg-white p-4 rounded border border-gray-300">
          <div className="text-xs font-medium text-gray-500">Critical priority</div>
          <div className="text-2xl font-bold text-red-900 mt-1 font-sans">
            {loading ? '-' : stats.critical}
          </div>
        </div>
      </section>

      {/* Recent Complaints Feed */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <div>
            <h2 className="text-xl text-gray-950">
              Recent complaints feed
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Live reports filed by residents across municipal sectors
            </p>
          </div>
          <Link
            to="/complaints"
            className="text-xs font-semibold text-gray-900 hover:underline"
          >
            View full registry
          </Link>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-gray-500">
            Loading recent complaints...
          </div>
        ) : recentComplaints.length === 0 ? (
          <div className="p-8 text-center bg-white border border-gray-300 rounded text-xs text-gray-600 space-y-2">
            <div>No complaints currently recorded in the registry.</div>
            <Link to="/complaints/new" className="btn-primary text-xs">
              Report the first issue
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentComplaints.map((item) => (
              <div
                key={item._id}
                className="bg-white border border-gray-300 rounded p-4 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-medium bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                      {item.category}
                    </span>
                    <PriorityBadge priority={item.priority} score={item.priorityScore} />
                  </div>

                  {item.imageUrl && item.imageUrl.trim() !== '' && (
                    <div className="relative h-36 w-full overflow-hidden rounded border border-gray-200 bg-gray-100">
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
                      className="font-semibold text-gray-950 hover:underline text-sm block"
                    >
                      {item.title}
                    </Link>
                    <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                  <span className="truncate max-w-[140px]" title={item.area}>
                    Area: {item.area}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* System Explanation Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        <div className="bg-white p-5 border border-gray-300 rounded space-y-1.5">
          <h3 className="text-sm font-bold text-gray-950">Dynamic priority calculation</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Priorities calculate continuously based on community upvotes and days open (Score = upvotes &times; 2 + age). Urgent reports automatically surface first.
          </p>
        </div>

        <div className="bg-white p-5 border border-gray-300 rounded space-y-1.5">
          <h3 className="text-sm font-bold text-gray-950">Duplicate report detection</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            When reporting a problem, the system matches your locality and description against active complaints, letting you upvote existing issues directly.
          </p>
        </div>

        <div className="bg-white p-5 border border-gray-300 rounded space-y-1.5">
          <h3 className="text-sm font-bold text-gray-950">Resolution feedback loop</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Once an officer marks a complaint resolved, the reporting citizen submits a 1 to 5 star rating to evaluate repair quality.
          </p>
        </div>
      </section>
    </div>
  );
};

export default Home;
