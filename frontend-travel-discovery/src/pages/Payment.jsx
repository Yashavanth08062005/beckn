import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, IndianRupee, CreditCard, Smartphone, Building2, Wallet, Lock, Info } from 'lucide-react';
import { ensureLoggedInOrRedirect } from '../utils/authGuard'; // 🔒 NEW IMPORT

export default function Payment() {
  const location = useLocation();
  const navigate = useNavigate();
  const [bookingSummary, setBookingSummary] = useState(null);
  const [selectedInsurance, setSelectedInsurance] = useState(false);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [convenienceFee] = useState(99);

  // 🔒 AUTH GUARD
  useEffect(() => {
    ensureLoggedInOrRedirect(navigate);
  }, [navigate]);

  useEffect(() => {
    if (location && location.state && location.state.bookingSummary) {
      setBookingSummary(location.state.bookingSummary);
    } else {
      // If no booking data, redirect back
      navigate('/booking');
    }
  }, [location, navigate]);

  if (!bookingSummary) {
    return null;
  }

  const baseAmount = bookingSummary.flight.amount || 0;
  const totalAmount = baseAmount + (selectedInsurance ? 99 : 0) + convenienceFee;

  const handlePayment = () => {
    const ok = ensureLoggedInOrRedirect(navigate);
    if (!ok) return;

    // Navigate to payment success page
    navigate('/payment-success', {
      state: {
        bookingSummary: {
          ...bookingSummary,
          insurance: selectedInsurance,
          convenienceFee,
          totalAmount,
        }
      }
    });
  };

  const formatPassengerName = (name, gender) => {
    const genderInitial = gender ? ` (${gender.charAt(0)})` : '';
    return `${name}${genderInitial}`;
  };

  const paymentMethods = [
    {
      id: 'upi',
      title: 'UPI Options',
      subtitle: 'Pay directly from your bank account',
      icon: <Smartphone className="h-5 w-5" />,
      methods: ['Google Pay', 'PhonePe', 'Paytm', 'BHIM UPI']
    },
    {
      id: 'cards',
      title: 'Credit & Debit Cards',
      subtitle: 'Visa, Mastercard, Amex, Rupay',
      icon: <CreditCard className="h-5 w-5" />,
      methods: ['Credit Card', 'Debit Card']
    },
    {
      id: 'emi',
      title: 'EMI',
      subtitle: 'NO COST EMI',
      icon: <Wallet className="h-5 w-5" />,
      methods: ['EMI Options']
    },
    {
      id: 'netbanking',
      title: 'Net Banking',
      subtitle: '40+ banks available',
      icon: <Building2 className="h-5 w-5" />,
      methods: ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'SBI', 'View All Banks']
    },
    {
      id: 'paylater',
      title: 'Pay Later',
      subtitle: 'Lazypay, Amazon Pay Later',
      icon: <Wallet className="h-5 w-5" />,
      methods: ['Lazypay', 'Amazon Pay Later']
    },
    {
      id: 'giftcards',
      title: 'Gift Cards & e-wallets',
      subtitle: 'MMT Gift Cards, Amazon Pay',
      icon: <Wallet className="h-5 w-5" />,
      methods: ['MMT Gift Cards', 'Amazon Pay']
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="h-6 w-6 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Payment</h1>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Flight/Hotel Details Block */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {bookingSummary.bookingType === 'hotel' ? 'Hotel Details' : 'Flight Details'}
              </h2>
              {bookingSummary.bookingType === 'hotel' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{bookingSummary.flight.name || 'Hotel'}</p>
                      <p className="text-sm text-gray-600">{bookingSummary.flight.location || 'Location'}</p>
                    </div>
                  </div>
                  <div className="flex space-x-6 text-sm text-gray-600 pt-3 border-t border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Check-in</p>
                      <p className="font-medium text-gray-900">{bookingSummary.flight.checkIn || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 mb-1">Check-out</p>
                      <p className="font-medium text-gray-900">{bookingSummary.flight.checkOut || 'N/A'}</p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 pt-3 border-t border-gray-200">
                    <p className="font-medium">Passenger: {formatPassengerName(bookingSummary.passenger.name, bookingSummary.passenger.gender)}</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-lg font-semibold text-gray-900">{bookingSummary.flight.route || 'Route'}</p>
                      <p className="text-sm text-gray-600">
                        {bookingSummary.flight.date || 'Date'} • {bookingSummary.flight.time || 'Time'}
                      </p>
                    </div>
                  </div>
                  <div className="text-sm text-gray-700 pt-3 border-t border-gray-200">
                    <p className="font-medium">Passenger: {formatPassengerName(bookingSummary.passenger.name, bookingSummary.passenger.gender)}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Insurance / Add-ons Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Worry Free Travel!</h3>
              <div className={`border-2 rounded-lg p-4 ${selectedInsurance ? 'border-blue-600 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900 mb-2">
                      Get ₹1000 if your flight's delayed by 1+ hr for any reason.
                    </h4>
                    <p className="text-sm text-gray-600 mb-2">
                      NOTE: 30% of domestic flights were delayed last month.
                    </p>
                    <a href="#" className="text-sm text-blue-600 hover:underline">View T&Cs</a>
                  </div>
                  <button
                    onClick={() => setSelectedInsurance(!selectedInsurance)}
                    className={`ml-4 px-4 py-2 rounded-lg font-semibold transition-colors ${
                      selectedInsurance
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {selectedInsurance ? 'Added' : 'Add @ ₹99'}
                  </button>
                </div>
              </div>
            </div>

            {/* Payment Options Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Payment Options</h3>
              <div className="space-y-4">
                {paymentMethods.map((method) => (
                  <div key={method.id} className="border border-gray-200 rounded-lg p-4 hover:border-blue-400 transition-colors">
                    <div className="flex items-center justify-between cursor-pointer"
                      onClick={() => setSelectedPaymentMethod(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${selectedPaymentMethod === method.id ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          {method.icon}
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{method.title}</h4>
                          <p className="text-sm text-gray-600">{method.subtitle}</p>
                        </div>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        selectedPaymentMethod === method.id
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300'
                      }`}>
                        {selectedPaymentMethod === method.id && (
                          <div className="w-2 h-2 rounded-full bg-white"></div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Payment Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-24">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h3>
              
              <div className="space-y-3 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Price</span>
                  <span className="text-gray-900 font-medium">
                    <IndianRupee className="h-3 w-3 inline" />
                    {baseAmount.toLocaleString('en-IN')}
                  </span>
                </div>
                {selectedInsurance && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Flight Delay Protection</span>
                    <span className="text-gray-900 font-medium">
                      <IndianRupee className="h-3 w-3 inline" />
                      99
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Convenience fee</span>
                  <span className="text-gray-900 font-medium">
                    <IndianRupee className="h-3 w-3 inline" />
                    {convenienceFee}
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">Total Due</span>
                    <span className="text-2xl font-bold text-gray-900">
                      <IndianRupee className="h-5 w-5 inline" />
                      {totalAmount.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Convenience fee added</p>
                </div>
              </div>

              <button
                onClick={handlePayment}
                disabled={!selectedPaymentMethod}
                className={`w-full py-3 px-4 rounded-lg font-semibold text-white transition-colors ${
                  selectedPaymentMethod
                    ? 'bg-blue-600 hover:bg-blue-700'
                    : 'bg-gray-300 cursor-not-allowed'
                }`}
              >
                <Lock className="h-4 w-4 inline mr-2" />
                Pay Securely
              </button>

              <div className="mt-4 flex items-center justify-center space-x-2 text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
