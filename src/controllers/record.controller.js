const Record = require('../models/Record.model');
const createRecord = async (req, res, next) => {
  try {
    const recordData = {
      ...req.body,
      createdBy: req.user._id, 
    };

    const record = await Record.create(recordData);

    res.status(201).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};
const getRecords = async (req, res, next) => {
  try {
    const { type, category, page = 1, limit = 10 } = req.query;
    const query = { deletedAt: null };
    if (type) query.type = type;
    if (category) query.category = category;
    const startIndex = (page - 1) * limit;

    const records = await Record.find(query)
      .populate('createdBy', 'name email')
      .sort({ date: -1 }) // Sort by newest first
      .skip(startIndex)
      .limit(parseInt(limit));

    const total = await Record.countDocuments(query);

    res.status(200).json({
      success: true,
      count: records.length,
      pagination: {
        totalRecords: total,
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
      },
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

const updateRecord = async (req, res, next) => {
  try {
    let record = await Record.findById(req.params.id);
    if (!record || record.deletedAt !== null) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    record = await Record.findByIdAndUpdate(req.params.id, req.body, {
      new: true, 
      runValidators: true, 
    });

    res.status(200).json({ success: true, data: record });
  } catch (error) {
    next(error);
  }
};


const deleteRecord = async (req, res, next) => {
  try {
    const record = await Record.findById(req.params.id);

    if (!record || record.deletedAt !== null) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }

    // SOFT DELETE: We do NOT use Record.findByIdAndDelete(). Instead, we set the deletedAt field to the current date.
    record.deletedAt = new Date();
    await record.save();

    res.status(200).json({ 
      success: true, 
      message: 'Record successfully deleted' 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { createRecord, getRecords, updateRecord, deleteRecord };