const axios = require('axios');

async function testBusSearch() {
    try {
        console.log('🔍 Testing bus search for BLR → GOI...');
        
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

        console.log('📤 Sending search request to bus BPP...');
        const response = await axios.post('http://localhost:7007/search', searchRequest);
        
        console.log('📥 Response received:');
        console.log('Status:', response.status);
        
        const catalog = response.data?.message?.catalog;
        if (catalog && catalog.providers && catalog.providers[0]?.items) {
            const buses = catalog.providers[0].items;
            console.log(`✅ Found ${buses.length} buses:`);
            
            buses.forEach((bus, index) => {
                console.log(`  ${index + 1}. ${bus.descriptor.name} - ${bus.descriptor.code}`);
                console.log(`     Price: ₹${bus.price.value}`);
                console.log(`     Route: ${bus.tags.find(t => t.code === 'ROUTE')?.list.find(l => l.code === 'FROM')?.value} → ${bus.tags.find(t => t.code === 'ROUTE')?.list.find(l => l.code === 'TO')?.value}`);
                console.log('');
            });
        } else {
            console.log('❌ No buses found in response');
            console.log('Response structure:', JSON.stringify(response.data, null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error testing bus search:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testBusSearch();