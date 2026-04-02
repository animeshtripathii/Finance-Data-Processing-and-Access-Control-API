const Record = require('../models/Record.model');


exports.getDashboardSummary = async (req, res, next) => {
  try {
    
    const summary = await Record.aggregate([
     
      { $match: { deletedAt: null } },
      
      {
        $facet: {
          overallTotals: [
            {
              $group: {
                _id: null,
                totalIncome: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'Income'] }, '$amount', 0],
                  },
                },
                totalExpenses: {
                  $sum: {
                    $cond: [{ $eq: ['$type', 'Expense'] }, '$amount', 0],
                  },
                },
              },
            },
          ],
          
          categoryBreakdown: [
            {
              $group: {
                _id: '$category',
                totalAmount: { $sum: '$amount' },
              },
            },
            { $sort: { totalAmount: -1 } }, 
          ],
        },
      },
    ]);

 
    const totals = summary[0].overallTotals[0] || { totalIncome: 0, totalExpenses: 0 };
    const netBalance = totals.totalIncome - totals.totalExpenses;

    res.status(200).json({
      success: true,
      data: {
        totals: {
          income: totals.totalIncome,
          expenses: totals.totalExpenses,
          netBalance: netBalance,
        },
        categories: summary[0].categoryBreakdown.map(cat => ({
          name: cat._id,
          amount: cat.totalAmount
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getRecentActivity = async (req, res, next) => {
  try {
    const limit = Math.max(parseInt(req.query.limit, 10) || 10, 1);

    const recentActivity = await Record.find({ deletedAt: null })
      .populate('createdBy', 'name email role')
      .sort({ date: -1, createdAt: -1 })
      .limit(limit);

    res.status(200).json({
      success: true,
      count: recentActivity.length,
      data: recentActivity,
    });
  } catch (error) {
    next(error);
  }
};

exports.getMonthlyTrends = async (req, res, next) => {
  try {
    const year = parseInt(req.query.year, 10) || new Date().getFullYear();

    const monthlyTrends = await Record.aggregate([
      {
        $match: {
          deletedAt: null,
          date: {
            $gte: new Date(`${year}-01-01T00:00:00.000Z`),
            $lte: new Date(`${year}-12-31T23:59:59.999Z`),
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: '$date' },
            type: '$type',
          },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $sort: {
          '_id.month': 1,
        },
      },
    ]);

    const monthMap = {};
    for (let m = 1; m <= 12; m += 1) {
      monthMap[m] = { month: m, income: 0, expense: 0, net: 0 };
    }

    monthlyTrends.forEach((item) => {
      const month = item._id.month;
      if (item._id.type === 'Income') {
        monthMap[month].income = item.totalAmount;
      }
      if (item._id.type === 'Expense') {
        monthMap[month].expense = item.totalAmount;
      }
      monthMap[month].net = monthMap[month].income - monthMap[month].expense;
    });

    res.status(200).json({
      success: true,
      year,
      data: Object.values(monthMap),
    });
  } catch (error) {
    next(error);
  }
};