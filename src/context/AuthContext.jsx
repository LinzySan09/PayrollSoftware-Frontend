import React, { createContext, useContext, useState, useCallback } from "react";
import { authLogin } from "../api/endpoints";

const Ctx = createContext(null);

export function AuthProvider({ children }) {
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem("pp_user")); } catch { return null; } });
  const [token, setToken] = useState(() => localStorage.getItem("pp_token") || null);

  const login = useCallback(async (username, password) => {
    const res = await authLogin({ username, password });
    const { token, user } = res.data;
    localStorage.setItem("pp_token", token);
    localStorage.setItem("pp_user",  JSON.stringify(user));
    setToken(token);
    setUser(user);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("pp_token");
    localStorage.removeItem("pp_user");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <Ctx.Provider value={{ user, token, isAuthenticated: !!token, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => useContext(Ctx);
