'use client';

import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { exportToPng, exportToPdf } from '@/lib/export';
import { useScheduleStore } from '@/lib/store';

interface ExportButtonsProps {
  targetRef: React.RefObject<HTMLElement | null>;
}

export default function ExportButtons({ targetRef }: ExportButtonsProps) {
  const schedule = useScheduleStore((s) => s.schedule);
  const [exporting, setExporting] = useState<'png' | 'pdf' | null>(null);

  const getFilename = useCallback(() => {
    const name = schedule.projectName || 'schedule';
    const date = schedule.date || 'undated';
    return `${name}_${date}`;
  }, [schedule.projectName, schedule.date]);

  const handleExportPng = useCallback(async () => {
    if (!targetRef.current || exporting) return;
    setExporting('png');
    try {
      await exportToPng(targetRef.current, `${getFilename()}.png`);
    } finally {
      setExporting(null);
    }
  }, [targetRef, exporting, getFilename]);

  const handleExportPdf = useCallback(async () => {
    if (!targetRef.current || exporting) return;
    setExporting('pdf');
    try {
      await exportToPdf(targetRef.current, `${getFilename()}.pdf`);
    } finally {
      setExporting(null);
    }
  }, [targetRef, exporting, getFilename]);

  const handlePrint = useCallback(() => {
    const scheduleEl = targetRef.current;
    if (!scheduleEl) return;

    // Extract only schedule rows from live DOM, skipping page wrappers/gaps/labels
    const rows = scheduleEl.querySelectorAll('[data-schedule-row]');

    const cleanContainer = document.createElement('div');
    cleanContainer.style.width = '100%';
    cleanContainer.style.maxWidth = '100%';
    cleanContainer.style.background = 'white';

    // Copy font/border styles from the original schedule
    const originalStyle = scheduleEl.querySelector('[id="schedule-content"]') || scheduleEl;
    const computed = window.getComputedStyle(originalStyle);
    cleanContainer.style.fontFamily = computed.fontFamily;
    cleanContainer.style.fontSize = computed.fontSize;
    cleanContainer.style.borderWidth = computed.borderWidth;
    cleanContainer.style.borderColor = computed.borderColor;
    cleanContainer.style.borderStyle = computed.borderStyle;

    rows.forEach(row => {
      const rowClone = row.cloneNode(true) as HTMLElement;
      rowClone.querySelectorAll('[data-export-hide]').forEach(el => el.remove());
      cleanContainer.appendChild(rowClone);
    });

    // Get page stylesheets
    const styles = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map(el => el.outerHTML)
      .join('\n');

    // Open print window
    const printWindow = window.open('', '_blank', 'width=816,height=1056');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Print Schedule</title>
        ${styles}
        <style>
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            margin: 0;
            padding: 0.25in;
            background: white;
          }
          @page {
            size: ${schedule.paperSize === 'legal' ? 'legal' : 'letter'} portrait;
            margin: 0.25in;
          }
          [data-schedule-row] {
            break-inside: avoid !important;
            page-break-inside: avoid !important;
          }
        </style>
      </head>
      <body>
        ${cleanContainer.outerHTML}
      </body>
      </html>
    `);
    printWindow.document.close();

    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };
  }, [targetRef, schedule.paperSize]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPng}
        disabled={exporting !== null}
      >
        {exporting === 'png' ? 'Exporting...' : 'Export PNG'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handleExportPdf}
        disabled={exporting !== null}
      >
        {exporting === 'pdf' ? 'Exporting...' : 'Export PDF'}
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={handlePrint}
        disabled={exporting !== null}
      >
        Print
      </Button>
    </div>
  );
}
