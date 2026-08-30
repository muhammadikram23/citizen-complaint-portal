import React from 'react';

export const StatusBadge = ({ status }) => {
  const normalized = (status || 'Pending').toLowerCase();

  const configs = {
    resolved: {
      label: 'Resolved',
      classes: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    },
    'in progress': {
      label: 'In Progress',
      classes: 'bg-blue-50 text-blue-800 border-blue-300',
    },
    pending: {
      label: 'Pending',
      classes: 'bg-amber-50 text-amber-800 border-amber-300',
    },
  };

  const current = configs[normalized] || configs.pending;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border font-sans ${current.classes}`}
    >
      {current.label}
    </span>
  );
};

export default StatusBadge;
