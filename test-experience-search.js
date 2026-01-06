const axios = require('axios');

async function testExperienceSearch() {
    try {
        console.log('Testing experience search through BAP...');
        
        const searchPayload = {
            context: {
                domain: "travel",
                country: "IND",
                city: "std:080",
                action: "search",
                version: "1.0.0",
                bap_id: "test.bap.com",
                bap_uri: "https://test.bap.com/beckn",
                transaction_id: "test-exp-txn-123",
                message_id: "test-exp-msg-123",
                timestamp: new Date().toISOString(),
                ttl: "PT30S"
            },
            message: {
                intent: {
                    category: {
                        id: "EXPERIENCE"
                    },
                    fulfillment: {
                        start: {
                            location: {
                                city: {
                                    name: "Mumbai"
                                },
                                gps: "18.9220,72.8332"
                            }
                        }
                    }
                }
            }
        };

        const response = await axios.post('http://localhost:8081/beckn/search', searchPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Experience search successful!');
        console.log('Status:', response.status);
        console.log('Response context:', response.data.context);
        
        const catalog = response.data.message.catalog;
        const providers = catalog?.providers || [];
        
        console.log(`Found ${providers.length} experience providers:`);
        
        providers.forEach((provider, providerIndex) => {
            console.log(`\nProvider ${providerIndex + 1}: ${provider.descriptor?.name}`);
            const items = provider.items || [];
            console.log(`  Items: ${items.length}`);
            
            items.slice(0, 3).forEach((item, itemIndex) => {
                console.log(`  ${itemIndex + 1}. ${item.descriptor?.name} - ₹${item.price?.value}`);
                console.log(`     Category: ${item.category_id}`);
                console.log(`     Duration: ${item.time?.duration || 'N/A'}`);
            });
        });

    } catch (error) {
        console.error('❌ Experience search failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('Status:', error.response.status);
        }
    }
}

testExperienceSearch();