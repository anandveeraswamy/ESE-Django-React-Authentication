import axios from 'axios'

// TODO: change to env variable to prepare for deployment to production
const API_URL = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_URL,
})

export const login = async (username, password) => {
  const response = await api.post('/token/', { username, password })
  return response.data
}

export const register = async (username, email, password) => {
  const response = await api.post('/register/', { username, email, password })
  return response.data
}

export const refreshToken = async (refreshToken) => {
  const response = await api.post('/token/refresh/', { refresh: refreshToken })
  return response.data
}

export default api
