import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';

type Contact = {
  id: string;
  name: string;
  email: string;
  subscribed: boolean;
};

type GetContactsReponse = {
  contacts: Contact[];
  totalCount: number;
};

export async function getContacts(page: number, searchQuery?: string): Promise<GetContactsReponse> {
  const { data, headers } = await api.post('/contact/index', { page });
  const totalCount = Number(headers['x-total-count']);
  const contacts = data.map((contact: Contact) => {
    return {
      id: contact.id,
      name: contact.name,
      email: contact.email,
      subscribed: contact.subscribed
    };
  });

  return {
    contacts,
    totalCount
  };
}

export function useContacts(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['contacts', [page, searchQuery]], () => getContacts(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetContactsReponse, unknown>;
}