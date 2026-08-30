import React from 'react';

export const PriorityBadge = ({ priority, score }) => {
  const normalized = (priority || 'Low').toLowerCase();

  const configs = {
    critical: {
      label: 'Critical',
      classes: 'bg-red-50 text-red-800 border-red-300 font-semibold',
    },
    high: {
      label: 'High',
      classes: 'bg-orange-50 text-orange-800 border-orange-300 font-medium',
    },
    medium: {
      label: 'Medium',
      classes: 'bg-blue-50 text-blue-800 border-blue-300 font-medium',
    },
    low: {
      label: 'Low',
      classes: 'bg-gray-100 text-gray-700 border-gray-300',
    },
  };

  const current = configs[normalized] || configs.low;

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs border font-sans ${current.classes}`}
    >
      <span>{current.label}</span>
    </span>
  );
};

export default PriorityBadge;
