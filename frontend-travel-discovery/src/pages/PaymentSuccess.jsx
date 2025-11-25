import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle2, IndianRupee, Home, History } from 'lucide-react';

const defaultFlight = {
  route: 'Mumbai → Bengaluru',
  date: '2025-11-20',
  time: '08:30',
  duration: '1h 20m',
  airline: 'IndiGo',
  flightNumber: '6E-123',
  baggageCabin: '7kg',
  baggageChecked: '15kg',
  amount: 11000,
};

const API_BASE = 'http://localhost:8081';

export default function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();

  const [bookingSummary, setBookingSummary] = useState(null);
  const [showSummary, setShowSummary] = useState(false);
  const [bookings, setBookings] = useState([]);

  // ✅ ye flag ensure karega ki payment sirf 1 hi baar DB me save ho
  const hasSavedToDb = useRef(false);

  useEffect(() => {
    // Agar state hi nahi mila (direct refresh / direct URL open)
    if (!location || !location.state || !location.state.bookingSummary) {
      // direct /payment-success par aaye ho to home bhej do
      navigate('/');
      return;
    }

    // React StrictMode / double render se bachne ke liye
    if (hasSavedToDb.current) {
      // pehle hi save ho chuka, dobara mat chalao
      return;
    }
    hasSavedToDb.current = true;

    const init = async () => {
      const summary = location.state.bookingSummary;
      setBookingSummary(summary);

      // Existing bookings load karo
      let existingBookings = [];
      try {
        const raw = localStorage.getItem('bookings');
        if (raw) existingBookings = JSON.parse(raw);
      } catch (e) {
        console.error('Failed to load bookings', e);
      }

      // PNR / Booking ID generate
      const generatePNR = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let pnr = '';
        for (let i = 0; i < 6; i++) {
          pnr += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return `TRV${pnr}`;
      };

      // flight seat number
      const generateSeatNumber = () => {
        const rows = [
          1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
          11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
          21, 22, 23, 24, 25, 26, 27, 28, 29, 30
        ];
        const seats = ['A', 'B', 'C', 'D', 'E', 'F'];
        const row = rows[Math.floor(Math.random() * rows.length)];
        const seat = seats[Math.floor(Math.random() * seats.length)];
        return `${row}${seat}`;
      };

      const pnr = generatePNR();
      const seatNumber =
        summary.bookingType === 'flight' ? generateSeatNumber() : null;

      // Booking entry banake localStorage me daalo
      const newEntry = {
        id: Date.now(),
        pnr: pnr,
        seatNumber: seatNumber,
        name: summary.passenger.name,
        age: summary.passenger.age,
        gender: summary.passenger.gender,
        email: summary.contact.email,
        mobile: summary.contact.mobile,
        state: summary.contact.state,
        bookingType: summary.bookingType,
        ...(summary.bookingType === 'flight'
          ? {
              route: summary.flight.route || defaultFlight.route,
              date: summary.flight.date || defaultFlight.date,
              time: summary.flight.time || defaultFlight.time,
              duration: summary.flight.duration || defaultFlight.duration,
              airline: summary.flight.airline || defaultFlight.airline,
              flightNumber:
                summary.flight.flightNumber || defaultFlight.flightNumber,
              datetime: `${
                summary.flight.date || defaultFlight.date
              } ${summary.flight.time || defaultFlight.time}`,
            }
          : {
              hotelName: summary.flight.name || 'Hotel',
              location: summary.flight.location || 'Location',
              checkIn: summary.flight.checkIn || '',
              checkOut: summary.flight.checkOut || '',
              nights: summary.flight.nights || 1,
              rooms: summary.flight.rooms || 1,
              guests: summary.flight.guests || 1,
              datetime: `${summary.flight.checkIn || ''} to ${
                summary.flight.checkOut || ''
              }`,
            }),
        amount:
          summary.totalAmount ||
          summary.flight.amount ||
          defaultFlight.amount,
        bookingDate: summary.bookingDate || new Date().toISOString(),
      };

      // PNR & seat number ko summary me bhi add karo
      summary.pnr = pnr;
      summary.seatNumber = seatNumber;
      setBookingSummary({ ...summary });

      const updated = [newEntry, ...existingBookings];
      setBookings(updated);
      try {
        localStorage.setItem('bookings', JSON.stringify(updated));
      } catch (err) {
        console.error('Failed to save booking', err);
      }

      // ✅ DB me payment record save karo (sirf 1 baar)
      try {
        // logged-in user ka id nikaalo (tumhare project me jo bhi key hai)
        let userId = 'guest';
        try {
          const rawUser = localStorage.getItem('user');
          if (rawUser) {
            const user = JSON.parse(rawUser);
            userId =
              user.id ||
              user.user_id ||
              user._id ||
              user.email ||
              'guest';
          }
        } catch (e) {
          console.error('Error reading user from localStorage', e);
        }

        await fetch(`${API_BASE}/api/payments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            booking_type: summary.bookingType || 'flight',
            amount:
              summary.totalAmount ||
              summary.flight.amount ||
              defaultFlight.amount,
            currency: 'INR',
            status: 'SUCCESS',
            // payment_id ko pnr se tie kar diya, taaki unique rahe
            payment_id: pnr,
          }),
        });
      } catch (err) {
        console.error('Failed to save payment in DB', err);
      }

      // pehle popup dikhana hai, isliye showSummary ko false hi rakho
      setShowSummary(false);
    };

    init();
  }, [location, navigate]);

  if (!bookingSummary) {
    return null;
  }

  const handleClosePopup = () => {
    setShowSummary(true);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Success Popup Modal */}
        {!showSummary && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 transform transition-all">
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-green-100 p-4">
                    <CheckCircle2 className="h-12 w-12 text-green-600" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  Your payment has been processed successfully. Booking
                  confirmed!
                </p>
                <button
                  onClick={handleClosePopup}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  View Booking Details
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Booking Summary - Display Details After Popup */}
        {showSummary && bookingSummary && (
          <div className="mt-6 space-y-6">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-xl p-6 shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <h2 className="text-3xl font-bold text-gray-900">
                  Booking Confirmed Successfully!
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Passenger Details */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Passenger Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Name:
                      </span>
                      <span className="text-gray-900">
                        {bookingSummary.passenger.name}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Age:
                      </span>
                      <span className="text-gray-900">
                        {bookingSummary.passenger.age} years
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Gender:
                      </span>
                      <span className="text-gray-900">
                        {bookingSummary.passenger.gender}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                    Contact Details
                  </h3>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Email:
                      </span>
                      <span className="text-gray-900">
                        {bookingSummary.contact.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        Mobile:
                      </span>
                      <span className="text-gray-900">
                        {bookingSummary.contact.mobile}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium text-gray-600">
                        State:
                      </span>
                      <span className="text-gray-900">
                        {bookingSummary.contact.state}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Booking Reference Info */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  Booking Reference
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-600">
                      {bookingSummary.bookingType === 'hotel'
                        ? 'Booking ID'
                        : 'PNR'}
                      :
                    </span>
                    <span className="text-gray-900 font-semibold text-base">
                      {bookingSummary.pnr || 'N/A'}
                    </span>
                  </div>
                  {bookingSummary.bookingType === 'flight' &&
                    bookingSummary.seatNumber && (
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-gray-600">
                          Seat Number:
                        </span>
                        <span className="text-gray-900 font-semibold text-base">
                          {bookingSummary.seatNumber}
                        </span>
                      </div>
                    )}
                </div>
              </div>

              {/* Flight/Hotel Details */}
              <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b border-gray-200">
                  {bookingSummary.bookingType === 'hotel'
                    ? 'Hotel Details'
                    : 'Flight Details'}
                </h3>
                <div className="space-y-3 text-sm">
                  {bookingSummary.bookingType === 'hotel' ? (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Hotel Name:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.name || 'Hotel'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Location:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.location || 'Location'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Check-in Date:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.checkIn || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Check-out Date:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.checkOut || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Nights:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.nights || 1}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Rooms:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.rooms || 1}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Guests:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.guests || 1}
                        </span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Route:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.route || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Date:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.date || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Time:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.time || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Duration:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.duration || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Airline:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.airline || 'N/A'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-600">
                          Flight Number:
                        </span>
                        <span className="text-gray-900">
                          {bookingSummary.flight.flightNumber || 'N/A'}
                        </span>
                      </div>
                    </>
                  )}
                  <div className="flex justify-between pt-3 border-t border-gray-200 mt-3">
                    <span className="font-semibold text-base text-gray-900">
                      Total Amount Paid:
                    </span>
                    <div className="flex items-center">
                      <IndianRupee className="h-5 w-5 text-gray-900" />
                      <span className="text-2xl font-bold text-green-700 ml-1">
                        {(
                          bookingSummary.totalAmount ||
                          bookingSummary.flight.amount ||
                          0
                        ).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                  {bookingSummary.insurance && (
                    <div className="text-xs text-gray-600 pt-2">
                      * Includes Flight Delay Protection
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-green-300 flex justify-center space-x-4">
                <button
                  onClick={() => navigate('/')}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <Home className="h-4 w-4" />
                  <span>Back to Home</span>
                </button>
                <button
                  onClick={() =>
                    navigate(
                      `/booking-history?type=${
                        bookingSummary.bookingType || 'flight'
                      }`
                    )
                  }
                  className="bg-gray-600 hover:bg-gray-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors flex items-center space-x-2"
                >
                  <History className="h-4 w-4" />
                  <span>View Booking History</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
