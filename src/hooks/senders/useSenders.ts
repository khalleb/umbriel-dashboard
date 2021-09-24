import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';


type Sender = {
  id: string;
  name: string;
  email: string;
  active: boolean;
};

type GetSendersReponse = {
  senders: Sender[];
  totalCount: number;
};

export async function getSenders(page: number, searchQuery?: string): Promise<GetSendersReponse> {
  const { data } = await api.post('/sender/index', { page, searchQueryColumn: 'email', searchQueryValue: searchQuery });
  const senders = data?.list;

  return {
    senders,
    totalCount: data?.total
  };
}

export function useSenders(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['senders', [page, searchQuery]], () => getSenders(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetSendersReponse, unknown>;
}