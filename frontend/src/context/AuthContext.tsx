import { createContext, useContext, useEffect, useState } from "react"
import type { ReactNode } from "react"

type User = {
  id: number
  email: string
  name?: string
  phone?: string
  is_admin: boolean
  blocked: boolean
  created_at: string
  updated_at: string
}

type AuthContextType = {
  isLoggedIn: boolean
  user: User | null
  loading: boolean
  login: () => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
        })

        if (res.ok) {
          const data = await res.json()
          setUser(data)
          setIsLoggedIn(true);
        }
      } catch (err) {
        console.error("auth check failed", err)
        setIsLoggedIn(false)
        setUser(null)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const login = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/profile", {
        method: "GET",
        credentials: "include",
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setUser(data)
      setIsLoggedIn(true)
    } catch {
      setIsLoggedIn(false)
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      await fetch("/api/logout", {
        method: "POST",
        credentials: "include",
      });
    } catch (err) {
      console.error("Ошибка при logout:", err)
    } finally {
      setIsLoggedIn(false)
      setUser(null)
    }
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider >
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
