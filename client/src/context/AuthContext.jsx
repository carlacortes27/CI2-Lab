import { useCallback, useEffect, useMemo, useState } from 'react';
import { getCurrentUser, loginUser, logoutUser, registerUser } from '../lib/api.js';
import { AuthContext } from './authContextBase.js';

const TOKEN_KEY = 'cvcomillas.authToken';
const USER_KEY = 'cvcomillas.authUser';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(TOKEN_KEY);
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(loadStoredUser);
  const [checkingSession, setCheckingSession] = useState(Boolean(token));

  useEffect(() => {
    if (!token) {
      setCheckingSession(false);
      return;
    }

    let active = true;
    getCurrentUser(token)
      .then(({ user: currentUser }) => {
        if (!active) return;
        setUser(currentUser);
        localStorage.setItem(USER_KEY, JSON.stringify(currentUser));
      })
      .catch(() => {
        if (!active) return;
        setToken(null);
        setUser(null);
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      })
      .finally(() => {
        if (active) setCheckingSession(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  const persistSession = useCallback((nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    localStorage.setItem(TOKEN_KEY, nextToken);
    localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
  }, []);

  const register = useCallback(async (payload) => {
    const result = await registerUser(payload);
    persistSession(result.token, result.user);
    return result.user;
  }, [persistSession]);

  const login = useCallback(async (payload) => {
    const result = await loginUser(payload);
    persistSession(result.token, result.user);
    return result.user;
  }, [persistSession]);

  const logout = useCallback(async () => {
    const currentToken = token;
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    if (currentToken) {
      await logoutUser(currentToken).catch(() => {});
    }
  }, [token]);

  const value = useMemo(
    () => ({ token, user, checkingSession, register, login, logout }),
    [token, user, checkingSession, register, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
