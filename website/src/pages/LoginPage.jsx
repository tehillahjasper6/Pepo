import React, { useState } from 'react'
import { ArrowRight, Mail, Lock, Eye, EyeOff, Loader } from 'lucide-react'
import { login, signup } from '../utils/api'

const LoginPage = () => {
  const [screen, setScreen] = useState('mode') // 'mode' | 'login' | 'signup' | 'otp'
  const [mode, setMode] = useState('login') // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [name, setName] = useState('')
  const [otp, setOtp] = useState(['', '', '', ''])
  const [tempEmail, setTempEmail] = useState('')

  const handleSelectMode = (selectedMode) => {
    setMode(selectedMode)
    setScreen(selectedMode)
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (mode === 'login') {
        await login(email, password)
        // Redirect to dashboard or home
        window.location.href = '/dashboard'
      } else {
        // Sign up
        if (password !== confirmPassword) {
          throw new Error('Passwords do not match')
        }
        await signup(email, password, name)
        // After signup, show OTP verification
        setTempEmail(email)
        setScreen('otp')
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index, value) => {
    if (value.length > 1) return
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)
    
    // Auto-focus next input
    if (value && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleVerifyOtp = async () => {
    const otpCode = otp.join('')
    if (otpCode.length !== 4) {
      setError('Please enter a valid 4-digit code')
      return
    }
    
    setLoading(true)
    try {
      // Verify OTP endpoint would go here
      // await verifyOtp(tempEmail, otpCode)
      window.location.href = '/dashboard'
    } catch (err) {
      setError('Invalid OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  // Mode selection screen
  if (screen === 'mode') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-400 via-yellow-300 to-amber-400 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
              <span className="text-3xl">❤️</span>
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Pepo</h1>
            <p className="text-gray-700 mt-2">Share what you have. Change what's possible.</p>
          </div>

          {/* Options */}
          <div className="space-y-4">
            <button
              onClick={() => handleSelectMode('login')}
              className="w-full py-4 bg-white text-gray-900 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Sign In
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            <button
              onClick={() => handleSelectMode('signup')}
              className="w-full py-4 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2 group"
            >
              Create Account
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
          </div>

          {/* Trust signals */}
          <div className="mt-12 space-y-3 text-center">
            <div className="text-sm text-gray-800">
              <span className="font-bold">50,000+</span> active givers
            </div>
            <div className="text-sm text-gray-800">
              <span className="font-bold">100,000+</span> items shared
            </div>
            <div className="text-sm text-gray-800">
              Fair, transparent, and trustworthy
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Login/Signup form screen
  if (screen === 'login' || screen === 'signup') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Back button */}
          <button
            onClick={() => setScreen('mode')}
            className="mb-6 text-gray-600 hover:text-gray-900 font-medium flex items-center gap-1"
          >
            ← Back
          </button>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {mode === 'login' ? 'Welcome Back' : 'Join Pepo'}
              </h2>
              <p className="text-gray-600">
                {mode === 'login'
                  ? 'Sign in to your account'
                  : 'Create your account to start giving'}
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="John Doe"
                    required={mode === 'signup'}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3 top-3.5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 transition-all"
                    />
                  </div>
                </div>
              )}

              {mode === 'login' && (
                <div className="text-right">
                  <a href="#" className="text-sm text-yellow-600 hover:text-yellow-700 font-medium">
                    Forgot password?
                  </a>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader size={18} className="animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <div className="grid grid-cols-3 gap-4">
              <button className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" fill="#1877F2"/>
                </svg>
              </button>
              <button className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.001 12.001 0 0024 12c0-6.63-5.37-12-12-12z" fill="currentColor"/>
                </svg>
              </button>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-600">
              {mode === 'login' ? (
                <>
                  Don't have an account?{' '}
                  <button
                    onClick={() => setMode('signup')}
                    className="text-yellow-600 font-bold hover:text-yellow-700"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{' '}
                  <button
                    onClick={() => setMode('login')}
                    className="text-yellow-600 font-bold hover:text-yellow-700"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // OTP verification screen
  if (screen === 'otp') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-green-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-2xl p-8 space-y-6">
            {/* Header */}
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                Security Checkup
              </h2>
              <p className="text-gray-600">
                Enter the verification code we sent to<br />
                <span className="font-medium text-gray-900">{tempEmail}</span>
              </p>
            </div>

            {error && (
              <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* OTP Input */}
            <div className="flex gap-3 justify-center">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  id={`otp-${index}`}
                  type="text"
                  inputMode="numeric"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  className="w-14 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent"
                />
              ))}
            </div>

            {/* Verify Button */}
            <button
              onClick={handleVerifyOtp}
              disabled={loading || otp.join('').length !== 4}
              className="w-full py-3 bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-900 font-bold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader size={18} className="animate-spin" />}
              Confirm OTP
            </button>

            {/* Resend */}
            <div className="text-center text-sm text-gray-600">
              Didn't receive code?{' '}
              <button className="text-yellow-600 font-bold hover:text-yellow-700">
                Resend
              </button>
            </div>

            {/* Social */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <button className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#4285F4">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                </svg>
              </button>
              <button className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button className="py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-all flex items-center justify-center">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.001 12.001 0 0024 12c0-6.63-5.37-12-12-12z"/>
                </svg>
              </button>
            </div>

            <div className="text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                onClick={() => setScreen('login')}
                className="text-yellow-600 font-bold hover:text-yellow-700"
              >
                Log in
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default LoginPage
