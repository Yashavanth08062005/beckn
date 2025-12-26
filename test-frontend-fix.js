const axios = require('axios');

// Helper function to extract tag values (copied from frontend)
const getTagValue = (tags, tagCode, listCode) => {
  if (!tags) return null;
  const tag = tags.find(t => t.code === tagCode);
  if (!tag || !tag.list) return null;
  const listItem = tag.list.find(l => l.code === listCode);
  return listItem?.value;
};

async function testFrontendFix() {
    try {
        console.log('🔍 Testing frontend fix for bus times...');
        
        const becknRequest = {
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
                                start: new Date().toISOString(),
                                end: new Date(Date.now() + 24*60*60*1000).toISOString()
                            }
                        }
                    }
                }
            }
        };

        console.log('📤 Sending request to BAP...');
        const response = await axios.post('http://localhost:8081/beckn/search', becknRequest);
        
        const catalog = response.data?.message?.catalog;
        if (catalog && catalog.providers) {
            catalog.providers.forEach(provider => {
                if (provider.items) {
                    provider.items.forEach(item => {
                        if (item.category_id === 'BUS') {
                            console.log(`\n🚌 ${item.descriptor?.name} - ${item.descriptor?.code}`);
                            console.log(`   Price: ₹${item.price?.value}`);
                            
                            // Test the tag extraction
                            const departureTime = getTagValue(item.tags, 'SCHEDULE', 'DEPARTURE_TIME');
                            const arrivalTime = getTagValue(item.tags, 'SCHEDULE', 'ARRIVAL_TIME');
                            const duration = getTagValue(item.tags, 'ROUTE', 'DURATION');
                            
                            console.log(`   Departure Time (from tags): ${departureTime}`);
                            console.log(`   Arrival Time (from tags): ${arrivalTime}`);
                            console.log(`   Duration: ${duration}`);
                            
                            if (departureTime) {
                                const depTime = new Date(departureTime);
                                console.log(`   Formatted Departure: ${depTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
                            }
                            
                            if (arrivalTime) {
                                const arrTime = new Date(arrivalTime);
                                console.log(`   Formatted Arrival: ${arrTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })}`);
                            }
                        }
                    });
                }
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testFrontendFix();