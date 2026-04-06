import React, { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import Alert from '../components/Alert';

const emptyItem = () => ({ productId: '', rate: '', quantity: 1, discount: 0, subtotal: 0 });

export default function Sale() {
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [items, setItems] = useState([emptyItem()]);
  const [products, setProducts] = useState([]);
  const [paymentMode, setPaymentMode] = useState('cash');
  const [notes, setNotes] = useState('');
  const [alert, setAlert] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    api.get('/products').then((r) => setProducts(r.data)).catch(console.error);
  }, []);

  // Customer autocomplete
  const searchCustomers = useCallback(async (q) => {
    if (q.length < 2) { setSearchResults([]); return; }
    try {
      const r = await api.get(`/customers/search?q=${q}`);
      setSearchResults(r.data);
      setShowDropdown(true);
    } catch { setSearchResults([]); }
  }, []);

  const handleCustomerInput = (e) => {
    const val = e.target.value;
    setCustomer((c) => ({ ...c, [e.target.name]: val }));
    if (e.target.name === 'name') searchCustomers(val);
    if (e.target.name === 'phone') searchCustomers(val);
  };

  const selectCustomer = (c) => {
    setCustomer({ name: c.name, phone: c.phone, address: c.address || '' });
    setSearchResults([]);
    setShowDropdown(false);
  };

  // Item handlers
  const updateItem = (index, field, value) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      // Auto-fill rate when product selected
      if (field === 'productId') {
        const product = products.find((p) => p._id === value);
        if (product) updated[index].rate = product.rate;
      }
      // Recalculate subtotal
      const it = updated[index];
      const rate = parseFloat(it.rate) || 0;
      const qty = parseFloat(it.quantity) || 0;
      const disc = parseFloat(it.discount) || 0;
      updated[index].subtotal = Math.max(0, rate * qty - disc);
      return updated;
    });
  };

  const addItem = () => setItems((prev) => [...prev, emptyItem()]);
  const removeItem = (i) => setItems((prev) => prev.filter((_, idx) => idx !== i));

  const totalAmount = items.reduce((s, it) => s + (parseFloat(it.subtotal) || 0), 0);
  const totalDiscount = items.reduce((s, it) => s + (parseFloat(it.discount) || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!customer.name || !customer.phone) { setAlert({ type: 'error', message: 'Customer name and phone are required.' }); return; }
    if (items.some((it) => !it.productId || !it.quantity)) { setAlert({ type: 'error', message: 'All items must have a product and quantity.' }); return; }

    setLoading(true);
    try {
      await api.post('/sales', {
        customerName: customer.name,
        customerPhone: customer.phone,
        customerAddress: customer.address,
        items: items.map((it) => ({
          productId: it.productId,
          rate: parseFloat(it.rate),
          quantity: parseFloat(it.quantity),
          discount: parseFloat(it.discount) || 0,
        })),
        paymentMode,
        notes,
      });
      setAlert({ type: 'success', message: `Sale recorded successfully! Total: ₹${totalAmount.toFixed(2)}` });
      setCustomer({ name: '', phone: '', address: '' });
      setItems([emptyItem()]);
      setNotes('');
      // Refresh products for updated stock
      api.get('/products').then((r) => setProducts(r.data));
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to record sale.' });
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => `₹${(n || 0).toFixed(2)}`;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>New Sale</h1>
          <p>Record a customer sale and auto-update stock.</p>
        </div>
        <div style={{ fontSize: 13, color: 'var(--slate)' }}>{new Date().toLocaleString('en-IN')}</div>
      </div>

      <div className="page-body fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        <form onSubmit={handleSubmit}>
          {/* Customer Section */}
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-title">Customer Details</div>
            <div className="form-row">
              <div className="form-group" style={{ position: 'relative' }}>
                <label className="form-label">Customer Name *</label>
                <input className="form-control" name="name" value={customer.name} onChange={handleCustomerInput} placeholder="Enter or search name" autoComplete="off" />
                {showDropdown && searchResults.length > 0 && (
                      <div className="autocomplete-dropdown">
                        {searchResults.map((c) => (
                          <div key={c._id} onClick={() => selectCustomer(c)} className="autocomplete-item">
                            <strong>{c.name}</strong> — {c.phone}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Phone Number *</label>
                    <input className="form-control" name="phone" value={customer.phone} onChange={handleCustomerInput} placeholder="10-digit mobile number" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <input className="form-control" name="address" value={customer.address} onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))} placeholder="Optional address" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Payment Mode</label>
                    <select className="form-control" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                      <option value="cash">Cash</option>
                      <option value="upi">UPI</option>
                      <option value="credit">Credit</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="card-title" style={{ justifyContent: 'space-between' }}>
                  <span>Items</span>
                  <button type="button" className="btn btn-secondary btn-sm" onClick={addItem}>+ Add Item</button>
                </div>

                {/* Header */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 40px', gap: 12, padding: '0 12px', marginBottom: 12 }}>
                  {['Product', 'Rate (₹)', 'Qty', 'Discount (₹)', 'Subtotal', ''].map((h) => (
                    <div key={h} style={{ fontSize: 11, fontWeight: 700, color: 'var(--p-slate)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{h}</div>
                  ))}
                </div>

                {items.map((item, i) => {
                  const product = products.find((p) => p._id === item.productId);
                  return (
                    <div key={i} className="item-row">
                      <div>
                        <select className="form-control" value={item.productId} onChange={(e) => updateItem(i, 'productId', e.target.value)}>
                          <option value="">Select product...</option>
                          {products.map((p) => (
                            <option key={p._id} value={p._id} disabled={p.stock === 0}>
                              {p.name} (Stock: {p.stock} {p.unit})
                            </option>
                          ))}
                        </select>
                        {product && <span style={{ fontSize: 11, color: 'var(--p-slate)', marginTop: 8, display: 'block', fontWeight: 600 }}>Available: {product.stock} {product.unit}</span>}
                      </div>
                      <input className="form-control" type="number" min="0" step="0.01" value={item.rate} onChange={(e) => updateItem(i, 'rate', e.target.value)} placeholder="Rate" />
                      <input className="form-control" type="number" min="1" step="0.01" value={item.quantity} onChange={(e) => updateItem(i, 'quantity', e.target.value)} placeholder="Qty" />
                      <input className="form-control" type="number" min="0" step="0.01" value={item.discount} onChange={(e) => updateItem(i, 'discount', e.target.value)} placeholder="0" />
                      <div style={{ padding: '10px 0', fontFamily: 'var(--p-font-display)', fontWeight: 800, color: 'var(--p-primary)', fontSize: 16 }}>{fmt(item.subtotal)}</div>
                      <button type="button" onClick={() => removeItem(i)} disabled={items.length === 1}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--p-danger)', fontSize: 18, lineHeight: 1, padding: 8, transition: 'transform 0.2s' }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}>✕</button>
                    </div>
                  );
                })}

                {/* Totals */}
                <div style={{ marginTop: 24, padding: '24px', background: 'var(--p-mist)', borderRadius: 'var(--p-radius-sm)', borderTop: '2px solid var(--p-fog)' }}>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 48 }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--p-slate)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL DISCOUNT</div>
                      <div style={{ fontFamily: 'var(--p-font-display)', fontWeight: 700, color: 'var(--p-accent)', fontSize: 20 }}>{fmt(totalDiscount)}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, color: 'var(--p-slate)', marginBottom: 6, fontWeight: 700, letterSpacing: '0.05em' }}>TOTAL AMOUNT</div>
                      <div style={{ fontFamily: 'var(--p-font-display)', fontWeight: 800, color: 'var(--p-primary)', fontSize: 32 }}>{fmt(totalAmount)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="card" style={{ marginBottom: 24 }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label className="form-label">Notes (optional)</label>
                  <textarea className="form-control" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Any remarks..." rows={2} />
                </div>
              </div>

              <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary btn-lg" onClick={() => { setCustomer({ name: '', phone: '', address: '' }); setItems([emptyItem()]); }}>
                  Clear
                </button>
                <button type="submit" className="btn btn-primary btn-lg" disabled={loading} style={{ minWidth: 260 }}>
                  {loading ? <><span className="spinner" style={{ width: 18, height: 18, marginRight: 10 }} /> Processing...</> : `Confirm Sale — ${fmt(totalAmount)}`}
                </button>
              </div>
        </form>
      </div>
    </>
  );
}
