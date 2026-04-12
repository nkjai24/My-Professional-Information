// src/utils/auth.ts

/* =========================
   TYPES
========================= */

export interface User {
    email: string;
    name?: string;
  }
  
  const TOKEN_KEY = "token";
  const USER_KEY = "user";
  
  
  /* =========================
     TOKEN
  ========================= */
  
  export const getToken = (): string | null => {
    return localStorage.getItem(TOKEN_KEY);
  };
  
  export const setToken = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
  };
  
  export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY);
  };
  
  
  /* =========================
     USER
  ========================= */
  
  export const getUser = (): User | null => {
    try {
      const raw = localStorage.getItem(USER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  };
  
  export const setUser = (user: User) => {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  };
  
  export const removeUser = () => {
    localStorage.removeItem(USER_KEY);
  };
  
  
  /* =========================
     AUTH STATE
  ========================= */
  
  export const isAuthenticated = (): boolean => {
    return !!getToken();
  };
  
  
  /* =========================
     LOGIN SAVE
  ========================= */
  
  export const login = (token: string, user: User) => {
    setToken(token);
    setUser(user);
  };
  
  
  /* =========================
     LOGOUT
  ========================= */
  
  export const logout = () => {
    removeToken();
    removeUser();
  };
  
  
  /* =========================
     AUTH HEADER
  ========================= */
  
  export const getAuthHeader = () => {
    const token = getToken();
  
    if (!token) return {};
  
    return {
      Authorization: `Bearer ${token}`,
    };
  };