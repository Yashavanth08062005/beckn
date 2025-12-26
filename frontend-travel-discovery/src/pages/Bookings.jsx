import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Plane, Hotel, Calendar, MapPin, IndianRupee, Download, Eye, Loader, AlertCircle, Bus } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';

const Bookings = () => {
    const navigate = useNavigate();
    const { user, isAuthenticated } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all'); // 'all', 'flight', 'hotel', 'bus'

    useEffect(() => {
        if (!isAuthenticated) {
            navigate('/login');
            return;
        }

        fetchBookings();
    }, [isAuthenticated, navigate]);

    const fetchBookings = async () => {
        try {
            setLoading(true);
            setError('');
            const API_BASE_URL = import.meta.env.VITE_BAP_URL || 'http://localhost:8081';

            // Fetch by user ID if available, otherwise by email
            const endpoint = user?.id
                ? `/api/bookings/user/${user.id}`
                : `/api/bookings/email/${user?.email}`;

            console.log('📥 Fetching bookings from:', `${API_BASE_URL}${endpoint}`);

            const response = await axios.get(`${API_BASE_URL}${endpoint}`);

            console.log('✅ Bookings fetched:', response.data);
            setBookings(response.data.bookings || []);
            setLoading(false);

        } catch (err) {
            console.error('❌ Error fetching bookings:', err);
            setError(err.response?.data?.error || 'Failed to fetch bookings');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
        } catch {
            return dateString;
        }
    };

    const formatDateOnly = (dateString) => {
        if (!dateString) return 'N/A';
        try {
            return format(new Date(dateString), 'dd MMM yyyy');
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status) => {
        switch (status?.toUpperCase()) {
            case 'CONFIRMED':
                return 'bg-green-100 text-green-800';
            case 'CANCELLED':
                return 'bg-red-100 text-red-800';
            case 'COMPLETED':
                return 'bg-blue-100 text-blue-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredBookings = bookings.filter(booking => {
        if (filter === 'all') return true;
        return booking.booking_type === filter;
    });

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader className="animate-spin h-12 w-12 text-blue-600 mx-auto mb-4" />
                    <p className="text-gray-600">Loading your bookings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Bookings</h1>
                    <p className="text-gray-600">View and manage all your travel bookings</p>
                </div>

                {/* Filter Tabs */}
                <div className="mb-6 flex space-x-2 border-b border-gray-200">
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-3 font-medium transition-colors ${filter === 'all'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        All Bookings ({bookings.length})
                    </button>
                    <button
                        onClick={() => setFilter('flight')}
                        className={`px-6 py-3 font-medium transition-colors ${filter === 'flight'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Flights ({bookings.filter(b => b.booking_type === 'flight').length})
                    </button>
                    <button
                        onClick={() => setFilter('hotel')}
                        className={`px-6 py-3 font-medium transition-colors ${filter === 'hotel'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Hotels ({bookings.filter(b => b.booking_type === 'hotel').length})
                    </button>
                    <button
                        onClick={() => setFilter('bus')}
                        className={`px-6 py-3 font-medium transition-colors ${filter === 'bus'
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                    >
                        Buses ({bookings.filter(b => b.booking_type === 'bus').length})
                    </button>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                        <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                        <span className="text-red-800">{error}</span>
                    </div>
                )}

                {/* Bookings List */}
                {filteredBookings.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <div className="text-gray-400 mb-4">
                            {filter === 'flight' ? (
                                <Plane className="h-16 w-16 mx-auto" />
                            ) : filter === 'hotel' ? (
                                <Hotel className="h-16 w-16 mx-auto" />
                            ) : filter === 'bus' ? (
                                <Bus className="h-16 w-16 mx-auto" />
                            ) : (
                                <AlertCircle className="h-16 w-16 mx-auto" />
                            )}
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No bookings found
                        </h3>
                        <p className="text-gray-600 mb-6">
                            {filter === 'all'
                                ? "You haven't made any bookings yet"
                                : `You haven't booked any ${filter}s yet`
                            }
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                        >
                            Start Booking
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredBookings.map((booking) => (
                            <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    {/* Left Section - Booking Details */}
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            {booking.booking_type === 'flight' ? (
                                                <Plane className="h-6 w-6 text-blue-600" />
                                            ) : booking.booking_type === 'hotel' ? (
                                                <Hotel className="h-6 w-6 text-blue-600" />
                                            ) : (
                                                <Bus className="h-6 w-6 text-blue-600" />
                                            )}
                                            <div>
                                                <h3 className="text-lg font-bold text-gray-900">
                                                    {booking.item_name}
                                                </h3>
                                                <p className="text-sm text-gray-600">{booking.item_code}</p>
                                            </div>
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.booking_status)}`}>
                                                {booking.booking_status}
                                            </span>
                                        </div>

                                        {/* Flight & Bus Details (Similar Structure) */}
                                        {(booking.booking_type === 'flight' || booking.booking_type === 'bus') && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 mb-1">Route</p>
                                                    <p className="font-semibold text-gray-900 flex items-center">
                                                        <MapPin className="h-4 w-4 mr-1" />
                                                        {booking.origin} → {booking.destination}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">Departure</p>
                                                    <p className="font-semibold text-gray-900 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {formatDate(booking.departure_time)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">Passenger</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {booking.passenger_name}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Hotel Details */}
                                        {booking.booking_type === 'hotel' && (
                                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-500 mb-1">Check-in</p>
                                                    <p className="font-semibold text-gray-900 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {formatDateOnly(booking.check_in_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">Check-out</p>
                                                    <p className="font-semibold text-gray-900 flex items-center">
                                                        <Calendar className="h-4 w-4 mr-1" />
                                                        {formatDateOnly(booking.check_out_date)}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500 mb-1">Guest</p>
                                                    <p className="font-semibold text-gray-900">
                                                        {booking.passenger_name}
                                                    </p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Booking Reference */}
                                        <div className="mt-3 pt-3 border-t border-gray-200">
                                            <p className="text-xs text-gray-500">
                                                Booking Reference: <span className="font-mono font-semibold text-gray-900">{booking.booking_reference}</span>
                                            </p>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Booked on: {formatDate(booking.created_at)}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right Section - Price & Actions */}
                                    <div className="flex flex-col items-end space-y-3 min-w-[160px]">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 mb-1">Total Amount</p>
                                            <div className="flex items-center space-x-1">
                                                <IndianRupee className="h-5 w-5 text-gray-700" />
                                                <span className="text-2xl font-bold text-gray-900">
                                                    {booking.amount?.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                            <p className="text-xs text-green-600 font-medium mt-1">
                                                {booking.payment_status}
                                            </p>
                                        </div>

                                        <button
                                            onClick={() => navigate('/booking-confirmation', {
                                                state: {
                                                    booking: {
                                                        id: booking.booking_reference,
                                                        transactionId: booking.transaction_id,
                                                        status: booking.booking_status
                                                    },
                                                    flight: booking.item_details,
                                                    passenger: {
                                                        passenger_name: booking.passenger_name,
                                                        email: booking.passenger_email,
                                                        phone: booking.passenger_phone,
                                                        date_of_birth: booking.date_of_birth,
                                                        nationality: booking.nationality,
                                                        passport_number: booking.passport_number,
                                                        address: booking.address_line1,
                                                        city: booking.city,
                                                        state: booking.state,
                                                        pincode: booking.postal_code,
                                                        country: booking.country
                                                    }
                                                }
                                            })}
                                            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 font-semibold transition-colors flex items-center justify-center"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookings;
