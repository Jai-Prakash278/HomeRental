import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const PropertyDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { isLoggedIn, user } = useContext(AuthContext);
    
    const [home, setHome] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Booking State
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [bookingLoading, setBookingLoading] = useState(false);
    const [bookingError, setBookingError] = useState('');
    const [bookingSuccess, setBookingSuccess] = useState(false);

    const [blockedDates, setBlockedDates] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [aggregateRating, setAggregateRating] = useState(0);

    useEffect(() => {
        Promise.all([
            axios.get(`${API_URL}/api/store/${id}`),
            axios.get(`${API_URL}/api/store/availability/${id}`),
            axios.get(`${API_URL}/api/store/reviews/${id}`)
        ])
        .then(([homeRes, availRes, revRes]) => {
            setHome(homeRes.data.home);
            setBlockedDates(availRes.data.blockedDates || []);
            
            const fetchedReviews = revRes.data.reviews || [];
            setReviews(fetchedReviews);
            if (fetchedReviews.length > 0) {
                const total = fetchedReviews.reduce((sum, r) => sum + r.rating, 0);
                setAggregateRating((total / fetchedReviews.length).toFixed(1));
            }
        })
        .catch(err => {
            console.error(err);
            setError('We couldn\'t load this home. It may have been removed.');
        })
        .finally(() => {
            setLoading(false);
        });
    }, [id]);

    const calculateNights = () => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        if (end <= start) return 0;
        return Math.ceil((end - start) / (1000 * 3600 * 24));
    };

    const handleReserve = async () => {
        if (!isLoggedIn) {
            return navigate('/login');
        }
        
        if (!checkIn || !checkOut) {
            return setBookingError('Please select check-in and check-out dates.');
        }

        const nights = calculateNights();
        if (nights <= 0) {
            return setBookingError('Check-out must be after check-in.');
        }

        const today = new Date();
        today.setUTCHours(0,0,0,0);
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        
        if (checkInDate < today) {
            return setBookingError('Check-in cannot be in the past.');
        }

        // Validate overlap with blocked dates
        const isOverlapping = blockedDates.some(b => {
            const bIn = new Date(b.checkIn);
            const bOut = new Date(b.checkOut);
            return (checkInDate < bOut && checkOutDate > bIn);
        });

        if (isOverlapping) {
            return setBookingError('Those dates are partially or fully booked. Please select available dates.');
        }

        setBookingLoading(true);
        setBookingError('');

        try {
            await axios.post(`${API_URL}/api/bookings`, {
                homeId: home._id,
                checkIn,
                checkOut,
                guests: Number(guests)
            });
            setBookingSuccess(true);
        } catch (err) {
            setBookingError(err.response?.data?.error || 'Failed to create booking.');
        } finally {
            setBookingLoading(false);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading property details...</p>
        </div>
    );

    if (error || !home) return (
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
            <h2 className="text-3xl font-bold mb-2">Oops!</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <Link to="/" className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors">Back to Explore</Link>
        </div>
    );

    let images = [];
    if (home.images && home.images.length > 0) {
        images = home.images.map(img => img.includes('/') || img.includes('\\\\') ? `${API_URL}/${img.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${img}`);
    } else if (home.imageUrl) {
        images = [home.imageUrl.includes('/') || home.imageUrl.includes('\\\\') ? `${API_URL}/${home.imageUrl.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${home.imageUrl}`];
    }


    const nights = calculateNights();
    const basePrice = nights > 0 ? home.price * nights : 0;
    const cleaningFee = home.cleaningFee || 0;
    const totalPrice = basePrice > 0 ? basePrice + cleaningFee : 0;

    return (
        <main className="px-[5%] pt-[100px] pb-16 max-w-[1200px] mx-auto animate-[fadeUp_0.5s_backwards] md:pb-16 pb-[120px]">
            <div className="text-[0.9rem] color-slate-500 mb-4">
                <Link to="/" className="text-indigo-600 font-semibold hover:underline">Explore</Link> <span className="text-slate-400 mx-1">/</span> <span className="text-slate-600">{home.city || home.location}</span>
            </div>

            <div className="mb-6">
                <h1 className="text-4xl font-bold text-slate-900 mb-2">{home.houseName}</h1>
                <div className="flex gap-4 text-[0.95rem] text-slate-600 font-semibold">
                    {reviews.length > 0 && <span className="text-slate-800"><span className="text-amber-400">★</span> {aggregateRating} · <span className="underline">{reviews.length} reviews</span></span>}
                    <span>📍 {home.city || home.location}, {home.country}</span>
                </div>
            </div>

            {images.length > 0 && (
                <div className="flex overflow-x-auto md:overflow-hidden snap-x snap-mandatory gap-3 md:gap-2 rounded-2xl md:rounded-3xl mb-10 h-[280px] md:h-[450px] [&::-webkit-scrollbar]:hidden">
                    {/* Primary Image */}
                    <div className={`${images.length > 1 ? 'w-full md:w-1/2' : 'w-full'} flex-shrink-0 snap-center h-full overflow-hidden relative group md:rounded-none`}>
                        <img src={images[0]} alt="Primary" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    
                    {/* Secondary Images (Desktop Grid) */}
                    {images.length > 1 && (
                        <div className="hidden md:grid w-1/2 h-full gap-2 grid-cols-2 grid-rows-2">
                            {images.slice(1, 5).map((img, idx, arr) => (
                                <div key={idx} className={`overflow-hidden relative group ${arr.length === 1 ? 'col-span-2 row-span-2' : arr.length === 2 ? 'col-span-2' : arr.length === 3 && idx === 0 ? 'col-span-2' : ''}`}>
                                    <img src={img} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Secondary Images (Mobile Swipe Carousel) */}
                    {images.length > 1 && images.slice(1, 5).map((img, idx) => (
                        <div key={idx} className="md:hidden w-full flex-shrink-0 snap-center h-full overflow-hidden relative rounded-2xl">
                            <img src={img} alt={`Gallery ${idx+1}`} className="w-full h-full object-cover" />
                        </div>
                    ))}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-16 relative">
                <div>
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold mb-2">{home.propertyType} hosted by our community</h2>
                        <div className="flex flex-wrap gap-2 text-[0.9rem] text-slate-600">
                            <span className="after:content-['·'] after:ml-2 last:after:content-['']">{home.maxGuests} guests</span>
                            <span className="after:content-['·'] after:ml-2 last:after:content-['']">{home.bedrooms} bedrooms</span>
                            <span className="after:content-['·'] after:ml-2 last:after:content-['']">{home.beds} beds</span>
                            <span className="after:content-['·'] after:ml-2 last:after:content-['']">{home.bathrooms} baths</span>
                        </div>
                    </div>
                    
                    <hr className="border-slate-200 my-8" />

                    <div>
                        <h3 className="text-xl font-bold mb-4">About this space</h3>
                        <p className="text-slate-700 leading-relaxed whitespace-pre-line">{home.description}</p>
                    </div>

                    <hr className="border-slate-200 my-8" />

                    {home.amenities && home.amenities.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xl font-bold mb-4">What this place offers</h3>
                            <div className="grid grid-cols-2 gap-4">
                                {home.amenities.map((amenity, idx) => (
                                    <div key={idx} className="text-slate-700 flex items-center gap-2">✓ {amenity}</div>
                                ))}
                            </div>
                        </div>
                    )}

                    <hr className="border-slate-200 my-8" />

                    <div>
                        <h3 className="text-2xl font-bold mb-6">Guest Reviews</h3>
                        {reviews.length === 0 ? (
                            <p className="text-slate-500 italic">No reviews yet. Be the first to leave a review after your stay!</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {reviews.map(review => (
                                    <div key={review._id} className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-lg">
                                                    {review.guestId?.fname?.charAt(0) || 'G'}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-slate-900">{review.guestId?.fname || 'Guest'}</h4>
                                                    <p className="text-xs text-slate-500">{new Date(review.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</p>
                                                </div>
                                            </div>
                                            <div className="flex">
                                                {[...Array(5)].map((_, i) => (
                                                    <span key={i} className={`text-sm ${i < review.rating ? 'text-amber-400' : 'text-slate-200'}`}>★</span>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-slate-700 text-sm leading-relaxed">{review.comment}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* BOOKING CARD SIDEBAR */}
                <div className="md:sticky md:top-[100px] self-start w-full mt-10 md:mt-0">
                    <div className="bg-white p-6 rounded-3xl shadow-[0_10px_30px_rgba(0,0,0,0.1)] border border-slate-100 flex flex-col justify-between">
                        
                        {bookingSuccess ? (
                            <div className="text-center py-8">
                                <div className="text-5xl mb-4">🎉</div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-2">Booking Confirmed!</h3>
                                <p className="text-slate-600 mb-6">Pack your bags for {home.city}. Your stay is fully secured.</p>
                                <Link to="/trips" className="bg-indigo-600 text-white font-semibold py-3 px-6 rounded-xl hover:bg-indigo-700 transition-colors inline-block w-full">View My Trips</Link>
                            </div>
                        ) : (
                            <>
                                <div className="mb-6">
                                    <h3 className="text-2xl font-bold text-slate-900">₹{home.price} <span className="text-base text-slate-500 font-medium">/ night</span></h3>
                                </div>
                                
                                {bookingError && <div className="mb-4 bg-rose-50 text-rose-600 p-3 rounded-lg text-sm font-semibold text-center">{bookingError}</div>}
                                
                                <div className="border border-slate-300 rounded-xl overflow-hidden mb-6">
                                    <div className="flex flex-col xl:flex-row border-b border-slate-300">
                                        <div className="flex-1 p-3 flex flex-col border-b xl:border-b-0 xl:border-r border-slate-300 overflow-hidden">
                                            <label className="text-[0.7rem] font-bold mb-1 text-slate-800">CHECK-IN</label>
                                            <input type="datetime-local" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} min={new Date().toISOString().slice(0, 16)} className="border-none outline-none text-sm text-slate-600 bg-transparent cursor-pointer w-full" />
                                        </div>
                                        <div className="flex-1 p-3 flex flex-col overflow-hidden">
                                            <label className="text-[0.7rem] font-bold mb-1 text-slate-800">CHECK-OUT</label>
                                            <input type="datetime-local" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} min={checkIn || new Date().toISOString().slice(0, 16)} className="border-none outline-none text-sm text-slate-600 bg-transparent cursor-pointer w-full" />
                                        </div>
                                    </div>
                                    <div className="p-3 flex flex-col">
                                        <label className="text-[0.7rem] font-bold mb-1 text-slate-800">GUESTS</label>
                                        <select value={guests} onChange={(e) => setGuests(e.target.value)} className="border-none outline-none text-sm text-slate-600 bg-transparent cursor-pointer">
                                            {[...Array(home.maxGuests)].map((_, i) => (
                                                <option key={i+1} value={i+1}>{i+1} guest{i > 0 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <button 
                                    disabled={bookingLoading}
                                    className="w-full bg-gradient-to-br from-pink-500 to-rose-600 text-white border-none py-4 rounded-xl text-lg font-semibold cursor-pointer transition-transform hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(225,29,72,0.4)] disabled:opacity-70 disabled:cursor-not-allowed" 
                                    onClick={handleReserve}
                                >
                                    {bookingLoading ? 'Securing Dates...' : 'Reserve'}
                                </button>
                                
                                {nights > 0 && (
                                    <div className="mt-6 space-y-3">
                                        <p className="text-center text-sm text-slate-500 mb-4">You won't be charged yet</p>
                                        <div className="flex justify-between text-slate-600">
                                            <span>₹{home.price} × {nights} nights</span>
                                            <span>₹{basePrice}</span>
                                        </div>
                                        {cleaningFee > 0 && (
                                            <div className="flex justify-between text-slate-600">
                                                <span>Cleaning fee</span>
                                                <span>₹{cleaningFee}</span>
                                            </div>
                                        )}
                                        <hr className="border-slate-200 my-2" />
                                        <div className="flex justify-between font-bold text-slate-900 text-lg">
                                            <span>Total</span>
                                            <span>₹{totalPrice}</span>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
};

export default PropertyDetail;
