import { motion } from 'framer-motion'
import { useState } from 'react'
import Lottie from 'lottie-react'
import { useNavigate } from 'react-router-dom'
import inflowHeaderAnimation from '../assets/inflowai_header_cropped_720.json'
import { demoCredentials } from '../config/navigation'
import { useDashboard } from '../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { login } = useDashboard()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    if (
      email.trim().toLowerCase() !== demoCredentials.email ||
      password !== demoCredentials.password
    ) {
      setError('Use the provided credentials to continue.')
      return
    }

    login()
    navigate('/overview')
  }

  return (
    <main className="login-shell">
      <section className="login-hero">
        <div className="login-brand">
          <Lottie
            animationData={inflowHeaderAnimation}
            className="login-lottie"
            loop={false}
          />
        </div>
        <p>Client dashboard</p>
      </section>

      <section className="login-panel">
        <label className="field field--minimal">
          <span>Username or email</span>
          <input
            onChange={(event) => setEmail(event.target.value)}
            placeholder="demo@inflowai.net"
            spellCheck="false"
            type="email"
            value={email}
          />
        </label>

        <label className="field field--minimal">
          <span>Password</span>
          <input
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
        </label>

        <div className="login-note">
          Access for this environment: <strong>{demoCredentials.email}</strong> /{' '}
          <strong>{demoCredentials.password}</strong>
        </div>

        {error ? <p className="form-error">{error}</p> : null}

        <div className="login-actions">
          <motion.button
            className="primary-button"
            onClick={handleLogin}
            type="button"
            whileTap={{ scale: 0.985 }}
          >
            Sign in
          </motion.button>
        </div>
      </section>
    </main>
  )
}
