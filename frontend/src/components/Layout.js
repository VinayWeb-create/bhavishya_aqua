import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

import logo from '../logo.png';

const navItems = [
  { path: '/',        label: 'Dashboard',    icon: '⬡',  end: true },
  { path: '/sale',    label: 'Sale',         icon: '🛒' },
  { path: '/return',  label: 'Return',       icon: '↩' },
  { path: '/history', label: 'History',      icon: '📜' },
  { path: '/stock',   label: 'Stock',        icon: '📦' },
  { path: '/reports', label: 'Reports',      icon: '📊' },
  { path: '/search',  label: 'Search',       icon: '⌕' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [theme, setTheme] = useState('light');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('bhavishya-theme', next);
    document.documentElement.classList.toggle('theme-dark', next === 'dark');
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  useEffect(() => {
    const stored = localStorage.getItem('bhavishya-theme');
    const initial = stored || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(initial);
    document.documentElement.classList.toggle('theme-dark', initial === 'dark');
  }, []);

  // Close sidebar on mobile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (window.innerWidth <= 768 && sidebarOpen) {
        const sidebar = document.querySelector('.sidebar');
        const menuBtn = document.querySelector('.menu-btn');
        if (!sidebar.contains(event.target) && !menuBtn.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen]);

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="app-shell">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <img src={logo} className="brand-logo" alt="Bhavishya Aqua" />
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.end}
              className={({ isActive }) => `nav-item${isActive ? ' active' : ''}`}
              onClick={closeSidebar}
              title={item.label}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-badge">
            <div className="avatar">{initials}</div>
            <div className="nav-label">
              <div className="user-name">{user?.name || 'User'}</div>
              <div className="user-role">{user?.role || 'Staff'}</div>
            </div>
          </div>
          
          <div className="sidebar-actions">
            <button className="nav-item-btn" onClick={toggleTheme} aria-label="Toggle theme" title="Toggle Theme">
              <span className="nav-icon">{theme === 'dark' ? '☀' : '🌙'}</span>
              <span className="nav-label">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
            </button>
            <button className="nav-item-btn logout" onClick={handleLogout} title="Sign Out">
              <span className="nav-icon">🚪</span>
              <span className="nav-label">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Menu Button for mobile */}
      <button className="menu-btn" onClick={toggleSidebar}>
        <span className="menu-icon">☰</span>
      </button>

      {/* Mobile Navigation Bar */}
      <div className="mobile-nav">
        <div className="mobile-nav-content">
          <div className="mobile-nav-brand">
            <img src={logo} className="brand-logo-mobile" alt="Logo" />
          </div>
          <div className="mobile-nav-actions">
            <button className="theme-toggle-mobile" onClick={toggleTheme} aria-label="Toggle theme">
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
            <div className="user-badge-mobile">
              <div className="avatar-mini">{initials}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && window.innerWidth <= 768 && (
        <div className="sidebar-overlay" onClick={closeSidebar}></div>
      )}

      <main className="main-content">
        <header className="content-header">
          <button className="refresh-btn" onClick={() => window.location.reload()} title="Refresh Data">
            <span className="refresh-icon">↺</span>
            <span className="refresh-text">Refresh Data</span>
          </button>
        </header>
        <Outlet />
      </main>
    </div>
  );
}
