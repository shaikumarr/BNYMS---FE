// src/context/AuthContext.jsx
import { createContext, useContext, useState } from "react";
import { authApi } from "../api/services";
import { TOKEN_KEY, USER_KEY } from "../api/axios";

const AuthContext = createContext(null);

// Only accept a saved user if it really looks like a TaskPulse user
function readStoredUser() {
  try {
    if (!localStorage.getItem(TOKEN_KEY)) return null;
    const stored = JSON.parse(localStorage.getItem(USER_KEY));
    if (stored && (stored.role === "MANAGER" || stored.role === "USER")) {
      return stored;
    }
  } catch {
    // corrupted data: fall through and treat as logged out
  }
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  return null;
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);

  const login = async (email, password) => {
    const res = await authApi.login({ email, password });
    const loggedIn = { id: res.id, name: res.name, email: res.email, role: res.role };
    localStorage.setItem(TOKEN_KEY, res.token);
    localStorage.setItem(USER_KEY, JSON.stringify(loggedIn));
    setUser(loggedIn);
    return loggedIn;
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);