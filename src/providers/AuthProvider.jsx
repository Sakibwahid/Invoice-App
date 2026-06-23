import { createContext, useEffect, useState, useCallback } from "react";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { auth } from "../firebase/firebase.config";

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const login = useCallback((email, password) => {
    setError(null);
    return signInWithEmailAndPassword(auth, email, password).catch((err) => {
      const errorMessage = err.code === "auth/user-not-found"
        ? "Email not found"
        : err.code === "auth/wrong-password"
        ? "Incorrect password"
        : err.code === "auth/invalid-email"
        ? "Invalid email format"
        : err.code === "auth/too-many-requests"
        ? "Too many login attempts. Please try again later."
        : err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    });
  }, []);

  const signup = useCallback((email, password) => {
    setError(null);
    return createUserWithEmailAndPassword(auth, email, password).catch((err) => {
      const errorMessage = err.code === "auth/email-already-in-use"
        ? "Email already registered"
        : err.code === "auth/weak-password"
        ? "Password must be at least 6 characters"
        : err.code === "auth/invalid-email"
        ? "Invalid email format"
        : err.message;
      setError(errorMessage);
      throw new Error(errorMessage);
    });
  }, []);

  const logout = useCallback(() => {
    setError(null);
    return signOut(auth);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const authInfo = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;