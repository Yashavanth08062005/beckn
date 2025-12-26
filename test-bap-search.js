const axios = require('axios');

async function testBAPSearch() {
    try {
        console.log('🔍 Testing BAP search for BLR → GOI (bus)...');
        
        const searchRequest = {
            context: {
                domain: "mobility",
                country: "IND",
                city: "std:080",
                action: "search",
                core_version: "1.1.0",
                bap_id: "travel-discovery-bap.example.com",
                bap_uri: "http://localhost:8081",
                transaction_id: `txn-${Date.now()}`,
                message_id: `msg-${Date.now()}`,
                timestamp: new Date().toISOString(),
                ttl: "PT30S"
            },
            message: {
                intent: {
                    category: {
                        id: "MOBILITY"
                    },
                    fulfillment: {
                        start: {
                            location: {
                                gps: "12.9716,77.5946" // BLR - Bangalore
                            }
                        },
                        end: {
                            location: {
                                gps: "15.3808,73.8389" // GOI - Goa
                            }
                        },
                        time: {
                            range: {
                                start: new Date().toISOString(),
                                end: new Date(Date.now() + 24*60*60*1000).toISOString()
                            }
                        }
                    }
                }
            }
        };

        console.log('📤 Sending search request to BAP...');
        const response = await axios.post('http://localhost:8081/beckn/search', searchRequest);
        
        console.log('📥 Response received from BAP:');
        console.log('Status:', response.status);
        
        const catalog = response.data?.message?.catalog;
        if (catalog && catalog.providers) {
            let totalItems = 0;
            catalog.providers.forEach(provider => {
                if (provider.items) {
                    totalItems += provider.items.length;
                    console.log(`✅ Provider: ${provider.descriptor?.name || provider.id}`);
                    console.log(`   Items: ${provider.items.length}`);
                    
                    provider.items.forEach((item, index) => {
                        console.log(`     ${index + 1}. ${item.descriptor?.name} - ${item.descriptor?.code}`);
                        console.log(`        Price: ₹${item.price?.value}`);
                        console.log(`        Category: ${item.category_id}`);
                        
                        const routeTag = item.tags?.find(t => t.code === 'ROUTE');
                        if (routeTag) {
                            const from = routeTag.list?.find(l => l.code === 'FROM')?.value;
                            const to = routeTag.list?.find(l => l.code === 'TO')?.value;
                            console.log(`        Route: ${from} → ${to}`);
                        }
                        console.log('');
                    });
                }
            });
            
            console.log(`📊 Total items found: ${totalItems}`);
        } else {
            console.log('❌ No catalog found in response');
            console.log('Response structure:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error testing BAP search:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testBAPSearch();