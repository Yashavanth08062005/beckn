// src/pages/FlightsPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee } from 'lucide-react';
import { domesticFlights, internationalFlights } from '../data/flightsMock';

export default function FlightsPage() {
  const [tab, setTab] = useState('domestic'); // 'domestic' | 'international'
  const navigate = useNavigate();

  const flights = tab === 'domestic' ? domesticFlights : internationalFlights;

  const handleBook = (flight) => {
    // yahin se FlightBooking ko data pass karenge
    navigate('/flight-booking', {
      state: {
        travelOption: flight, // FlightBooking me location.state.travelOption
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-5xl mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">Book Flights</h1>

        {/* Tabs – Domestic / International */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setTab('domestic')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              tab === 'domestic'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            Domestic Flights
          </button>
          <button
            onClick={() => setTab('international')}
            className={`px-4 py-2 rounded-full text-sm font-semibold border ${
              tab === 'international'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white text-gray-700 border-gray-300'
            }`}
          >
            International Flights
          </button>
        </div>

        {/* Flights list */}
        <div className="space-y-4">
          {flights.map((f) => (
            <div
              key={f.id}
              className="bg-white rounded-xl shadow-md p-4 flex flex-col md:flex-row justify-between gap-4"
            >
              <div>
                <div className="text-sm text-gray-500 mb-1">
                  {tab === 'domestic' ? 'Domestic' : 'International'} • {f.airline}
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {f.route}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {f.date} • {f.time} • {f.duration}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  Flight no: {f.flightNumber} • Cabin {f.baggageCabin} • Checked {f.baggageChecked}
                </div>
              </div>

              <div className="flex flex-col items-end justify-between">
                <div className="flex items-center">
                  <IndianRupee className="h-5 w-5 text-gray-800" />
                  <span className="text-2xl font-bold ml-1 text-gray-900">
                    {f.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <button
                  onClick={() => handleBook(f)}
                  className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg shadow"
                >
                  Book
                </button>
              </div>
            </div>
          ))}

          {flights.length === 0 && (
            <div className="text-center text-gray-500 text-sm py-10">
              No flights available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
