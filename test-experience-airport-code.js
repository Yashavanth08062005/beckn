const axios = require('axios');

async function testExperienceAirportCodeSearch() {
    try {
        console.log('Testing experience search with Airport Code "BOM"...');

        const searchPayload = {
            context: {
                domain: "travel",
                country: "IND",
                city: "std:080",
                action: "search",
                version: "1.0.0",
                bap_id: "test.bap.com",
                bap_uri: "https://test.bap.com/beckn",
                transaction_id: "test-exp-txn-bom",
                message_id: "test-exp-msg-bom",
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
                                // Sending "BOM" as city name to simulate airport code search
                                city: {
                                    name: "BOM"
                                }
                            }
                        }
                    }
                }
            }
        };

        // Note: We are hitting the BAP, assuming it forwards to BPP.
        // If BAP is just an open proxy, this works.
        // Or we can hit BPP directly if we know the port (7010).
        // Let's hit BPP directly to isolate the test to the BPP logic change.
        // BPP Port from app.js is 7010.

        const bppUrl = 'http://localhost:7010/search';
        console.log(`Sending request to BPP directly at ${bppUrl}...`);

        const response = await axios.post(bppUrl, searchPayload, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Experience search successful!');
        console.log('Status:', response.status);

        const catalog = response.data.message.catalog;
        const providers = catalog?.providers || [];

        console.log(`Found ${providers.length} experience providers.`);

        // We expect items to be found for Mumbai because BOM -> Mumbai
        if (providers.length > 0 && providers[0].items.length > 0) {
            const firstItem = providers[0].items[0];
            const locationCity = firstItem.tags.find(t => t.code === 'LOCATION')?.list.find(l => l.code === 'CITY')?.value;

            console.log(`First Item: ${firstItem.descriptor.name}`);
            console.log(`Location City: ${locationCity}`);

            if (locationCity === 'Mumbai') {
                console.log('🎉 SUCCESS: BOM mapped to Mumbai correctly!');
            } else {
                console.log('⚠️  WARNING: Items found but city might not be Mumbai match:', locationCity);
            }

        } else {
            console.error('❌ FAILURE: No items found for BOM search.');
        }

    } catch (error) {
        console.error('❌ Experience search failed:', error.response?.data || error.message);
    }
}

testExperienceAirportCodeSearch();
