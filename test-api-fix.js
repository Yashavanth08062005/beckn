const axios = require('axios');

async function testAPIFix() {
    try {
        console.log('🔍 Testing if API changes broke the search...');
        
        // Test the exact same request the frontend would make
        const searchData = {
            origin: "BLR",
            destination: "GOI", 
            travelDate: "2025-12-26",
            transportMode: "bus",
            passengers: "1"
        };

        console.log('📤 Search data:', searchData);
        
        // Simulate the frontend API call
        const response = await fetch('http://localhost:8081/beckn/search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
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
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        console.log('📥 Response received');
        
        // Apply the same filtering and transformation logic as the updated frontend
        const catalog = data?.message?.catalog;
        if (!catalog || !catalog.providers) {
            console.log('❌ No providers found in catalog');
            return;
        }

        const items = [];
        catalog.providers.forEach(provider => {
            if (provider.items) {
                provider.items.forEach(item => {
                    const itemCategory = item.category_id;
                    const mode = searchData.transportMode;

                    let shouldInclude = false;
                    if (mode === 'bus') {
                        shouldInclude = (itemCategory === 'BUS');
                    } else if (mode === 'flight') {
                        shouldInclude = (itemCategory === 'FLIGHT');
                    }

                    if (shouldInclude) {
                        // Helper function to extract tag values
                        const getTagValue = (tags, tagCode, listCode) => {
                            if (!tags) return null;
                            const tag = tags.find(t => t.code === tagCode);
                            if (!tag || !tag.list) return null;
                            const listItem = tag.list.find(l => l.code === listCode);
                            return listItem?.value;
                        };

                        // Test the new time extraction logic
                        const departureTime = getTagValue(item.tags, 'SCHEDULE', 'DEPARTURE_TIME') || item.time?.timestamp;
                        const arrivalTime = getTagValue(item.tags, 'SCHEDULE', 'ARRIVAL_TIME');
                        const duration = getTagValue(item.tags, 'ROUTE', 'DURATION');
                        
                        const transformedItem = {
                            id: item.id,
                            provider: provider.descriptor?.name || 'Provider',
                            price: parseFloat(item.price?.value || 0),
                            details: {
                                name: item.descriptor?.name,
                                code: item.descriptor?.code,
                                departureTime: departureTime,
                                arrivalTime: arrivalTime,
                                duration: duration
                            }
                        };
                        items.push(transformedItem);
                    }
                });
            }
        });

        console.log(`✅ Filtered and transformed items: ${items.length}`);
        items.forEach((item, index) => {
            console.log(`  ${index + 1}. ${item.details.name} - ₹${item.price}`);
            console.log(`     Departure: ${item.details.departureTime ? new Date(item.details.departureTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}`);
            console.log(`     Arrival: ${item.details.arrivalTime ? new Date(item.details.arrivalTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }) : 'N/A'}`);
            console.log(`     Duration: ${item.details.duration || 'N/A'}`);
        });
        
    } catch (error) {
        console.error('❌ Error testing API fix:', error.message);
        if (error.response) {
            console.error('Response status:', error.response.status);
            console.error('Response data:', error.response.data);
        }
    }
}

testAPIFix();