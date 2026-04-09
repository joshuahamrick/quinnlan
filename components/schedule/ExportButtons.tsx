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
    </div>
  );
}
