const axios = require('axios');

const API_BASE_URL = 'http://localhost:8081';

async function testBookingsAPI() {
    try {
        console.log('🧪 Testing Bookings API for pratham@gmail.com...\n');

        // Test the exact API call that the frontend makes
        const endpoint = `/api/bookings/email/pratham@gmail.com`;
        console.log('📡 API Call:', `${API_BASE_URL}${endpoint}`);

        const response = await axios.get(`${API_BASE_URL}${endpoint}`);
        const bookings = response.data.bookings || [];

        console.log('✅ API Response received');
        console.log('📊 Status:', response.status);
        console.log('📋 Bookings count:', bookings.length);

        if (bookings.length > 0) {
            console.log('\n📝 Bookings found:');
            bookings.forEach((booking, index) => {
                console.log(`${index + 1}. ${booking.item_name} - ${booking.booking_reference}`);
                console.log(`   Email: ${booking.passenger_email}`);
                console.log(`   Status: ${booking.booking_status}`);
                console.log(`   Amount: ₹${booking.amount}`);
                console.log(`   Created: ${new Date(booking.created_at).toLocaleString()}`);
                console.log('');
            });

            console.log('🎯 This is what should appear in "Your Bookings" page');
        } else {
            console.log('❌ No bookings found - this is why "Your Bookings" is empty');
        }

        // Test the fallback emails too
        console.log('\n🔍 Testing fallback emails...');
        const fallbackEmails = ['pratham@example.com', 'test@example.com'];
        
        for (const email of fallbackEmails) {
            try {
                const fallbackResponse = await axios.get(`${API_BASE_URL}/api/bookings/email/${email}`);
                const fallbackBookings = fallbackResponse.data.bookings || [];
                console.log(`📧 ${email}: ${fallbackBookings.length} bookings`);
            } catch (error) {
                console.log(`📧 ${email}: Error or no bookings`);
            }
        }

    } catch (error) {
        console.error('❌ API Error:', error.response?.data || error.message);
        console.log('This error would cause "Your Bookings" to show empty');
    }
}

testBookingsAPI().catch(console.error);