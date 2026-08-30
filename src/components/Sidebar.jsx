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
  User,
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

  const getNavLinkClass = ({ isActive }) => {
    const base =
      'flex items-center gap-3 px-3 py-2.5 rounded text-xs sm:text-sm transition-colors min-h-[42px] font-sans';
    if (isActive) {
      return `${base} bg-emerald-600 text-white font-medium shadow-xs`;
    }
    return `${base} text-slate-700 hover:bg-slate-200/70 hover:text-slate-950 font-normal`;
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
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <img src={logo} alt="Portal Logo" className="h-9 w-auto object-contain shrink-0" />
          <span className="font-bold text-sm tracking-tight text-gray-950">
            Citizen Portal
          </span>
        </div>

        {isAuthenticated && (
          <span
            className={`text-xs px-2 py-0.5 rounded font-medium border ${
              isOfficer
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-emerald-50 text-emerald-900 border-emerald-300'
            }`}
          >
            {isOfficer ? 'Officer' : 'Citizen'}
          </span>
        )}
      </header>

      {/* Mobile Backdrop */}
      {mobileDrawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-black/50"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer (Single Unified Column) */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white border-r border-gray-300 transform transition-transform duration-200 ease-in-out flex flex-col ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Portal Logo" className="h-10 w-auto object-contain shrink-0" />
            <div>
              <div className="font-bold text-sm text-gray-950 leading-tight">Civic Portal</div>
              <div className="text-[11px] text-gray-500">
                {isAuthenticated
                  ? isOfficer
                    ? 'Officer operations'
                    : 'Citizen service'
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

        {/* Drawer Unified Nav Column */}
        <div className="flex-1 p-3.5 space-y-4 overflow-y-auto">
          {/* Main Navigation Routes */}
          {!isAuthenticated ? (
            <div className="space-y-1">
              <NavLink to="/" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>Home</span>
              </NavLink>
              <NavLink to="/complaints" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>Browse complaints</span>
              </NavLink>
            </div>
          ) : isOfficer ? (
            <div className="space-y-1">
              <NavLink to="/officer/dashboard" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>Officer dashboard</span>
              </NavLink>
              <NavLink to="/complaints" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                <span>Browse complaints</span>
              </NavLink>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Primary Green Action Button: Report a Complaint */}
              <NavLink
                to="/complaints/new"
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full min-h-[42px] px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors mb-2"
              >
                <PlusCircle className="h-4 w-4" strokeWidth={2} />
                <span>Report a complaint</span>
              </NavLink>

              <div className="space-y-1">
                <NavLink to="/dashboard" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                  <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>Citizen dashboard</span>
                </NavLink>
                <NavLink to="/complaints/mine" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                  <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>My complaints</span>
                </NavLink>
                <NavLink to="/complaints" onClick={() => setMobileDrawerOpen(false)} className={getNavLinkClass}>
                  <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  <span>Browse complaints</span>
                </NavLink>
              </div>
            </div>
          )}

          {/* Section directly positioned under Browse Complaints */}
          <div className="pt-3 border-t border-gray-200 space-y-3">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-1">
                  Account Access
                </div>
                <NavLink
                  to="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full min-h-[42px] px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.75} />
                  <span>Log in</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full min-h-[42px] px-3 py-2 rounded bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 border border-emerald-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  <UserPlus className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
                  <span>Sign up</span>
                </NavLink>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="px-2.5 py-2 bg-gray-50 rounded border border-gray-200">
                  <div className="text-xs font-semibold text-gray-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                      isOfficer
                        ? 'bg-amber-50 text-amber-900 border-amber-300'
                        : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                    }`}
                  >
                    {user?.role === 'officer' ? 'Municipal Officer' : 'Verified Citizen'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50/70 hover:bg-red-100/80 border border-red-200 rounded transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Sign out</span>
                </button>
              </div>
            )}

            {/* Dark Mode Toggle directly under in the column */}
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Fixed Side Navigation Rail (Single Continuous Column) */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white border-r border-gray-300 min-h-screen transition-[width] duration-150 ${
          collapsed ? 'w-16' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-3.5 border-b border-gray-200 flex items-center justify-between min-h-[64px]">
          {!collapsed ? (
            <div className="flex items-center gap-2.5 overflow-hidden">
              <img src={logo} alt="Portal Logo" className="h-10 w-auto object-contain shrink-0" />
              <div className="overflow-hidden">
                <span className="font-bold text-sm text-gray-950 leading-tight block truncate">
                  Civic Portal
                </span>
                <span className="text-[11px] text-gray-500 block truncate">
                  {isAuthenticated
                    ? isOfficer
                      ? 'Officer Mode'
                      : 'Citizen Mode'
                    : 'Public Access'}
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

        {/* Main Column: Routes + Actions + User Info + Theme Toggle flowing in a single column */}
        <div className="flex-1 p-3 space-y-4 overflow-y-auto">
          {/* Primary Routes */}
          {!isAuthenticated ? (
            <div className="space-y-1">
              <NavLink to="/" className={getNavLinkClass} title={collapsed ? 'Home' : undefined}>
                <Home className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span>Home</span>}
              </NavLink>

              <NavLink
                to="/complaints"
                className={getNavLinkClass}
                title={collapsed ? 'Browse complaints' : undefined}
              >
                <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span>Browse complaints</span>}
              </NavLink>
            </div>
          ) : isOfficer ? (
            <div className="space-y-1">
              <NavLink
                to="/officer/dashboard"
                className={getNavLinkClass}
                title={collapsed ? 'Officer dashboard' : undefined}
              >
                <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">Officer dashboard</span>}
              </NavLink>

              <NavLink
                to="/complaints"
                className={getNavLinkClass}
                title={collapsed ? 'Browse complaints' : undefined}
              >
                <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                {!collapsed && <span className="truncate">Browse complaints</span>}
              </NavLink>
            </div>
          ) : (
            <div className="space-y-2">
              {/* Primary Solid Green Action Button */}
              <NavLink
                to="/complaints/new"
                className={`w-full min-h-[42px] px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors ${
                  collapsed ? 'p-2' : ''
                }`}
                title="Report a complaint"
              >
                <PlusCircle className="h-4 w-4 shrink-0" strokeWidth={2} />
                {!collapsed && <span>Report a complaint</span>}
              </NavLink>

              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  className={getNavLinkClass}
                  title={collapsed ? 'Citizen dashboard' : undefined}
                >
                  <LayoutDashboard className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="truncate">Citizen dashboard</span>}
                </NavLink>

                <NavLink
                  to="/complaints/mine"
                  className={getNavLinkClass}
                  title={collapsed ? 'My complaints' : undefined}
                >
                  <FileText className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="truncate">My complaints</span>}
                </NavLink>

                <NavLink
                  to="/complaints"
                  className={getNavLinkClass}
                  title={collapsed ? 'Browse complaints' : undefined}
                >
                  <Search className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span className="truncate">Browse complaints</span>}
                </NavLink>
              </div>
            </div>
          )}

          {/* Column Section Positioned Directly Under Browse Complaints */}
          <div className="pt-3 border-t border-gray-200 space-y-3">
            {!isAuthenticated ? (
              <div className="space-y-2">
                {!collapsed && (
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 px-1">
                    Account Access
                  </div>
                )}

                <NavLink
                  to="/login"
                  className={`w-full min-h-[42px] px-3 py-2 rounded bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors ${
                    collapsed ? 'p-2' : ''
                  }`}
                  title="Log in"
                >
                  <LogIn className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span>Log in</span>}
                </NavLink>

                <NavLink
                  to="/signup"
                  className={`w-full min-h-[42px] px-3 py-2 rounded bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 border border-emerald-600 text-xs font-semibold flex items-center justify-center gap-2 transition-colors ${
                    collapsed ? 'p-2' : ''
                  }`}
                  title="Sign up"
                >
                  <UserPlus className="h-4 w-4 text-emerald-700 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span>Sign up</span>}
                </NavLink>
              </div>
            ) : (
              <div className="space-y-2.5">
                {!collapsed ? (
                  <div className="px-2.5 py-2 bg-gray-50 rounded border border-gray-200">
                    <div className="text-xs font-semibold text-gray-900 truncate">
                      {user?.name}
                    </div>
                    <div className="text-[11px] text-gray-500 truncate">{user?.email}</div>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold px-1.5 py-0.5 rounded border ${
                        isOfficer
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {user?.role === 'officer' ? 'Municipal Officer' : 'Verified Citizen'}
                    </span>
                  </div>
                ) : (
                  <div className="flex justify-center" title={`${user?.name} (${user?.role})`}>
                    <User className="h-4 w-4 text-gray-600" strokeWidth={1.75} />
                  </div>
                )}

                {!collapsed ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium text-red-700 bg-red-50/70 hover:bg-red-100/80 border border-red-200 rounded transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="p-2 text-red-700 hover:bg-red-50 rounded"
                      title="Sign out"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dark Mode Toggle directly inside the column */}
            <div className="pt-2">
              <ThemeToggle />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page Area */}
      <main className="flex-1 min-w-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;
