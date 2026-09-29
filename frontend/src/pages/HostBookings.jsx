import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const HostBookings = () => {
    const { isLoggedIn, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (user?.userType !== 'host') {
            navigate('/');
            return;
        }

        axios.get(`${API_URL}/api/bookings/host`)
            .then(res => {
                setBookings(res.data.bookings || []);
            })
            .catch(err => {
                console.error("Failed to load host bookings", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isLoggedIn, user, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading reservations...</p>
        </div>
    );

    return (
        <main className="px-[5%] pt-[100px] pb-16 min-h-screen max-w-[1200px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800">Reservations</h1>
                <Link to="/host/homes" className="text-indigo-600 font-semibold hover:underline">Manage Listings</Link>
            </div>
            
            {bookings.length === 0 ? (
                <div className="bg-white p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No bookings yet.</h2>
                    <p className="text-slate-500 mb-6">Make sure your property listings have great photos and competitive pricing!</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-[0_4px_15px_rgba(0,0,0,0.05)] border border-slate-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Guest</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Property</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Dates</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Payout</th>
                                    <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {bookings.map(booking => {
                                    const home = booking.homeId;
                                    const guest = booking.guestId;
                                    if (!home || !guest) return null;
                                    
                                    const isCancelled = booking.status === 'CANCELLED';
                                    const checkInDate = new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
                                    const checkOutDate = new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                                    
                                    return (
                                        <tr key={booking._id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="p-4">
                                                <p className="font-bold text-slate-800">{guest.fname} {guest.lname}</p>
                                                <p className="text-xs text-slate-500">{booking.guests} guest{booking.guests > 1 ? 's' : ''}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-semibold text-slate-700 max-w-[200px] truncate">{home.houseName}</p>
                                                <p className="text-xs text-slate-500">{home.city || home.location}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className="font-medium text-slate-700">{checkInDate} - {checkOutDate}</p>
                                                <p className="text-xs text-slate-500">{booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}</p>
                                            </td>
                                            <td className="p-4">
                                                <p className={`font-bold ${isCancelled ? 'text-slate-400 line-through' : 'text-emerald-600'}`}>₹{booking.totalPrice}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isCancelled ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </main>
    );
};

export default HostBookings;
