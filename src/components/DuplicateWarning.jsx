import React from 'react';
import { AlertCircle, ThumbsUp } from 'lucide-react';
import { PriorityBadge } from './PriorityBadge';
import { StatusBadge } from './StatusBadge';

export const DuplicateWarning = ({ duplicates, onUpvote, onDismiss }) => {
  if (!duplicates || duplicates.length === 0) return null;

  return (
    <div className="rounded border border-amber-300 bg-amber-50/80 p-4 mb-5">
      <div className="flex items-start gap-3">
        <AlertCircle className="h-5 w-5 text-amber-800 shrink-0 mt-0.5" strokeWidth={1.75} />
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-amber-950">
            Similar active complaints found in this area
          </h3>
          <p className="text-xs text-amber-900 mt-0.5 leading-relaxed">
            Existing reports match this category and location. Upvoting an existing issue increases its priority score for faster municipal response.
          </p>

          <div className="mt-3 space-y-2 max-h-60 overflow-y-auto">
            {duplicates.map((item) => (
              <div
                key={item.id || item._id}
                className="bg-white border border-amber-200 rounded p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="space-y-1 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-slate-900 truncate">
                      {item.title}
                    </span>
                    {item.similarity !== undefined && (
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-medium bg-amber-100 text-amber-900 border border-amber-300">
                        {Math.round(item.similarity * 100)}% match
                      </span>
                    )}
                    <PriorityBadge priority={item.priority} score={item.priorityScore} />
                    <StatusBadge status={item.status} />
                  </div>

                  {item.description && (
                    <p className="text-slate-600 line-clamp-1">
                      {item.description}
                    </p>
                  )}

                  <div className="text-xs text-slate-500">
                    Area: <span className="text-slate-800 font-medium">{item.area}</span> &bull; Upvotes: <span className="font-semibold text-slate-900">{item.upvotes}</span>
                  </div>
                </div>

                <div className="shrink-0">
                  <button
                    type="button"
                    onClick={() => onUpvote(item.id || item._id)}
                    className="btn-primary text-xs min-h-[36px] py-1 px-3 inline-flex items-center gap-1.5"
                  >
                    <ThumbsUp className="h-3.5 w-3.5" strokeWidth={1.75} />
                    Upvote instead ({item.upvotes})
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-3 pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <span className="text-amber-900">
              Is your problem distinct from the items above?
            </span>
            <button
              type="button"
              onClick={onDismiss}
              className="text-slate-900 font-semibold hover:underline text-left"
            >
              Continue filing new complaint
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DuplicateWarning;
