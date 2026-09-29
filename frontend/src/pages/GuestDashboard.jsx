import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL;

const GuestDashboard = () => {
    const { isLoggedIn, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('upcoming');
    const [cancellingId, setCancellingId] = useState(null);
    
    // Confirm Modal State
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [bookingToCancel, setBookingToCancel] = useState(null);

    // Review State
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [reviewForm, setReviewForm] = useState({ bookingId: null, homeId: null, rating: 5, comment: '' });
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState('');
    const [reviewSuccess, setReviewSuccess] = useState(false);

    // Checkout State
    const [checkingOutId, setCheckingOutId] = useState(null);
    const [paymentSlip, setPaymentSlip] = useState(null);
    const [checkoutConfirmOpen, setCheckoutConfirmOpen] = useState(false);
    const [bookingToCheckout, setBookingToCheckout] = useState(null);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (user?.userType !== 'guest') {
            navigate('/');
            return;
        }

        axios.get(`${API_URL}/api/bookings`)
            .then(res => {
                setBookings(res.data.bookings || []);
            })
            .catch(err => {
                console.error("Failed to load bookings", err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [isLoggedIn, user, navigate]);

    const handleCancelClick = (bookingId) => {
        setBookingToCancel(bookingId);
        setConfirmModalOpen(true);
    };

    const handleConfirmCancel = async () => {
        if (!bookingToCancel) return;

        setConfirmModalOpen(false);
        setCancellingId(bookingToCancel);
        try {
            await axios.patch(`${API_URL}/api/bookings/${bookingToCancel}/cancel`);
            setBookings(bookings.map(b => b._id === bookingToCancel ? { ...b, status: 'CANCELLED' } : b));
        } catch (err) {
            alert(err.response?.data?.error || "Failed to cancel booking.");
        } finally {
            setCancellingId(null);
            setBookingToCancel(null);
        }
    };

    const openReviewModal = (booking) => {
        let resolvedHomeId = null;
        if (booking) {
            if (booking.homeId && booking.homeId._id) resolvedHomeId = booking.homeId._id;
            else if (booking.homeId) resolvedHomeId = booking.homeId;
            else if (booking.home) resolvedHomeId = booking.home._id || booking.home;
        }
        
        setReviewForm({ bookingId: booking?._id, homeId: resolvedHomeId, rating: 5, comment: '' });
        setReviewModalOpen(true);
        setReviewError('');
        setReviewSuccess(false);
    };

    const closeReviewModal = () => {
        setReviewModalOpen(false);
    };

    const submitReview = async (e) => {
        e.preventDefault();
        setReviewLoading(true);
        setReviewError('');
        
        try {
            await axios.post(`${API_URL}/api/store/reviews`, reviewForm, { withCredentials: true });
            setReviewSuccess(true);
            setTimeout(() => {
                setReviewModalOpen(false);
            }, 2000);
        } catch (err) {
            setReviewError(err.response?.data?.error || "Failed to submit review.");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleCheckoutClick = (booking) => {
        setBookingToCheckout(booking);
        setCheckoutConfirmOpen(true);
    };

    const handleConfirmCheckout = async () => {
        if (!bookingToCheckout) return;
        
        setCheckoutConfirmOpen(false);
        setCheckingOutId(bookingToCheckout._id);
        try {
            const res = await axios.patch(`${API_URL}/api/bookings/${bookingToCheckout._id}/checkout`);
            setBookings(bookings.map(b => b._id === bookingToCheckout._id ? res.data.booking : b));
            setPaymentSlip(res.data.booking);
        } catch (err) {
            alert(err.response?.data?.error || "Failed to checkout.");
        } finally {
            setCheckingOutId(null);
            setBookingToCheckout(null);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading your trips...</p>
        </div>
    );

    const upcomingTrips = bookings.filter(b => b.status === 'CONFIRMED' || b.status === 'PENDING');
    const pastTrips = bookings.filter(b => b.status === 'COMPLETED');
    const cancelledTrips = bookings.filter(b => b.status === 'CANCELLED');

    const displayedBookings = filter === 'upcoming' ? upcomingTrips 
                            : filter === 'past' ? pastTrips 
                            : filter === 'cancelled' ? cancelledTrips 
                            : bookings;

    return (
        <main className="px-[5%] pt-[100px] pb-16 min-h-screen max-w-[1200px] mx-auto animate-[fadeUp_0.5s_backwards]">
            
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Good morning, {user?.fname}</h1>
                <p className="text-slate-500">Ready for your next stay?</p>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center">
                    <span className="text-4xl font-extrabold text-indigo-600 mb-1">{upcomingTrips.length}</span>
                    <span className="text-sm font-semibold text-slate-500">Upcoming</span>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center">
                    <span className="text-4xl font-extrabold text-slate-800 mb-1">{bookings.length}</span>
                    <span className="text-sm font-semibold text-slate-500">Total Trips</span>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center hidden md:flex">
                    <span className="text-4xl font-extrabold text-emerald-500 mb-1">{pastTrips.length}</span>
                    <span className="text-sm font-semibold text-slate-500">Completed</span>
                </div>
                <div className="bg-white/70 backdrop-blur-md p-6 rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col justify-center items-center hidden md:flex">
                    <span className="text-4xl font-extrabold text-rose-500 mb-1">{cancelledTrips.length}</span>
                    <span className="text-sm font-semibold text-slate-500">Cancelled</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-6 border-b border-slate-200 mb-8 overflow-x-auto">
                <button 
                    className={`pb-4 text-[0.95rem] font-bold whitespace-nowrap transition-colors ${filter === 'upcoming' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}
                    onClick={() => setFilter('upcoming')}
                >
                    Upcoming Trips
                </button>
                <button 
                    className={`pb-4 text-[0.95rem] font-bold whitespace-nowrap transition-colors ${filter === 'past' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}
                    onClick={() => setFilter('past')}
                >
                    Completed
                </button>
                <button 
                    className={`pb-4 text-[0.95rem] font-bold whitespace-nowrap transition-colors ${filter === 'cancelled' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}
                    onClick={() => setFilter('cancelled')}
                >
                    Cancelled
                </button>
                <button 
                    className={`pb-4 text-[0.95rem] font-bold whitespace-nowrap transition-colors ${filter === 'all' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-800 border-b-2 border-transparent'}`}
                    onClick={() => setFilter('all')}
                >
                    All Trips
                </button>
            </div>
            
            {displayedBookings.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-md p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No trips found</h2>
                    <p className="text-slate-500 mb-6">Your next adventure starts here.</p>
                    {filter === 'upcoming' && (
                        <Link to="/" className="px-6 py-3 bg-slate-900 rounded-xl font-bold text-white hover:bg-slate-800 transition-colors inline-block">Explore Homes</Link>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayedBookings.map(booking => {
                        const home = booking.homeId;
                        if (!home) return null;
                        
                        const image = home.imageUrl || (home.images && home.images.length > 0 ? home.images[0] : null);
                        const isCancelled = booking.status === 'CANCELLED';
                        const checkInDate = new Date(booking.checkIn).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                        const checkOutDate = new Date(booking.checkOut).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
                        const isCancelling = cancellingId === booking._id;

                        let statusColor = 'bg-slate-100 text-slate-600';
                        if (booking.status === 'CONFIRMED') statusColor = 'bg-emerald-100 text-emerald-700';
                        if (booking.status === 'PENDING') statusColor = 'bg-amber-100 text-amber-700';
                        if (booking.status === 'COMPLETED') statusColor = 'bg-indigo-100 text-indigo-700';
                        
                        return (
                            <div key={booking._id} className={`bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-slate-100 flex flex-col transition-all hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(0,0,0,0.1)] ${isCancelled ? 'opacity-70' : ''}`}>
                                <div className="h-[220px] bg-slate-100 relative">
                                    <Link to={`/property/${home._id}`}>
                                        <img 
                                            src={image ? (image.includes('/') || image.includes('\\\\') ? `${API_URL}/${image.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${image}`) : ''} 
                                            alt={home.houseName} 
                                            className="w-full h-full object-cover transition-opacity"
                                        />
                                    </Link>
                                    <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-[0.7rem] font-extrabold uppercase shadow-sm ${statusColor}`}>
                                        {booking.status}
                                    </div>
                                </div>
                                
                                <div className="p-6 flex flex-col flex-grow">
                                    <div className="mb-4 flex-grow">
                                        <h3 className="text-xl font-bold text-slate-900 mb-1 line-clamp-1">{home.houseName}</h3>
                                        <p className="text-slate-500 text-sm mb-4">📍 {home.city || home.location}</p>
                                        
                                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-[0.75rem] font-bold text-slate-400">DATES</span>
                                                <span className="text-sm font-semibold text-slate-700">{checkInDate} - {checkOutDate}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-[0.75rem] font-bold text-slate-400">DETAILS</span>
                                                <span className="text-sm font-semibold text-slate-700">{booking.guests} guest{booking.guests > 1 ? 's' : ''} · {booking.numberOfNights} night{booking.numberOfNights > 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        <div className="flex justify-between items-end">
                                            <div>
                                                <p className="text-[0.7rem] font-bold text-slate-400">TOTAL COST</p>
                                                <p className="text-xl font-bold text-slate-900">₹{booking.totalPrice}</p>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    {!isCancelled && booking.status !== 'COMPLETED' && (
                                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                                            <Link to={`/property/${home._id}`} className="flex-1 text-center py-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl font-semibold text-sm transition-colors">Details</Link>
                                            
                                            {new Date() < new Date(booking.checkIn) ? (
                                                <button 
                                                    disabled={isCancelling}
                                                    onClick={() => handleCancelClick(booking._id)} 
                                                    className="flex-1 py-2.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {isCancelling ? 'Cancelling...' : 'Cancel Trip'}
                                                </button>
                                            ) : (
                                                <button 
                                                    disabled={checkingOutId === booking._id}
                                                    onClick={() => handleCheckoutClick(booking)} 
                                                    className="flex-1 py-2.5 border border-emerald-500 text-emerald-600 hover:bg-emerald-50 rounded-xl font-semibold text-sm transition-colors cursor-pointer disabled:opacity-50"
                                                >
                                                    {checkingOutId === booking._id ? 'Processing...' : 'Self Checkout'}
                                                </button>
                                            )}
                                        </div>
                                    )}
                                    {booking.status === 'COMPLETED' && (
                                        <div className="flex gap-3 pt-4 border-t border-slate-100">
                                            <button 
                                                onClick={() => openReviewModal(booking)}
                                                className="flex-1 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl font-semibold text-sm transition-colors"
                                            >
                                                Leave a Review
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Review Modal */}
            {reviewModalOpen && (
                <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fadeUp_0.2s_ease-out]">
                        <h2 className="text-2xl font-bold text-slate-900 mb-2">Leave a Review</h2>
                        <p className="text-slate-500 mb-6 text-sm">Share your experience with future guests.</p>
                        
                        {reviewSuccess ? (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                                <h3 className="text-xl font-bold text-slate-800">Review Submitted!</h3>
                                <p className="text-slate-500 mt-2">Thank you for sharing your experience.</p>
                            </div>
                        ) : (
                            <form onSubmit={submitReview}>
                                {reviewError && <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-xl text-sm font-semibold">{reviewError}</div>}
                                
                                <div className="mb-6">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Rating</label>
                                    <div className="flex gap-2 text-3xl">
                                        {[1, 2, 3, 4, 5].map(star => (
                                            <span 
                                                key={star} 
                                                className={`cursor-pointer ${reviewForm.rating >= star ? 'text-amber-400' : 'text-slate-200'} hover:scale-110 transition-transform`}
                                                onClick={() => setReviewForm({...reviewForm, rating: star})}
                                            >
                                                ★
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-8">
                                    <label className="block text-sm font-bold text-slate-700 mb-2">Comment</label>
                                    <textarea 
                                        className="w-full border border-slate-200 rounded-xl p-4 outline-none focus:border-indigo-600 transition-colors resize-none h-32"
                                        placeholder="What did you like about this place?"
                                        value={reviewForm.comment}
                                        onChange={(e) => setReviewForm({...reviewForm, comment: e.target.value})}
                                        required
                                    ></textarea>
                                </div>
                                
                                <div className="flex gap-3">
                                    <button 
                                        type="button" 
                                        onClick={closeReviewModal}
                                        className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={reviewLoading}
                                        className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors disabled:opacity-70"
                                    >
                                        {reviewLoading ? 'Submitting...' : 'Submit'}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <ConfirmModal 
                isOpen={confirmModalOpen}
                title="Cancel Trip"
                message="Are you sure you want to cancel this booking? This action cannot be undone."
                confirmText="Cancel Trip"
                confirmColor="rose"
                onCancel={() => {
                    setConfirmModalOpen(false);
                    setBookingToCancel(null);
                }}
                onConfirm={handleConfirmCancel}
            />

            <ConfirmModal 
                isOpen={checkoutConfirmOpen}
                title="Self Checkout"
                message="Are you sure you want to self-checkout now? Your final payment slip will be generated based on the current time."
                confirmText="Proceed to Checkout"
                confirmColor="emerald"
                onCancel={() => {
                    setCheckoutConfirmOpen(false);
                    setBookingToCheckout(null);
                }}
                onConfirm={handleConfirmCheckout}
            />

            {/* Payment Slip Modal */}
            {paymentSlip && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl animate-[fadeUp_0.2s_ease-out]">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto mb-4">✓</div>
                            <h2 className="text-2xl font-bold text-slate-900">Checkout Complete</h2>
                            <p className="text-slate-500 mt-1">Here is your final payment slip.</p>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-6 mb-6">
                            <div className="flex justify-between items-center mb-3 text-sm text-slate-600">
                                <span>Booking Ref:</span>
                                <span className="font-mono text-slate-900">{paymentSlip._id.slice(-8).toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-3 text-sm text-slate-600">
                                <span>Check-In:</span>
                                <span className="font-semibold text-slate-900">{new Date(paymentSlip.checkIn).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center mb-6 text-sm text-slate-600">
                                <span>Check-Out (Actual):</span>
                                <span className="font-semibold text-slate-900">{new Date(paymentSlip.checkOut).toLocaleString()}</span>
                            </div>

                            <hr className="border-slate-200 mb-4" />

                            <div className="flex justify-between items-center mb-2">
                                <span className="text-slate-700 font-medium">Nights / Charge</span>
                                <span className="text-slate-900">₹{(paymentSlip.totalPrice - (paymentSlip.cleaningFee || 0)).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-slate-700 font-medium">Cleaning Fee</span>
                                <span className="text-slate-900">₹{paymentSlip.cleaningFee || 0}</span>
                            </div>
                            
                            <hr className="border-slate-300 mb-4" />
                            
                            <div className="flex justify-between items-center text-xl font-bold text-slate-900">
                                <span>Total Paid</span>
                                <span>₹{paymentSlip.totalPrice}</span>
                            </div>
                        </div>

                        <div className="flex gap-3">
                            <button 
                                onClick={() => setPaymentSlip(null)} 
                                className="flex-1 py-3 px-4 border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                Close
                            </button>
                            <button 
                                onClick={() => {
                                    setPaymentSlip(null);
                                    openReviewModal(paymentSlip);
                                }} 
                                className="flex-1 py-3 px-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                            >
                                Leave Review
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    );
};

export default GuestDashboard;
