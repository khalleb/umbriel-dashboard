import axios, { AxiosError } from 'axios';
import { parseCookies, setCookie } from 'nookies';
import { signOut } from '../contexts/AuthContext';
import { AuthTokenError } from "./errors/AuthTokenError";

let isRefreshing = false;
let failedRequestsQueue = [];

export function setupApiClient(ctx = undefined) {
  let cookies = ctx ? parseCookies(ctx) : parseCookies();

  const api = axios.create({
    baseURL: `${process.env.NEXT_PUBLIC_API_URL}`,
    headers: {
      Authorization: `Bearer ${cookies['umbriel_access_token']}`
    }
  });
  api.interceptors.response.use(
    response => { return response; },
    (error: AxiosError) => {
      if (error?.response?.status === 401) {
        if (error?.response?.data?.message === "token.expired") {
          cookies = cookies = ctx ? parseCookies(ctx) : parseCookies();
          const refreshTokenCookie = cookies?.umbriel_refresh_token;
          const originalConfig = error.config;

          if (!isRefreshing) {
            isRefreshing = true;
            api.post("/session/refresh-token", { token: refreshTokenCookie })
              .then((response) => {
                const { token, refresh_token } = response.data;
                setCookie(ctx, 'umbriel_access_token', token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                })

                setCookie(ctx, 'umbriel_refresh_token', refresh_token, {
                  maxAge: 60 * 60 * 24 * 30, // 30 days
                  path: '/'
                })

                api.defaults.headers["Authorization"] = `Bearer ${token}`;

                failedRequestsQueue.forEach((request) => request.onSuccess(token));
                failedRequestsQueue = [];
              })
              .catch((err) => {
                failedRequestsQueue.forEach((request) => request.onFailure(err));
                failedRequestsQueue = [];

                if (process.browser) {
                  signOut();
                }
              })
              .finally(() => {
                isRefreshing = false;
              });
          }
          return new Promise((resolve, reject) => {
            failedRequestsQueue.push({
              onSuccess: (token: string) => {
                originalConfig.headers['Authorization'] = `Bearer ${token}`
                resolve(api(originalConfig))
              },
              onFailure: (err: AxiosError) => {
                reject(err)
              }
            })
          });
        } else {
          if (process.browser) {
            signOut()
          } else {
            return Promise.reject(new AuthTokenError())
          }
        }
      }
      return Promise.reject(error);
    }
  );
  return api;
}
