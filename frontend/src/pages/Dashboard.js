import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const modules = [
  { path: '/sale',    label: 'Sale',         desc: 'Record new customer sales and reduce stock automatically.',        icon: '🛒', color: '#0e8a7c', bg: '#d0f0ec' },
  { path: '/return',  label: 'Return',       desc: 'Process product returns and restore inventory.',                   icon: '↩', color: '#d97706', bg: '#fef3c7' },
  { path: '/history', label: 'History',      desc: 'View complete purchase history of any customer.',                  icon: '📜', color: '#4a5e78', bg: '#dce8f3' },
  { path: '/stock',   label: 'Stock Update', desc: 'Manage product catalog and add stock manually.',                   icon: '📦', color: '#7c3aed', bg: '#ede9fe' },
  { path: '/reports', label: 'Reports',      desc: 'Generate daily, weekly, monthly and yearly sales reports.',        icon: '📊', color: '#16a34a', bg: '#dcfce7' },
  { path: '/search',  label: 'Search',       desc: 'Find customers by name or phone number instantly.',                icon: '⌕', color: '#c0392b', bg: '#fdecea' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/reports/summary')
      .then((r) => setSummary(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);

  const cards = [
    { label: "Today's Revenue", value: loading ? '—' : fmt(summary?.todayRevenue), icon: '💰', accent: 'teal' },
    { label: 'Transactions Today', value: loading ? '—' : summary?.todayTransactions ?? 0, icon: '🧾', accent: 'amber' },
    { label: 'Total Customers', value: loading ? '—' : summary?.totalCustomers ?? 0, icon: '👥', accent: 'purple' },
    { label: 'Lifetime Revenue', value: loading ? '—' : fmt(summary?.totalRevenue), icon: '📈', accent: 'green' },
  ];

  return (
    <>
      <div className="dashboard-hero">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back, {user?.name}. Review the latest business activity and quick actions below.</p>
        </div>
        <div className="dashboard-meta">
          <div>{new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
          <div className="status-pill">Live tracking</div>
        </div>
      </div>

      <div className="page-body fade-in">
        <div className="kpi-grid">
          {cards.map((card) => (
            <div key={card.label} className={`kpi-card ${card.accent}`}>
              <div className="kpi-icon">{card.icon}</div>
              <div>
                <div className="kpi-value">{card.value}</div>
                <div className="kpi-label">{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="module-header">
          <h2>Modules</h2>
          <p>Quick navigation to the functions you use most.</p>
        </div>

        <div className="module-grid">
          {modules.map((mod) => (
            <Link key={mod.path} to={mod.path} className="module-card module-card-dark">
              <div className="mod-icon" style={{ background: mod.bg, color: mod.color }}>
                {mod.icon}
              </div>
              <div className="mod-title">{mod.label}</div>
              <div className="mod-desc">{mod.desc}</div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
