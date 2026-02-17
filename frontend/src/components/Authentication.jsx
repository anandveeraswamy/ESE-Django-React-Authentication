import { useState } from 'react'
import { useAuth } from '../AuthContext'
import { useNavigate } from 'react-router-dom'
import { login as apiLogin, register as apiRegister } from '../services/api'

const AuthForm = ({ onSubmit, fields, submitButtonText }) => {
  const [formData, setFormData] = useState(
    fields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {})
  )
  const [error, setError] = useState('')

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await onSubmit(formData)
    } catch (error) {
      console.error('AuthForm submission error:', error)
      setError('An error occurred (see details in the console). Please try again.')
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      {fields.map((field) => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          value={formData[field.name]}
          onChange={handleChange}
          required={field.required}
        />
      ))}
      <button type="submit">{submitButtonText}</button>
    </form>
  )
}

export const Login = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    const data = await apiLogin(formData.username, formData.password)
    login(data.access, data.refresh, formData.username)
    navigate('/private')
  }

  const fields = [
    { name: 'username', type: 'text', placeholder: 'Username', required: true },
    { name: 'password', type: 'password', placeholder: 'Password', required: true },
  ]

  return <AuthForm onSubmit={handleSubmit} fields={fields} submitButtonText="Login"/>
}

export const Register = () => {
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (formData) => {
    await apiRegister(formData.username, formData.email, formData.password)
    const loginData = await apiLogin(formData.username, formData.password)
    login(loginData.access, loginData.refresh, formData.username)
    navigate('/private')
  }

  const fields = [
    { name: 'username', type: 'text', placeholder: 'Username', required: true },
    { name: 'email', type: 'email', placeholder: 'Email', required: true },
    { name: 'password', type: 'password', placeholder: 'Password', required: true },
  ]

  return <AuthForm onSubmit={handleSubmit} fields={fields} submitButtonText="Register"/>
}
