import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

import { MANAGERIAL_DISCLAIMER } from '@/utils/calculations';
import { formatCurrency } from '@/utils/format';
import {
  managerialPdfFileName,
  type ManagerialPdfInput,
  type ManagerialPdfResult,
} from '@/utils/managerialPdf';

const ORANGE: [number, number, number] = [255, 92, 0];
const INK: [number, number, number] = [17, 17, 17];
const MUTED: [number, number, number] = [107, 107, 118];
const CREAM: [number, number, number] = [255, 248, 243];

type PdfWithTable = jsPDF & { lastAutoTable?: { finalY?: number } };

function formatGeneratedAt(date: Date): string {
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function overtimeCell(row: { overtimeHours: string; extras: number }): string {
  return `${row.overtimeHours}\n${formatCurrency(row.extras)}`;
}

function absenceCell(row: { absenceCount: number; absenceDiscount: number }): string {
  if (row.absenceCount <= 0) return '0';
  const label = row.absenceCount === 1 ? '1 falta' : `${row.absenceCount} faltas`;
  return `${label}\n${formatCurrency(row.absenceDiscount)}`;
}

export function createManagerialPdf(input: ManagerialPdfInput): { doc: jsPDF; fileName: string } {
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'landscape' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 12;
  const contentWidth = pageWidth - margin * 2;
  const companyName = input.companyName?.trim();

  doc.setFillColor(...ORANGE);
  doc.rect(0, 0, pageWidth, 22, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.setTextColor(255, 255, 255);
  doc.text('OFolium — Demonstrativo gerencial', margin, 14);

  let cursor = 32;
  doc.setTextColor(...INK);
  if (companyName) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    const companyLines = doc.splitTextToSize(companyName, contentWidth) as string[];
    doc.text(companyLines, margin, cursor);
    cursor += companyLines.length * 6;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.setTextColor(...MUTED);
  doc.text(`Competência: ${input.competenceLabel}`, margin, cursor);
  cursor += 5;
  doc.text(`Gerado em: ${formatGeneratedAt(input.generatedAt)}`, margin, cursor);
  cursor += 8;

  const tableOptions = {
    margin: { top: 16, right: margin, bottom: 14, left: margin },
    theme: 'plain' as const,
    styles: {
      font: 'helvetica' as const,
      fontSize: 8,
      textColor: INK,
      cellPadding: 2.2,
      overflow: 'linebreak' as const,
      valign: 'middle' as const,
    },
    headStyles: {
      fillColor: ORANGE,
      textColor: 255,
      fontStyle: 'bold' as const,
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: [247, 247, 248] as [number, number, number] },
    showHead: 'everyPage' as const,
    rowPageBreak: 'avoid' as const,
    didDrawPage: (data: { pageNumber: number }) => {
      if (data.pageNumber === 1) return;
      doc.setFillColor(...ORANGE);
      doc.rect(0, 0, pageWidth, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text('OFolium — Demonstrativo gerencial', margin, 6.5);
    },
  };

  autoTable(doc, {
    ...tableOptions,
    startY: cursor,
    head: [['Funcionário', 'Salário', 'Horas extras', 'Faltas', 'Vales', 'Adicionais', 'Descontos', 'Previsão']],
    body: input.rows.map((row) => [
      `${row.employeeName}\n${row.role || '—'}`,
      formatCurrency(row.baseSalary),
      overtimeCell(row),
      absenceCell(row),
      formatCurrency(row.vales),
      formatCurrency(row.additions),
      formatCurrency(row.discounts),
      formatCurrency(row.forecast),
    ]),
    columnStyles: {
      0: { cellWidth: 52, halign: 'left' },
      1: { cellWidth: 28, halign: 'right' },
      2: { cellWidth: 30, halign: 'right' },
      3: { cellWidth: 28, halign: 'right' },
      4: { cellWidth: 28, halign: 'right' },
      5: { cellWidth: 30, halign: 'right' },
      6: { cellWidth: 30, halign: 'right' },
      7: { cellWidth: 32, halign: 'right' },
    },
  });

  const summaryBottom = (doc as PdfWithTable).lastAutoTable?.finalY ?? cursor;
  let sectionTop = summaryBottom + 8;
  if (sectionTop > pageHeight - 28) {
    doc.addPage();
    sectionTop = 18;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Lançamentos da competência', margin, sectionTop);

  if (input.movements.length === 0) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(...MUTED);
    doc.text('Nenhum lançamento nesta competência.', margin, sectionTop + 6);
    sectionTop += 10;
  } else {
    autoTable(doc, {
      ...tableOptions,
      startY: sectionTop + 3,
      head: [['Data', 'Funcionário', 'Tipo', 'Detalhe', 'Valor']],
      body: input.movements.map((movement) => [
        movement.occurrenceDate,
        movement.employeeName,
        movement.type,
        movement.detail || '—',
        movement.valueLabel,
      ]),
      columnStyles: {
        0: { cellWidth: 28 },
        1: { cellWidth: 58 },
        2: { cellWidth: 32 },
        3: { cellWidth: 100 },
        4: { cellWidth: 40, halign: 'right' },
      },
    });
    sectionTop = (doc as PdfWithTable).lastAutoTable?.finalY ?? sectionTop;
  }

  const tableBottom = sectionTop;
  const disclaimerLines = doc.splitTextToSize(MANAGERIAL_DISCLAIMER, contentWidth - 8) as string[];
  const closingHeight = 14 + 8 + disclaimerLines.length * 4.5;
  let closingTop = tableBottom + 8;
  if (closingTop + closingHeight > pageHeight - 16) {
    doc.addPage();
    closingTop = 20;
  }

  doc.setFillColor(...CREAM);
  doc.setDrawColor(...ORANGE);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, closingTop, contentWidth, 12, 1.5, 1.5, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...INK);
  doc.text('Total geral previsto', margin + 4, closingTop + 7.6);
  doc.setTextColor(...ORANGE);
  doc.text(formatCurrency(input.totalForecast), margin + contentWidth - 4, closingTop + 7.6, {
    align: 'right',
  });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...MUTED);
  doc.text(disclaimerLines, margin, closingTop + 20);

  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.setTextColor(155, 155, 166);
    doc.text(`Página ${page} de ${pageCount}`, pageWidth - margin, pageHeight - 8, { align: 'right' });
  }

  return { doc, fileName: managerialPdfFileName(input.competence) };
}

export function downloadManagerialPdf(input: ManagerialPdfInput): ManagerialPdfResult {
  const { doc, fileName } = createManagerialPdf(input);
  const blob = doc.output('blob');
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = fileName;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
  return { ok: true };
}
