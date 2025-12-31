'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { PepoIcon } from '@/components/PepoBee';
import { useAuth } from '@/hooks/useAuth';
import { apiClient } from '@/lib/apiClient';
import { toast } from '@/components/Toast';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [method, setMethod] = useState<'otp' | 'password'>('otp');
  const [otpType, setOtpType] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (otpType === 'email' && !email) {
        toast.error('Please enter your email address');
        setLoading(false);
        return;
      }
      if (otpType === 'phone' && !phone) {
        toast.error('Please enter your phone number');
        setLoading(false);
        return;
      }

      await apiClient.sendOTP(otpType === 'email' ? email : undefined, otpType === 'phone' ? phone : undefined);
      setOtpSent(true);
      toast.success(`OTP sent to your ${otpType === 'email' ? 'email' : 'phone number'}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (!otp) {
        toast.error('Please enter the OTP code');
        setLoading(false);
        return;
      }

      const response = await apiClient.verifyOTP(
        otpType === 'email' ? email : undefined,
        otpType === 'phone' ? phone : undefined,
        otp
      );
      
      toast.success('Welcome back to PEPO! 🐝');
      router.push('/browse');
    } catch (error: any) {
      toast.error(error.message || 'Invalid OTP code');
      setLoading(false);
    }
  };

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const identifier = email || phone;
      if (!identifier) {
        toast.error('Please enter your email or phone number');
        setLoading(false);
        return;
      }
      
      await login(identifier, password);
      toast.success('Welcome back to PEPO! 🐝');
      router.push('/browse');
    } catch (error: any) {
      toast.error(error.message || 'Login failed. Please check your credentials.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-400 via-primary-500 to-primary-600 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-full mb-4">
            <PepoIcon size={50} />
          </div>
          <h1 className="text-3xl font-bold text-white">Welcome Back to PEPO</h1>
          <p className="text-white/80 mt-2">Give Freely. Live Lightly.</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Method Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setMethod('otp')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                method === 'otp'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              OTP
            </button>
            <button
              onClick={() => setMethod('password')}
              className={`flex-1 py-2 px-4 rounded-md font-medium transition-colors ${
                method === 'password'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              Password
            </button>
          </div>

          {/* OTP Method */}
          {method === 'otp' && !otpSent && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              {/* OTP Type Toggle */}
              <div className="flex bg-gray-50 rounded-lg p-1 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setOtpType('email');
                    setPhone('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    otpType === 'email'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setOtpType('phone');
                    setEmail('');
                  }}
                  className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                    otpType === 'phone'
                      ? 'bg-white text-primary-600 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  Phone
                </button>
              </div>

              {otpType === 'email' ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="input"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                    className="input"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Sending...' : `Send OTP to ${otpType === 'email' ? 'Email' : 'Phone'}`}
              </button>
            </form>
          )}

          {/* OTP Verification */}
          {method === 'otp' && otpSent && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter OTP Code
                </label>
                <input
                  type="text"
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="123456"
                  maxLength={6}
                  className="input text-center text-2xl tracking-widest"
                />
                <p className="text-sm text-gray-600 mt-2">
                  Sent to {otpType === 'email' ? email : phone}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Verifying...' : 'Verify & Login'}
              </button>

              <button
                type="button"
                onClick={async () => {
                  setLoading(true);
                  setOtp('');
                  try {
                    await apiClient.sendOTP(
                      otpType === 'email' ? email : undefined,
                      otpType === 'phone' ? phone : undefined
                    );
                    toast.success(`OTP resent to your ${otpType === 'email' ? 'email' : 'phone number'}`);
                  } catch (error: any) {
                    toast.error(error.message || 'Failed to resend OTP');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="btn btn-secondary w-full"
              >
                {loading ? 'Resending...' : 'Resend Code'}
              </button>
            </form>
          )}

          {/* Password Method */}
          {method === 'password' && (
            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={email || phone}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value.includes('@')) {
                      setEmail(value);
                      setPhone('');
                    } else {
                      setPhone(value);
                      setEmail('');
                    }
                  }}
                  placeholder="you@example.com or +1234567890"
                  className="input"
                />
                <p className="text-xs text-gray-500 mt-1">
                  You can login with either email or phone number
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary w-full"
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          )}

          {/* OAuth Options */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button className="btn btn-secondary">
                <span className="mr-2">🔍</span>
                Google
              </button>
              <button className="btn btn-secondary">
                <span className="mr-2">🍎</span>
                Apple
              </button>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <Link href="/signup" className="font-medium text-primary-600 hover:text-primary-700">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

