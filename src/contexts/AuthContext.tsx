import { createContext, ReactNode, useEffect, useState } from 'react';

import Router from 'next/router';
import { destroyCookie, parseCookies, setCookie } from 'nookies';
import { api } from '../services/apiClient';

type User = {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'client'
};

type SignInCredentials = {
  email: string;
  password: string;
};

type AuthContextData = {
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signOut: () => void;
  isAuthenticated: boolean;
  user: User | undefined;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

let authChannel: BroadcastChannel;

export function signOut() {
  destroyCookie(undefined, 'umbriel_access_token', { path: '/' })
  destroyCookie(undefined, 'umbriel_refresh_token', { path: '/' })
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

  useEffect(() => {
    const cookies = parseCookies();
    const token = cookies['umbriel_access_token'];

    if (token) {
      api.get('/session/me')
        .then(response => {
          const { id, email, name, role } = response?.data

          setUser({ id, email, name, role })
        })
        .catch(() => {
          signOut();
        })
    }
  }, [])

  async function signIn({ email, password }: SignInCredentials) {
    try {
      const response = await api.post('session/auth', {
        email,
        password
      });

      const { token, refresh_token, user } = response?.data;

      setCookie(undefined, 'umbriel_access_token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days - Tempo de armazenamento no browser
        path: '/'
      })

      setCookie(undefined, 'umbriel_refresh_token', refresh_token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days - Tempo de armazenamento no browser
        path: '/'
      })

      setUser({
        id: user?.id,
        email: user?.email,
        name: user?.name,
        role: user?.role
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