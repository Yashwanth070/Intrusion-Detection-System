import { useState, useEffect, useCallback } from 'react';

const PROD_BACKEND = 'https://intrusion-detection-backend-1jrs.onrender.com';
const isLocalhost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
const API_URL = import.meta.env.VITE_API_URL || (isLocalhost ? (window.location.port === '3000' ? '/api' : 'http://localhost:5001/api') : `${PROD_BACKEND}/api`);

export function useApi(endpoint, options = {}) {
  const [data, setData] = useState(options.fallbackData || options.initialData || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}${endpoint}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      setData(json);
      setError(null);
    } catch (err) {
      setError(err.message);
      // Retain or restore fallback data if provided
      if (options.fallbackData) {
        setData(options.fallbackData);
      }
    } finally {
      setLoading(false);
    }
  }, [endpoint, options.fallbackData]);

  useEffect(() => {
    fetchData();
    if (options.refetchInterval) {
      const interval = setInterval(fetchData, options.refetchInterval);
      return () => clearInterval(interval);
    }
  }, [fetchData, options.refetchInterval]);

  return { data, loading, error, refetch: fetchData };
}

export default useApi;
