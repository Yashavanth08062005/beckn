// src/controllers/paymentController.js
const pool = require('../db');
const crypto = require('crypto');

exports.createPayment = async (req, res, next) => {
  try {
    let {
      userId,
      bookingType,
      amount,
      currency,
      status,
      paymentId,
    } = req.body;

    // Fallbacks
    if (!paymentId) {
      paymentId = `manual_${crypto.randomBytes(8).toString('hex')}`;
    }

    if (!currency) currency = 'INR';
    if (!status) status = 'SUCCESS';

    if (!userId || !bookingType || !amount) {
      return res.status(400).json({
        success: false,
        message: 'userId, bookingType aur amount required hai',
      });
    }

    const query = `
      INSERT INTO payments (user_id, booking_type, amount, currency, status, payment_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *;
    `;

    const values = [userId, bookingType, amount, currency, status, paymentId];

    const result = await pool.query(query, values);

    return res.status(201).json({
      success: true,
      payment: result.rows[0],
    });
  } catch (err) {
    console.error('Error saving payment:', err);
    next(err); // errorHandler middleware handle karega
  }
};
