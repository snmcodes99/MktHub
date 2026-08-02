import axios from "axios"
import { toast } from "sonner"

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json",
  },
  // Required so the browser sends the HttpOnly refreshToken cookie on every request
  withCredentials: true,
})

// --- Request Interceptor ---
// Attach the access token from localStorage to every request
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// --- Response Interceptor ---
// On 401, silently attempt a token refresh, then retry the original request.
// If the refresh also fails (expired/revoked session), clear state and redirect to /login.
let isRefreshing = false
let failedQueue = []

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle Rate Limiting
    if (error.response?.status === 429) {
      toast.error("Too many requests. Please try again later.", {
        description: error.response.data?.message || "You have exceeded the rate limit.",
      })
      return Promise.reject(error)
    }

    // If 401 and we haven't already retried this request and it's not the refresh endpoint itself
    if (error.response?.status === 401 && !originalRequest._retry && originalRequest.url !== "/auth/refresh") {
      if (isRefreshing) {
        // Queue this request until the refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`
            return axiosClient(originalRequest)
          })
          .catch((err) => Promise.reject(err))
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const res = await axiosClient.post("/auth/refresh")
        const newAccessToken = res.data.data.accessToken
        localStorage.setItem("accessToken", newAccessToken)
        axiosClient.defaults.headers.common.Authorization = `Bearer ${newAccessToken}`
        processQueue(null, newAccessToken)
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
        return axiosClient(originalRequest)
      } catch (refreshError) {
        processQueue(refreshError, null)
        // Refresh failed — session is dead, force logout
        localStorage.removeItem("accessToken")
        localStorage.removeItem("user")
        window.location.href = "/login"
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

export default axiosClient
