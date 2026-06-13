import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("finflow_user");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  });

  const signup = useCallback(async ({ name, email, password }) => {
    try {
      await api.signup({ name, email, password });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const login = useCallback(async ({ email, password }) => {
    try {
      const data = await api.login({ email, password });
      localStorage.setItem("finflow_token", data.token);
      localStorage.setItem("finflow_user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("finflow_token");
    localStorage.removeItem("finflow_user");
    setCurrentUser(null);
  }, []);

  const resetPassword = useCallback(async ({ email, newPassword }) => {
    try {
      await api.resetPassword({ email, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, signup, logout, resetPassword }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
