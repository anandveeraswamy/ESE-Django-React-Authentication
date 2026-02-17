import { createContext, useState, useEffect, useContext } from 'react'

const LOCAL_STORAGE_NAMESPACE = 'appAuthentication'

const authStorage = {
  set: (key, value) => {
    const item = JSON.stringify(value)
    localStorage.setItem(`${LOCAL_STORAGE_NAMESPACE}.${key}`, item)
  },
  get: (key) => {
    const item = localStorage.getItem(`${LOCAL_STORAGE_NAMESPACE}.${key}`)
    return item ? JSON.parse(item) : null
  },
  remove: (key) => {
    localStorage.removeItem(`${LOCAL_STORAGE_NAMESPACE}.${key}`)
  },
  clear: () => {
    Object.keys(localStorage)
      .filter(key => key.startsWith(`${LOCAL_STORAGE_NAMESPACE}.`))
      .forEach(key => localStorage.removeItem(key))
  }
}

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [username, setUsername] = useState(null)

  useEffect(() => {
    checkLoginStatus()
  }, [])

  const checkLoginStatus = () => {
    const token = authStorage.get('access_token')
    const storedUsername = authStorage.get('username')
    if (token && storedUsername) {
      setIsLoggedIn(true)
      setUsername(storedUsername)
    } else {
      setIsLoggedIn(false)
      setUsername(null)
    }
  }

  const login = (accessToken, refreshToken, user) => {
    authStorage.set('access_token', accessToken)
    authStorage.set('refresh_token', refreshToken)
    authStorage.set('username', user)
    setIsLoggedIn(true)
    setUsername(user)
  }

  const logout = () => {
    authStorage.clear()
    setIsLoggedIn(false)
    setUsername(null)
  }

  const getAccessToken = () => authStorage.get('access_token')
  const getRefreshToken = () => authStorage.get('refresh_token')

  return (
    <AuthContext.Provider value={{
      isLoggedIn,
      username,
      login,
      logout,
      checkLoginStatus,
      getAccessToken,
      getRefreshToken
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
