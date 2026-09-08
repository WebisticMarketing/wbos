// app/lib/task-pdf.ts
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import fs from 'fs';
import path from 'path';

interface TaskData {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    business: string | null;
  } | null;
  project: {
    id: string;
    name: string;
    service: string;
  } | null;
  assignedToMember: {
    id: string;
    name: string;
    role: string;
  } | null;
}

export function generateTaskPDF(task: TaskData): Buffer {
  const doc = new jsPDF('p', 'mm', 'a4');
  const pageWidth = 210;
  const margin = 20;
  let y = 20;

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Colors
  const primaryColor: [number, number, number] = [0, 104, 227];
  const darkColor: [number, number, number] = [10, 22, 40];
  const grayColor: [number, number, number] = [100, 100, 100];
  const lightGrayColor: [number, number, number] = [245, 248, 250];

  const addLine = (x: number, yPos: number, width: number, color: [number, number, number] = primaryColor) => {
    doc.setDrawColor(color[0], color[1], color[2]);
    doc.line(x, yPos, x + width, yPos);
  };

  // Header with Logo
  let logoAdded = false;
  try {
    const logoPath = path.join(process.cwd(), 'public', 'logo.png');
    if (fs.existsSync(logoPath)) {
      const logoData = fs.readFileSync(logoPath);
      const logoBase64 = logoData.toString('base64');
      const logoImage = `data:image/png;base64,${logoBase64}`;
      doc.addImage(logoImage, 'PNG', margin, y - 5, 14, 14);
      logoAdded = true;
      doc.setFontSize(20);
      doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
      doc.text('WEBISTIC', margin + 18, y + 4);
      doc.setFontSize(9);
      doc.setTextColor(100, 100, 100);
      doc.text('Marketing Solutions', margin + 18, y + 11);
    }
  } catch (error) {
    // Fallback: Text only
  }

  if (!logoAdded) {
    doc.setFontSize(22);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('WEBISTIC', margin, y);
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text('Marketing Solutions', margin, y + 6);
    y += 6;
  }

  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  const dateStr = `Generated: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}`;
  doc.text(dateStr, pageWidth - margin - doc.getTextWidth(dateStr), y + 4);

  if (logoAdded) {
    y += 20;
  } else {
    y += 18;
  }
  
  addLine(margin, y, pageWidth - margin * 2);
  y += 12;

  // Title
  doc.setFontSize(16);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text('TASK DETAILS', margin, y);
  doc.setFontSize(9);
  doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
  doc.text(`#${task.id.slice(0, 8)}`, margin + 45, y + 1);
  y += 10;

  // Status badge
  const statusColors: Record<string, [number, number, number]> = {
    todo: [150, 150, 150],
    'in-progress': [234, 179, 8],
    review: [168, 85, 247],
    done: [34, 197, 94],
    blocked: [239, 68, 68],
  };
  const statusLabels: Record<string, string> = {
    todo: 'Pending',
    'in-progress': 'In Progress',
    review: 'Review',
    done: 'Completed',
    blocked: 'Blocked',
  };
  const statusColor = statusColors[task.status] || [100, 100, 100];
  const statusLabel = statusLabels[task.status] || task.status.replace('-', ' ').toUpperCase();
  
  doc.setFillColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.roundedRect(margin, y - 4, 35, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(statusLabel.toUpperCase(), margin + 3, y + 3.5);

  // Priority badge
  const priorityColors: Record<string, [number, number, number]> = {
    low: [59, 130, 246],
    medium: [234, 179, 8],
    high: [249, 115, 22],
    urgent: [239, 68, 68],
  };
  const priorityColor = priorityColors[task.priority] || [100, 100, 100];
  doc.setFillColor(priorityColor[0], priorityColor[1], priorityColor[2]);
  doc.roundedRect(margin + 40, y - 4, 30, 10, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(task.priority.toUpperCase(), margin + 43, y + 3.5);
  y += 14;

  // Task Title
  doc.setFontSize(13);
  doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
  doc.text(task.title, margin, y);
  y += 10;

  // Description
  if (task.description) {
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.roundedRect(margin, y - 3, 170, 2, 1, 1, 'F');
    y += 6;
    doc.setFontSize(10);
    doc.setTextColor(60, 60, 60);
    const lines = doc.splitTextToSize(task.description, 165);
    doc.text(lines, margin, y);
    y += lines.length * 5 + 8;
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.roundedRect(margin, y - 3, 170, 2, 1, 1, 'F');
    y += 10;
  }

  // Details Table
  const detailsData = [
    ['Created', formatDateTime(task.createdAt)],
    ['Last Updated', formatDateTime(task.updatedAt)],
    ['Due Date', formatDate(task.dueDate)],
    ['Assigned To', task.assignedToMember?.name || 'Unassigned'],
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: detailsData,
    theme: 'plain',
    bodyStyles: {
      fontSize: 9,
      textColor: [51, 51, 51],
    },
    columnStyles: {
      0: { cellWidth: 45, fontStyle: 'bold', textColor: [100, 100, 100] },
      1: { cellWidth: 115 },
    },
    margin: { left: margin, right: margin },
  });

  y = (doc as any).lastAutoTable.finalY + 10;

  // Assigned To Details
  if (task.assignedToMember) {
    doc.setFillColor(lightGrayColor[0], lightGrayColor[1], lightGrayColor[2]);
    doc.roundedRect(margin, y, 170, 30, 4, 4, 'F');
    doc.setFontSize(10);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Assigned To', margin + 6, y + 8);
    doc.setTextColor(60, 60, 60);
    doc.text(task.assignedToMember.name, margin + 6, y + 18);
    doc.setFontSize(8);
    doc.setTextColor(grayColor[0], grayColor[1], grayColor[2]);
    doc.text(task.assignedToMember.role.replace('_', ' '), margin + 6, y + 26);
    y += 38;
  }

  // Related Information
  if (task.client || task.project) {
    if (y > 220) {
      doc.addPage();
      y = 20;
    }

    doc.setFontSize(11);
    doc.setTextColor(darkColor[0], darkColor[1], darkColor[2]);
    doc.text('Related Information', margin, y);
    y += 4;
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setLineWidth(0.5);
    doc.line(margin, y, margin + 45, y);
    y += 8;

    const relatedData = [];
    if (task.client) {
      relatedData.push(['Client', task.client.name]);
      if (task.client.business) {
        relatedData.push(['Business', task.client.business]);
      }
    }
    if (task.project) {
      relatedData.push(['Project', task.project.name]);
      relatedData.push(['Service', task.project.service]);
    }

    if (relatedData.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [],
        body: relatedData,
        theme: 'plain',
        bodyStyles: {
          fontSize: 9,
          textColor: [51, 51, 51],
        },
        columnStyles: {
          0: { cellWidth: 45, fontStyle: 'bold', textColor: [100, 100, 100] },
          1: { cellWidth: 115 },
        },
        margin: { left: margin, right: margin },
      });
      y = (doc as any).lastAutoTable.finalY + 10;
    }
  }

  // Footer
  if (y > 250) {
    doc.addPage();
    y = 20;
  }

  doc.setDrawColor(200, 200, 200);
  doc.setLineWidth(0.3);
  doc.line(margin, y, pageWidth - margin, y);
  y += 6;
  
  doc.setFontSize(7);
  doc.setTextColor(150, 150, 150);
  doc.text('Generated by Webistic CRM', margin, y);
  doc.text('https://webistic.co', pageWidth - margin - 30, y);
  
  y += 4;
  doc.setTextColor(180, 180, 180);
  doc.text(`Task ID: ${task.id.slice(0, 8)}`, margin, y);
  doc.text('Page 1 of 1', pageWidth - margin - 30, y);

  const pdfArrayBuffer = doc.output('arraybuffer');
  return Buffer.from(pdfArrayBuffer);
}