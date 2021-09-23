import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from 'next';
import { destroyCookie, parseCookies } from 'nookies';

export function withSSRAuth<P>(fn: GetServerSideProps<P>) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<P>> => {
    const cookies = parseCookies(ctx);

    const token = cookies[process.env.NEXT_PUBLIC_NEXT_ACCESS_TOKEN];

    if (!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }
    try {
      return await fn(ctx);
    } catch (err) {
      destroyCookie(ctx, process.env.NEXT_PUBLIC_NEXT_ACCESS_TOKEN)
      destroyCookie(ctx, process.env.NEXT_PUBLIC_NEXT_REFRESH_TOKEN)

      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      };
    }
  };
}
