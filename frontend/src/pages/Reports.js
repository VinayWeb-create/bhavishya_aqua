import React, { useState, useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import api from '../utils/api';
import Alert from '../components/Alert';

Chart.register(...registerables);

export default function Reports() {
  const [type, setType] = useState('daily');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const load = async (t) => {
    setLoading(true);
    try {
      const r = await api.get(`/reports?type=${t}`);
      setData(r.data);
    } catch {
      setAlert({ type: 'error', message: 'Failed to generate report.' });
    } finally { setLoading(false); }
  };

  useEffect(() => { load(type); }, [type]);

  useEffect(() => {
    if (!data || !chartRef.current) return;

    if (chartInstance.current) { chartInstance.current.destroy(); }

    const labels = Object.keys(data.salesByDate);
    const values = Object.values(data.salesByDate);

    chartInstance.current = new Chart(chartRef.current, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Revenue (₹)',
          data: values,
          backgroundColor: 'hsla(215, 95%, 45%, 0.15)',
          borderColor: 'hsl(215, 95%, 45%)',
          borderWidth: 2,
          borderRadius: 8,
          hoverBackgroundColor: 'hsla(215, 95%, 45%, 0.25)',
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            backgroundColor: 'hsl(225, 45%, 12%)',
            titleFont: { family: 'Outfit', size: 14 },
            bodyFont: { family: 'Inter', size: 13 },
            padding: 12,
            cornerRadius: 8,
            callbacks: { label: (ctx) => ` ₹ ${ctx.parsed.y.toLocaleString('en-IN')}` },
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            ticks: { 
              font: { family: 'Inter', size: 11 },
              color: 'hsl(225, 20%, 55%)',
              callback: (v) => `₹${(v / 1000).toFixed(0)}k` 
            },
            grid: { color: 'hsla(0, 0%, 0%, 0.04)', drawBorder: false },
          },
          x: { 
            ticks: { font: { family: 'Inter', size: 11 }, color: 'hsl(225, 20%, 55%)' },
            grid: { display: false } 
          },
        },
      },
    });

    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [data]);

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n || 0);
  const periods = ['daily', 'weekly', 'monthly', 'yearly'];

  return (
    <>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 40 }}>
        <div>
          <h1>Business Performance</h1>
          <p>Analyzing sales trajectory and revenue growth for the current period.</p>
        </div>
        <div style={{ display: 'flex', gap: 6, background: 'var(--p-mist)', padding: 6, borderRadius: 'var(--p-radius-sm)', border: '1px solid var(--p-fog)' }}>
          {periods.map((p) => (
            <button key={p} onClick={() => setType(p)}
              className="btn btn-sm"
              style={{
                background: type === p ? 'var(--p-primary)' : 'transparent',
                color: type === p ? 'white' : 'var(--p-slate)',
                boxShadow: type === p ? 'var(--p-shadow-sm)' : 'none',
                padding: '10px 20px',
                minWidth: 100,
                textTransform: 'uppercase',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.08em'
              }}>
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="page-body fade-in">
        {alert && <Alert type={alert.type} message={alert.message} onClose={() => setAlert(null)} />}

        {loading ? (
          <div className="loading-center" style={{ padding: 100 }}><div className="spinner" style={{ width: 40, height: 40 }} /><span>Analyzing performance...</span></div>
        ) : data && (
          <>
            {/* Summary Grid */}
            <div className="stat-grid" style={{ marginBottom: 32 }}>
              <div className="stat-card blue">
                <span className="stat-icon">💰</span>
                <div className="stat-value" style={{ color: 'var(--p-info)' }}>{fmt(data.totalSales)}</div>
                <div className="stat-label">Gross Revenue</div>
              </div>
              <div className="stat-card red">
                <span className="stat-icon">↩</span>
                <div className="stat-value" style={{ color: 'var(--p-danger)' }}>{fmt(data.totalReturns)}</div>
                <div className="stat-label">Returns Loss</div>
              </div>
              <div className="stat-card green">
                <span className="stat-icon">📈</span>
                <div className="stat-value" style={{ color: 'var(--p-success)' }}>{fmt(data.netRevenue)}</div>
                <div className="stat-label">Net Earnings</div>
              </div>
              <div className="stat-card amber">
                <span className="stat-icon">🧾</span>
                <div className="stat-value" style={{ color: 'var(--p-warning)' }}>{data.transactionCount}</div>
                <div className="stat-label">Orders Placed</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 360px', gap: 32, marginBottom: 32 }}>
              {/* Analytics Chart */}
              <div className="card">
                <div className="card-title">Revenue Trends</div>
                {Object.keys(data.salesByDate).length === 0 ? (
                  <div className="loading-center" style={{ padding: 100 }}><p style={{ color: 'var(--p-slate)' }}>No transactions recorded for this period.</p></div>
                ) : (
                  <div style={{ height: 320, marginTop: 24 }}>
                    <canvas ref={chartRef} />
                  </div>
                )}
              </div>

              {/* Top Products Benchmarking */}
              <div className="card">
                <div className="card-title">Product Efficiency</div>
                <div style={{ marginTop: 24 }}>
                  {data.topProducts.length === 0 ? (
                    <div style={{ padding: 40, textAlign: 'center', color: 'var(--p-slate)' }}>No product data found.</div>
                  ) : (
                    data.topProducts.map((p, i) => (
                      <div key={i} style={{ marginBottom: 20 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, alignItems: 'center' }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: 'var(--p-ink)' }}>{p.name}</span>
                          <span style={{ fontSize: 13, color: 'var(--p-primary)', fontWeight: 800 }}>{fmt(p.revenue)}</span>
                        </div>
                        <div style={{ height: 6, background: 'var(--p-mist)', borderRadius: 10, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%',
                            width: `${(p.revenue / data.topProducts[0].revenue) * 100}%`,
                            background: 'linear-gradient(90deg, var(--p-primary), var(--p-primary-soft))',
                            borderRadius: 10,
                            transition: 'width 1s cubic-bezier(0.23, 1, 0.32, 1)',
                          }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: 11, color: 'var(--p-slate)', fontWeight: 600 }}>
                          <span>{p.quantity} units sold</span>
                          <span>{((p.revenue / data.totalSales) * 100).toFixed(1)}% Share</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Detailed History */}
            <div className="card">
              <div className="card-title">Recent Transactions Ledger</div>
              {data.sales.length === 0 ? (
                <div style={{ padding: 40, textAlign: 'center', color: 'var(--p-slate)' }}>No transaction history.</div>
              ) : (
                <div className="table-wrapper" style={{ marginTop: 24 }}>
                  <table>
                    <thead>
                      <tr>
                        <th>Timestamp</th>
                        <th>Stakeholder</th>
                        <th>Inventory Items</th>
                        <th>Method</th>
                        <th style={{ textAlign: 'right' }}>Total Val.</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.sales.map((sale) => (
                        <tr key={sale._id}>
                          <td><span style={{ fontWeight: 600 }}>{new Date(sale.saleDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span></td>
                          <td>
                            <div style={{ fontWeight: 800, color: 'var(--p-ink)' }}>{sale.customerName}</div>
                            <div style={{ fontSize: 11, color: 'var(--p-slate)', fontWeight: 600 }}>{sale.customerPhone}</div>
                          </td>
                          <td style={{ fontSize: 13, color: 'var(--p-ink-soft)', maxWidth: 300, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sale.items.map((it) => `${it.productName} (x${it.quantity})`).join(', ')}
                          </td>
                          <td><span className="badge badge-info">{sale.paymentMode}</span></td>
                          <td style={{ textAlign: 'right' }}>
                            <span style={{ color: 'var(--p-primary)', fontWeight: 800, fontSize: 16 }}>{fmt(sale.totalAmount)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
