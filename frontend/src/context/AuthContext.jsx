import { createContext, useState, useEffect, useCallback } from "react"
import {
  getCurrentUser,
  login as loginApi,
  register as registerApi,
  logout as logoutApi,
  logoutAllDevices as logoutAllDevicesApi,
  updateProfile as updateProfileApi,
  refreshToken as refreshTokenApi,
} from "@/api/authApi"

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem("accessToken")
    if (!token) {
      // No access token — try a silent refresh using the HttpOnly cookie
      try {
        const res = await refreshTokenApi()
        const newAccessToken = res.data.data.accessToken
        localStorage.setItem("accessToken", newAccessToken)
        const userRes = await getCurrentUser()
        setUser(userRes.data.data)
      } catch {
        // No valid session at all — user is logged out
        setUser(null)
      } finally {
        setLoading(false)
      }
      return
    }

    try {
      const res = await getCurrentUser()
      setUser(res.data.data)
    } catch {
      // Token invalid — axiosClient interceptor will attempt refresh automatically.
      // If that also fails, it redirects to /login. We just clean up here.
      localStorage.removeItem("accessToken")
      localStorage.removeItem("user")
      setUser(null)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // Returns nothing — user must verify email before they can log in.
  const register = async (data) => {
    await registerApi(data)
    // Backend returns { user } with no token. User must verify email first.
  }

  const login = async (credentials) => {
    const res = await loginApi(credentials)
    // Backend returns { accessToken, user }. refreshToken is set as HttpOnly cookie.
    const { accessToken, user: userData } = res.data.data
    localStorage.setItem("accessToken", accessToken)
    setUser(userData)
    return userData
  }

  const logout = async () => {
    try {
      await logoutApi()
    } catch {
      // Logout locally even if the server call fails
    }
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    setUser(null)
  }

  const logoutAll = async () => {
    try {
      await logoutAllDevicesApi()
    } catch {
      // Best-effort
    }
    localStorage.removeItem("accessToken")
    localStorage.removeItem("user")
    setUser(null)
  }

  const updateProfile = async (data) => {
    const res = await updateProfileApi(data)
    // Update local user state with the returned updated user
    setUser(res.data.data)
    return res.data.data
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, logoutAll, updateProfile, fetchUser }}
    >
      {children}
    </AuthContext.Provider>
  )
}
