import { useQuery, UseQueryOptions, UseQueryResult } from 'react-query';
import { api } from '../../services/apiClient';


type User = {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
};

type GetUsersReponse = {
  users: User[];
  totalCount: number;
};

export async function getUsers(page: number, searchQuery?: string): Promise<GetUsersReponse> {
  const { data } = await api.post('/user/index', { page, searchQueryColumn: 'name', searchQueryValue: searchQuery });
  const users = data?.list;

  return {
    users,
    totalCount: data?.total
  };
}

export function useUsers(page: number = 1, searchQuery?: string, options?: UseQueryOptions) {
  return useQuery(['users', [page, searchQuery]], () => getUsers(page, searchQuery), {
    staleTime: 1000 * 60 * 10,
    ...options
  }) as UseQueryResult<GetUsersReponse, unknown>;
}