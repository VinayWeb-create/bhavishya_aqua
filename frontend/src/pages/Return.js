import React, { useState } from 'react';
import api from '../utils/api';
import Alert from '../components/Alert';

export default function Return() {
  const [query, setQuery] = useState('');
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [sales, setSales] = useState([]);
  const [selectedSale, setSelectedSale] = useState(null);
  const [returnItem, setReturnItem] = useState({ productId: '', quantity: 1, reason: '' });
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const searchCustomer = async () => {
    if (!query.trim()) return;
    setSearching(true);
    try {
      const r = await api.get(`/customers/search?q=${query}`);
      setCustomers(r.data);
      setSelectedCustomer(null); setSales([]); setSelectedSale(null);
    } catch { setAlert({ type: 'error', message: 'Search failed.' }); }
    finally { setSearching(false); }
  };

  const selectCustomer = async (c) => {
    setSelectedCustomer(c);
    try {
      const r = await api.get(`/sales/customer/${c._id}`);
      setSales(r.data);
    } catch { setAlert({ type: 'error', message: 'Failed to load sales.' }); }
  };

  const handleReturn = async (e) => {
    e.preventDefault();
    if (!selectedSale || !returnItem.productId || !returnItem.quantity) {
      setAlert({ type: 'error', message: 'Please fill all fields.' }); return;
    }
    setLoading(true);
    try {
      const r = await api.post('/returns', {
        saleId: selectedSale._id,
        productId: returnItem.productId,
        quantity: Number(returnItem.quantity),
        reason: returnItem.reason,
      });
      setAlert({ type: 'success', message: `Return processed. Refund: ₹${r.data.refundAmount.toFixed(2)}` });
      setReturnItem({ productId: '', quantity: 1, reason: '' });
      setSelectedSale(null);
      // Refresh sales
      const updated = await api.get(`/sales/customer/${selectedCustomer._id}`);
      setSales(updated.data);
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Return failed.' });
    } finally { setLoading(false); }
  };

  const fmt = (n) => `₹${(n || 0).toFixed(2)}`;
  const fmtDate = (d) => new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <>
      <div className="page-header">
        <div><h1>Return</h1><p>Process product returns and restore stock.</p></div>
      </div>
      <div className="page-body fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Step 1: Search Customer */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-title">Step 1 — Find Customer</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <input className="form-control" value={query} onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && searchCustomer()}
              placeholder="Search by name or phone number..." style={{ flex: 1 }} />
            <button className="btn btn-primary" onClick={searchCustomer} disabled={searching} style={{ minWidth: 120 }}>
              {searching ? <span className="spinner" style={{ width: 18, height: 18 }} /> : 'Search'}
            </button>
          </div>

          {customers.length > 0 && !selectedCustomer && (
            <div style={{ marginTop: 16 }}>
              {customers.map((c) => (
                <div key={c._id} onClick={() => selectCustomer(c)}
                  style={{ padding: '16px 20px', background: 'var(--p-mist)', borderRadius: 'var(--p-radius-sm)', marginBottom: 8, cursor: 'pointer', border: '1px solid var(--p-fog)', transition: 'all var(--p-transition)' }}
                  onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--p-primary)'}
                  onMouseOut={(e) => e.currentTarget.style.borderColor = 'var(--p-fog)'}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--p-ink)' }}>{c.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--p-slate)' }}>{c.phone}</div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--p-primary)' }}>Spent: {fmt(c.totalSpent)}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {selectedCustomer && (
            <div style={{ marginTop: 16, padding: '16px 20px', background: 'hsla(215, 95%, 45%, 0.1)', borderRadius: 'var(--p-radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid var(--p-primary-soft)' }}>
              <div>
                <strong style={{ color: 'var(--p-primary)', fontSize: 18 }}>{selectedCustomer.name}</strong>
                <span style={{ marginLeft: 16, fontSize: 14, color: 'var(--p-slate)', fontWeight: 500 }}>{selectedCustomer.phone}</span>
              </div>
              <button className="btn btn-secondary btn-sm" onClick={() => { setSelectedCustomer(null); setSales([]); setSelectedSale(null); setCustomers([]); }}>
                Change Customer
              </button>
            </div>
          )}
        </div>

        {/* Step 2: Select Sale */}
        {selectedCustomer && sales.length > 0 && (
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-title">Step 2 — Select Purchase to Return</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
              {sales.map((sale) => (
                <div key={sale._id} onClick={() => { setSelectedSale(sale); setReturnItem({ productId: '', quantity: 1, reason: '' }); }}
                  style={{
                    padding: '20px', background: selectedSale?._id === sale._id ? 'hsla(215, 95%, 45%, 0.05)' : 'var(--p-white)',
                    borderRadius: 'var(--p-radius-sm)', cursor: 'pointer',
                    border: `1.5px solid ${selectedSale?._id === sale._id ? 'var(--p-primary)' : 'var(--p-fog)'}`,
                    transition: 'all var(--p-transition)',
                    boxShadow: selectedSale?._id === sale._id ? 'var(--p-shadow-md)' : 'none'
                  }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--p-slate)', textTransform: 'uppercase' }}>{fmtDate(sale.saleDate)}</span>
                    <strong style={{ color: 'var(--p-primary)', fontSize: 18 }}>{fmt(sale.totalAmount)}</strong>
                  </div>
                  <div style={{ borderTop: '1px solid var(--p-mist)', paddingTop: 12 }}>
                    {sale.items.map((it, i) => (
                      <div key={i} style={{ fontSize: 13, color: 'var(--p-ink-soft)', marginBottom: 4, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{it.productName} × {it.quantity}</span>
                        <span style={{ fontWeight: 600 }}>{fmt(it.rate)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Return Form */}
        {selectedSale && (
          <div className="card">
            <div className="card-title">Step 3 — Return Details</div>
            <form onSubmit={handleReturn}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product to Return *</label>
                  <select className="form-control" value={returnItem.productId} onChange={(e) => setReturnItem((r) => ({ ...r, productId: e.target.value }))}>
                    <option value="">Select product...</option>
                    {selectedSale.items.map((it) => (
                      <option key={it.product} value={it.product}>{it.productName} (Purchased: {it.quantity})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Return Quantity *</label>
                  <input className="form-control" type="number" min="1" value={returnItem.quantity}
                    onChange={(e) => setReturnItem((r) => ({ ...r, quantity: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Reason</label>
                  <input className="form-control" value={returnItem.reason} onChange={(e) => setReturnItem((r) => ({ ...r, reason: e.target.value }))} placeholder="Optional reason..." />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 16 }}>
                <button type="submit" className="btn btn-danger btn-lg" disabled={loading} style={{ minWidth: 200 }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18 }} /> Processing...</> : 'Confirm Return'}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
