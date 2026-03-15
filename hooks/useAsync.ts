import { useState, useEffect, useRef } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

/**
 * Ejecuta una función async y expone data, loading y error.
 * Cancela la actualización de estado si el componente se desmonta.
 */
export function useAsync<T>(
  fn: () => Promise<T>,
  deps: React.DependencyList
): AsyncState<T> {
  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: true,
    error: null,
  });
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    setState({ data: null, loading: true, error: null });

    fn()
      .then((data) => {
        if (isMounted.current) setState({ data, loading: false, error: null });
      })
      .catch((err: unknown) => {
        if (isMounted.current) {
          const message = err instanceof Error ? err.message : 'Error desconocido';
          setState({ data: null, loading: false, error: message });
        }
      });

    return () => {
      isMounted.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return state;
}
