import {
  GetServerSideProps,
  GetServerSidePropsContext,
  GetServerSidePropsResult
} from 'next';
import { parseCookies } from 'nookies';

export function withSSRGuest<P>(fn: GetServerSideProps<P>) {
  return async (
    ctx: GetServerSidePropsContext
  ): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    const token = cookies[process.env.NEXT_PUBLIC_NEXT_ACCESS_TOKEN]

    if (token) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      };
    }
    return await fn(ctx);
  };
}