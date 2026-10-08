import { createContext, useContext, useState, useEffect } from "react";
const Ctx = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem("tf_token");
    const u = localStorage.getItem("tf_user");
    if (t && u) { setToken(t); setUser(JSON.parse(u)); }
    setLoading(false);
  }, []);
  const login = ({ token: t, user: u }) => {
    localStorage.setItem("tf_token", t); localStorage.setItem("tf_user", JSON.stringify(u));
    setToken(t); setUser(u);
  };
  const logout = () => {
    localStorage.removeItem("tf_token"); localStorage.removeItem("tf_user");
    setToken(null); setUser(null);
  };
  return <Ctx.Provider value={{ user, token, login, logout, loading }}>{children}</Ctx.Provider>;
}
export const useAuth = () => useContext(Ctx);
