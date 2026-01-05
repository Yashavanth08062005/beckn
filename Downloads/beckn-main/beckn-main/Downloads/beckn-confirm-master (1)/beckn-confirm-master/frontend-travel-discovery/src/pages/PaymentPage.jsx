import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Lock, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { bookingData, item, type } = location.state || {};

    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [scriptLoaded, setScriptLoaded] = useState(false);

    useEffect(() => {
        if (!bookingData || !item) {
            navigate('/');
            return;
        }

        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        script.onload = () => setScriptLoaded(true);
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [bookingData, item, navigate]);

    const confirmBooking = async (transactionId) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_BAP_URL || 'http://localhost:8081';

            // Create Beckn confirm request
            const confirmRequest = {
                context: {
                    domain: (type === 'flight' || type === 'bus' || type === 'train') ? 'mobility' : 'hospitality',
                    country: 'IND',
                    city: 'std:080',
                    action: 'confirm',
                    core_version: '1.1.0',
                    bap_id: 'travel-discovery-bap.example.com',
                    bap_uri: API_BASE_URL,
                    transaction_id: `txn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    message_id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    timestamp: new Date().toISOString(),
                    ttl: 'PT30S'
                },
                message: {
                    order: {
                        id: `order-${Date.now()}`,
                        state: 'CONFIRMED',
                        provider: {
                            id: item.providerId || 'provider-001'
                        },
                        items: [
                            {
                                id: item.id,
                                quantity: {
                                    count: 1
                                }
                            }
                        ],
                        billing: {
                            name: bookingData.passenger_name,
                            email: bookingData.passenger_email,
                            phone: bookingData.passenger_phone,
                            address: {
                                door: bookingData.address_line1,
                                building: bookingData.address_line2 || '',
                                street: bookingData.address_line1,
                                city: bookingData.city,
                                state: bookingData.state,
                                country: bookingData.country,
                                area_code: bookingData.postal_code
                            }
                        },
                        fulfillment: {
                            type: 'DELIVERY',
                            customer: {
                                person: {
                                    name: bookingData.passenger_name,
                                    age: bookingData.passenger_age,
                                    gender: bookingData.passenger_gender
                                },
                                contact: {
                                    phone: bookingData.passenger_phone,
                                    email: bookingData.passenger_email
                                }
                            }
                        },
                        payment: {
                            type: 'PRE-FULFILLMENT',
                            status: 'PAID',
                            params: {
                                amount: item.price.toString(),
                                currency: item.currency || 'INR',
                                transaction_id: transactionId
                            }
                        },
                        quote: {
                            price: {
                                currency: item.currency || 'INR',
                                value: item.price.toString()
                            }
                        }
                    }
                }
            };

            console.log('📤 Sending Beckn confirm request:', confirmRequest);

            const response = await axios.post(`${API_BASE_URL}/beckn/confirm`, confirmRequest);

            console.log('✅ Beckn confirm response:', response.data);

            // Save booking to database API
            try {
                const bookingRef = `BK${Date.now().toString().slice(-8)}`;

                // Robust Data Extraction (Unified with PaymentSuccess.jsx)
                // Common fallbacks
                let itemName = item.details?.name || item.name || item.descriptor?.name;
                let itemCode = item.details?.code || item.code || item.id;
                let origin = item.origin;
                let destination = item.destination;
                let departureTime = item.details?.departureTime || item.time?.range?.start || item.time?.timestamp;
                let arrivalTime = item.details?.arrivalTime || item.time?.range?.end;

                // Type-specific overrides
                if (type === 'flight') {
                    itemName = item.details?.airline || item.airline || itemName;
                    itemCode = item.details?.flightNumber || item.flightNumber || itemCode;
                    origin = item.details?.origin || item.origin || origin;
                    destination = item.details?.destination || item.destination || destination;

                } else if (type === 'hotel') {
                    itemName = item.details?.hotelName || item.details?.name || item.hotel_name || itemName;
                    itemCode = item.details?.hotelId || item.hotel_code || itemCode;
                    origin = null;
                    destination = item.details?.city || item.city || item.location?.city?.name || destination;

                    if (!destination && item.details?.address) {
                        const addr = item.details.address;
                        if (typeof addr === 'string') destination = addr.split(',').pop().trim();
                        else destination = addr.city || addr.state;
                    }

                } else if (type === 'bus') {
                    itemName = item.details?.travels || item.details?.operator || item.travels || item.bus_operator || item.operator_name || itemName;
                    origin = item.details?.departureCity || item.details?.source || item.details?.from || item.source || item.from || origin;
                    destination = item.details?.arrivalCity || item.details?.destination || item.details?.to || item.destination || item.to || destination;
                    departureTime = item.details?.departureTime || item.departure_time || item.time?.range?.start || item.timings?.departure || departureTime;
                    arrivalTime = item.details?.arrivalTime || item.arrival_time || item.time?.range?.end || item.timings?.arrival || arrivalTime;

                } else if (type === 'experience') {
                    itemName = item.details?.title || item.details?.name || item.descriptor?.name || item.descriptor?.code || itemName;
                    itemCode = item.id || item.descriptor?.code || itemCode;
                    origin = null; // Experiences don't have an origin in the travel sense
                    destination = item.details?.location || item.details?.address || item.city || item.location_id || destination;

                    // Experience time handling
                    departureTime = item.time?.range?.start || item.time?.timestamp || item.volume?.start_time || departureTime;
                    arrivalTime = item.time?.range?.end || item.volume?.end_time || arrivalTime;

                } else if (type === 'train') {
                    itemName = item.details?.trainName || item.details?.name || item.train_name || item.trainName || itemName;
                    itemCode = item.details?.trainNumber || item.train_number || itemCode;

                    // Advanced Tag Parsing for Trains
                    if (item.tags) {
                        const routeTag = item.tags.find(tag => tag.code === 'ROUTE');
                        if (routeTag) {
                            const fromTag = routeTag.list.find(i => i.code === 'FROM');
                            if (fromTag) {
                                const val = fromTag.value;
                                if (val.includes('SBC') || val.includes('Bengaluru')) origin = 'BLR';
                                else if (val.includes('NZM') || val.includes('Delhi')) origin = 'DEL';
                                else if (val.includes('MAS') || val.includes('Chennai')) origin = 'MAA';
                                else if (val.includes('KCG') || val.includes('Hyderabad')) origin = 'HYD';
                                else {
                                    const match = val.match(/\(([^)]+)\)/);
                                    origin = match ? match[1] : val.substring(0, 3).toUpperCase();
                                }
                            }
                            const toTag = routeTag.list.find(i => i.code === 'TO');
                            if (toTag) {
                                const val = toTag.value;
                                if (val.includes('SBC') || val.includes('Bengaluru')) destination = 'BLR';
                                else if (val.includes('NZM') || val.includes('Delhi')) destination = 'DEL';
                                else if (val.includes('MAS') || val.includes('Chennai')) destination = 'MAA';
                                else if (val.includes('KCG') || val.includes('Hyderabad')) destination = 'HYD';
                                else {
                                    const match = val.match(/\(([^)]+)\)/);
                                    destination = match ? match[1] : val.substring(0, 3).toUpperCase();
                                }
                            }
                            const depTag = routeTag.list.find(i => i.code === 'DEPARTURE_TIME');
                            if (depTag) departureTime = depTag.value;
                            const arrTag = routeTag.list.find(i => i.code === 'ARRIVAL_TIME');
                            if (arrTag) arrivalTime = arrTag.value;
                        }
                    }
                    // Fallbacks logic for trains
                    origin = origin || item.details?.fromStation || item.details?.source || item.details?.from || item.source || item.from;
                    destination = destination || item.details?.toStation || item.details?.destination || item.details?.to || item.destination || item.to;

                    departureTime = departureTime || item.details?.departureTime || item.departure_time || item.time?.range?.start || item.timings?.departure;
                    arrivalTime = arrivalTime || item.details?.arrivalTime || item.arrival_time || item.time?.range?.end || item.timings?.arrival;
                }

                const bookingPayload = {
                    booking_reference: bookingRef,
                    user_id: user?.id || null,
                    booking_type: type,
                    item_id: item.id,
                    provider_id: item.providerId || 'provider-001',
                    item_name: itemName,
                    item_code: itemCode,
                    origin: origin,
                    destination: destination,
                    departure_time: departureTime,
                    arrival_time: arrivalTime,
                    check_in_date: type === 'hotel' ? (item.checkIn || item.details?.checkIn) : null,
                    check_out_date: type === 'hotel' ? (item.checkOut || item.details?.checkOut) : null,
                    passenger_name: bookingData.passenger_name,
                    passenger_email: user?.email || bookingData.passenger_email,
                    passenger_phone: bookingData.passenger_phone,
                    passenger_gender: bookingData.passenger_gender,
                    date_of_birth: bookingData.date_of_birth,
                    nationality: bookingData.nationality,
                    passport_number: bookingData.passport_number,
                    address_line1: bookingData.address_line1,
                    address_line2: bookingData.address_line2,
                    city: bookingData.city,
                    state: bookingData.state,
                    postal_code: bookingData.postal_code,
                    country: bookingData.country,
                    transaction_id: transactionId,
                    payment_method: 'razorpay',
                    payment_status: 'PAID',
                    amount: item.price,
                    currency: item.currency || 'INR',
                    booking_status: 'CONFIRMED',
                    beckn_transaction_id: confirmRequest.context.transaction_id,
                    beckn_message_id: confirmRequest.context.message_id,
                    order_id: confirmRequest.message.order.id,
                    item_details: item,
                    booking_metadata: {
                        payment_date: new Date().toISOString(),
                        beckn_response: response.data
                    }
                };

                // Override origin/destination from searchContext if available (to match user intent)
                const searchContext = location.state?.searchContext;
                if (searchContext) {
                    if (searchContext.origin) bookingPayload.origin = searchContext.origin;
                    if (searchContext.destination) bookingPayload.destination = searchContext.destination;


                    // FIX: Use User's Selected Dates for Hotels
                    if (type === 'hotel') {
                        if (searchContext.checkInDate) {
                            bookingPayload.check_in_date = searchContext.checkInDate;
                            bookingPayload.departure_time = searchContext.checkInDate;
                            // Update item for next page
                            if (!item.details) item.details = {};
                            item.details.checkIn = searchContext.checkInDate;
                        }
                        if (searchContext.checkOutDate) {
                            bookingPayload.check_out_date = searchContext.checkOutDate;
                            bookingPayload.arrival_time = searchContext.checkOutDate;
                            // Update item for next page
                            if (!item.details) item.details = {};
                            item.details.checkOut = searchContext.checkOutDate;
                        }
                    }

                    // FIX: Use User's Selected Date for Experiences
                    if (type === 'experience' && searchContext.travelDate) {
                        bookingPayload.departure_time = searchContext.travelDate;
                        // For arrival/end time, if we successfully parsed duration (e.g. "3 hours"), we could calculate it.
                        // For now, we just set start time which is the most critical.
                        if (!item.details) item.details = {};
                        item.details.departureTime = searchContext.travelDate;
                    }
                }

                console.log('💾 Saving booking to database:', bookingPayload);

                const bookingResponse = await axios.post(`${API_BASE_URL}/api/bookings`, bookingPayload);

                console.log('✅ Booking saved successfully:', bookingResponse.data);

                // Navigate to confirmation page
                navigate('/booking-confirmation', {
                    state: {
                        booking: {
                            id: bookingRef,
                            transactionId: transactionId,
                            status: 'CONFIRMED',
                            paymentMethod: 'razorpay'
                        },
                        flight: {
                            ...item,
                            details: item.details
                        },
                        passenger: bookingData
                    }
                });

            } catch (bookingError) {
                console.error('❌ Error saving booking to database:', bookingError);
                // Navigate anyway
                navigate('/booking-confirmation', {
                    state: {
                        booking: {
                            id: confirmRequest.message.order.id,
                            transactionId: transactionId,
                            status: 'CONFIRMED',
                            paymentMethod: 'razorpay'
                        },
                        flight: {
                            ...item,
                            details: item.details
                        },
                        passenger: bookingData
                    }
                });
            }

        } catch (err) {
            console.error('❌ Beckn confirm error:', err);
            setError('Failed to confirm booking. Please contact support.');
            setProcessing(false);
        }
    };

    const handlePayment = () => {
        setProcessing(true);
        setError('');

        if (typeof window.Razorpay === 'undefined') {
            setError('Razorpay SDK failed to load. Please check your connection.');
            setProcessing(false);
            return;
        }

        const options = {
            key: "rzp_test_1DP5mmOlF5G5ag", // Standard Test Key for demo purposes
            amount: (item.price * 100).toString(), // Razorpay expects amount in paise
            currency: "INR",
            description: `Payment for ${type} booking`,
            image: "https://example.com/image/rzp.jpg", // Kept from snippet
            prefill: {
                email: bookingData.passenger_email,
                contact: bookingData.passenger_phone,
            },
            config: {
                display: {
                    blocks: {
                        utib: { //name for Axis block
                            name: "Pay Using Axis Bank",
                            instruments: [
                                {
                                    method: "card",
                                    issuers: ["UTIB"]
                                },
                                {
                                    method: "netbanking",
                                    banks: ["UTIB"]
                                },
                            ]
                        },
                        other: { //  name for other block
                            name: "Other Payment Methods",
                            instruments: [
                                {
                                    method: "card",
                                    issuers: ["ICIC"]
                                },
                                {
                                    method: 'netbanking',
                                }
                            ]
                        }
                    },
                    hide: [
                        {
                            method: "upi"
                        }
                    ],
                    sequence: ["block.utib", "block.other"],
                    preferences: {
                        show_default_blocks: false
                    }
                }
            },
            handler: function (response) {
                console.log('Razorpay Payment ID:', response.razorpay_payment_id);
                confirmBooking(response.razorpay_payment_id);
            },
            modal: {
                ondismiss: function () {
                    setProcessing(false);
                    console.log("Checkout form closed by the user");
                }
            }
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.on('payment.failed', function (response) {
            setError(response.error.description);
            setProcessing(false);
        });
        rzp1.open();
    };

    if (!bookingData || !item) {
        return null;
    }

    const totalAmount = item.price || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md mx-auto">
                <div className="mb-6 text-center">
                    <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
                    <p className="text-gray-600 mt-2">Complete your booking for ₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>

                <div className="bg-white rounded-xl shadow-md p-6">
                    {/* Security Badge */}
                    <div className="flex items-center justify-center mb-6 p-4 bg-green-50 rounded-lg">
                        <Lock className="h-5 w-5 text-green-600 mr-2" />
                        <span className="text-sm text-green-800 font-medium">
                            Secure Payment with Razorpay
                        </span>
                    </div>

                    {error && (
                        <div className="flex items-center p-4 mb-6 bg-red-50 border border-red-200 rounded-lg">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <span className="text-sm text-red-800">{error}</span>
                        </div>
                    )}

                    <div className="flex flex-col space-y-4">
                        <button
                            id="rzp-button1"
                            onClick={handlePayment}
                            disabled={!scriptLoaded || processing}
                            className="bg-blue-600 text-white rounded-lg py-4 px-6 font-bold text-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg transform active:scale-95 duration-200"
                        >
                            {processing ? (
                                <>
                                    <Loader className="animate-spin h-6 w-6 mr-3" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    <i className="fas fa-money-bill mr-3"></i>
                                    Own Checkout
                                </>
                            )}
                        </button>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-xs text-gray-400">
                            By continuing, you agree to our Terms of Service and Privacy Policy.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
