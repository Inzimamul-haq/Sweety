/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { deleteUserAccount, fetchMe, loginUser, registerUser } from './auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('sweety_token')));

  useEffect(() => {
    const token = localStorage.getItem('sweety_token');
    if (!token) return;

    let ignore = false;
    fetchMe()
      .then((userData) => {
        if (!ignore) setUser(userData);
      })
      .catch(() => {
        if (!ignore) {
          localStorage.removeItem('sweety_token');
          setUser(null);
        }
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      async login(payload) {
        const result = await loginUser(payload);
        localStorage.setItem('sweety_token', result.token);
        setUser(result.user);
        return result.user;
      },
      async register(payload) {
        const result = await registerUser(payload);
        localStorage.setItem('sweety_token', result.token);
        setUser(result.user);
        return result.user;
      },
      updateUser(nextUser) {
        setUser((prev) => ({ ...prev, ...nextUser }));
      },
      logout() {
        localStorage.removeItem('sweety_token');
        setUser(null);
      },
      async deleteAccount(payload) {
        const result = await deleteUserAccount(payload);
        localStorage.removeItem('sweety_token');
        setUser(null);
        return result;
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
