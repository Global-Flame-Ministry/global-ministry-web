import { useCallback, useRef } from 'react';
import { useNavigate, matchPath } from 'react-router-dom';
import { queryClient } from '../queryClient';
import { routeQueryMap } from '../utils/routeQueryMap';

export function usePrefetchNavigate() {
  const navigate = useNavigate();
  const latestRequestId = useRef(0);

  const navigateWithPrefetch = useCallback(
    (path: string) => {
      const requestId = ++latestRequestId.current;
      let matched = false;

      for (const entry of routeQueryMap) {
        const match = matchPath(entry.pattern, path);
        if (match) {
          matched = true;
          const params = match.params as Record<string, string | undefined>;
          const queries = entry.getQueries(params);

          const prefetchPromise = Promise.all(
            queries.map((q) =>
              queryClient.ensureQueryData({ queryKey: q.queryKey, queryFn: q.queryFn })
            )
          );

          const timeout = new Promise<void>((_, reject) =>
            setTimeout(() => reject(new Error('Prefetch timeout')), 8000)
          );

          Promise.race([prefetchPromise, timeout])
            .catch(() => {})
            .finally(() => {
              if (latestRequestId.current === requestId) {
                navigate(path);
              }
            });

          break;
        }
      }

      if (!matched) {
        navigate(path);
      }
    },
    [navigate]
  );

  return { navigateWithPrefetch };
}
