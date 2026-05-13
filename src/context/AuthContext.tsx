import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
} from "firebase/auth";
import type { User } from "firebase/auth";

import { auth, googleProvider } from "../firebase";

type Role = "student" | "teacher" | "hod" | "principal";

interface AuthContextType {
  user: User | null;
  role: Role | null;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  setRole: (role: Role) => void;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const [role, setRoleState] = useState<Role | null>(() => {
    return localStorage.getItem("role") as Role | null;
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login Error:", error);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setRoleState(null);
      localStorage.removeItem("role");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  const setRole = (role: Role) => {
    setRoleState(role);
    localStorage.setItem("role", role);
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email);
  };

  return (
    <AuthContext.Provider
      value={{ user, role, loginWithGoogle, logout, setRole, resetPassword }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};