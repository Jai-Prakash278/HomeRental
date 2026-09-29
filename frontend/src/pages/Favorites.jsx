import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const API_URL = import.meta.env.VITE_API_URL;

const Favorites = () => {
    const { isLoggedIn, user, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }



        fetchFavorites();
    }, [isLoggedIn, user, navigate]);

    const fetchFavorites = () => {
        setLoading(true);
        axios.get(`${API_URL}/api/store/favourite-list`, { withCredentials: true })
            .then(res => {
                setHomes(res.data.favouriteHomes || []);
            })
            .catch(err => {
                console.error("Failed to load favorites", err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const toggleFavourite = async (e, home) => {
        e.preventDefault();
        e.stopPropagation();

        try {
            await axios.post(`${API_URL}/api/store/remove-favourite`, { _id: home._id }, { withCredentials: true });
            setHomes(homes.filter(h => h._id !== home._id));
        } catch (err) {
            console.error("Failed to remove favourite", err);
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading your favorites...</p>
        </div>
    );

    return (
        <main className="px-[5%] pt-[100px] pb-16 min-h-screen max-w-[1600px] mx-auto animate-[fadeUp_0.5s_backwards]">
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold text-slate-800 mb-2">Saved Homes</h1>
                <p className="text-slate-500">Your wish list for future trips.</p>
            </div>

            {homes.length === 0 ? (
                <div className="bg-white/50 backdrop-blur-md p-12 rounded-3xl border border-slate-200 shadow-sm text-center">
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">No saved homes yet</h2>
                    <p className="text-slate-500 mb-6">Explore beautiful places for your next stay.</p>
                    <Link to="/" className="px-6 py-3 bg-slate-900 rounded-xl font-bold text-white hover:bg-slate-800 transition-colors inline-block">Explore Homes</Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {homes.map((home, index) => {
                        const image = home.imageUrl || (home.images && home.images.length > 0 ? home.images[0] : null);
                        return (
                            <Link to={`/property/${home._id}`} className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] block" key={home._id}>
                                <div className="relative h-[220px] overflow-hidden bg-slate-100">
                                    <img 
                                        src={image ? (image.includes('/') || image.includes('\\\\') ? `${API_URL}/${image.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${image}`) : ''} 
                                        onError={(e) => { e.target.src = 'https://via.placeholder.com/500x300?text=No+Image'; }} 
                                        alt={home.houseName} 
                                        loading="lazy"
                                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                    />
                                    <div 
                                        onClick={(e) => toggleFavourite(e, home)}
                                        className="absolute top-4 right-4 text-2xl drop-shadow-md transition-transform hover:scale-125 cursor-pointer z-10"
                                    >
                                        <span className="text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">♥</span>
                                    </div>
                                    {home.rating > 0 && (
                                        <div className="absolute bottom-4 right-4 bg-white/90 px-2 py-1 rounded-full text-xs font-bold text-slate-800 shadow-md">
                                            <span className="text-amber-400">★</span> {home.rating}
                                        </div>
                                    )}
                                </div>
                                <div className="p-5">
                                    <div className="flex justify-between items-center mb-1.5">
                                        <p className="text-[0.85rem] text-slate-500 font-semibold uppercase tracking-wide truncate">{home.city || home.location}, {home.country}</p>
                                        <p className="text-[0.75rem] bg-slate-100 px-2 py-0.5 rounded-lg text-slate-600 whitespace-nowrap ml-2">{home.propertyType}</p>
                                    </div>
                                    <h2 className="text-[1.1rem] font-bold text-slate-900 mb-3 truncate">{home.houseName}</h2>
                                    
                                    <div className="mt-2">
                                        <p className="text-lg font-extrabold text-slate-900">₹{home.price} <span className="text-[0.9rem] font-medium text-slate-500">/ night</span></p>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </main>
    );
};

export default Favorites;
