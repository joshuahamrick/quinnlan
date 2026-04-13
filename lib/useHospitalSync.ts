'use client';

import { useEffect, useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import { fetchNearestER } from '@/lib/hospital';

export function useHospitalSync() {
  const { schedule, updateField } = useScheduleStore();
  const lastKey = useRef('');

  useEffect(() => {
    const { shootingLat, shootingLon } = schedule;
    if (!shootingLat || !shootingLon) return;

    const key = `${shootingLat},${shootingLon}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    let cancelled = false;

    async function sync() {
      const result = await fetchNearestER(shootingLat, shootingLon);
      if (cancelled) return;
      if (result) {
        updateField('hospitalName', result.name);
        updateField('hospitalAddress', result.address);
        updateField('hospitalPhone', result.phone);
        updateField('hospitalDepartment', result.department);
      }
    }

    sync();
    return () => { cancelled = true; };
  }, [schedule.shootingLat, schedule.shootingLon, updateField]);
}
