type User = {
  role: string;
};

type ValidateUserPermissionsParams = {
  user: User;
  role: string;
};

export function validateUserPermissions({ user, role }: ValidateUserPermissionsParams) {
  return (user.role === 'admin' && role === 'admin') ? true : false;
}