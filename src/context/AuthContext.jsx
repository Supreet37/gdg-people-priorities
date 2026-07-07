/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../services/api";
import { signInWithPopup, signOut } from "firebase/auth";
import { auth, googleProvider } from "../firebase";
const AuthContext = createContext(void 0);
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTabState] = useState("landing");
  useEffect(() => {
    async function initAuth() {
      const token = localStorage.getItem("peoples_priorities_token");
      if (token) {
        try {
          const profile = await api.auth.me();
          setUser(profile);
          setActiveTabState(profile.role === "mp" ? "mp-overview" : "citizen-overview");
        } catch (e) {
          console.error("Session restore failed:", e);
          api.auth.logout();
          setUser(null);
          setActiveTabState("landing");
        }
      } else {
        setActiveTabState("landing");
      }
      setLoading(false);
    }
    initAuth();
  }, []);
  const login = async (username, password) => {
    setLoading(true);
    try {
      const profile = await api.auth.login(username, password);
      setUser(profile);
      setActiveTabState(profile.role === "mp" ? "mp-overview" : "citizen-overview");
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  const register = async (payload) => {
    setLoading(true);
    try {
      const profile = await api.auth.register(payload);
      setUser(profile);
      setActiveTabState("citizen-overview");
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  const loginWithGoogle = async () => {
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      const profile = await api.auth.googleLogin({
        uid: fbUser.uid,
        email: fbUser.email,
        name: fbUser.displayName,
        phoneNumber: fbUser.phoneNumber
      });
      setUser(profile);
      setActiveTabState("citizen-overview");
    } catch (e) {
      setUser(null);
      throw e;
    } finally {
      setLoading(false);
    }
  };
  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.warn("Firebase signout warning:", err);
    }
    api.auth.logout();
    setUser(null);
    setActiveTabState("landing");
  };
  const setActiveTab = (tab) => {
    setActiveTabState(tab);
  };
  const refreshUser = async () => {
    try {
      const profile = await api.auth.me();
      setUser(profile);
    } catch (e) {
      console.error("Could not refresh user profile:", e);
    }
  };
  return <AuthContext.Provider
    value={{
      user,
      loading,
      activeTab,
      login,
      register,
      loginWithGoogle,
      logout,
      setActiveTab,
      refreshUser
    }}
  >
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === void 0) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
