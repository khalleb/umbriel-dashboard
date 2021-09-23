
import { useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { validateUserPermissions } from '../utils/validateUserPermissions';

type UseCanParams = {
  role?: string;
};

export function useCan({ role }: UseCanParams) {
  const { user, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return false;
  }

  const userHasValidPermissions = validateUserPermissions({ user, role });

  return userHasValidPermissions;
}