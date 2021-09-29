import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';

export type Message = {
  id: string;
  subject: string;
  sent_at: string | null;
};

type GetMessagesReponse = {
  messages: Message[];
  totalCount: number;
};

export async function getMessages(page: number, searchQuery?: string): Promise<GetMessagesReponse> {
  const { data } = await api.post('/message/index', { page, searchQueryColumn: 'name', searchQueryValue: searchQuery });
  const messages = data?.list;

  const messagespPasrse: Message[] = await Promise.all(
    messages.map(async (message: Message) => {
      return {
        id: message.id,
        subject: message.subject,
        sent_at: message.sent_at !== null ? new Date(message.sent_at).toLocaleDateString('pt-br', {
          day: '2-digit',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }) : null
      };
    })
  );

  return {
    messages: messagespPasrse,
    totalCount: data?.total
  };
}

export function useMessages(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['messages', [page, searchQuery]], () => getMessages(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetMessagesReponse, unknown>;
}