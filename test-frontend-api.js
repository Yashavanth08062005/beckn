const axios = require('axios');

async function testFrontendAPI() {
    try {
        console.log('🔍 Testing frontend API search for BLR → GOI (bus)...');
        
        // Simulate the same request the frontend would make
        const searchData = {
            origin: "BLR",
            destination: "GOI", 
            travelDate: "2025-12-26",
            transportMode: "bus",
            passengers: "1"
        };

        console.log('📤 Search data:', searchData);
        
        // Create the request that the frontend API service would create
        const becknRequest = {
            context: {
                domain: "mobility",
                country: "IND", 
                city: "std:080",
                action: "search",
                core_version: "1.1.0",
                bap_id: "travel-discovery-bap.example.com",
                bap_uri: "http://localhost:8081",
                transaction_id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                message_id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
                                gps: "12.9716,77.5946" // BLR
                            }
                        },
                        end: {
                            location: {
                                gps: "15.3808,73.8389" // GOI
                            }
                        },
                        time: {
                            range: {
                                start: new Date(searchData.travelDate + 'T00:00:00').toISOString(),
                                end: new Date(searchData.travelDate + 'T23:59:59').toISOString()
                            }
                        }
                    }
                }
            }
        };

        console.log('📤 Sending request to BAP...');
        const response = await axios.post('http://localhost:8081/beckn/search', becknRequest);
        
        console.log('📥 BAP Response received');
        
        // Simulate the frontend transformation logic
        const catalog = response.data?.message?.catalog;
        if (!catalog || !catalog.providers) {
            console.log('❌ No providers found in catalog');
            return;
        }

        const items = [];
        catalog.providers.forEach(provider => {
            if (provider.items) {
                provider.items.forEach(item => {
                    // Apply the same filtering logic as frontend
                    const itemCategory = item.category_id;
                    const mode = searchData.transportMode;

                    let shouldInclude = false;
                    if (mode === 'bus') {
                        shouldInclude = (itemCategory === 'BUS');
                    } else if (mode === 'flight') {
                        shouldInclude = (itemCategory === 'FLIGHT');
                    }

                    console.log(`🔍 Item: ${item.descriptor?.name}, Category: ${itemCategory}, Mode: ${mode}, Include: ${shouldInclude}`);

                    if (shouldInclude) {
                        // Transform the item (simplified)
                        const transformedItem = {
                            id: item.id,
                            provider: provider.descriptor?.name || 'Provider',
                            providerId: provider.id,
                            price: parseFloat(item.price?.value || 0),
                            currency: item.price?.currency || 'INR',
                            travelMode: mode,
                            origin: item.tags?.find(t => t.code === 'ROUTE')?.list?.find(l => l.code === 'FROM')?.value?.split('(')[0]?.trim(),
                            destination: item.tags?.find(t => t.code === 'ROUTE')?.list?.find(l => l.code === 'TO')?.value?.split('(')[0]?.trim(),
                            details: {
                                name: item.descriptor?.name,
                                code: item.descriptor?.code
                            }
                        };
                        items.push(transformedItem);
                    }
                });
            }
        });

        console.log(`✅ Filtered items: ${items.length}`);
        items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.details.name} - ₹${item.price}`);
            console.log(`     Route: ${item.origin} → ${item.destination}`);
        });
        
    } catch (error) {
        console.error('❌ Error testing frontend API:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testFrontendAPI();