import React, { useState } from 'react';
import api from '../utils/api';
import Alert from '../components/Alert';

export default function History() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const r = await api.get(`/customers/search?q=${query}`);
      setResults(r.data);
      setSelectedCustomer(null); setSales([]);
    } catch { setAlert({ type: 'error', message: 'Search failed.' }); }
    finally { setLoading(false); }
  };

  const loadHistory = async (customer) => {
    setSelectedCustomer(customer);
    try {
      const r = await api.get(`/sales/customer/${customer._id}`);
      setSales(r.data);
    } catch { setAlert({ type: 'error', message: 'Failed to load history.' }); }
  };

  const fmt = (n) => `₹${(n || 0).toFixed(2)}`;
  const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });

  const totalSpent = sales.reduce((s, sale) => s + sale.totalAmount, 0);

  return (
    <>
      <div className="page-header">
        <div><h1>Purchase History</h1><p>View complete transaction history for any customer.</p></div>
      </div>
      <div className="page-body fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Search */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Identify Customer</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && search()}
              placeholder="Search by name or contact number..." style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={search} disabled={loading} style={{ minWidth: 120 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Search'}
            </button>
          </div>

          {results.length > 0 && !selectedCustomer && (
            <div style={{ marginTop: 20 }}>
              {results.map((c) => (
                <div key={c._id} onClick={() => loadHistory(c)}
                  style={{ padding: '16px 20px', background: 'var(--p-mist)', borderRadius: 'var(--p-radius-sm)', marginBottom: 8, cursor: 'pointer', border: '1px solid var(--p-fog)', transition: 'all var(--p-transition)' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--p-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--p-fog)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong style={{ fontSize: 16, color: 'var(--p-ink)' }}>{c.name}</strong>
                      <span style={{ marginLeft: 12, color: 'var(--p-slate)', fontSize: 13 }}>{c.phone}</span>
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--p-primary)' }}>Lifetime Revenue: {fmt(c.totalSpent)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedCustomer && (
          <>
            {/* Customer Insight Dashboard */}
            <div className="stat-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card blue">
                <span className="stat-icon">👤</span>
                <div className="stat-value">{selectedCustomer.name}</div>
                <div className="stat-label">Verified Stakeholder</div>
              </div>
              <div className="stat-card green">
                <span className="stat-icon">💰</span>
                <div className="stat-value" style={{ color: 'var(--p-success)' }}>{fmt(totalSpent)}</div>
                <div className="stat-label">Lifetime Value</div>
              </div>
              <div className="stat-card amber">
                <span className="stat-icon">🧾</span>
                <div className="stat-value" style={{ color: 'var(--p-warning)' }}>{sales.length}</div>
                <div className="stat-label">Total Transactions</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <button className="btn btn-secondary btn-lg" onClick={() => { setSelectedCustomer(null); setResults([]); setQuery(''); }} style={{ width: '100%' }}>
                  Change Search
                </button>
              </div>
            </div>

            {/* Purchase Records */}
            <div className="module-header" style={{ marginBottom: 24, borderBottom: '1px solid var(--p-fog)', paddingBottom: 16 }}>
              <h2 style={{ fontSize: 24, color: 'var(--p-ink)' }}>Transaction History Ledger</h2>
            </div>

            {sales.length === 0 ? (
              <div className="card loading-center" style={{ padding: 60 }}><p style={{ color: 'var(--p-slate)', fontSize: 15 }}>No historical data for this stakeholder.</p></div>
            ) : (
              sales.map((sale) => (
                <div key={sale._id} className="card" style={{ marginBottom: 20, borderLeft: '6px solid var(--p-primary)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--p-slate)', textTransform: 'uppercase', marginBottom: 4 }}>RECORDED ON</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--p-ink)' }}>{fmtDate(sale.saleDate)}</div>
                    </div>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--p-slate)', textTransform: 'uppercase', marginBottom: 4 }}>PAYMENT</div>
                      <span className={`badge badge-info`}>{sale.paymentMode}</span>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--p-slate)', textTransform: 'uppercase', marginBottom: 4 }}>TOTAL VAL.</div>
                      <div style={{ color: 'var(--p-primary)', fontFamily: 'var(--p-font-display)', fontSize: 24, fontWeight: 800 }}>{fmt(sale.totalAmount)}</div>
                    </div>
                  </div>
                  <div className="table-wrapper">
                    <table>
                      <thead>
                        <tr>
                          <th>Inventory Product</th><th>Unit Rate</th><th>Quantity</th><th>Line Disc.</th><th>Line Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sale.items.map((it, i) => (
                          <tr key={i}>
                            <td><strong style={{ color: 'var(--p-ink)' }}>{it.productName}</strong></td>
                            <td>{fmt(it.rate)}</td>
                            <td><span style={{ fontWeight: 700 }}>{it.quantity}</span></td>
                            <td><span style={{ color: 'var(--p-accent)' }}>{fmt(it.discount)}</span></td>
                            <td style={{ color: 'var(--p-primary)', fontWeight: 800 }}>{fmt(it.subtotal)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {sale.notes && (
                    <div style={{ marginTop: 20, padding: '12px 16px', background: 'var(--p-mist)', borderRadius: 'var(--p-radius-sm)', fontSize: 13, color: 'var(--p-slate)', borderLeft: '4px solid var(--p-fog)' }}>
                      <strong>Remark:</strong> {sale.notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>
    </>
  );
}
