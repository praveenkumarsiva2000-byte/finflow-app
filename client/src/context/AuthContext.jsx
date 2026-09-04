import { createContext, useContext, useState, useCallback } from "react";
import { api } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const raw = localStorage.getItem("cashlyne_user");
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
      if (data.mfaRequired) {
        return { success: true, mfaRequired: true, email: data.email };
      }
      localStorage.setItem("cashlyne_token", data.token);
      localStorage.setItem("cashlyne_user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const verifyLoginOtp = useCallback(async ({ email, otp }) => {
    try {
      const data = await api.verifyLoginOtp({ email, otp });
      localStorage.setItem("cashlyne_token", data.token);
      localStorage.setItem("cashlyne_user", JSON.stringify(data.user));
      setCurrentUser(data.user);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("cashlyne_token");
    localStorage.removeItem("cashlyne_user");
    setCurrentUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email) => {
    try {
      await api.forgotPassword(email);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const verifyResetOtp = useCallback(async ({ email, otp }) => {
    try {
      const data = await api.verifyOtp({ email, otp });
      return { success: true, resetToken: data.resetToken };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  const confirmPasswordReset = useCallback(async ({ resetToken, newPassword }) => {
    try {
      await api.resetPassword({ resetToken, newPassword });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }, []);

  return (
    <AuthContext.Provider value={{ currentUser, login, verifyLoginOtp, signup, logout, requestPasswordReset, verifyResetOtp, confirmPasswordReset }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
