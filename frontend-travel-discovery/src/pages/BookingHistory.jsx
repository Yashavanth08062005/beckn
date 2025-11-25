import React, { useEffect, useState } from 'react';
import {
  IndianRupee,
  Plane,
  Hotel,
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Clock,
  Trash2,
  Home,
  Bus
} from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ensureLoggedInOrRedirect } from '../utils/authGuard'; // 🔒 NEW IMPORT

export default function BookingHistory() {
  const [allBookings, setAllBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const filterType = searchParams.get('type'); // 'hotel' | 'flight' | 'bus'

  const clean = (v) => (v || '').toString().trim().toLowerCase();
  const normDate = (v) => (v ? v.toString().slice(0, 10) : '');
  const normTime = (v) => (v ? v.toString().trim() : '');

  // 🔒 AUTH GUARD: user required to view history
  useEffect(() => {
    ensureLoggedInOrRedirect(navigate);
  }, [navigate]);

  // 🔑 1) Stable key: same booking ko ek hi baar allow karenge
  const getStableKey = (b) => {
    if (!b) return 'unknown';

    const type = clean(b.bookingType);
    const email = clean(b.email);
    const mobile = clean(b.mobile);
    const amount = String(b.amount || '');

    if (type === 'hotel') {
      return [
        'hotel',
        clean(b.hotelName),
        normDate(b.checkIn),
        normDate(b.checkOut),
        email,
        mobile,
        amount
      ].join('|');
    }

    if (type === 'bus') {
      const route =
        clean(b.route) ||
        `${clean(b.from)}-${clean(b.to)}` ||
        `${clean(b.origin)}-${clean(b.destination)}`;

      return [
        'bus',
        route,
        normDate(b.date),
        normTime(b.time),
        email,
        mobile,
        amount
      ].join('|');
    }

    // default: flight
    const route =
      clean(b.route) ||
      `${clean(b.from)}-${clean(b.to)}` ||
      `${clean(b.origin)}-${clean(b.destination)}`;

    return [
      'flight',
      route,
      normDate(b.date),
      normTime(b.time),
      email,
      mobile,
      amount
    ].join('|');
  };

  // 🧹 2) Dedupe: same key => first one only
  const dedupeBookings = (list) => {
    const map = new Map();
    for (const b of list || []) {
      const key = getStableKey(b);
      if (!map.has(key)) {
        map.set(key, b);
      }
    }
    return Array.from(map.values());
  };

  useEffect(() => {
    try {
      const raw = localStorage.getItem('bookings');
      if (raw) {
        let bookingsData = JSON.parse(raw) || [];

        // ❌ duplicates hatao (flight + hotel + bus sab types)
        bookingsData = dedupeBookings(bookingsData);

        // latest booking upar dikhane ke liye sort
        bookingsData.sort((a, b) => {
          const da = new Date(a.bookingDate || 0).getTime();
          const db = new Date(b.bookingDate || 0).getTime();
          return db - da;
        });

        setAllBookings(bookingsData);

        if (filterType) {
          const filtered = bookingsData.filter(
            (b) => clean(b.bookingType) === clean(filterType)
          );
          setFilteredBookings(filtered);
        } else {
          setFilteredBookings(bookingsData);
        }

        // ✅ cleaned list ko localStorage me save karo
        localStorage.setItem('bookings', JSON.stringify(bookingsData));
      } else {
        setAllBookings([]);
        setFilteredBookings([]);
      }
    } catch (e) {
      console.error('Failed to read bookings', e);
    }
  }, [filterType]);

  const handleClear = () => {
    const message = filterType
      ? `Are you sure you want to clear all ${filterType} booking history? This action cannot be undone.`
      : 'Are you sure you want to clear all booking history? This action cannot be undone.';

    if (!confirm(message)) return;

    if (filterType) {
      const remaining = allBookings.filter(
        (b) => clean(b.bookingType) !== clean(filterType)
      );
      localStorage.setItem('bookings', JSON.stringify(remaining));
      setAllBookings(remaining);
      setFilteredBookings([]);
    } else {
      localStorage.removeItem('bookings');
      setAllBookings([]);
      setFilteredBookings([]);
    }
  };

  const bookings = filteredBookings;

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return dateString;
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateString;
    }
  };

  const getTitle = () => {
    if (filterType === 'hotel') return 'Hotel Booking History';
    if (filterType === 'flight') return 'Flight Booking History';
    if (filterType === 'bus') return 'Bus Booking History';
    return 'Booking History';
  };

  const getTypeLabel = (type) => {
    const t = clean(type);
    if (t === 'hotel') return 'Hotel';
    if (t === 'bus') return 'Bus';
    return 'Flight';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {getTitle()}
              </h1>
              <p className="text-gray-600">
                {bookings.length === 0
                  ? filterType
                    ? `No ${filterType} bookings yet. Start booking to see your history here.`
                    : 'No bookings yet. Start booking to see your history here.'
                  : `You have ${bookings.length} ${filterType ? filterType : ''} booking${
                      bookings.length > 1 ? 's' : ''
                    } in your history.`}
              </p>
              {!filterType && (
                <div className="flex flex-wrap gap-3 mt-4">
                  <button
                    onClick={() => navigate('/booking-history?type=flight')}
                    className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Show Flights Only
                  </button>
                  <button
                    onClick={() => navigate('/booking-history?type=hotel')}
                    className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Show Hotels Only
                  </button>
                  <button
                    onClick={() => navigate('/booking-history?type=bus')}
                    className="px-4 py-2 bg-orange-100 hover:bg-orange-200 text-orange-800 rounded-lg text-sm font-semibold transition-colors"
                  >
                    Show Buses Only
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
              >
                <Home className="h-4 w-4" />
                <span>Home</span>
              </button>
              {bookings.length > 0 && (
                <button
                  onClick={handleClear}
                  className="flex items-center space-x-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Clear All</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-gray-100 p-6">
                <Calendar className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No Bookings Found
            </h3>
            <p className="text-gray-600 mb-6">
              Start booking flights, hotels or buses to see them here.
            </p>
            <button
              onClick={() => navigate('/')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Start Booking
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => (
              <div
                key={getStableKey(b)}
                className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start space-x-4">
                    <div
                      className={`rounded-full p-3 ${
                        clean(b.bookingType) === 'hotel'
                          ? 'bg-blue-100'
                          : clean(b.bookingType) === 'bus'
                          ? 'bg-orange-100'
                          : 'bg-green-100'
                      }`}
                    >
                      {clean(b.bookingType) === 'hotel' ? (
                        <Hotel className="h-6 w-6 text-blue-600" />
                      ) : clean(b.bookingType) === 'bus' ? (
                        <Bus className="h-6 w-6 text-orange-600" />
                      ) : (
                        <Plane className="h-6 w-6 text-green-600" />
                      )}
                    </div>
                    <div>
                      <div className="flex items-center flex-wrap gap-2 mb-1">
                        <h3 className="text-xl font-bold text-gray-900">
                          {b.name}
                        </h3>
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            clean(b.bookingType) === 'hotel'
                              ? 'bg-blue-100 text-blue-800'
                              : clean(b.bookingType) === 'bus'
                              ? 'bg-orange-100 text-orange-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {getTypeLabel(b.bookingType)}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <User className="h-4 w-4" />
                          <span>
                            Age: {b.age}, {b.gender}
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Mail className="h-4 w-4" />
                          <span>{b.email}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Phone className="h-4 w-4" />
                          <span>{b.mobile}</span>
                        </div>
                        {b.state && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{b.state}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center justify-end mb-2">
                      <IndianRupee className="h-6 w-6 text-gray-700" />
                      <span className="text-3xl font-bold text-gray-900 ml-1">
                        {Number(b.amount || 0).toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      Booked: {formatDate(b.bookingDate)}
                    </div>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="border-t border-gray-200 pt-4 mt-4">
                  {clean(b.bookingType) === 'hotel' ? (
                    // HOTEL DETAILS
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">
                          Hotel:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.hotelName || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Location:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.location || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Check-in:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.checkIn || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Check-out:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.checkOut || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Nights:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.nights || 1}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Rooms:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.rooms || 1}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Guests:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.guests || 1}
                        </span>
                      </div>
                      <div className="md:col-span-2">
                        <span className="font-semibold text-gray-700">
                          Duration:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.datetime || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : clean(b.bookingType) === 'bus' ? (
                    // BUS DETAILS
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">
                          Route:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.route || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Date:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.date || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Time:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.time || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Bus Operator:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.busName || b.operator || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Seat:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.seatNumber || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Duration:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.duration || 'N/A'}
                        </span>
                      </div>
                      <div className="md:col-span-3">
                        <span className="font-semibold text-gray-700">
                          Full Schedule:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.datetime || 'N/A'}
                        </span>
                      </div>
                    </div>
                  ) : (
                    // FLIGHT DETAILS
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-700">
                          Route:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.route || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Date:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.date || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Time:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.time || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Airline:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.airline || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Flight Number:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.flightNumber || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-700">
                          Duration:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.duration || 'N/A'}
                        </span>
                      </div>
                      <div className="md:col-span-3">
                        <span className="font-semibold text-gray-700">
                          Full Schedule:
                        </span>
                        <span className="text-gray-900 ml-2">
                          {b.datetime || 'N/A'}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
