import React from 'react';
import { StatusBadge } from './StatusBadge';

export const StatusHistoryTimeline = ({ history }) => {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return null;
  }

  // Sort chronological order (oldest to newest)
  const entries = [...history].sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  );

  return (
    <div className="space-y-3.5 font-sans">
      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
        Status history & audit trail
      </div>

      <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-emerald-900/10">
        {entries.map((item, index) => {
          const formattedDate = item.changedAt
            ? new Date(item.changedAt).toLocaleString(undefined, {
                dateStyle: 'medium',
                timeStyle: 'short',
              })
            : 'Date not recorded';

          return (
            <div key={item._id || index} className="relative flex items-start gap-3">
              {/* Timeline Bullet Dot */}
              <div className="absolute -left-6 mt-1.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-600 shadow-soft" />

              <div className="flex-1 bg-emerald-50/40 border border-emerald-900/10 rounded-2xl p-4 text-xs space-y-1.5 shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-[11px] text-slate-500 font-medium">{formattedDate}</span>
                </div>

                {item.remark && (
                  <p className="text-slate-800 text-xs italic leading-relaxed pt-0.5">
                    "{item.remark}"
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StatusHistoryTimeline;
