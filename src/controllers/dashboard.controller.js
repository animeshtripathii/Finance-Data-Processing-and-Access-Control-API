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