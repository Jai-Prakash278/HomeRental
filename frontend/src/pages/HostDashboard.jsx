import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const HostDashboard = () => {
    const { isLoggedIn, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [stats, setStats] = useState({
        totalProperties: 0,
        activeProperties: 0,
        upcomingReservations: 0,
        totalReservations: 0,
        totalRevenue: 0
    });
    const [recentBookings, setRecentBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

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

        const fetchDashboardData = async () => {
            try {
                const [statsRes, bookingsRes] = await Promise.all([
                    axios.get(`${API_URL}/api/host/stats`, { withCredentials: true }),
                    axios.get(`${API_URL}/api/bookings/host`, { withCredentials: true }) // Still needed for the 'recent bookings' preview, though eventually we could paginate it or limit it on backend.
                ]);

                setStats(statsRes.data.stats);

                // Get top 3 upcoming bookings for quick view
                const bookings = bookingsRes.data.bookings || [];
                const upcoming = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
                setRecentBookings(upcoming.slice(0, 3));
            } catch (err) {
                console.error("Dashboard error", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, [isLoggedIn, user, navigate]);

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading your dashboard...</p>
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center py-32">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">We couldn't load your dashboard.</h2>
            <button onClick={() => window.location.reload()} className="px-6 py-2 bg-indigo-600 text-white rounded-xl font-semibold">Try again</button>
        </div>
    );

    return (
        <main className="px-[5%] pt-[100px] pb-16 min-h-screen max-w-[1200px] mx-auto animate-[fadeUp_0.5s_backwards]">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Host Dashboard</h1>
                    <p className="text-slate-500">Welcome back, {user?.fname}. Here's what's happening.</p>
                </div>
                <div className="flex gap-3">
                    <Link to="/host/addHome" className="px-5 py-2.5 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all">+ Add New Property</Link>
                </div>
            </div>

            {/* Statistics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <span className="text-sm font-bold text-slate-400 mb-2">TOTAL REVENUE</span>
                    <span className="text-4xl font-extrabold text-slate-800">₹{stats.totalRevenue.toLocaleString()}</span>
                </div>
                
                <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <span className="text-sm font-bold text-slate-400 mb-2">UPCOMING STAYS</span>
                    <span className="text-4xl font-extrabold text-slate-800">{stats.upcomingReservations}</span>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-pink-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <span className="text-sm font-bold text-slate-400 mb-2">YOUR PROPERTIES</span>
                    <span className="text-4xl font-extrabold text-slate-800">{stats.totalProperties}</span>
                </div>

                <div className="bg-white p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 flex flex-col relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-50 rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                    <span className="text-sm font-bold text-slate-400 mb-2">TOTAL RESERVATIONS</span>
                    <span className="text-4xl font-extrabold text-slate-800">{stats.totalReservations}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-8">
                {/* Recent Bookings Panel */}
                <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-6 md:p-8">
                    <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                        <h2 className="text-xl font-bold text-slate-800">Upcoming Arrivals</h2>
                        <Link to="/host/bookings" className="text-indigo-600 font-semibold text-sm hover:underline">View All</Link>
                    </div>

                    {recentBookings.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-slate-500 mb-4">You have no upcoming arrivals at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {recentBookings.map(b => (
                                <div key={b._id} className="flex flex-col md:flex-row justify-between md:items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                    <div className="flex flex-col mb-3 md:mb-0">
                                        <span className="font-bold text-slate-800">{b.guestId?.fname} {b.guestId?.lname}</span>
                                        <span className="text-sm text-slate-500">{b.homeId?.houseName}</span>
                                    </div>
                                    <div className="flex flex-col text-left md:text-right mb-3 md:mb-0">
                                        <span className="font-semibold text-slate-700">{new Date(b.checkIn).toLocaleDateString()} - {new Date(b.checkOut).toLocaleDateString()}</span>
                                        <span className="text-sm text-slate-500">{b.numberOfNights} nights • {b.guests} guests</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block font-bold text-emerald-600">₹{b.totalPrice}</span>
                                        <span className="inline-block px-2 py-0.5 mt-1 bg-emerald-100 text-emerald-700 text-[0.65rem] font-bold rounded-md">CONFIRMED</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Quick Actions Panel */}
                <div className="space-y-6">
                    <Link to="/host/homes" className="block bg-gradient-to-br from-indigo-600 to-indigo-800 text-white p-8 rounded-3xl shadow-[0_10px_30px_rgba(79,70,229,0.2)] hover:-translate-y-1 transition-transform">
                        <h3 className="text-2xl font-bold mb-2">Manage Properties</h3>
                        <p className="text-indigo-100 opacity-90 text-sm">Update pricing, photos, and availability for your {stats.totalProperties} listings.</p>
                    </Link>
                    
                    <Link to="/host/bookings" className="block bg-white p-8 rounded-3xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-colors">
                        <h3 className="text-xl font-bold text-slate-800 mb-2">All Reservations</h3>
                        <p className="text-slate-500 text-sm">View your complete booking history and manage cancellations.</p>
                    </Link>
                </div>
            </div>

        </main>
    );
};

export default HostDashboard;
