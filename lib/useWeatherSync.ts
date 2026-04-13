'use client';

import { useEffect, useRef } from 'react';
import { useScheduleStore } from '@/lib/store';
import { parseScheduleDate, fetchSunriseSunset, fetchWeather } from '@/lib/weather';

export function useWeatherSync() {
  const { schedule, updateField } = useScheduleStore();
  const lastKey = useRef('');

  useEffect(() => {
    const { shootingLat, shootingLon, date } = schedule;
    if (!shootingLat || !shootingLon || !date) return;

    const isoDate = parseScheduleDate(date);
    if (!isoDate) return;

    const key = `${shootingLat},${shootingLon},${isoDate}`;
    if (key === lastKey.current) return;
    lastKey.current = key;

    let cancelled = false;

    async function sync() {
      const [sun, weather] = await Promise.all([
        fetchSunriseSunset(shootingLat, shootingLon, isoDate!),
        fetchWeather(shootingLat, shootingLon, isoDate!),
      ]);
      if (cancelled) return;
      if (sun) {
        updateField('sunrise', sun.sunrise);
        updateField('sunset', sun.sunset);
      }
      if (weather) {
        updateField('weather', weather);
      }
    }

    sync();
    return () => { cancelled = true; };
  }, [schedule.shootingLat, schedule.shootingLon, schedule.date, updateField]);
}
