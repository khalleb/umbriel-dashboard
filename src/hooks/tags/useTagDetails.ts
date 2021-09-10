import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from "../../services/apiClient";


type TagWithDetails = {
  id: string
  active: boolean
  name: string
};

type GetTagDetailsReponse = {
  tag: TagWithDetails;
};


export async function getTag(contact_id: string): Promise<GetTagDetailsReponse>  {
  const response = await api.get(`/tag/show?id=${contact_id}`);
  const { data } = response;
  return {  
    tag: data
  };
}

export function useTagDetails(tag_id: string, options?: UseQueryOptions) {
  return useQuery(['tag', [tag_id]], () => getTag(tag_id), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetTagDetailsReponse, unknown> ;
}