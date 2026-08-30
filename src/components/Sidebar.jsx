import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { ThemeToggle } from './ThemeToggle';
import {
  Home,
  PlusCircle,
  FileText,
  Search,
  LayoutDashboard,
  LogOut,
  LogIn,
  UserPlus,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
} from 'lucide-react';

export const Sidebar = ({ children }) => {
  const { user, isAuthenticated, logout, isOfficer } = useAuth();
  const navigate = useNavigate();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
    setMobileDrawerOpen(false);
  };

  const getNavItems = () => {
    if (!isAuthenticated) {
      return [
        { to: '/', label: 'Home', icon: Home },
        { to: '/complaints', label: 'Browse complaints', icon: Search },
        { to: '/login', label: 'Log in', icon: LogIn },
        { to: '/signup', label: 'Sign up', icon: UserPlus },
      ];
    }

    if (isOfficer) {
      return [
        { to: '/officer/dashboard', label: 'Officer dashboard', icon: LayoutDashboard },
        { to: '/complaints', label: 'Public registry view', icon: Search },
      ];
    }

    return [
      { to: '/dashboard', label: 'Citizen dashboard', icon: LayoutDashboard },
      { to: '/complaints/new', label: 'Report a complaint', icon: PlusCircle },
      { to: '/complaints/mine', label: 'My complaints', icon: FileText },
      { to: '/complaints', label: 'Browse complaints', icon: Search },
    ];
  };

  const navItems = getNavItems();

  const getNavLinkClass = ({ isActive }) => {
    const base =
      'flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-colors min-h-[44px] font-sans';
    if (isActive) {
      return `${base} bg-slate-900 text-white font-medium`;
    }
    return `${base} text-gray-700 hover:bg-gray-200/70 hover:text-gray-950`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-100 font-sans">
      {/* Mobile Top Header */}
      <header className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-300 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 -ml-2 rounded text-gray-700 hover:bg-gray-100 hover:text-gray-950 min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Open navigation"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <img src={logo} alt="Portal Logo" className="h-9 w-auto object-contain shrink-0" />
          <span className="font-serif font-bold text-base tracking-tight text-gray-950">
            Citizen Complaint Portal
          </span>
        </div>

        {isAuthenticated && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium border ${
              isOfficer
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-gray-100 text-gray-800 border-gray-300'
            }`}
          >
            {isOfficer ? 'Officer' : 'Citizen'}
          </span>
        )}
      </header>

      {/* Mobile Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/40"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-300 transform transition-transform duration-200 ease-in-out flex flex-col ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Portal Logo" className="h-10 w-auto object-contain shrink-0" />
            <div>
              <div className="font-serif font-bold text-base text-gray-950">Municipal Portal</div>
              <div className="text-xs text-gray-500">
                {isAuthenticated
                  ? isOfficer
                    ? 'Officer operations mode'
                    : 'Citizen service mode'
                  : 'Public access'}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(false)}
            className="p-2 rounded text-gray-500 hover:bg-gray-100 hover:text-gray-900"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" strokeWidth={1.5} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setMobileDrawerOpen(false)}
                className={getNavLinkClass}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {isAuthenticated ? (
          <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
            <div className="px-2 py-1.5">
              <div className="text-xs font-semibold text-gray-900 truncate">
                {user?.name}
              </div>
              <div className="text-xs text-gray-500 truncate">{user?.email}</div>
            </div>
            <div className="space-y-1">
              <ThemeToggle />
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition-colors"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
                Sign out
              </button>
            </div>
          </div>
        ) : (
          <div className="p-3 border-t border-gray-200 bg-gray-50 space-y-2">
            <ThemeToggle />
            <NavLink
              to="/login"
              onClick={() => setMobileDrawerOpen(false)}
              className="btn-secondary w-full text-xs text-center"
            >
              Log in
            </NavLink>
            <NavLink
              to="/signup"
              onClick={() => setMobileDrawerOpen(false)}
              className="btn-primary w-full text-xs text-center"
            >
              Sign up
            </NavLink>
          </div>
        )}
      </div>

      {/* Desktop Fixed Side Navigation Rail */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white border-r border-gray-300 min-h-screen transition-[width] duration-150 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img src={logo} alt="Portal Logo" className="h-10 w-auto object-contain shrink-0" />
              <div className="overflow-hidden">
                <span className="font-serif font-bold text-base text-gray-950 leading-tight block truncate">
                  Civic Portal
                </span>
                <span className="text-xs text-gray-500 block truncate">
                  {isAuthenticated
                    ? isOfficer
                      ? 'Officer mode'
                      : 'Citizen mode'
                    : 'Public access'}
                </span>
              </div>
            </div>
          ) : (
            <div className="mx-auto" title="Civic Complaint Portal">
              <img src={logo} alt="Portal Logo" className="h-9 w-auto object-contain shrink-0" />
            </div>
          )}

          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="text-gray-400 hover:text-gray-700 p-1.5 rounded hover:bg-gray-100 transition-colors shrink-0"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.5} />
            ) : (
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.5} />
            )}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={getNavLinkClass}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0" strokeWidth={1.5} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            );
          })}
        </nav>

        {isAuthenticated ? (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            {!collapsed ? (
              <div className="space-y-2">
                <div className="px-2">
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                  <span
                    className={`inline-block mt-1 text-[11px] font-semibold px-1.5 py-0.5 rounded border ${
                      isOfficer
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-gray-100 text-gray-800 border-gray-300'
                    }`}
                  >
                    {user?.role === 'officer' ? 'Municipal Officer' : 'Citizen'}
                  </span>
                </div>
                <div className="space-y-1">
                  <ThemeToggle />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50 rounded transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.5} />
                    Sign out
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="p-2 text-red-700 hover:bg-red-50 rounded"
                  title="Sign out"
                >
                  <LogOut className="h-4 w-4" strokeWidth={1.5} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            {!collapsed ? (
              <div className="space-y-2">
                <ThemeToggle />
                <NavLink to="/login" className="btn-secondary w-full text-xs text-center">
                  Log in
                </NavLink>
                <NavLink to="/signup" className="btn-primary w-full text-xs text-center">
                  Sign up
                </NavLink>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <ThemeToggle />
                <NavLink
                  to="/login"
                  className="p-2 text-gray-700 hover:bg-gray-100 rounded"
                  title="Log in"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.5} />
                </NavLink>
              </div>
            )}
          </div>
        )}
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
