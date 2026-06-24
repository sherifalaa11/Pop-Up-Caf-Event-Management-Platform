import { createContext, useContext, useState } from "react";
import { api } from "./api";

const AuthContext = createContext();

// Stores the logged-in user + token in localStorage so a refresh keeps you signed in.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });

  function save(data) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }

  async function login(email, password) {
    const data = await api.post("/auth/login", { email, password });
    return save(data);
  }

  async function register(payload) {
    const data = await api.post("/auth/register", payload);
    return save(data);
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }

  // Used after editing your own profile
  function updateLocalUser(updated) {
    localStorage.setItem("user", JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateLocalUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
