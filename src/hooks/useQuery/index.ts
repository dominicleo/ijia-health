import { getCurrentPage } from '@/utils';

function useQuery<
  Q extends Record<string, string | undefined> = {
    [name: string]: string | undefined;
  }
>(): Q;

function useQuery() {
  const page = getCurrentPage();
  const query = page.query || {};

  Object.entries(query).forEach(([key, value]) => {
    if (value) {
      query[key] = decodeURIComponent(value as string);
    }
  });

  return query;
}

export default useQuery;
