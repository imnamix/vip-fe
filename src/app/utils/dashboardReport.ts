import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

interface DashboardStats {
  totalEnquiries: number;
  pendingEnquiries: number;
  inProgressEnquiries: number;
  deliveredEnquiries: number;
  dispatchedEnquiries: number;
  cancelledEnquiries: number;
  totalEvents: number;
  totalVipNumbers: number;
  totalGeneralInquiries: number;
  pendingGeneralInquiries: number;
}

interface MonthlyPoint { month: string; year: number; enquiries: number; }
interface StatusPoint  { status: string; count: number; }
interface RecentEnquiry {
  id: number; name: string; mobile: string;
  status: string; inquiryType: string; created_at: string;
}

interface DashboardSummary {
  stats: DashboardStats;
  monthlyTrend: MonthlyPoint[];
  inquiryStatusBreakdown: StatusPoint[];
  recentEnquiries: RecentEnquiry[];
}

const BRAND_RED = '#D32F2F';
const percent = (part: number, total: number) => (total > 0 ? `${Math.round((part / total) * 100)}%` : '—');

export async function downloadDashboardReport(summary: DashboardSummary) {
  const { stats: s, monthlyTrend, inquiryStatusBreakdown, recentEnquiries } = summary;

  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginX = 40;
  const now = new Date();

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(BRAND_RED);
  doc.text('VIP Numerology — Dashboard Report', marginX, 48);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor('#616161');
  doc.text(
    `Generated on ${now.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })} at ${now.toLocaleTimeString('en-IN')}`,
    marginX,
    66,
  );
  doc.setDrawColor('#E0E0E0');
  doc.line(marginX, 76, pageWidth - marginX, 76);

  let cursorY = 96;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor('#212121');
  doc.text('Overview', marginX, cursorY);
  cursorY += 10;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['Metric', { content: 'Value', styles: { halign: 'right' } }]],
    body: [
      ['Total Enquiries', s.totalEnquiries.toLocaleString()],
      ['Pending Enquiries', s.pendingEnquiries.toLocaleString()],
      ['In Progress', s.inProgressEnquiries.toLocaleString()],
      ['Dispatched', s.dispatchedEnquiries.toLocaleString()],
      ['Delivered', s.deliveredEnquiries.toLocaleString()],
      ['Cancelled', s.cancelledEnquiries.toLocaleString()],
      ['Total Events', s.totalEvents.toLocaleString()],
      ['VIP Numbers', s.totalVipNumbers.toLocaleString()],
      ['General Inquiries', s.totalGeneralInquiries.toLocaleString()],
      ['General Inquiries Pending', s.pendingGeneralInquiries.toLocaleString()],
    ],
    theme: 'striped',
    headStyles: { fillColor: [211, 47, 47], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 'auto', halign: 'left' },
      1: { cellWidth: 140, halign: 'right' },
    },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 28;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor('#212121');
  doc.text('Key Rates', marginX, cursorY);
  cursorY += 10;

  autoTable(doc, {
    startY: cursorY,
    margin: { left: marginX, right: marginX },
    head: [['Rate', { content: 'Value', styles: { halign: 'right' } }, 'Description']],
    body: [
      ['Delivery Rate', percent(s.deliveredEnquiries, s.totalEnquiries), 'of all enquiries delivered'],
      ['General Pending', percent(s.pendingGeneralInquiries, s.totalGeneralInquiries), 'general inquiries awaiting reply'],
      ['Inquiry Pending', percent(s.pendingEnquiries, s.totalEnquiries), 'of all enquiries still pending'],
    ],
    theme: 'striped',
    headStyles: { fillColor: [211, 47, 47], textColor: 255, fontStyle: 'bold' },
    styles: { fontSize: 10, cellPadding: 6, valign: 'middle' },
    columnStyles: {
      0: { cellWidth: 130, halign: 'left' },
      1: { cellWidth: 80, halign: 'right' },
      2: { cellWidth: 'auto', halign: 'left' },
    },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 28;

  if (inquiryStatusBreakdown.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#212121');
    doc.text('Enquiry Status Breakdown', marginX, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [['Status', { content: 'Count', styles: { halign: 'right' } }]],
      body: inquiryStatusBreakdown.map(d => [d.status, d.count.toLocaleString()]),
      theme: 'striped',
      headStyles: { fillColor: [211, 47, 47], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 140, halign: 'right' },
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 28;
  }

  if (monthlyTrend.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#212121');
    doc.text('Monthly Enquiry Trend', marginX, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [[
        'Month',
        { content: 'Year', styles: { halign: 'right' } },
        { content: 'Enquiries', styles: { halign: 'right' } },
      ]],
      body: monthlyTrend.map(m => [m.month, String(m.year), m.enquiries.toLocaleString()]),
      theme: 'striped',
      headStyles: { fillColor: [211, 47, 47], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 10, cellPadding: 6, valign: 'middle' },
      columnStyles: {
        0: { cellWidth: 'auto', halign: 'left' },
        1: { cellWidth: 100, halign: 'right' },
        2: { cellWidth: 140, halign: 'right' },
      },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 28;
  }

  if (recentEnquiries.length > 0) {
    if (cursorY > doc.internal.pageSize.getHeight() - 150) {
      doc.addPage();
      cursorY = 48;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor('#212121');
    doc.text('Recent Enquiries', marginX, cursorY);
    cursorY += 10;

    autoTable(doc, {
      startY: cursorY,
      margin: { left: marginX, right: marginX },
      head: [['Name', 'Mobile', 'Type', 'Status', 'Received On']],
      body: recentEnquiries.map(e => [
        e.name ?? '—',
        e.mobile ?? '—',
        e.inquiryType ?? 'enquiry',
        e.status,
        new Date(e.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      ]),
      theme: 'striped',
      headStyles: { fillColor: [211, 47, 47], textColor: 255, fontStyle: 'bold' },
      styles: { fontSize: 9, cellPadding: 6 },
    });
  }

  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor('#9E9E9E');
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - marginX,
      doc.internal.pageSize.getHeight() - 20,
      { align: 'right' },
    );
  }

  const fileDate = now.toISOString().slice(0, 10);
  doc.save(`vip-dashboard-report-${fileDate}.pdf`);
}
