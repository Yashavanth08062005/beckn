// routes/bookingsRoutes.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * POST /api/bookings
 * Body: (example)
 * {
 *   pnr: "TRVABC123",
 *   payment_id: "TRVABC123",
 *   user_id: "1",
 *   booking_type: "flight",
 *   // passenger/contact fields from form
 *   passenger: { name, age, gender },
 *   contact: { mobile, email, state },
 *   // flight/hotel specific
 *   flight: { route, date, time, duration, airline, flightNumber, baggageCabin, baggageChecked, seatNumber },
 *   hotel: { hotelName, location, checkIn, checkOut, nights, rooms, guests },
 *   amount: 5500,
 *   currency: "INR",
 *   raw_summary: {...} // optional
 * }
 */
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/bookings body:', req.body);

    const {
      pnr,
      payment_id,
      user_id,
      booking_type,
      passenger,
      contact,
      flight,
      hotel,
      amount,
      currency = 'INR',
      raw_summary,
      booking_details // optional if frontend sends full object already
    } = req.body || {};

    // minimal validation
    if (!pnr || !booking_type || amount === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: pnr, booking_type, amount'
      });
    }

    // If frontend already provided booking_details object, prefer it.
    // Otherwise build booking_details from provided fields.
    const bookingDetails = booking_details && typeof booking_details === 'object'
      ? booking_details
      : {
          pnr,
          payment_id: payment_id || pnr,
          passenger: passenger || {},
          contact: contact || {},
          flight: flight || null,
          hotel: hotel || null,
          meta: {
            createdFrom: 'frontend-form',
            createdAt: new Date().toISOString()
          }
        };

    const rawJson = raw_summary ? JSON.stringify(raw_summary) : JSON.stringify({});
    const detailsJson = JSON.stringify(bookingDetails);

    const query = `
      INSERT INTO bookings
        (pnr, payment_id, user_id, booking_type, name, email, amount, currency, raw_summary, booking_details)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9::jsonb, $10::jsonb)
      ON CONFLICT (pnr) DO NOTHING
      RETURNING *;
    `;

    // fill name/email from passenger/contact where available for quick columns
    const name = (passenger && passenger.name) || null;
    const email = (contact && contact.email) || null;

    const values = [
      pnr,
      payment_id || pnr,
      user_id || 'guest',
      booking_type,
      name,
      email,
      amount,
      currency,
      rawJson,
      detailsJson
    ];

    const result = await pool.query(query, values);
    console.log('bookings insert result:', result.rowCount);

    if (!result.rows || result.rows.length === 0) {
      // duplicate PNR -> no insert
      return res.status(200).json({
        success: true,
        message: 'Booking already exists (duplicate pnr)'
      });
    }

    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    console.error('Error in /api/bookings:', err);
    return res.status(500).json({
      success: false,
      message: 'DB error',
      error: err.message
    });
  }
});

module.exports = router;
