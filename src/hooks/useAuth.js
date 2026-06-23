import { useContext, useCallback } from "react";
import { AuthContext } from "../providers/AuthProvider";

const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  const handleAuthError = useCallback((error) => {
    const errorMap = {
      "auth/user-not-found": "Email address not found",
      "auth/wrong-password": "Incorrect password",
      "auth/invalid-email": "Invalid email address format",
      "auth/user-disabled": "This account has been disabled",
      "auth/too-many-requests": "Too many login attempts. Try again later.",
      "auth/email-already-in-use": "Email already registered",
      "auth/weak-password": "Password must be at least 6 characters",
      "auth/operation-not-allowed": "This operation is not allowed",
      "auth/invalid-credential": "Invalid credentials provided",
      "auth/network-request-failed": "Network error. Check your connection.",
    };

    return errorMap[error.code] || error.message || "An error occurred";
  }, []);

  return {
    ...context,
    handleAuthError,
  };
};

export default useAuth;
