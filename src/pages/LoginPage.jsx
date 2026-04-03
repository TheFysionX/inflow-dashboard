import { motion } from 'framer-motion'
import { useState } from 'react'
import Lottie from 'lottie-react'
import { useNavigate } from 'react-router-dom'
import inflowHeaderAnimation from '../assets/inflowai_header_cropped_720.json'
import { resolveDemoAccessAccount } from '../config/demoAccess'
import { useDashboard } from '../context/AppContext'

export default function LoginPage() {
  const navigate = useNavigate()
  const { defaultLandingPath, login } = useDashboard()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function handleLogin() {
    const account = resolveDemoAccessAccount(identifier, password)

    if (!account) {
      setError('That login key does not match this demo environment.')
      return
    }

    setError('')
    login({ accountId: account.id })
    navigate(defaultLandingPath || '/overview')
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
            onChange={(event) => setIdentifier(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleLogin()
              }
            }}
            placeholder="Enter your username or email"
            spellCheck="false"
            type="text"
            value={identifier}
          />
        </label>

        <label className="field field--minimal">
          <span>Password</span>
          <input
            onChange={(event) => setPassword(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                handleLogin()
              }
            }}
            placeholder="Enter your password"
            type="password"
            value={password}
          />
        </label>

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
