const db = require('./src/config/database');
const axios = require('axios');

async function diagnose() {
    try {
        console.log('--- 1. DATABASE CHECK ---');
        // Check current time
        const timeRes = await db.query("SELECT NOW() as current_db_time");
        console.log('DB Time:', timeRes.rows[0].current_db_time);

        // Check buses
        const res = await db.query("SELECT id, bus_id, departure_city, arrival_city, departure_time FROM buses");
        console.log('Found buses:', res.rows.length);
        console.table(res.rows);

        console.log('\n--- 2. API SIMULATION CHECK ---');
        // Simulate what frontend sends to BAP -> BPP
        // Frontend sends GPS for BLR and BOM
        const startGps = '12.9716,77.5946'; // BLR
        const endGps = '19.0896,72.8656';   // BOM
        // const startGps = '19.0896,72.8656'; // BOM
        // const endGps = '12.9716,77.5946';   // BLR

        const testDate = new Date(); // Search for now

        const payload = {
            context: {
                transaction_id: "diag-1",
                bap_id: "diag-tool"
            },
            message: {
                intent: {
                    fulfillment: {
                        start: { location: { gps: startGps } },
                        end: { location: { gps: endGps } },
                        time: { range: { start: testDate.toISOString() } }
                    }
                }
            }
        };

        console.log('Sending search for BLR -> BOM (GPS)...');
        console.log('Start GPS:', startGps);
        console.log('End GPS:', endGps);

        try {
            const apiRes = await axios.post('http://localhost:7007/search', payload);
            console.log('API Status:', apiRes.status);
            const providers = apiRes.data.message.catalog.providers;
            console.log('Providers found:', providers.length);
            if (providers.length > 0) {
                console.log('Items found:', providers[0].items.length);
                providers[0].items.forEach(item => {
                    console.log(`- ${item.descriptor.name} (${item.time.label}): ${item.time.timestamp}`);
                });
            } else {
                console.log('No providers in response catalog.');
            }
        } catch (e) {
            console.error('API Request Failed:', e.message);
            if (e.response) console.error('Response data:', e.response.data);
        }

    } catch (err) {
        console.error('Diagnosis Error:', err);
    } finally {
        process.exit(0);
    }
}

diagnose();
