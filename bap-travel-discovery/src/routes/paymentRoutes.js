/*******************************
 * paymentRoutes.js (FINAL)
 *******************************/
const express = require("express");
const router = express.Router();
const pool = require("../db");

const asyncHandler = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res, next)).catch(next);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    console.log("POST /api/payments", req.body);

    const {
      user_id,
      booking_type,
      amount,
      currency,
      status = "SUCCESS",
      payment_id,
      booking_details,
    } = req.body || {};

    if (!user_id || !booking_type || !amount || !currency || !payment_id) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: user_id, booking_type, amount, currency, payment_id",
      });
    }

    const parsedAmount = Number(amount);
    if (Number.isNaN(parsedAmount)) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount value",
      });
    }

    const client = await pool.connect();

    try {
      await client.query("BEGIN");

      // 1️⃣ UPSERT PAYMENT
      const paymentQuery = `
        INSERT INTO payments (user_id, booking_type, amount, currency, status, payment_id)
        VALUES ($1,$2,$3,$4,$5,$6)
        ON CONFLICT (payment_id) DO UPDATE SET
          user_id = EXCLUDED.user_id,
          booking_type = EXCLUDED.booking_type,
          amount = EXCLUDED.amount,
          currency = EXCLUDED.currency,
          status = EXCLUDED.status
        RETURNING *;
      `;

      const paymentRes = await client.query(paymentQuery, [
        user_id,
        booking_type,
        parsedAmount,
        currency,
        status,
        payment_id,
      ]);

      // 2️⃣ INSERT INTO BOOKINGS TABLE
      if (booking_details) {
        const bookingInsertQuery = `
          INSERT INTO bookings
            (pnr, payment_id, user_id, booking_type, amount, currency, booking_details, raw_summary)
          VALUES
            ($1,$2,$3,$4,$5,$6,$7::jsonb,$7::jsonb)
          ON CONFLICT (pnr) DO NOTHING
          RETURNING *;
        `;

        const bd = typeof booking_details === "string"
          ? booking_details
          : JSON.stringify(booking_details);

        const bookingRes = await client.query(bookingInsertQuery, [
          payment_id, // using payment_id as PNR
          payment_id,
          user_id,
          booking_type,
          parsedAmount,
          currency,
          bd,
        ]);

        await client.query("COMMIT");

        return res.status(200).json({
          success: true,
          payment: paymentRes.rows[0],
          booking: bookingRes.rows[0] || "Already exists",
        });
      }

      await client.query("COMMIT");

      return res.status(200).json({
        success: true,
        message: "Payment saved (no booking_details provided)",
        payment: paymentRes.rows[0],
      });
    } catch (err) {
      await client.query("ROLLBACK");
      console.error("Payment route error:", err);
      return res.status(500).json({
        success: false,
        message: "Failed to save payment/booking",
        error: err.message,
      });
    } finally {
      client.release();
    }
  })
);

module.exports = router;
