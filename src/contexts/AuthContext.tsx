import { createContext, ReactNode, useEffect, useState } from 'react';

import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { api } from '../services/apiClient';

type User = {
  id: string;
  email: string;
  name: string;
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, process.env.NEXT_PUBLIC_NEXT_ACCESS_TOKEN)
  destroyCookie(undefined, process.env.NEXT_PUBLIC_NEXT_REFRESH_TOKEN)
  authChannel?.postMessage('signOut');
  Router.push('/');
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>();
  const isAuthenticated = !!user;

  useEffect(() => {
    authChannel = new BroadcastChannel('auth');

    authChannel.onmessage = message => {
      switch (message.data) {
        case 'signOut':
          signOut();
          authChannel.close();
          break;
        default:
          break;
      }
    };
  }, []);

  // useEffect(() => {
  //   const cookies = parseCookies();
  //   const token = cookies[process.env.NEXT_PUBLIC_NEXT_ACCESS_TOKEN];

  //   if (token) {
  //     api.get('/session/me')
  //       .then(response => {
  //         const { id, email, name, active, role } = response.data

  //         setUser({ id, email, name, active, role })
  //       })
  //       .catch(() => {
  //         signOut();
  //       })
  //   }
  // }, [])

  async function signIn({ email, password }: SignInCredentials) {
    debugger
    try {
      const response = await api.post('session/auth', {
        email,
        password
      });

      const { token, refresh_token, user } = response.data;

      setCookie(undefined, process.env.NEXT_PUBLIC_NEXT_ACCESS_TOKEN, token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, process.env.NEXT_PUBLIC_NEXT_REFRESH_TOKEN, refresh_token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setUser({
        id: user?.id,
        email: user?.email,
        name: user?.name,
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`;

      Router.push('/dashboard');
    } catch (err) {
      console.log(err);
    }
  }

  return (
    <AuthContext.Provider value={{ signIn, signOut, isAuthenticated, user }}>
      {children}
    </AuthContext.Provider>
  );
}