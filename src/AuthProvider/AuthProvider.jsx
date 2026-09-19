import React, { createContext, useState, useEffect, useContext } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStorageData = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("accessToken");

        if (storedToken) {
          const decodedUser = jwtDecode(storedToken);
          setToken(storedToken);
          setUser(decodedUser);
        }
      } catch (e) {
        console.error("Failed to load auth data", e);
        await AsyncStorage.removeItem("accessToken");
      } finally {
        setLoading(false);
      }
    };
    loadStorageData();
  }, [token,setToken]);

  const login = async (tokenData) => {
    try {
      const decodedUser = jwtDecode(tokenData);
      setToken(tokenData);
      setUser(decodedUser);

      await AsyncStorage.setItem("accessToken", tokenData);
      await AsyncStorage.setItem("userInfo", JSON.stringify(decodedUser));
    } catch (error) {
      console.error("Invalid token during login", error);
    }
  };

  const logout = async () => {
    setToken(null);
    setUser(null);
    await AsyncStorage.removeItem("accessToken");
    await AsyncStorage.removeItem("userInfo");
    await AsyncStorage.removeItem("refreshToken");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isLoggedIn: !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};