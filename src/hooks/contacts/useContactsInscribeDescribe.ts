import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';


type InscribeDescribeContactReponse = {
  message: string;
};


export async function getInscribeDescribe(contact_id: string): Promise<InscribeDescribeContactReponse>  {
  const response = await api.get(`contact/inscribe-describe?id=${contact_id}`);
  const { data } = response;
  return {  
    message: data
  };
}

export function useContactInscribeDescribe(contact_id: string, options?: UseQueryOptions) {
  return useQuery(['contacts', [contact_id]], () => getInscribeDescribe(contact_id), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<InscribeDescribeContactReponse, unknown> ;
}