// app/lib/pdf-report.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

interface ReportData {
  sales: {
    totalLeads: number;
    qualifiedLeads: number;
    convertedLeads: number;
    lostLeads: number;
    conversionRate: number;
    averageDealValue: number;
  };
  clients: {
    active: number;
    new: number;
    lost: number;
    retention: number;
  };
  finance: {
    totalRevenue: number;
    monthlyRevenue: number;
    recurringRevenue: number;
    outstandingInvoices: number;
  };
  services: Array<{
    name: string;
    clients: number;
    revenue: number;
  }>;
  leadSources: Array<{
    source: string;
    leads: number;
    qualified: number;
    converted: number;
  }>;
}

export function generatePDF(data: ReportData, dateRange: string): Buffer {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  const formatCurrency = (amount: number) => `£${amount.toFixed(2)}`;
  const now = new Date();

  // Colors
  const primaryColor: [number, number, number] = [0, 104, 227];
  const darkColor: [number, number, number] = [10, 22, 40];

  // Helper: Add a line
  const addLine = (x: number, yPos: number, width: number, color: [number, number, number] = primaryColor) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(x, yPos, x + width, yPos);
  };

  // ============================================================
  // HEADER WITH LOGO
  // ============================================================
  
  let logoAdded = false;
  
  // Try to add logo
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      const logoBase64 = logoData.toString('base64');
      const logoImage = `data:image/png;base64,${logoBase64}`;
      
      // Add logo image (left side)
      doc.addImage(logoImage, 'PNG', margin, y - 5, 14, 14);
      logoAdded = true;
      
      // Company name next to logo
      doc.setFontSize(20);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('WEBISTIC', margin + 18, y + 4);
      
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Marketing Solutions', margin + 18, y + 11);
    }
  } catch (error) {
    console.error('Logo load error:', error);
  }

  // Fallback: Text only if logo failed
  if (!logoAdded) {
    doc.setFontSize(22);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('WEBISTIC', margin, y);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Marketing Solutions', margin, y + 6);
    y += 6;
  }

  // Date (right side)
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const dateStr = `Generated: ${now.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  doc.text(dateStr, pageWidth - margin - doc.getTextWidth(dateStr), y + 4);

  // Adjust y position after header
  if (logoAdded) {
    y += 20;
  } else {
    y += 18;
  }
  
  addLine(margin, y, pageWidth - margin * 2);
  y += 10;

  // Title
  doc.setFontSize(18);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('Business Performance Report', margin, y);
  y += 8;
  doc.setFontSize(11);
  doc.setTextColor(100, 100, 100);
  doc.text(`Date Range: ${dateRange}`, margin, y);
  y += 15;

  // === EXECUTIVE SUMMARY ===
  doc.setFontSize(13);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('EXECUTIVE SUMMARY', margin, y);
  y += 2;
  addLine(margin, y, 60, primaryColor);
  y += 8;

  // Summary Cards
  const cards = [
    { label: 'Total Revenue', value: formatCurrency(data.finance.totalRevenue) },
    { label: 'Total Leads', value: data.sales.totalLeads.toString() },
    { label: 'Active Clients', value: data.clients.active.toString() },
    { label: 'Conversion Rate', value: `${data.sales.conversionRate}%` },
  ];

  let x = margin;
  cards.forEach((card, index) => {
    doc.setFillColor(245, 248, 250);
    doc.rect(x, y - 4, 40, 20, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(card.label, x + 2, y + 4);
    doc.setFontSize(12);
    if (index === 0) {
      doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    } else if (index === 3) {
      doc.setTextColor(34, 197, 94);
    } else {
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    }
    doc.text(card.value, x + 2, y + 14);
    x += 44;
  });
  y += 22;

  // === SALES REPORT ===
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('SALES REPORT', margin, y);
  y += 2;
  addLine(margin, y, 50, darkColor);
  y += 8;

  const salesData = [
    ['Qualified Leads', data.sales.qualifiedLeads.toString()],
    ['Converted', data.sales.convertedLeads.toString()],
    ['Avg Deal Value', formatCurrency(data.sales.averageDealValue)],
  ];

  x = margin;
  salesData.forEach((item) => {
    doc.setFillColor(245, 248, 250);
    doc.rect(x, y - 4, 60, 18, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(item[0], x + 2, y + 4);
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(item[1], x + 2, y + 13);
    x += 64;
  });
  y += 22;

  // === CLIENT REPORT ===
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('CLIENT REPORT', margin, y);
  y += 2;
  addLine(margin, y, 50, darkColor);
  y += 8;

  const clientData = [
    ['New Clients', data.clients.new.toString()],
    ['Lost Clients', data.clients.lost.toString()],
    ['Retention Rate', `${data.clients.retention}%`],
  ];

  x = margin;
  clientData.forEach((item) => {
    doc.setFillColor(245, 248, 250);
    doc.rect(x, y - 4, 60, 18, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(item[0], x + 2, y + 4);
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(item[1], x + 2, y + 13);
    x += 64;
  });
  y += 22;

  // === FINANCE REPORT ===
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('FINANCE REPORT', margin, y);
  y += 2;
  addLine(margin, y, 50, darkColor);
  y += 8;

  const financeData = [
    ['Monthly Revenue', formatCurrency(data.finance.monthlyRevenue)],
    ['Recurring Revenue', formatCurrency(data.finance.recurringRevenue)],
    ['Outstanding', formatCurrency(data.finance.outstandingInvoices)],
  ];

  x = margin;
  financeData.forEach((item) => {
    doc.setFillColor(245, 248, 250);
    doc.rect(x, y - 4, 60, 18, 'F');
    doc.setFontSize(7);
    doc.setTextColor(100, 100, 100);
    doc.text(item[0], x + 2, y + 4);
    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text(item[1], x + 2, y + 13);
    x += 64;
  });
  y += 22;

  // === SERVICE PERFORMANCE ===
  y += 5;
  doc.setFontSize(12);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('SERVICE PERFORMANCE', margin, y);
  y += 2;
  addLine(margin, y, 50, darkColor);
  y += 8;

  const serviceRows = data.services.map(s => [
    s.name,
    s.clients.toString(),
    formatCurrency(s.revenue),
    data.finance.totalRevenue > 0 ? `${Math.round((s.revenue / data.finance.totalRevenue) * 100)}%` : '0%'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Service', 'Clients', 'Revenue', '% of Total']],
    body: serviceRows,
    theme: 'plain',
    headStyles: {
      fillColor: [10, 22, 40],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      2: { cellWidth: 40, halign: 'right' },
      3: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // Get Y position after autoTable
  y = (doc as any).lastAutoTable.finalY + 15;

  // === LEAD SOURCE PERFORMANCE ===
  doc.setFontSize(12);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('LEAD SOURCE PERFORMANCE', margin, y);
  y += 2;
  addLine(margin, y, 50, darkColor);
  y += 8;

  const sourceRows = data.leadSources.map(s => [
    s.source.replace('_', ' '),
    s.leads.toString(),
    s.qualified.toString(),
    s.converted.toString(),
    s.leads > 0 ? `${Math.round((s.converted / s.leads) * 100)}%` : '0%'
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Source', 'Leads', 'Qualified', 'Converted', 'Rate']],
    body: sourceRows,
    theme: 'plain',
    headStyles: {
      fillColor: [10, 22, 40],
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      0: { cellWidth: 50 },
      1: { cellWidth: 30, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 30, halign: 'right' },
      4: { cellWidth: 25, halign: 'right' },
    },
    margin: { left: margin, right: margin },
  });

  // Footer
  y = (doc as any).lastAutoTable.finalY + 20;
  if (y > 260) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(margin, y, pageWidth - margin, y);
  y += 5;
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Webistic CRM', margin, y);
  doc.text('https://webistic.co', pageWidth - margin - 30, y);
  
  y += 5;
  doc.setTextColor(180, 180, 180);
  doc.text('Page 1 of 1', pageWidth - margin - 30, y);

  // Return as Buffer
  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}