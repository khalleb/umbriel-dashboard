import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';

type ContactWithDetails = {
  id: string
  active: boolean
  name: string
  email: string
  subscribed: boolean
  tags: Array<{
    id: string
    active: boolean
    name: string
  }>
};

type GetContactDetailsReponse = {
  contact: ContactWithDetails;
};

export async function getContacts(contact_id: string): Promise<GetContactDetailsReponse>  {
  const response = await api.get(`/contact/show?id=${contact_id}`);
  const { data } = response;
  return {  
    contact: data
  };
}

export function useContactDetails(contact_id: string, options?: UseQueryOptions) {
  return useQuery(['contact', [contact_id]], () => getContacts(contact_id), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetContactDetailsReponse, unknown> ;
}