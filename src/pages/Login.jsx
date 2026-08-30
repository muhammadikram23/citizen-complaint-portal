import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { AlertCircle } from 'lucide-react';

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const redirectMessage = location.state?.message;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter your email address and password.');
      return;
    }

    setLoading(true);
    try {
      const user = await login(email.trim(), password);
      if (user.role === 'officer') {
        navigate('/officer/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-white border border-gray-300 rounded p-6 sm:p-8 space-y-5 shadow-xs">
        <div className="flex items-center gap-3.5">
          <img src={logo} alt="Municipal Logo" className="h-14 sm:h-16 w-auto object-contain shrink-0" />
          <div>
            <h1 className="text-xl font-bold text-gray-950 font-serif">
              Portal authentication
            </h1>
            <p className="text-xs text-gray-600 mt-0.5">
              Sign in to citizen services or officer operations
            </p>
          </div>
        </div>

        {redirectMessage && (
          <div className="p-3 rounded bg-blue-50 border border-blue-200 text-xs text-blue-900">
            {redirectMessage}
          </div>
        )}

        {error && (
          <div className="p-3 rounded bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Email address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs"
          >
            {loading ? 'Authenticating...' : 'Sign in to portal'}
          </button>
        </form>

        <div className="pt-4 border-t border-gray-200 text-center text-xs text-gray-600">
          New citizen?{' '}
          <Link to="/signup" className="text-gray-950 font-semibold hover:underline">
            Register for an account
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
