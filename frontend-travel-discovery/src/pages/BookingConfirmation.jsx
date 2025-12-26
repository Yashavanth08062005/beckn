import { useLocation, useNavigate } from 'react-router-dom';
import { CheckCircle, Plane, User, MapPin, Phone, Mail, Calendar, Download, Bus } from 'lucide-react';

const BookingConfirmation = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const { booking, flight, passenger, type } = location.state || {}; // type passed from BookinForm

    if (!booking || !flight || !passenger) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <p className="text-gray-600 mb-4">No booking information found</p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                        Go to Home
                    </button>
                </div>
            </div>
        );
    }

    const bookingId = `BK${Date.now().toString().slice(-8)}`;
    const isBus = type === 'bus' ||
        type === 'Bus' ||
        flight?.category_id === 'BUS' ||
        flight?.category_id === 'bus' ||
        flight?.category_id === 'Mobility' ||
        flight?.booking_type === 'bus' ||
        (flight?.descriptor?.code && (flight.descriptor.code.includes('KSRTC') || flight.descriptor.code.includes('KAD') || flight.descriptor.code.includes('VRL'))) ||
        (flight?.details?.name && (flight.details.name.includes('Bus') || flight.details.name.includes('KSRTC') || flight.details.name.includes('Transport')));

    const busLabels = {
        title: 'Bus Ticket Confirmed!',
        subtitle: 'Your bus seat has been successfully booked',
        detailsTitle: 'Bus Details',
        providerLabel: 'Operator',
        vehicleLabel: 'Bus Number',
        deptLabel: 'Boarding Point',
        arrLabel: 'Dropping Point',
        infoTitle: 'Bus Information',
        stationType: 'Stop',
        instructions: [
            '• Please arrive at the boarding point 15 mins before departure',
            '• Carry a valid government-issued photo ID',
            '• Show the ticket SMS/Email to the conductor',
            '• Booking confirmation has been sent to your email'
        ]
    };

    const flightLabels = {
        title: 'Booking Confirmed!',
        subtitle: 'Your flight has been successfully booked',
        detailsTitle: 'Flight Details',
        providerLabel: 'Airline',
        vehicleLabel: 'Flight',
        deptLabel: 'Departure',
        arrLabel: 'Arrival',
        infoTitle: 'Flight Information',
        stationType: 'Airport',
        instructions: [
            '• Please arrive at the airport at least 2 hours before departure',
            '• Carry a valid government-issued photo ID',
            '• Check baggage allowance before packing',
            '• Booking confirmation has been sent to your email',
            '• You can check-in online 24 hours before departure'
        ]
    };

    const labels = isBus ? busLabels : flightLabels;

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Success Header */}
                <div className="bg-white rounded-xl shadow-md p-8 mb-6 text-center">
                    <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        {labels.title}
                    </h1>
                    <p className="text-gray-600 mb-4">
                        {labels.subtitle}
                    </p>
                    <div className="inline-block bg-blue-50 px-6 py-3 rounded-lg">
                        <p className="text-sm text-gray-600">Booking Reference</p>
                        <p className="text-2xl font-bold text-blue-600">{bookingId}</p>
                    </div>
                </div>

                {/* Journey Details */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        {isBus ? (
                            <Bus className="h-6 w-6 mr-2 text-orange-600" />
                        ) : (
                            <Plane className="h-6 w-6 mr-2 text-blue-600" />
                        )}
                        {labels.detailsTitle}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">{labels.providerLabel}</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {flight.details?.airline || flight.descriptor?.name || 'Provider'}
                            </p>
                            <p className="text-sm text-gray-600">
                                {labels.vehicleLabel} {flight.details?.flightNumber || flight.descriptor?.code || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Route</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {flight.details?.departureAirport || flight.origin || 'DEP'}
                                {' → '}
                                {flight.details?.arrivalAirport || flight.destination || 'ARR'}
                            </p>
                            <p className="text-xs text-gray-500">
                                {flight.details?.originCity && flight.details?.destinationCity &&
                                    `${flight.details.originCity} to ${flight.details.destinationCity}`
                                }
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Duration</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {flight.details?.duration || 'N/A'}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Price</p>
                            <p className="text-lg font-semibold text-green-600">
                                ₹{flight.price || '0'}
                            </p>
                        </div>

                        {flight.details?.departureTime && (
                            <div>
                                <p className="text-sm text-gray-500">{labels.deptLabel}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(flight.details.departureTime).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}

                        {flight.details?.arrivalTime && (
                            <div>
                                <p className="text-sm text-gray-500">{labels.arrLabel}</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {new Date(flight.details.arrivalTime).toLocaleString('en-US', {
                                        month: 'short',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 pt-6 border-t">
                        <p className="text-sm text-gray-500 mb-2">{labels.infoTitle}</p>
                        <div className="flex flex-wrap gap-2">
                            {flight.details?.cabinClass && !isBus && (
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    Class: {flight.details.cabinClass}
                                </span>
                            )}
                            {flight.details?.seatType && isBus && (
                                <span className="bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-sm">
                                    Seat Type: {flight.details.seatType}
                                </span>
                            )}
                            {flight.details?.baggage && !isBus && (
                                <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                    Baggage: {flight.details.baggage}
                                </span>
                            )}
                            {flight.details?.aircraft && (
                                <span className={`${isBus ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'} px-3 py-1 rounded-full text-sm`}>
                                    {isBus ? 'Bus Type' : 'Aircraft'}: {flight.details.aircraft}
                                </span>
                            )}
                            {flight.details?.stops !== undefined && (
                                <span className={`${isBus ? 'bg-orange-50 text-orange-700' : 'bg-blue-50 text-blue-700'} px-3 py-1 rounded-full text-sm`}>
                                    {flight.details.stops === 0 ? (isBus ? 'Direct' : 'Non-stop') : `${flight.details.stops} stop(s)`}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Passenger Details */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <User className="h-6 w-6 mr-2 text-blue-600" />
                        Passenger Details
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Full Name</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {passenger.passenger_name}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Date of Birth</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {new Date(passenger.date_of_birth).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500">Nationality</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {passenger.nationality}
                            </p>
                        </div>

                        {passenger.passport_number && (
                            <div>
                                <p className="text-sm text-gray-500">Passport Number</p>
                                <p className="text-lg font-semibold text-gray-900">
                                    {passenger.passport_number}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Contact & Address */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                        <MapPin className="h-6 w-6 mr-2 text-blue-600" />
                        Contact & Address
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500 flex items-center mb-1">
                                <Mail className="h-4 w-4 mr-1" />
                                Email
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {passenger.email}
                            </p>
                        </div>

                        <div>
                            <p className="text-sm text-gray-500 flex items-center mb-1">
                                <Phone className="h-4 w-4 mr-1" />
                                Phone
                            </p>
                            <p className="text-lg font-semibold text-gray-900">
                                {passenger.phone}
                            </p>
                        </div>

                        <div className="md:col-span-2">
                            <p className="text-sm text-gray-500 mb-1">Address</p>
                            <p className="text-lg font-semibold text-gray-900">
                                {passenger.address}, {passenger.city}, {passenger.state} - {passenger.pincode}, {passenger.country}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Important Information */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
                    <h3 className="text-lg font-semibold text-yellow-900 mb-3">
                        Important Information
                    </h3>
                    <ul className="space-y-2 text-sm text-yellow-800">
                        {labels.instructions.map((instruction, idx) => (
                            <li key={idx}>{instruction}</li>
                        ))}
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={() => window.print()}
                        className="flex-1 bg-white border-2 border-blue-600 text-blue-600 py-3 px-6 rounded-lg hover:bg-blue-50 font-semibold transition-colors flex items-center justify-center"
                    >
                        <Download className="h-5 w-5 mr-2" />
                        Download Ticket
                    </button>
                    <button
                        onClick={() => navigate('/')}
                        className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 font-semibold transition-colors"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookingConfirmation;
