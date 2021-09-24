import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';


type Template = {
  id: string;
  name: string;
  active: boolean;
};

type GetTemplatesReponse = {
  templates: Template[];
  totalCount: number;
};


export async function getTemplates(page: number, searchQuery?: string): Promise<GetTemplatesReponse> {
  const { data } = await api.post('/template/index', { page, searchQueryColumn: 'name', searchQueryValue: searchQuery, select: ["id", "name", "active"] });
  const templates = data?.list;

  return {
    templates,
    totalCount: data?.total
  };
}

export function useTemplates(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['templates', [page, searchQuery]], () => getTemplates(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetTemplatesReponse, unknown>;
}