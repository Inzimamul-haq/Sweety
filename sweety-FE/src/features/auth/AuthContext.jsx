import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { fetchMe, loginUser, registerUser } from './auth.api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('sweety_token');
    if (!token) {
      setLoading(false);
      return;
    }

    fetchMe()
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('sweety_token');
        setUser(null);
      })
      .finally(() => setLoading(false));
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
      logout() {
        localStorage.removeItem('sweety_token');
        setUser(null);
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
