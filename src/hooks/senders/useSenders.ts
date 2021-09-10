import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';


type Sender = {
  id: string;
  name: string;
  email: string;
};

type GetSendersReponse = {
  senders: Sender[];
  totalCount: number;
};

export async function getSenders(page: number, searchQuery?: string): Promise<GetSendersReponse> {
  const { data, headers } = await api.post('/sender/index', { page });
  const totalCount = Number(headers['x-total-count']);
  const senders = data.map((sender: Sender) => {
    return {
      id: sender.id,
      name: sender.name,
      email: sender.email,
    };
  });

  return {
    senders,
    totalCount
  };
}

export function useSenders(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['senders', [page, searchQuery]], () => getSenders(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetSendersReponse, unknown>;
}