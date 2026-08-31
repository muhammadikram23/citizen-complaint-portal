import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import logo from '../assets/logo.png';
import { ThemeToggle } from './ThemeToggle';
import {
  Home,
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
      'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm transition-all duration-150 min-h-[42px] font-sans';
    if (isActive) {
      return `${base} bg-emerald-600 text-white font-semibold shadow-soft`;
    }
    return `${base} text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-950 font-medium`;
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#f6faf7] font-sans">
      {/* Mobile Top Header Bar */}
      <header className="md:hidden sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-emerald-900/10 px-4 py-3 flex items-center justify-between shadow-soft">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileDrawerOpen(true)}
            className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-emerald-50/70 hover:text-emerald-950 min-h-[42px] min-w-[42px] flex items-center justify-center transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" strokeWidth={1.75} />
          </button>
          <img src={logo} alt="Portal Logo" className="h-9 w-auto object-contain shrink-0" />
          <span className="font-bold text-sm tracking-tight text-slate-950">
            Citizen Portal
          </span>
        </div>

        {isAuthenticated && (
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
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
          className="md:hidden fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => setMobileDrawerOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile Slide-in Drawer with Beautiful Rounded Corners */}
      <div
        className={`md:hidden fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md border-r border-emerald-900/10 rounded-r-3xl shadow-soft-lg transform transition-transform duration-200 ease-out flex flex-col ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-1 rounded-xl bg-emerald-50/80 border border-emerald-200/60">
              <img src={logo} alt="Portal Logo" className="h-8 w-auto object-contain shrink-0" />
            </div>
            <div>
              <div className="font-bold text-sm text-slate-950 leading-tight">Civic Portal</div>
              <div className="text-[11px] text-slate-500 font-medium">
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
            className="p-2 rounded-xl text-slate-500 hover:bg-emerald-50 hover:text-slate-900 transition-colors"
            aria-label="Close navigation"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        {/* Drawer Unified Nav Column */}
        <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto">
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
          )}

          {/* Section Positioned Directly Under Browse Complaints */}
          <div className="pt-3 border-t border-emerald-900/10 space-y-3">
            {!isAuthenticated ? (
              <div className="space-y-2">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                  Account Access
                </div>
                <NavLink
                  to="/login"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full min-h-[42px] px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-soft transition-colors"
                >
                  <LogIn className="h-4 w-4" strokeWidth={1.75} />
                  <span>Log in</span>
                </NavLink>
                <NavLink
                  to="/signup"
                  onClick={() => setMobileDrawerOpen(false)}
                  className="w-full min-h-[42px] px-3.5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 border border-emerald-600/60 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-soft"
                >
                  <UserPlus className="h-4 w-4 text-emerald-700" strokeWidth={1.75} />
                  <span>Sign up</span>
                </NavLink>
              </div>
            ) : (
              <div className="space-y-2.5">
                <div className="px-3 py-2.5 bg-emerald-50/40 rounded-2xl border border-emerald-900/10">
                  <div className="text-xs font-semibold text-slate-900 truncate">
                    {user?.name}
                  </div>
                  <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                  <span
                    className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
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
                  className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-700 bg-red-50/70 hover:bg-red-100/80 border border-red-200 transition-colors"
                >
                  <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                  <span>Sign out</span>
                </button>
              </div>
            )}

            {/* Dark Mode Toggle — mobile drawer is never collapsed, always full view */}
            <div className="pt-1">
              <ThemeToggle collapsed={false} />
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Fixed Side Navigation Rail with Rounded Aesthetic */}
      <aside
        className={`hidden md:flex flex-col shrink-0 bg-white/90 backdrop-blur-sm border-r border-emerald-900/10 min-h-screen transition-[width] duration-200 shadow-soft overflow-hidden ${
          collapsed ? 'w-20' : 'w-64'
        }`}
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-emerald-900/10 flex items-center justify-between min-h-[68px]">
          {!collapsed ? (
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="p-1 rounded-xl bg-emerald-50/80 border border-emerald-200/60 shrink-0">
                <img src={logo} alt="Portal Logo" className="h-8 w-auto object-contain shrink-0" />
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-sm text-slate-950 leading-tight block truncate">
                  Civic Portal
                </span>
                <span className="text-[11px] text-slate-500 font-medium block truncate">
                  {isAuthenticated
                    ? isOfficer
                      ? 'Officer Mode'
                      : 'Citizen Mode'
                    : 'Public Access'}
                </span>
              </div>
            </div>
          ) : (
            <div
              className="mx-auto flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50/80 border border-emerald-200/60 shrink-0 overflow-hidden"
              title="Civic Complaint Portal"
            >
              <img src={logo} alt="Portal Logo" className="h-6 w-6 object-contain shrink-0" />
            </div>
          )}

          {!collapsed && (
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
              title="Collapse sidebar"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" strokeWidth={1.75} />
            </button>
          )}
        </div>

        {/* Collapse toggle gets its own centered row when collapsed, so the
            brand header above only ever has to fit the logo, not the logo
            + a second button squeezed into 80px */}
        {collapsed && (
          <div className="px-4 pb-2 flex items-center justify-center">
            <button
              type="button"
              onClick={() => setCollapsed(!collapsed)}
              className="text-slate-400 hover:text-slate-700 p-1.5 rounded-xl hover:bg-emerald-50 transition-colors shrink-0"
              title="Expand sidebar"
              aria-label="Expand sidebar"
            >
              <PanelLeftOpen className="h-4 w-4" strokeWidth={1.75} />
            </button>
          </div>
        )}

        {/* Main Column: Routes + Actions + User Info + Theme Toggle flowing in a single column */}
        <div className="flex-1 p-3.5 space-y-3.5 overflow-y-auto overflow-x-hidden">
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
          )}

          {/* Column Section Positioned Directly Under Browse Complaints */}
          <div className="pt-3 border-t border-emerald-900/10 space-y-3">
            {!isAuthenticated ? (
              <div className="space-y-2">
                {!collapsed && (
                  <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1">
                    Account Access
                  </div>
                )}

                <NavLink
                  to="/login"
                  className={`min-h-[42px] rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 shadow-soft transition-colors ${
                    collapsed ? 'w-9 h-9 mx-auto p-0' : 'w-full px-3.5 py-2.5'
                  }`}
                  title="Log in"
                >
                  <LogIn className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                  {!collapsed && <span>Log in</span>}
                </NavLink>

                <NavLink
                  to="/signup"
                  className={`min-h-[42px] rounded-xl bg-white hover:bg-emerald-50 active:bg-emerald-100 text-emerald-800 border border-emerald-600/60 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors shadow-soft ${
                    collapsed ? 'w-9 h-9 mx-auto p-0' : 'w-full px-3.5 py-2.5'
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
                  <div className="px-3 py-2.5 bg-emerald-50/40 rounded-2xl border border-emerald-900/10">
                    <div className="text-xs font-semibold text-slate-900 truncate">
                      {user?.name}
                    </div>
                    <div className="text-[11px] text-slate-500 truncate">{user?.email}</div>
                    <span
                      className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        isOfficer
                          ? 'bg-amber-50 text-amber-900 border-amber-300'
                          : 'bg-emerald-50 text-emerald-900 border-emerald-300'
                      }`}
                    >
                      {user?.role === 'officer' ? 'Municipal Officer' : 'Verified Citizen'}
                    </span>
                  </div>
                ) : (
                  <div
                    className="mx-auto flex items-center justify-center h-9 w-9 rounded-xl bg-emerald-50/40 border border-emerald-900/10"
                    title={`${user?.name} (${user?.role})`}
                  >
                    <User className="h-4 w-4 text-slate-600" strokeWidth={1.75} />
                  </div>
                )}

                {!collapsed ? (
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium text-red-700 bg-red-50/70 hover:bg-red-100/80 border border-red-200 transition-colors"
                  >
                    <LogOut className="h-3.5 w-3.5" strokeWidth={1.75} />
                    <span>Sign out</span>
                  </button>
                ) : (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="h-9 w-9 flex items-center justify-center text-red-700 hover:bg-red-50 rounded-xl"
                      title="Sign out"
                    >
                      <LogOut className="h-4 w-4" strokeWidth={1.75} />
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Dark Mode Toggle — icon-only, no label, no switch when rail is collapsed */}
            <div className="pt-1 flex justify-center">
              <ThemeToggle collapsed={collapsed} />
            </div>
          </div>
        </div>
      </aside>

      {/* Main Page Area with light greenish-white background */}
      <main className="flex-1 min-w-0 overflow-y-auto bg-[#f6faf7]">
        {children}
      </main>
    </div>
  );
};

export default Sidebar;