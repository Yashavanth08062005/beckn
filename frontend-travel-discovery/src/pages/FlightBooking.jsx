import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { IndianRupee } from 'lucide-react';
import { ensureLoggedInOrRedirect } from '../utils/authGuard'; // 🔒 NEW IMPORT

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

const states = ['Karnataka','Maharashtra','Delhi','Tamil Nadu','Kerala','Goa','Rajasthan','West Bengal'];

export default function FlightBooking() {
  const location = useLocation();
  const navigate = useNavigate();

  const [flight, setFlight] = useState(defaultFlight);
  const [bookingType, setBookingType] = useState('flight'); // 'flight', 'hotel', or 'bus'
  const [form, setForm] = useState({ fullName: '', age: '', gender: '', mobile: '', email: '', state: 'Karnataka' });
  const [errors, setErrors] = useState({});
  const [bookingSummary, setBookingSummary] = useState(null);
  const [bookings, setBookings] = useState([]);

  // 🔒 AUTH GUARD: page level protection (NO direct alert here)
  useEffect(() => {
    const ok = ensureLoggedInOrRedirect(navigate);
    // agar ok === false, navigate ho chuka hoga /login pe
  }, [navigate]);

  useEffect(() => {
    // If navigated with a selected flight/hotel, use it
    const option = location?.state?.travelOption || location?.state?.flight;
    if (option) {
      const details = option.details || {};
      
      // Determine if it's a hotel or flight
      const isHotel = option.travelMode === 'hotel' || (!option.travelMode && option.checkIn);
      const isBus = option.travelMode === 'bus';
      
      if (isHotel) {
        setBookingType('hotel');
        // Map hotel data
        const mappedFlight = {
          name: details.name || option.name || 'Hotel',
          location: details.cityName || option.cityCode || details.address?.city || 'Location',
          checkIn: option.checkIn || details.checkIn || '',
          checkOut: option.checkOut || details.checkOut || '',
          nights: details.nights || option.nights || 1,
          rooms: details.rooms || option.rooms || 1,
          guests: details.adults || option.adults || 1,
          amount: option.price || details.price || option.amount || defaultFlight.amount,
          pricePerNight: option.pricePerNight || details.pricePerNight || 0,
        };
        setFlight(mappedFlight);
      } else if (isBus) {
        setBookingType('bus');
        const mappedBus = {
          route: details.originCity && details.destinationCity ? `${details.originCity} → ${details.destinationCity}` : details.route || option.origin || option.destination || 'Route',
          date: option.date || details.departureTime?.split('T')[0] || defaultFlight.date,
          time: details.departureTime?.split('T')[1]?.split(':').slice(0, 2).join(':') || option.time || defaultFlight.time,
          duration: details.duration || option.duration || defaultFlight.duration,
          operator: details.airline || option.provider || defaultFlight.airline,
          vehicleNumber: details.flightNumber || option.id || 'BUS-000',
          baggage: details.baggage || '15kg',
          amount: option.price || details.price || option.amount || defaultFlight.amount,
        };
        setFlight(mappedBus);
      } else {
        setBookingType('flight');
        // Map the option data to flight format
        const mappedFlight = {
          route: details.route || `${option.origin || details.departureAirport || 'Origin'} → ${option.destination || details.arrivalAirport || 'Destination'}`,
          date: option.date || details.departureTime?.split('T')[0] || defaultFlight.date,
          time: details.departureTime?.split('T')[1]?.split(':').slice(0, 2).join(':') || option.time || defaultFlight.time,
          duration: details.duration || option.duration || defaultFlight.duration,
          airline: details.airline || option.airline || defaultFlight.airline,
          flightNumber: details.flightNumber || option.flightNumber || defaultFlight.flightNumber,
          baggageCabin: details.baggageCabin || option.baggageCabin || defaultFlight.baggageCabin,
          baggageChecked: details.baggageChecked || option.baggageChecked || defaultFlight.baggageChecked,
          amount: option.price || details.price || option.amount || defaultFlight.amount,
        };
        setFlight(mappedFlight);
      }
    }
    // load existing bookings from localStorage
    try {
      const raw = localStorage.getItem('bookings');
      if (raw) setBookings(JSON.parse(raw));
    } catch (e) {
      // ignore
    }
  }, [location]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};
    const currentForm = form; // Use current form state
    
    if (!currentForm.fullName || currentForm.fullName.trim() === '') {
      newErrors.fullName = 'Full name is required';
    }
    
    if (!currentForm.age || String(currentForm.age).trim() === '') {
      newErrors.age = 'Age is required';
    } else {
      const ageNum = parseInt(currentForm.age);
      if (isNaN(ageNum) || ageNum < 1 || ageNum > 150) {
        newErrors.age = 'Please enter a valid age';
      }
    }
    
    if (!currentForm.gender || currentForm.gender === '') {
      newErrors.gender = 'Gender is required';
    }
    
    if (!currentForm.mobile || currentForm.mobile.trim() === '') {
      newErrors.mobile = 'Mobile number is required';
    } else {
      const mobileDigits = currentForm.mobile.replace(/\D/g, '');
      if (!/^[0-9]{10}$/.test(mobileDigits)) {
        newErrors.mobile = 'Please enter a valid 10-digit mobile number';
      }
    }
    
    if (!currentForm.email || currentForm.email.trim() === '') {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(currentForm.email.trim())) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!currentForm.state || currentForm.state === '') {
      newErrors.state = 'State is required';
    }
    
    setErrors(newErrors);
    const isValid = Object.keys(newErrors).length === 0;
    return isValid;
  };

  const handleContinue = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Extra safety: agar kisi tarah yahan aaya ho bina login:
    const ok = ensureLoggedInOrRedirect(navigate);
    if (!ok) return;
    
    console.log('Continue button clicked');
    console.log('Form data:', form);
    
    const isValid = validate();
    console.log('Validation result:', isValid);
    console.log('Errors:', errors);
    
    if (!isValid) {
      console.log('Validation failed, showing errors');
      return;
    }

    console.log('Validation passed, creating summary...');

    const summary = {
      passenger: { name: form.fullName, age: form.age, gender: form.gender },
      contact: { mobile: form.mobile, email: form.email, state: form.state },
      flight,
      bookingType,
      bookingDate: new Date().toISOString(),
    };
    
    console.log('Booking summary created:', summary);
    setBookingSummary(summary);

    // Create booking entry (will be saved after payment success)
    const newEntry = {
      id: Date.now(),
      name: form.fullName,
      age: form.age,
      gender: form.gender,
      email: form.email,
      mobile: form.mobile,
      state: form.state,
      bookingType,
      ...(bookingType === 'flight' ? {
        route: flight.route || defaultFlight.route,
        date: flight.date || defaultFlight.date,
        time: flight.time || defaultFlight.time,
        duration: flight.duration || defaultFlight.duration,
        airline: flight.airline || defaultFlight.airline,
        flightNumber: flight.flightNumber || defaultFlight.flightNumber,
        datetime: `${flight.date || defaultFlight.date} ${flight.time || defaultFlight.time}`,
      } : {
        hotelName: flight.name || 'Hotel',
        location: flight.location || 'Location',
        checkIn: flight.checkIn || '',
        checkOut: flight.checkOut || '',
        nights: flight.nights || 1,
        rooms: flight.rooms || 1,
        guests: flight.guests || 1,
        datetime: `${flight.checkIn || ''} to ${flight.checkOut || ''}`,
      }),
      amount: flight.amount || defaultFlight.amount,
      bookingDate: summary.bookingDate,
    };
    
    console.log('Navigating to payment page...');
    
    // Navigate to payment page
    navigate('/payment', {
      state: { bookingSummary: summary }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          {bookingType === 'hotel' ? 'Hotel Booking' : 'Flight Booking'}
        </h1>

        {/* Booking Summary Card */}
        {!bookingSummary && (
          <div className="bg-white shadow-lg rounded-xl p-6 mb-6">
            {bookingType === 'hotel' ? (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Hotel</div>
                  <div className="text-xl font-semibold text-gray-900">{flight.name || 'Hotel'}</div>
                  <div className="text-sm text-gray-600 mt-1">{flight.location || 'Location'}</div>
                  <div className="text-sm text-gray-600 mt-2">
                    Check-in: {flight.checkIn || 'N/A'} • Check-out: {flight.checkOut || 'N/A'}
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    {flight.nights || 1} Night(s) • {flight.rooms || 1} Room(s) • {flight.guests || 1} Guest(s)
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-6 w-6 text-gray-700" />
                    <div className="text-3xl font-bold ml-1 text-gray-900">
                      {(flight.amount || defaultFlight.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                  {flight.pricePerNight && (
                    <div className="text-xs text-gray-500 mt-1">
                      ₹{flight.pricePerNight.toLocaleString('en-IN')} per night
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-gray-500 mb-1">Route</div>
                  <div className="text-xl font-semibold text-gray-900">{flight.route || defaultFlight.route}</div>
                  <div className="text-sm text-gray-600 mt-1">
                    {flight.date || defaultFlight.date} • {flight.time || defaultFlight.time} • {flight.duration || defaultFlight.duration}
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    {flight.airline || defaultFlight.airline} • {flight.flightNumber || defaultFlight.flightNumber}
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end">
                    <IndianRupee className="h-6 w-6 text-gray-700" />
                    <div className="text-3xl font-bold ml-1 text-gray-900">
                      {(flight.amount || defaultFlight.amount).toLocaleString('en-IN')}
                    </div>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Cabin {flight.baggageCabin || defaultFlight.baggageCabin} • Checked {flight.baggageChecked || defaultFlight.baggageChecked}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Traveller Details Form */}
        {!bookingSummary && (
          <div className="bg-white shadow-lg rounded-xl p-6">
            <h2 className="text-xl font-semibold mb-6 text-gray-900">Traveller Details</h2>
            <form onSubmit={handleContinue} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your full name"
                  />
                  {errors.fullName && (
                    <div className="text-xs text-red-600 mt-1">{errors.fullName}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Age *
                  </label>
                  <input
                    type="number"
                    name="age"
                    value={form.age}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="Enter your age"
                  />
                  {errors.age && (
                    <div className="text-xs text-red-600 mt-1">{errors.age}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gender *
                  </label>
                  <select
                    name="gender"
                    value={form.gender}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && (
                    <div className="text-xs text-red-600 mt-1">{errors.gender}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    name="mobile"
                    value={form.mobile}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="10-digit mobile number"
                  />
                  {errors.mobile && (
                    <div className="text-xs text-red-600 mt-1">{errors.mobile}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && (
                    <div className="text-xs text-red-600 mt-1">{errors.email}</div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    State *
                  </label>
                  <select
                    name="state"
                    value={form.state}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  >
                    {states.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && (
                    <div className="text-xs text-red-600 mt-1">{errors.state}</div>
                  )}
                </div>
              </div>

              <div className="flex justify-end pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}
