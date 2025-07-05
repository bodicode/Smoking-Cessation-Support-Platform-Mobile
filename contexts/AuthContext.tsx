import React, { createContext, useContext, useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { User } from "@/types/api/user";

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  logout: () => void;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  setUser: () => {},
  logout: () => {},
  loading: true,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const userStr = await AsyncStorage.getItem("user");
        if (userStr) setUserState(JSON.parse(userStr));
      } catch (e) {
        setUserState(null);
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const setUser = async (u: User | null) => {
    setUserState(u);
    if (u) {
      await AsyncStorage.setItem("user", JSON.stringify(u));
    } else {
      await AsyncStorage.removeItem("user");
    }
  };

  const logout = async () => {
    setUserState(null);
    await AsyncStorage.removeItem("user");
    await AsyncStorage.removeItem("access_token");
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  return useContext(AuthContext);
}
