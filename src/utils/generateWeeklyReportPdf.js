import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Converts image URL to base64 Data URI for jsPDF embedding
 */
const getBase64FromUrl = async (url) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Could not load logo for PDF:', err);
    return null;
  }
};

/**
 * Generates an official executive PDF summary report of the week
 */
export const generateWeeklyReportPdf = async ({
  logoUrl,
  officerName,
  officerEmail,
  aiSummary,
  aiStats,
  complaints = [],
}) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const todayStr = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const docRef = `MUNI-OPS-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}${String(new Date().getDate()).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;

  // 1. EMBED LOGO & INSTITUTIONAL HEADER
  let logoBase64 = null;
  if (logoUrl) {
    logoBase64 = await getBase64FromUrl(logoUrl);
  }

  // Header background bar
  doc.setFillColor(30, 58, 95); // Deep municipal navy (#1E3A5F)
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Header logo
  if (logoBase64) {
    try {
      doc.addImage(logoBase64, 'PNG', margin, 3, 22, 22);
    } catch (e) {
      console.warn('Failed to embed logo in PDF:', e);
    }
  }

  // Header Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('MUNICIPAL CITIZEN COMPLAINT & OPERATIONS PORTAL', logoBase64 ? margin + 26 : margin, 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9.5);
  doc.text('Executive Weekly Operations Briefing Report', logoBase64 ? margin + 26 : margin, 17);

  doc.setFontSize(7.5);
  doc.setTextColor(200, 215, 235);
  doc.text(`Doc Ref: ${docRef}  |  Official Record`, logoBase64 ? margin + 26 : margin, 23);

  // Metadata sub-header bar
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, 32, pageWidth - margin * 2, 10, 'F');
  doc.setDrawColor(209, 213, 219);
  doc.rect(margin, 32, pageWidth - margin * 2, 10, 'S');

  doc.setTextColor(55, 65, 81);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('GENERATED ON:', margin + 3, 38.5);
  doc.setFont('helvetica', 'normal');
  doc.text(todayStr, margin + 29, 38.5);

  doc.setFont('helvetica', 'bold');
  doc.text('OFFICER IN CHARGE:', pageWidth / 2 + 5, 38.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`${officerName || 'Operations Officer'} (${officerEmail || 'officer@example.com'})`, pageWidth / 2 + 40, 38.5);

  let currentY = 47;

  // 2. SECTION 1: OPERATIONS EXECUTIVE BRIEFING (AI SYNTHESIS)
  doc.setFillColor(30, 58, 95);
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('1. EXECUTIVE OPERATIONS BRIEFING', margin + 3, currentY + 4.2);

  currentY += 8;

  const briefingText =
    aiSummary ||
    'Active municipal operations are currently tracking community infrastructure complaints. High priority tickets in water, road repairs, and electricity are prioritized according to dynamic citizen upvotes and time elapsed.';

  doc.setTextColor(31, 41, 55);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const splitBriefing = doc.splitTextToSize(briefingText, pageWidth - margin * 2 - 6);

  const briefingBoxHeight = Math.max(14, splitBriefing.length * 4 + 4);
  doc.setFillColor(249, 250, 251);
  doc.rect(margin, currentY, pageWidth - margin * 2, briefingBoxHeight, 'F');
  doc.setDrawColor(229, 231, 235);
  doc.rect(margin, currentY, pageWidth - margin * 2, briefingBoxHeight, 'S');

  doc.text(splitBriefing, margin + 3, currentY + 4.5);
  currentY += briefingBoxHeight + 6;

  // 3. SECTION 2: KEY PERFORMANCE INDICATORS (KPIs)
  doc.setFillColor(30, 58, 95);
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('2. KEY PERFORMANCE INDICATORS (PAST 7 DAYS)', margin + 3, currentY + 4.2);

  currentY += 8;

  const totalLogged = aiStats?.totalComplaints || complaints.length;
  const criticalCount = aiStats?.criticalCount || complaints.filter((c) => c.priority === 'Critical').length;
  const overdueCount = aiStats?.overdueCount || 0;
  const resolvedCount = aiStats?.resolvedThisWeek || complaints.filter((c) => c.status === 'Resolved').length;
  const avgRating = aiStats?.avgCitizenRating > 0 ? `${aiStats.avgCitizenRating} / 5.0` : 'N/A';
  const inProgressCount = complaints.filter((c) => c.status === 'In Progress').length;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['METRIC DESCRIPTION', 'COUNT / VALUE', 'OPERATIONAL STATUS']],
    body: [
      ['Total Complaints Logged in Registry', `${totalLogged}`, 'Active Registry Volume'],
      ['Critical Priority Issues (Immediate Hazard)', `${criticalCount}`, criticalCount > 0 ? 'High Attention Required' : 'Optimal'],
      ['Overdue Tickets (> 3 Days Open)', `${overdueCount}`, overdueCount > 0 ? 'SLA Remediation Target' : 'Within SLA Window'],
      ['Complaints Under Active Repair', `${inProgressCount}`, 'Field Teams Dispatched'],
      ['Successfully Resolved This Week', `${resolvedCount}`, 'Maintenance Completed'],
      ['Average Citizen Resolution Rating', `${avgRating}`, 'Citizen Satisfaction Index'],
    ],
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [55, 65, 81],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // 4. SECTION 3: CATEGORY VOLUME BREAKDOWN & RESOLUTION MATRIX
  const categories = ['Road', 'Garbage', 'Water', 'Electricity', 'Other'];
  const categoryRows = categories.map((cat) => {
    const items = complaints.filter((c) => c.category === cat);
    const pending = items.filter((c) => c.status === 'Pending').length;
    const inProg = items.filter((c) => c.status === 'In Progress').length;
    const resolved = items.filter((c) => c.status === 'Resolved').length;
    const rate = items.length > 0 ? `${Math.round((resolved / items.length) * 100)}%` : '0%';
    return [cat, `${items.length}`, `${pending}`, `${inProg}`, `${resolved}`, rate];
  });

  doc.setFillColor(30, 58, 95);
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('3. CATEGORY VOLUME & RESOLUTION MATRIX', margin + 3, currentY + 4.2);

  currentY += 8;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['CATEGORY', 'TOTAL', 'PENDING', 'IN PROGRESS', 'RESOLVED', 'RESOLUTION RATE']],
    body: categoryRows,
    styles: {
      fontSize: 8,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [55, 65, 81],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
  });

  // 5. SECTION 4: PRIORITY ACTION ITEMS TABLE (PAGE 2 IF NEEDED)
  currentY = doc.lastAutoTable.finalY + 8;

  if (currentY > pageHeight - 60) {
    doc.addPage();
    currentY = 20;
  }

  doc.setFillColor(30, 58, 95);
  doc.rect(margin, currentY, pageWidth - margin * 2, 6, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('4. CRITICAL & HIGH PRIORITY TICKETS REQUIRING DISPATCH', margin + 3, currentY + 4.2);

  currentY += 8;

  const urgentComplaints = complaints.filter(
    (c) => c.priority === 'Critical' || c.priority === 'High'
  );

  const urgentRows =
    urgentComplaints.length > 0
      ? urgentComplaints.map((c) => [
          c.priority.toUpperCase(),
          `${c.title}\nArea: ${c.area}`,
          c.category,
          c.status,
          `Score: ${c.priorityScore || 0}\n(${c.upvotes || 0} votes)`,
          c.officerRemark ? `"${c.officerRemark}"` : 'Pending Field Team Dispatch',
        ])
      : [
          [
            'OPTIMAL',
            'No Critical or High priority complaints are pending immediate dispatch at this time.',
            '-',
            'RESOLVED',
            '-',
            'Regular maintenance ongoing',
          ],
        ];

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    theme: 'grid',
    head: [['PRIORITY', 'TICKET TITLE & AREA', 'CATEGORY', 'STATUS', 'SCORE', 'REMARK / DISPATCH']],
    body: urgentRows,
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
    },
    headStyles: {
      fillColor: [55, 65, 81],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251],
    },
    columnStyles: {
      0: { cellWidth: 20, fontStyle: 'bold' },
      1: { cellWidth: 50 },
      2: { cellWidth: 22 },
      3: { cellWidth: 22 },
      4: { cellWidth: 24 },
      5: { cellWidth: 'auto' },
    },
  });

  // 6. OFFICIAL FOOTERS (Add page numbers to all pages)
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setDrawColor(209, 213, 219);
    doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(107, 114, 128);
    doc.text(
      'Municipal Operations Directorate • Citizen Complaint Portal • Confidential Municipal Report',
      margin,
      pageHeight - 7
    );
    doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 16, pageHeight - 7);
  }

  // Save the generated PDF
  const filename = `Municipal_Weekly_Operations_Summary_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(filename);
};
