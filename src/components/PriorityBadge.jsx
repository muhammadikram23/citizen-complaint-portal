import React from 'react';

export const PriorityBadge = ({ priority, score }) => {
  const normalized = (priority || 'Low').toLowerCase();

  const configs = {
    critical: {
      label: 'Critical',
      classes: 'bg-red-50 text-red-800 border-red-200 font-semibold',
    },
    high: {
      label: 'High',
      classes: 'bg-orange-50 text-orange-800 border-orange-200 font-medium',
    },
    medium: {
      label: 'Medium',
      classes: 'bg-blue-50 text-blue-800 border-blue-200 font-medium',
    },
    low: {
      label: 'Low',
      classes: 'bg-emerald-50/50 text-slate-700 border-emerald-900/10 font-medium',
    },
  };

  const current = configs[normalized] || configs.low;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border font-sans shadow-xs ${current.classes}`}
    >
      <span>{current.label}</span>
    </span>
  );
};

export default PriorityBadge;
