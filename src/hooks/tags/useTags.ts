import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';

type Tag = {
  id: string;
  name: string;
  active: boolean;
};

type GetTagsReponse = {
  tags: Tag[];
  totalCount: number;
};

export async function getTags(page: number, searchQuery?: string): Promise<GetTagsReponse> {
  const { data } = await api.post('/tag/index', { page, searchQueryColumn: 'name', searchQueryValue: searchQuery });
  const tags = data?.list;
  return {
    tags,
    totalCount: data?.total
  };
}

export function useTags(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['tags', [page, searchQuery]], () => getTags(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetTagsReponse, unknown>;
}