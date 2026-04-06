import React, { useState } from 'react';
import api from '../utils/api';
import Alert from '../components/Alert';

export default function Search() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState(null);
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true); setSelected(null); setDetails(null);
    try {
      const r = await api.get(`/customers/search?q=${query}`);
      setResults(r.data);
      if (r.data.length === 0) setAlert({ type: 'info', message: 'No customers found.' });
    } catch { setAlert({ type: 'error', message: 'Search failed.' }); }
    finally { setLoading(false); }
  };

  const viewDetails = async (customer) => {
    setSelected(customer);
    try {
      const [salesRes, returnsRes] = await Promise.all([
        api.get(`/sales/customer/${customer._id}`),
        api.get(`/returns/customer/${customer._id}`),
      ]);
      setDetails({ sales: salesRes.data, returns: returnsRes.data });
    } catch { setAlert({ type: 'error', message: 'Failed to load details.' }); }
  };

  const fmt = (n) => `₹${(n || 0).toFixed(2)}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <div className="page-header">
        <div><h1>Stakeholder Database</h1><p>Find customers and view their complete interactive profile.</p></div>
      </div>
      <div className="page-body fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <div className="card" style={{ marginBottom: 32 }}>
          <div className="card-title">Identify Stakeholder</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>⌕</span>
              <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && search()}
                placeholder="Search by full name or mobile contact..." style={{ paddingLeft: 40 }} />
            </div>
            <button className="btn btn-primary btn-lg" onClick={search} disabled={loading} style={{ minWidth: 140 }}>
              {loading ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Execute Search'}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {results.length > 0 && !selected && (
          <div className="card" style={{ marginBottom: 32 }}>
            <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Search Results — {results.length} found</span>
            </div>
            <div className="table-wrapper" style={{ marginTop: 20 }}>
              <table>
                <thead><tr><th>Full Name</th><th>Contact</th><th>Address</th><th>Lifetime Val.</th><th style={{ textAlign: 'right' }}>Actions</th></tr></thead>
                <tbody>
                  {results.map((c) => (
                    <tr key={c._id}>
                      <td><strong style={{ color: 'var(--p-ink)', fontSize: 15 }}>{c.name}</strong></td>
                      <td><span style={{ fontWeight: 600, color: 'var(--p-slate)' }}>{c.phone}</span></td>
                      <td><span style={{ fontSize: 13, color: 'var(--p-ink-soft)' }}>{c.address || '—'}</span></td>
                      <td><span style={{ color: 'var(--p-primary)', fontWeight: 800, fontSize: 16 }}>{fmt(c.totalSpent)}</span></td>
                      <td style={{ textAlign: 'right' }}><button className="btn btn-secondary btn-sm" onClick={() => viewDetails(c)}>View Profile</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Stakeholder Deep Insight */}
        {selected && details && (
          <div className="fade-in">
            <div className="module-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid var(--p-fog)', paddingBottom: 16 }}>
              <h2 style={{ fontSize: 26, color: 'var(--p-ink)' }}>{selected.name}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => { setSelected(null); setDetails(null); }}>← Return to search</button>
            </div>

            {/* Profile KPI Analytics */}
            <div className="stat-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card blue">
                <span className="stat-icon">📱</span>
                <div className="stat-value" style={{ color: 'var(--p-info)', fontSize: 20 }}>{selected.phone}</div>
                <div className="stat-label">Verified Contact</div>
              </div>
              <div className="stat-card green">
                <span className="stat-icon">💰</span>
                <div className="stat-value" style={{ color: 'var(--p-success)', fontSize: 20 }}>{fmt(selected.totalSpent)}</div>
                <div className="stat-label">Customer Value</div>
              </div>
              <div className="stat-card amber">
                <span className="stat-icon">🧾</span>
                <div className="stat-value" style={{ color: 'var(--p-warning)', fontSize: 20 }}>{details.sales.length}</div>
                <div className="stat-label">Purchase Vol.</div>
              </div>
              <div className="stat-card red">
                <span className="stat-icon">↩</span>
                <div className="stat-value" style={{ color: 'var(--p-danger)', fontSize: 20 }}>{details.returns.length}</div>
                <div className="stat-label">Return History</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 32 }}>
              {/* Purchase Ledger */}
              <div className="card">
                <div className="card-title">Acquisition History</div>
                {details.sales.length === 0 ? (
                  <div style={{ padding: 40, textAlign: 'center', color: 'var(--p-slate)', fontSize: 15 }}>No acquisition history available.</div>
                ) : (
                  <div className="table-wrapper" style={{ marginTop: 24 }}>
                    <table>
                      <thead><tr><th>Timestamp</th><th>Inventory Items</th><th>Method</th><th>Discount</th><th style={{ textAlign: 'right' }}>Total Val.</th></tr></thead>
                      <tbody>
                        {details.sales.map((s) => (
                          <tr key={s._id}>
                            <td><span style={{ fontWeight: 600 }}>{fmtDate(s.saleDate)}</span></td>
                            <td style={{ fontSize: 13, color: 'var(--p-ink-soft)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {s.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                            </td>
                            <td><span className="badge badge-info">{s.paymentMode}</span></td>
                            <td><span style={{ color: 'var(--p-accent)', fontWeight: 600 }}>{fmt(s.totalDiscount)}</span></td>
                            <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--p-primary)', fontWeight: 800, fontSize: 16 }}>{fmt(s.totalAmount)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Returns Ledger */}
              {details.returns.length > 0 && (
                <div className="card" style={{ borderTop: '4px solid var(--p-danger)' }}>
                  <div className="card-title">Returns & Adjustments History</div>
                  <div className="table-wrapper" style={{ marginTop: 24 }}>
                    <table>
                      <thead><tr><th>Timestamp</th><th>Inventory Product</th><th>Qty</th><th>Reasoning</th><th style={{ textAlign: 'right' }}>Refund Val.</th></tr></thead>
                      <tbody>
                        {details.returns.map((r) => (
                          <tr key={r._id}>
                            <td><span style={{ fontWeight: 600 }}>{fmtDate(r.returnDate)}</span></td>
                            <td><strong style={{ color: 'var(--p-ink)' }}>{r.productName}</strong></td>
                            <td><span style={{ fontWeight: 700 }}>{r.quantity}</span></td>
                            <td><span style={{ fontSize: 13, color: 'var(--p-slate)', fontStyle: 'italic' }}>{r.reason || 'Not specified'}</span></td>
                            <td style={{ textAlign: 'right' }}><span style={{ color: 'var(--p-danger)', fontWeight: 800 }}>- {fmt(r.refundAmount)}</span></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
