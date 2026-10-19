import axios from 'axios'

// One shared Axios instance for the whole app.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { Accept: 'application/json' },
})

export const TOKEN_KEY = 'pawmilya_token'

// Attach the Sanctum token to every request when logged in.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// An expired/invalid token sends the user back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(TOKEN_KEY)
      if (window.location.pathname !== '/login') window.location.assign('/login')
    }
    return Promise.reject(error)
  },
)

// Phase 0 health check against the Laravel API.
export const checkHealth = () => api.get('/api/health')

export default api
