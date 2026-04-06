import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import Alert from '../components/Alert';

const emptyProduct = { name: '', category: '', unit: 'kg', rate: '', stock: '', description: '' };

export default function Stock() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddStock, setShowAddStock] = useState(null); // product id
  const [addQty, setAddQty] = useState('');
  const [newProduct, setNewProduct] = useState(emptyProduct);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => {
    setLoading(true);
    api.get('/products')
      .then((r) => setProducts(r.data))
      .catch(() => setAlert({ type: 'error', message: 'Failed to load products.' }))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const handleAddProduct = async (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.rate) { setAlert({ type: 'error', message: 'Name and rate are required.' }); return; }
    setSaving(true);
    try {
      await api.post('/products', { ...newProduct, rate: Number(newProduct.rate), stock: Number(newProduct.stock) || 0 });
      setAlert({ type: 'success', message: `Product "${newProduct.name}" added successfully.` });
      setNewProduct(emptyProduct);
      setShowAddForm(false);
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to add product.' });
    } finally { setSaving(false); }
  };

  const handleAddStock = async (productId) => {
    if (!addQty || Number(addQty) <= 0) { setAlert({ type: 'error', message: 'Enter a valid quantity.' }); return; }
    try {
      await api.patch(`/products/${productId}/stock`, { quantity: Number(addQty) });
      setAlert({ type: 'success', message: 'Stock updated successfully.' });
      setShowAddStock(null); setAddQty('');
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Failed to update stock.' });
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/products/${id}`);
      setAlert({ type: 'success', message: `"${name}" deleted.` });
      load();
    } catch (err) {
      setAlert({ type: 'error', message: err.response?.data?.message || 'Delete failed.' });
    }
  };

  const filtered = products.filter((p) => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  const stockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', cls: 'badge-danger' };
    if (stock < 10) return { label: 'Low Stock', cls: 'badge-warning' };
    return { label: 'In Stock', cls: 'badge-success' };
  };

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1>Inventory & Stock</h1>
          <p>Manage products and real-time inventory levels.</p>
        </div>
        <button className="btn btn-primary btn-lg" onClick={() => setShowAddForm((v) => !v)}>
          {showAddForm ? 'Cancel' : '+ Add New Product'}
        </button>
      </div>

      <div className="page-body fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="card" style={{ marginBottom: 32, borderTop: '4px solid var(--p-primary)' }}>
            <div className="card-title">Add New Product to Catalog</div>
            <form onSubmit={handleAddProduct}>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-control" value={newProduct.name} onChange={(e) => setNewProduct((p) => ({ ...p, name: e.target.value }))} placeholder="e.g. Premium Fish Feed" />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-control" value={newProduct.category} onChange={(e) => setNewProduct((p) => ({ ...p, category: e.target.value }))} placeholder="e.g. Fish Food" />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit of Measure</label>
                  <select className="form-control" value={newProduct.unit} onChange={(e) => setNewProduct((p) => ({ ...p, unit: e.target.value }))}>
                    {['kg', 'g', 'bag', 'litre', 'ml', 'piece', 'box', 'packet'].map((u) => <option key={u}>{u}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Selling Rate (₹) *</label>
                  <input className="form-control" type="number" min="0" step="0.01" value={newProduct.rate} onChange={(e) => setNewProduct((p) => ({ ...p, rate: e.target.value }))} placeholder="0.00" />
                </div>
                <div className="form-group">
                  <label className="form-label">Opening Stock</label>
                  <input className="form-control" type="number" min="0" value={newProduct.stock} onChange={(e) => setNewProduct((p) => ({ ...p, stock: e.target.value }))} placeholder="0" />
                </div>
                <div className="form-group">
                  <label className="form-label">Product SKU / Details</label>
                  <input className="form-control" value={newProduct.description} onChange={(e) => setNewProduct((p) => ({ ...p, description: e.target.value }))} placeholder="Optional notes..." />
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 16, marginTop: 16 }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving} style={{ minWidth: 160 }}>
                  {saving ? <><span className="spinner" style={{ width: 16, height: 16 }} /> Saving...</> : 'Save Product'}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Inventory List */}
        <div className="card">
          <div style={{ marginBottom: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: 400 }}>
              <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>⌕</span>
              <input className="form-control" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Filter by name or category..." style={{ paddingLeft: 40 }} />
            </div>
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--p-slate)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {filtered.length} AVAILABLE PRODUCTS
            </div>
          </div>

          {loading ? (
            <div className="loading-center" style={{ padding: 60 }}><div className="spinner" style={{ width: 40, height: 40 }} /><span>Fetching inventory...</span></div>
          ) : (
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product & Details</th><th>Category</th><th>Unit</th><th>Selling Rate</th><th>Current Stock</th><th>Status</th><th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => {
                    const status = stockStatus(p.stock);
                    return (
                      <tr key={p._id}>
                        <td>
                          <div style={{ fontWeight: 800, color: 'var(--p-ink)', fontSize: 15 }}>{p.name}</div>
                          {p.description && <div style={{ fontSize: 11, color: 'var(--p-slate)', marginTop: 4 }}>{p.description}</div>}
                        </td>
                        <td><span style={{ fontSize: 12, fontWeight: 600, color: 'var(--p-slate)', textTransform: 'uppercase' }}>{p.category || 'N/A'}</span></td>
                        <td><span className="badge badge-info">{p.unit}</span></td>
                        <td><span style={{ fontWeight: 800, color: 'var(--p-primary)', fontSize: 16 }}>₹{p.rate.toFixed(2)}</span></td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <span style={{ fontFamily: 'var(--p-font-display)', fontWeight: 800, fontSize: 20, color: 'var(--p-ink)' }}>{p.stock}</span>
                            {showAddStock === p._id && (
                              <div className="fade-in" style={{ display: 'flex', gap: 8, background: 'var(--p-white)', padding: 8, borderRadius: 'var(--p-radius-sm)', border: '1px solid var(--p-primary-soft)', boxShadow: 'var(--p-shadow-md)', zIndex: 10 }}>
                                <input type="number" min="1" value={addQty} onChange={(e) => setAddQty(e.target.value)}
                                  placeholder="Qty" className="form-control" style={{ width: 80, padding: 8, fontSize: 13 }} />
                                <button className="btn btn-primary btn-sm" onClick={() => handleAddStock(p._id)}>ADD</button>
                                <button className="btn btn-ghost btn-sm" onClick={() => { setShowAddStock(null); setAddQty(''); }}>✕</button>
                              </div>
                            )}
                          </div>
                        </td>
                        <td><span className={`badge ${status.cls}`}>{status.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => { setShowAddStock(p._id); setAddQty(''); }} title="Update Stock">
                              + Stock
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ color: 'var(--p-danger)', border: '1px solid transparent' }} 
                              onClick={() => handleDelete(p._id, p.name)}
                              onMouseOver={(e) => e.currentTarget.style.borderColor = 'var(--p-danger)'}
                              onMouseOut={(e) => e.currentTarget.style.borderColor = 'transparent'}>
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan="7" style={{ textAlign: 'center', padding: 80, color: 'var(--p-slate)', fontSize: 15, fontWeight: 500 }}>No products found in the catalog.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
