import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { destroyCookie, parseCookies } from 'nookies';
import decode from 'jwt-decode';
import { AuthTokenError } from '../services/errors/AuthTokenError';
import { validateUserPermissions } from './validateUserPermissions';

type WithSSRAuthOptions = {
  role?: string;
};

export function withSSRAuth<P>(fn: GetServerSideProps<P>, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['umbriel_access_token'];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }

    if (options) {
      const user = decode<{ role: string }>(token);
      const { role } = options;

      const userHasValidPermissions = validateUserPermissions({ user, role });

      if (!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false,
          },
        };
      }
    }

    try {
      return await fn(ctx);
    } catch (error) {
      if (error instanceof AuthTokenError) {
        destroyCookie(ctx, 'umbriel_access_token', { path: '/' })
        destroyCookie(ctx, 'umbriel_refresh_token', { path: '/' })

        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        };
      }
    }
  };
}
