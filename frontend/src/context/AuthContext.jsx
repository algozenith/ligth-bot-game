import { createContext, useContext, useEffect, useState } from "react";

const AuthContext = createContext(null);
const API_URL = process.env.REACT_APP_API_URL;

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [username, setUsername] = useState(() => localStorage.getItem("username"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function verifyToken() {
      const storedToken = localStorage.getItem("token");
      if (!storedToken) {
        logout();
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/me`, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
          },
        });

        if (!res.ok) throw new Error("Invalid token");

        const data = await res.json();
        setToken(storedToken);
        setUsername(data.username);
      } catch (err) {
        // token is invalid → hard logout
        logout();
      } finally {
        setLoading(false);
      }
    }

    verifyToken();
  }, []);

  const login = (token, username) => {
    if (!token) return;
    localStorage.setItem("token", token);
    localStorage.setItem("username", username);
    setToken(token);
    setUsername(username);
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    setToken(null);
    setUsername(null);
  };

  return (
    <AuthContext.Provider
      value={{ token, username, login, logout, loading, isAuth: !!token }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
