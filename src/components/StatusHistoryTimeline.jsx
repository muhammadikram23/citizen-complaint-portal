import React from 'react';
import { StatusBadge } from './StatusBadge';

export const StatusHistoryTimeline = ({ history }) => {
  if (!history || !Array.isArray(history) || history.length === 0) {
    return null;
  }

  // Sort chronological order (oldest to newest) or show as logged
  const entries = [...history].sort(
    (a, b) => new Date(a.changedAt) - new Date(b.changedAt)
  );

  return (
    <div className="space-y-3 font-sans">
      <div className="text-xs font-bold text-text uppercase tracking-wider">
        Status history & audit trail
      </div>

      <div className="relative pl-5 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
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
              <div className="absolute -left-5 mt-1.5 h-2.5 w-2.5 rounded-full border-2 border-surface bg-text" />

              <div className="flex-1 bg-surface border border-border rounded p-3 text-xs space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <StatusBadge status={item.status} />
                  <span className="text-[11px] text-muted">{formattedDate}</span>
                </div>

                {item.remark && (
                  <p className="text-text text-xs italic leading-relaxed pt-0.5">
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
