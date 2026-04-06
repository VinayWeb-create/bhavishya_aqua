const Sale = require('../models/Sale');
const Return = require('../models/Return');

// Helper: date range builder
const getDateRange = (type) => {
  const now = new Date();
  let start, end;

  if (type === 'daily') {
    start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
  } else if (type === 'weekly') {
    const day = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
    end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
  } else if (type === 'monthly') {
    start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  } else if (type === 'yearly') {
    start = new Date(now.getFullYear(), 0, 1, 0, 0, 0);
    end = new Date(now.getFullYear(), 11, 31, 23, 59, 59);
  }
  return { start, end };
};

// GET /api/reports?type=daily|weekly|monthly|yearly
const getReport = async (req, res) => {
  try {
    const type = req.query.type || 'daily';
    const { start, end } = getDateRange(type);

    const [sales, returns] = await Promise.all([
      Sale.find({ saleDate: { $gte: start, $lte: end } })
        .populate('items.product', 'name unit category'),
      Return.find({ returnDate: { $gte: start, $lte: end } }),
    ]);

    const totalSales = sales.reduce((sum, s) => sum + s.totalAmount, 0);
    const totalReturns = returns.reduce((sum, r) => sum + r.refundAmount, 0);
    const netRevenue = totalSales - totalReturns;

    // Group sales by day (for charts)
    const salesByDate = {};
    sales.forEach((sale) => {
      const dateKey = new Date(sale.saleDate).toLocaleDateString('en-IN');
      if (!salesByDate[dateKey]) salesByDate[dateKey] = 0;
      salesByDate[dateKey] += sale.totalAmount;
    });

    // Top products
    const productMap = {};
    sales.forEach((sale) => {
      sale.items.forEach((item) => {
        const key = item.productName;
        if (!productMap[key]) productMap[key] = { name: key, quantity: 0, revenue: 0 };
        productMap[key].quantity += item.quantity;
        productMap[key].revenue += item.subtotal;
      });
    });
    const topProducts = Object.values(productMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);

    res.json({
      type,
      period: { start, end },
      totalSales,
      totalReturns,
      netRevenue,
      transactionCount: sales.length,
      returnCount: returns.length,
      salesByDate,
      topProducts,
      sales,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to generate report', error: err.message });
  }
};

// GET /api/reports/summary - dashboard summary cards
const getSummary = async (req, res) => {
  try {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);

    const [todaySales, totalSales, allCustomers] = await Promise.all([
      Sale.find({ saleDate: { $gte: startOfDay } }),
      Sale.find(),
      require('../models/Customer').countDocuments(),
    ]);

    res.json({
      todayRevenue: todaySales.reduce((s, sale) => s + sale.totalAmount, 0),
      todayTransactions: todaySales.length,
      totalRevenue: totalSales.reduce((s, sale) => s + sale.totalAmount, 0),
      totalTransactions: totalSales.length,
      totalCustomers: allCustomers,
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch summary', error: err.message });
  }
};

module.exports = { getReport, getSummary };
