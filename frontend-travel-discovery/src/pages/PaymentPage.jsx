import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CreditCard, Lock, CheckCircle, Loader, AlertCircle } from 'lucide-react';
import axios from 'axios';

const PaymentPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { bookingData, item, type } = location.state || {};

    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [error, setError] = useState('');

    const [cardDetails, setCardDetails] = useState({
        cardNumber: '',
        cardHolder: '',
        expiryMonth: '',
        expiryYear: '',
        cvv: ''
    });

    useEffect(() => {
        if (!bookingData || !item) {
            navigate('/');
        }
    }, [bookingData, item, navigate]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Format card number with spaces
        if (name === 'cardNumber') {
            const formatted = value.replace(/\s/g, '').replace(/(\d{4})/g, '$1 ').trim();
            setCardDetails(prev => ({ ...prev, [name]: formatted }));
        } else {
            setCardDetails(prev => ({ ...prev, [name]: value }));
        }
    };

    const simulatePayment = () => {
        return new Promise((resolve) => {
            // Simulate payment processing delay
            setTimeout(() => {
                resolve({ success: true, transactionId: `TXN${Date.now()}` });
            }, 3000);
        });
    };

    const handlePayment = async (e) => {
        e.preventDefault();
        setError('');
        setProcessing(true);

        try {
            // Validate card details
            if (paymentMethod === 'card') {
                if (!cardDetails.cardNumber || cardDetails.cardNumber.replace(/\s/g, '').length !== 16) {
                    throw new Error('Please enter a valid 16-digit card number');
                }
                if (!cardDetails.cardHolder) {
                    throw new Error('Please enter card holder name');
                }
                if (!cardDetails.expiryMonth || !cardDetails.expiryYear) {
                    throw new Error('Please enter card expiry date');
                }
                if (!cardDetails.cvv || cardDetails.cvv.length !== 3) {
                    throw new Error('Please enter a valid 3-digit CVV');
                }
            }

            // Simulate payment processing
            const paymentResult = await simulatePayment();

            if (paymentResult.success) {
                // Redirect to payment success page
                navigate('/payment-success', {
                    state: {
                        transactionId: paymentResult.transactionId,
                        bookingData: bookingData,
                        item: item,
                        type: type
                    }
                });
            } else {
                throw new Error('Payment failed. Please try again.');
            }

        } catch (err) {
            setError(err.message || 'Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    const confirmBooking = async (transactionId) => {
        try {
            const API_BASE_URL = import.meta.env.VITE_BAP_URL || 'http://localhost:8081';

            // Create Beckn confirm request
            const confirmRequest = {
                context: {
                    domain: type === 'flight' ? 'mobility' : 'hospitality',
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

            // Navigate to confirmation page
            navigate('/booking-confirmation', {
                state: {
                    booking: {
                        id: confirmRequest.message.order.id,
                        transactionId: transactionId,
                        status: 'CONFIRMED',
                        paymentMethod: paymentMethod
                    },
                    flight: {
                        ...item,
                        details: item.details,
                        category_id: type === 'bus' ? 'BUS' : item.category_id
                    },
                    passenger: bookingData,
                    type: type
                }
            });

        } catch (err) {
            console.error('❌ Beckn confirm error:', err);
            throw new Error('Failed to confirm booking. Please contact support.');
        }
    };

    if (!bookingData || !item) {
        return null;
    }

    const totalAmount = item.price || 0;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-3xl font-bold text-gray-900">Payment</h1>
                    <p className="text-gray-600 mt-2">Complete your booking securely</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-xl shadow-md p-6">
                            {/* Security Badge */}
                            <div className="flex items-center justify-center mb-6 p-4 bg-green-50 rounded-lg">
                                <Lock className="h-5 w-5 text-green-600 mr-2" />
                                <span className="text-sm text-green-800 font-medium">
                                    Secure Payment - Your data is encrypted
                                </span>
                            </div>

                            {/* Payment Method Selection */}
                            <div className="mb-6">
                                <label className="block text-sm font-medium text-gray-700 mb-3">
                                    Payment Method
                                </label>
                                <div className="grid grid-cols-3 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('card')}
                                        className={`p-4 border-2 rounded-lg text-center transition-all ${paymentMethod === 'card'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <CreditCard className="h-6 w-6 mx-auto mb-2" />
                                        <span className="text-sm font-medium">Card</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('upi')}
                                        className={`p-4 border-2 rounded-lg text-center transition-all ${paymentMethod === 'upi'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">₹</div>
                                        <span className="text-sm font-medium">UPI</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod('wallet')}
                                        className={`p-4 border-2 rounded-lg text-center transition-all ${paymentMethod === 'wallet'
                                            ? 'border-blue-600 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="text-2xl mb-2">💳</div>
                                        <span className="text-sm font-medium">Wallet</span>
                                    </button>
                                </div>
                            </div>

                            {/* Card Payment Form */}
                            {paymentMethod === 'card' && (
                                <form onSubmit={handlePayment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Number
                                        </label>
                                        <input
                                            type="text"
                                            name="cardNumber"
                                            value={cardDetails.cardNumber}
                                            onChange={handleInputChange}
                                            placeholder="1234 5678 9012 3456"
                                            maxLength="19"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Card Holder Name
                                        </label>
                                        <input
                                            type="text"
                                            name="cardHolder"
                                            value={cardDetails.cardHolder}
                                            onChange={handleInputChange}
                                            placeholder="John Doe"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    <div className="grid grid-cols-3 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Month
                                            </label>
                                            <select
                                                name="expiryMonth"
                                                value={cardDetails.expiryMonth}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">MM</option>
                                                {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                                                    <option key={month} value={month.toString().padStart(2, '0')}>
                                                        {month.toString().padStart(2, '0')}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Year
                                            </label>
                                            <select
                                                name="expiryYear"
                                                value={cardDetails.expiryYear}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            >
                                                <option value="">YY</option>
                                                {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                                                    <option key={year} value={year.toString().slice(-2)}>
                                                        {year.toString().slice(-2)}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                CVV
                                            </label>
                                            <input
                                                type="text"
                                                name="cvv"
                                                value={cardDetails.cvv}
                                                onChange={handleInputChange}
                                                placeholder="123"
                                                maxLength="3"
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                            <span className="text-sm text-red-800">{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                <Lock className="h-5 w-5 mr-2" />
                                                Pay ₹{totalAmount.toLocaleString('en-IN')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* UPI Payment */}
                            {paymentMethod === 'upi' && (
                                <form onSubmit={handlePayment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            UPI ID
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="yourname@upi"
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>

                                    {error && (
                                        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                            <span className="text-sm text-red-800">{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                Pay ₹{totalAmount.toLocaleString('en-IN')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}

                            {/* Wallet Payment */}
                            {paymentMethod === 'wallet' && (
                                <form onSubmit={handlePayment} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Select Wallet
                                        </label>
                                        <select className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                                            <option>Paytm</option>
                                            <option>PhonePe</option>
                                            <option>Google Pay</option>
                                            <option>Amazon Pay</option>
                                        </select>
                                    </div>

                                    {error && (
                                        <div className="flex items-center p-4 bg-red-50 border border-red-200 rounded-lg">
                                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                                            <span className="text-sm text-red-800">{error}</span>
                                        </div>
                                    )}

                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="w-full bg-blue-600 text-white py-4 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader className="animate-spin h-5 w-5 mr-2" />
                                                Processing Payment...
                                            </>
                                        ) : (
                                            <>
                                                Pay ₹{totalAmount.toLocaleString('en-IN')}
                                            </>
                                        )}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-md p-6 sticky top-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>

                            {type === 'flight' ? (
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {item.details?.airline || 'Flight'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {item.origin} → {item.destination}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.details?.flightNumber}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : type === 'bus' ? (
                                <div className="space-y-3 mb-6">
                                    <div className="flex items-start">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gray-900">
                                                {item.descriptor?.name || 'Bus Operator'}
                                            </p>
                                            <p className="text-sm text-gray-600">
                                                {item.origin} → {item.destination}
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                {item.descriptor?.short_desc || 'Bus Service'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : null}

                            <div className="border-t pt-4 space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Base Fare</span>
                                    <span className="text-gray-900">₹{totalAmount.toLocaleString('en-IN')}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-600">Taxes & Fees</span>
                                    <span className="text-gray-900">Included</span>
                                </div>
                            </div>

                            <div className="border-t mt-4 pt-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-bold text-gray-900">Total Amount</span>
                                    <span className="text-2xl font-bold text-blue-600">
                                        ₹{totalAmount.toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                                <p className="text-xs text-blue-800">
                                    <CheckCircle className="inline h-4 w-4 mr-1" />
                                    Your booking is protected by our secure payment system
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
