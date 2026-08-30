import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Landmark, Menu, X, LogOut, PlusCircle, ListFilter, LayoutDashboard, FileText } from 'lucide-react';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isOfficer, isCitizen } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => {
    return location.pathname === path
      ? 'text-blue-700 font-semibold border-b-2 border-blue-700 pb-1'
      : 'text-slate-600 hover:text-slate-900 transition-colors pb-1';
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo & Portal Identity */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="p-2 bg-slate-900 text-white rounded">
                <Landmark className="h-5 w-5 text-slate-100" />
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight block leading-tight">
                  CivicPortal
                </span>
                <span className="text-[11px] text-slate-500 font-mono tracking-wider uppercase block">
                  Municipal Issue Resolution
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            <Link to="/complaints" className={isActive('/complaints')}>
              Public Feed
            </Link>

            {isAuthenticated && isCitizen && (
              <>
                <Link to="/dashboard" className={isActive('/dashboard')}>
                  Dashboard
                </Link>
                <Link to="/complaints/mine" className={isActive('/complaints/mine')}>
                  My Complaints
                </Link>
                <Link
                  to="/complaints/new"
                  className="inline-flex items-center gap-1.5 bg-blue-700 text-white px-3.5 py-1.5 rounded-md text-xs font-medium hover:bg-blue-800 transition-colors"
                >
                  <PlusCircle className="h-4 w-4" />
                  Report Issue
                </Link>
              </>
            )}

            {isAuthenticated && isOfficer && (
              <>
                <Link to="/officer/dashboard" className={isActive('/officer/dashboard')}>
                  Officer Operations
                </Link>
              </>
            )}
          </nav>

          {/* User Session & Authentication Action */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-xs font-medium text-slate-900 leading-tight">
                    {user?.name}
                  </div>
                  <span
                    className={`inline-block px-1.5 py-0.2 text-[10px] uppercase font-mono font-semibold rounded ${
                      isOfficer
                        ? 'bg-amber-100 text-amber-900 border border-amber-300'
                        : 'bg-slate-100 text-slate-700 border border-slate-300'
                    }`}
                  >
                    {user?.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
                  title="Sign out of portal"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-sm font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded hover:bg-slate-100 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="text-sm font-medium bg-blue-700 text-white px-3.5 py-1.5 rounded-md hover:bg-blue-800 transition-colors"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-3">
          <Link
            to="/complaints"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 text-sm font-medium text-slate-700"
          >
            Public Feed
          </Link>

          {isAuthenticated && isCitizen && (
            <>
              <Link
                to="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm font-medium text-slate-700"
              >
                Dashboard
              </Link>
              <Link
                to="/complaints/mine"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-1.5 text-sm font-medium text-slate-700"
              >
                My Complaints
              </Link>
              <Link
                to="/complaints/new"
                onClick={() => setMobileMenuOpen(false)}
                className="block py-2 text-sm font-medium text-center bg-blue-700 text-white rounded"
              >
                Report New Issue
              </Link>
            </>
          )}

          {isAuthenticated && isOfficer && (
            <Link
              to="/officer/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-sm font-medium text-blue-700 font-semibold"
            >
              Officer Operations Dashboard
            </Link>
          )}

          <div className="pt-3 border-t border-slate-200">
            {isAuthenticated ? (
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-slate-900">{user?.name}</div>
                  <div className="text-[11px] font-mono text-slate-500">{user?.email}</div>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="text-xs font-medium text-rose-700 hover:underline"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 border border-slate-300 rounded text-sm font-medium text-slate-700"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-center py-2 bg-blue-700 text-white rounded text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
