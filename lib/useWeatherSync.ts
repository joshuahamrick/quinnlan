'use client';

import { useEffect, useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import { parseScheduleDate, fetchWeatherData } from '@/lib/weather';

export function useWeatherSync() {
  const { schedule, updateField } = useScheduleStore();
  const lastKey = useRef('');
  const isFirstRun = useRef(true);

  useEffect(() => {
    const { shootingLat, shootingLon, date } = schedule;

    const isoDate = date ? parseScheduleDate(date) : null;

    if (!shootingLat || !shootingLon || !isoDate) {
      // Skip clearing on first render — Zustand hasn't hydrated yet,
      // so lat/lon are still default 0s. Clearing now would wipe persisted data.
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      updateField('sunrise', '');
      updateField('sunset', '');
      updateField('weather', '');
      lastKey.current = '';
      return;
    }

    isFirstRun.current = false;

    const key = `${shootingLat},${shootingLon},${isoDate}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    let cancelled = false;

    async function sync() {
      const result = await fetchWeatherData(shootingLat, shootingLon, isoDate!);
      if (cancelled) return;
      if (result) {
        updateField('sunrise', result.sunrise);
        updateField('sunset', result.sunset);
        updateField('weather', result.weather);
      }
    }

    sync();
    return () => { cancelled = true; };
  }, [schedule.shootingLat, schedule.shootingLon, schedule.date, updateField]);
}
