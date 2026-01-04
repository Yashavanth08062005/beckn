const { Pool } = require('pg');
const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
    database: process.env.DB_NAME || 'travel_discovery',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '2005',
});

(async () => {
    try {
        const query = `
            INSERT INTO bookings (
                booking_reference, user_id, booking_type, item_id, provider_id,
                item_name, item_code, origin, destination, departure_time, arrival_time,
                check_in_date, check_out_date, passenger_name, passenger_email, passenger_phone,
                passenger_gender, date_of_birth, nationality, passport_number,
                address_line1, address_line2, city, state, postal_code, country,
                transaction_id, payment_method, payment_status, amount, currency,
                booking_status, beckn_transaction_id, beckn_message_id, order_id,
                item_details, booking_metadata
            ) VALUES (
                $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15,
                $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28,
                $29, $30, $31, $32, $33, $34, $35, $36, $37
            )
            RETURNING *
        `;

        const values = [
            'TEST_REF_' + Date.now(),
            1, // user_id
            'train', // booking_type
            'train-test-id', // item_id
            'test-provider', // provider_id
            'Test Train', // item_name
            '12345', // item_code
            'Bangalore', // origin
            'Delhi', // destination
            new Date().toISOString(), // departure_time
            new Date().toISOString(), // arrival_time
            null, null, // dates
            'Test User', // passenger_name
            'test@example.com',
            '9999999999',
            'Male', // gender
            null, // dob
            'IN', // nationality
            null, // passport
            'Address 1', 'Address 2', 'City', 'State', '560000', 'India',
            'TXN_TEST', 'CARD', 'CONFIRMED', 100, 'INR',
            'CONFIRMED', 'BECKN_TXN', 'BECKN_MSG', 'ORDER_ID',
            JSON.stringify({ foo: 'bar' }), JSON.stringify({ meta: 'data' })
        ];

        console.log('Attempting INSERT...');
        const result = await pool.query(query, values);
        console.log('INSERT SUCCESS:', result.rows[0].id);

    } catch (err) {
        console.error('INSERT FAILED:', err);
    } finally {
        await pool.end();
    }
})();
