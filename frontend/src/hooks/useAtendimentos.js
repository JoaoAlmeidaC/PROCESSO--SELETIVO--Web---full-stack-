import { useState, useEffect, useCallback, useRef } from 'react';
import { getAtendimentos, getMetricas, getOpcoes } from '../utils/api';

export function useAtendimentos(filtros) {
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  const fetch = useCallback(async (params) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAtendimentos(params);
      setData(res.data);
      setPagination(res.pagination);
    } catch (err) {
      setError(err.response?.data?.error || 'Erro ao carregar atendimentos');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetch({ ...filtros, page: filtros.page || 1 });
    }, filtros.busca ? 400 : 0);
    return () => clearTimeout(debounceRef.current);
  }, [JSON.stringify(filtros)]);

  return { data, pagination, loading, error, refetch: fetch };
}

export function useMetricas() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    getMetricas()
      .then(setData)
      .catch(err => setError(err.response?.data?.error || 'Erro ao carregar métricas'))
      .finally(() => setLoading(false));
  }, []);

  return { data, loading, error };
}

export function useOpcoes() {
  const [data, setData] = useState({ status: [], areas: [], advogados: [] });

  useEffect(() => {
    getOpcoes().then(setData).catch(() => {});
  }, []);

  return data;
}
