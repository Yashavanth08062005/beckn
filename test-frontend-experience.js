const axios = require('axios');

async function testFrontendExperienceSearch() {
    try {
        console.log('Testing frontend experience search...');
        
        // Simulate the frontend search request
        const searchData = {
            transportMode: 'experience',
            cityCode: 'Mumbai',
            travelDate: '2024-02-15',
            passengers: 2
        };

        // Create the same request the frontend would make
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
                        id: "EXPERIENCE"
                    },
                    fulfillment: {
                        start: {
                            location: {
                                city: {
                                    name: searchData.cityCode
                                }
                            }
                        },
                        end: {
                            location: {
                                gps: "19.0760,72.8777" // Mumbai GPS
                            }
                        },
                        time: {
                            range: {
                                start: new Date(searchData.travelDate + 'T09:00:00').toISOString(),
                                end: new Date(searchData.travelDate + 'T18:00:00').toISOString()
                            }
                        }
                    }
                }
            }
        };

        console.log('📤 Sending request to BAP...');
        const response = await axios.post('http://localhost:8081/beckn/search', becknRequest, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('✅ Response received!');
        console.log('Status:', response.status);
        
        const catalog = response.data?.message?.catalog;
        const providers = catalog?.providers || [];
        
        console.log(`Found ${providers.length} experience providers:`);
        
        let totalExperiences = 0;
        providers.forEach((provider, providerIndex) => {
            console.log(`\nProvider ${providerIndex + 1}: ${provider.descriptor?.name}`);
            const items = provider.items || [];
            totalExperiences += items.length;
            console.log(`  Items: ${items.length}`);
            
            items.slice(0, 3).forEach((item, itemIndex) => {
                console.log(`  ${itemIndex + 1}. ${item.descriptor?.name} - ₹${item.price?.value}`);
                console.log(`     Category: ${item.category_id}`);
                console.log(`     Duration: ${item.time?.duration || 'N/A'}`);
                
                // Check if item has proper structure for frontend
                const hasRequiredFields = item.id && item.descriptor?.name && item.price?.value;
                console.log(`     Frontend Ready: ${hasRequiredFields ? '✅' : '❌'}`);
            });
        });

        console.log(`\n📊 Summary: ${totalExperiences} total experiences found`);
        
        if (totalExperiences > 0) {
            console.log('🎉 Experience search is working correctly!');
        } else {
            console.log('⚠️ No experiences found - check BPP configuration');
        }

    } catch (error) {
        console.error('❌ Frontend experience search failed:', error.response?.data || error.message);
        if (error.response?.status) {
            console.error('Status:', error.response.status);
        }
    }
}

testFrontendExperienceSearch();