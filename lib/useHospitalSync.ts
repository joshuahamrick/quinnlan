'use client';

import { useEffect, useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import { fetchNearestER } from '@/lib/hospital';

export function useHospitalSync() {
  const { schedule, updateField } = useScheduleStore();
  const lastKey = useRef('');
  const isFirstRun = useRef(true);

  useEffect(() => {
    const { shootingLat, shootingLon } = schedule;

    if (!shootingLat || !shootingLon) {
      // Skip clearing on first render — Zustand hasn't hydrated yet,
      // so lat/lon are still default 0s. Clearing now would wipe persisted data.
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      updateField('hospitalName', '');
      updateField('hospitalAddress', '');
      updateField('hospitalPhone', '');
      updateField('hospitalDepartment', '');
      lastKey.current = '';
      return;
    }

    isFirstRun.current = false;

    const key = `${shootingLat},${shootingLon}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    // If hospital data already exists for this location, skip fetch
    if (schedule.hospitalName) return;

    let cancelled = false;

    async function sync() {
      const lat = shootingLat;
      const lon = shootingLon;

      // Check localStorage cache first
      const cacheKey = `hospital-${lat.toFixed(3)}-${lon.toFixed(3)}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const data = JSON.parse(cached);
          if (!cancelled) {
            updateField('hospitalName', data.name);
            updateField('hospitalAddress', data.address);
            updateField('hospitalPhone', data.phone);
            updateField('hospitalDepartment', data.department);
          }
          return;
        } catch {
          // Invalid cache, continue to fetch
        }
      }

      // Fetch with 8s timeout
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 8000);
      try {
        const result = await fetchNearestER(lat, lon, controller.signal);
        clearTimeout(timeout);
        if (cancelled) return;
        if (result) {
          localStorage.setItem(cacheKey, JSON.stringify(result));
          updateField('hospitalName', result.name);
          updateField('hospitalAddress', result.address);
          updateField('hospitalPhone', result.phone);
          updateField('hospitalDepartment', result.department);
        }
      } catch {
        clearTimeout(timeout);
        // Don't clear existing hospital data on error
      }
    }

    sync();
    return () => { cancelled = true; };
  }, [schedule.shootingLat, schedule.shootingLon, schedule.hospitalName, updateField]);
}
