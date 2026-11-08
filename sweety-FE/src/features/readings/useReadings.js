import { useCallback, useEffect, useState } from 'react';
import { getErrorPayload } from '../../api/client.js';
import {
  createReading,
  deleteReading,
  fetchReadings,
  updateReading,
} from './readings.api.js';

export function useReadings(date) {
  const [readings, setReadings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const data = await fetchReadings(date);
        if (!ignore) {
          setReadings(data);
          setError(null);
        }
      } catch (err) {
        if (!ignore) {
          setError(getErrorPayload(err));
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [date, reloadKey]);

  const refresh = useCallback(() => {
    setLoading(true);
    setReloadKey((k) => k + 1);
  }, []);

  async function add(payload) {
    const reading = await createReading(payload);
    setReadings((current) => [...current, reading]);
    return reading;
  }

  async function edit(id, payload) {
    const reading = await updateReading(id, payload);
    setReadings((current) => current.map((item) => (item.id === id ? reading : item)));
    return reading;
  }

  async function remove(id) {
    await deleteReading(id);
    setReadings((current) => current.filter((item) => item.id !== id));
  }

  return { readings, loading, error, refresh, add, edit, remove };
}
