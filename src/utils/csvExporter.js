/**
 * Utility to convert complaint objects into CSV format and trigger browser download.
 *
 * @param {Array} complaints - List of complaint objects
 * @param {string} customFilename - Optional custom filename
 */
export const downloadComplaintsAsCSV = (complaints = [], customFilename) => {
  const fields = [
    { key: '_id', label: 'Ticket ID' },
    { key: 'title', label: 'Title' },
    { key: 'category', label: 'Category' },
    { key: 'area', label: 'Area / Locality' },
    { key: 'status', label: 'Lifecycle Status' },
    { key: 'priority', label: 'Priority Tier' },
    { key: 'priorityScore', label: 'Priority Score' },
    { key: 'upvotes', label: 'Upvotes' },
    { key: 'creatorName', label: 'Filed By (Name)' },
    { key: 'creatorEmail', label: 'Filed By (Email)' },
    { key: 'createdAt', label: 'Date Filed' },
    { key: 'updatedAt', label: 'Last Updated' },
    { key: 'officerRemark', label: 'Officer Remark' },
    { key: 'feedbackRating', label: 'Citizen Rating (1-5)' },
    { key: 'feedbackComment', label: 'Citizen Comments' },
    { key: 'description', label: 'Detailed Description' },
  ];

  const escapeCSV = (val) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = fields.map((f) => escapeCSV(f.label)).join(',');

  const rows = complaints.map((c) => {
    return fields
      .map((f) => {
        let val = '';
        if (f.key === 'creatorName') {
          val = c.createdBy?.name || 'Citizen';
        } else if (f.key === 'creatorEmail') {
          val = c.createdBy?.email || 'N/A';
        } else if (f.key === 'createdAt' || f.key === 'updatedAt') {
          val = c[f.key] ? new Date(c[f.key]).toLocaleString() : '';
        } else if (f.key === 'feedbackRating') {
          val = c.feedbackGiven ? `${c.feedbackRating} / 5` : 'Not Provided';
        } else {
          val = c[f.key] !== undefined && c[f.key] !== null ? c[f.key] : '';
        }
        return escapeCSV(val);
      })
      .join(',');
  });

  const csvContent = '\uFEFF' + [headerLine, ...rows].join('\r\n'); // UTF-8 BOM for Excel compatibility
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const filename =
    customFilename ||
    `municipal-complaints-registry-${new Date().toISOString().slice(0, 10)}.csv`;

  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default downloadComplaintsAsCSV;
