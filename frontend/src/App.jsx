import { useEffect } from 'react'
import { BrowserRouter as Router, Route, Routes, NavLink, useNavigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { Register, Login } from './components/Authentication'

import './App.css'

const Home = () => {
  const { isLoggedIn, username} = useAuth()
  return (
    <h2>
      {isLoggedIn
        ? `Welcome, ${username}! You're logged in.`
        : "Hi, please log in (or register) to use the site"}
    </h2>
  )
}

const PrivateComponent = () => {
  const { isLoggedIn, username} = useAuth()
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [isLoggedIn, navigate]);

  return isLoggedIn ? <h2>Welcome {username}! This is the private section for authenticated users</h2> : null;
}

const Navigation = () => {
  const { isLoggedIn, logout } = useAuth()
  const navigate = useNavigate();

  const handleLogout = () => {
    logout()
    console.log('Logout successful')
    navigate('/')
  }

  return (
    <nav>
      <h1><NavLink to="/">Django+React Auth Example</NavLink></h1>
      <ul>
        {isLoggedIn ? (
          <>
            <li><NavLink to="/private">PrivateComponent</NavLink></li>
            <li><button onClick={handleLogout}>Logout</button></li>
          </>
        ) : (
          <>
            <li><NavLink to="/register">Register</NavLink></li>
            <li><NavLink to="/login">Login</NavLink></li>
          </>
        )}
      </ul>
    </nav>
  )
}

const AppContent = () => {
  const { isLoggedIn } = useAuth()

  return (
    <div className="App">
      <Navigation />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        {isLoggedIn && <Route path="/private" element={<PrivateComponent />} />}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </div>
  )
}

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  )
}

export default App
