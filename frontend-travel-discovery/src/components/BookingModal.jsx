import React, { useState } from 'react';

const BookingModal = ({ option, onClose, onConfirm }) => {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    passengers: 1,
    notes: ''
  });

  const [confirmed, setConfirmed] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    setConfirmed(true);
    if (onConfirm) onConfirm(form);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Booking Details</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">Close</button>
        </div>

        {!confirmed ? (
          <div>
            <p className="text-sm text-gray-600 mb-3">You are booking: <strong>{option?.details?.airline || option?.details?.name || option?.title || 'Option'}</strong></p>

            <div className="grid grid-cols-1 gap-3">
              <label className="text-xs">Full name</label>
              <input name="fullName" value={form.fullName} onChange={handleChange} className="border rounded px-3 py-2" />

              <label className="text-xs">Email</label>
              <input name="email" value={form.email} onChange={handleChange} className="border rounded px-3 py-2" />

              <label className="text-xs">Phone</label>
              <input name="phone" value={form.phone} onChange={handleChange} className="border rounded px-3 py-2" />

              <label className="text-xs">Passengers / Guests</label>
              <input type="number" min={1} name="passengers" value={form.passengers} onChange={handleChange} className="border rounded px-3 py-2" />

              <label className="text-xs">Notes (optional)</label>
              <textarea name="notes" value={form.notes} onChange={handleChange} className="border rounded px-3 py-2" rows={3} />
            </div>

            <div className="mt-4 flex justify-end space-x-2">
              <button onClick={onClose} className="px-4 py-2 rounded border">Cancel</button>
              <button onClick={handleConfirm} className="px-4 py-2 rounded bg-blue-600 text-white">Confirm</button>
            </div>
          </div>
        ) : (
          <div>
            <h4 className="font-semibold mb-2">Booking Confirmed</h4>
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Name:</strong> {form.fullName}</p>
              <p><strong>Email:</strong> {form.email}</p>
              <p><strong>Phone:</strong> {form.phone}</p>
              <p><strong>Passengers:</strong> {form.passengers}</p>
              {form.notes && <p><strong>Notes:</strong> {form.notes}</p>}
              <p className="pt-2 text-xs text-gray-500">This is a UI confirmation only (no real booking performed).</p>
            </div>

            <div className="mt-4 flex justify-end">
              <button onClick={onClose} className="px-4 py-2 rounded bg-green-600 text-white">Close</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookingModal;
