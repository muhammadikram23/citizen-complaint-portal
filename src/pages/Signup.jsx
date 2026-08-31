import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { AlertCircle, UserPlus, CheckCircle2 } from 'lucide-react';

export const Signup = () => {
  const { signup } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name || !formData.email || !formData.password) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    setLoading(true);
    try {
      await signup(formData.name, formData.email, formData.password);
      setSuccess('Account created successfully. Redirecting to login...');
      setTimeout(() => {
        navigate('/login', {
          state: { message: 'Account registered. Please enter your credentials to log in.' },
        });
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create account. Email may already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 sm:py-16">
      <div className="bg-white border border-emerald-900/10 rounded-3xl p-6 sm:p-8 space-y-5 shadow-soft">
        <div className="flex items-center gap-3.5">
          <div className="p-2 rounded-2xl bg-white border border-emerald-900/10 shadow-soft shrink-0">
            <img src={logo} alt="Municipal Logo" className="h-12 sm:h-14 w-auto object-contain shrink-0" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-950">
              Citizen registration
            </h1>
            <p className="text-xs text-slate-600 mt-0.5">
              Create an account to report issues and track repairs
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2 shadow-soft">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" strokeWidth={1.75} />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2 shadow-soft">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" strokeWidth={1.75} />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-text">Full name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Ahmed Khan"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="citizen@example.com"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Minimum 6 characters"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="label-text">Confirm password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Repeat password"
              className="input-field"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full text-xs sm:text-sm inline-flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            {loading ? 'Creating account...' : 'Create citizen account'}
          </button>
        </form>

        <div className="pt-4 border-t border-emerald-900/10 text-center text-xs text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="text-emerald-700 font-semibold hover:underline">
            Log in to portal
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
