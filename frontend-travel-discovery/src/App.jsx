import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import FlightBooking from './pages/FlightBooking';
import BookingHistory from './pages/BookingHistory';
import Profile from "./components/Profile";
import Payment from './pages/Payment';
import PaymentSuccess from './pages/PaymentSuccess';
import LoginPage from './pages/LoginPage';  // ✅ yahan se login page

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        {/* Sticky navbar */}
        <Navbar />

        {/* Page content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/booking" element={<FlightBooking />} />
            <Route path="/payment" element={<Payment />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/payment-success" element={<PaymentSuccess />} />
            <Route path="/booking-history" element={<BookingHistory />} />

            {/* ✅ Login route */}
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
