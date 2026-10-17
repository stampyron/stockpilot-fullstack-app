import { createContext, useContext, useState } from "react";
import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token"));

  function persist(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify({ name: data.name, email: data.email, role: data.role }));
    setToken(data.token);
    setUser({ name: data.name, email: data.email, role: data.role });
  }

  async function login(email, password) {
    const response = await api.post("/auth/login", { email, password });
    persist(response.data);
    return response.data;
  }

  async function register(name, email, password) {
    const response = await api.post("/auth/register", { name, email, password });
    persist(response.data);
    return response.data;
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
