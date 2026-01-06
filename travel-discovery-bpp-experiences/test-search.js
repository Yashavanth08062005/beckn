const axios = require('axios');

async function testSearch() {
    try {
        console.log('Testing experience search...');
        
        const searchPayload = {
            context: {
                domain: "travel",
                country: "IND",
                city: "std:080",
                action: "search",
                version: "1.0.0",
                bap_id: "test.bap.com",
                bap_uri: "https://test.bap.com/beckn",
                transaction_id: "test-txn-123",
                message_id: "test-msg-123",
                timestamp: new Date().toISOString(),
                ttl: "PT30S"
            },
            message: {
                intent: {
                    fulfillment: {
                        start: {
                            location: {
                                address: {
                                    city: "Mumbai"
                                }
                            }
                        }
                    }
                }
            }
        };

        const response = await axios.post('http://localhost:7010/search', searchPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Search successful!');
        console.log('Status:', response.status);
        console.log('Response context:', response.data.context);
        
        const catalog = response.data.message.catalog;
        const experiences = catalog?.bpp?.providers?.[0]?.items || [];
        
        console.log(`Found ${experiences.length} experiences:`);
        experiences.slice(0, 3).forEach((exp, index) => {
            console.log(`${index + 1}. ${exp.descriptor.name} - ₹${exp.price.value}`);
        });

    } catch (error) {
        console.error('❌ Search failed:', error.response?.data || error.message);
    }
}

testSearch();