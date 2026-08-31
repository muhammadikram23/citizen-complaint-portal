import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'Pending').toLowerCase();

  const configs = {
    resolved: {
      label: 'Resolved',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    },
    'in progress': {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-800 border-blue-200',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-amber-50 text-amber-800 border-amber-200',
    },
  };

  const current = configs[normalized] || configs.pending;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border font-sans shadow-xs ${current.classes}`}
    >
      {current.label}
    </span>
  );
};

export default StatusBadge;
