import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PROPERTY_TYPES = ['Entire home', 'Apartment', 'Private room', 'Shared room', 'Villa', 'Guest house', 'Other'];
const API_URL = import.meta.env.VITE_API_URL;

const HomeList = () => {
    const { isLoggedIn, user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    const [searchLocation, setSearchLocation] = useState(searchParams.get('location') || '');
    const [searchGuests, setSearchGuests] = useState(searchParams.get('guests') || '');
    const [searchType, setSearchType] = useState(searchParams.get('propertyType') || '');
    const [searchMinPrice, setSearchMinPrice] = useState(searchParams.get('minPrice') || '');
    const [searchMaxPrice, setSearchMaxPrice] = useState(searchParams.get('maxPrice') || '');
    const [showTypeDropdown, setShowTypeDropdown] = useState(false);

    const [homes, setHomes] = useState([]);
    const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchHomes();
    }, [searchParams]);

    const fetchHomes = () => {
        setLoading(true);
        setError('');

        const queryStr = searchParams.toString();

        axios.get(`${API_URL}/api/store?${queryStr}`)
            .then(res => {
                setHomes(res.data.homes || []);
                if (res.data.pagination) setPagination(res.data.pagination);
            })
            .catch(err => {
                console.error("Error fetching homes", err);
                setError('We couldn\'t load homes right now. Please try again.');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const toggleFavourite = async (e, home) => {
        e.preventDefault();
        e.stopPropagation();

        if (!isLoggedIn) {
            return navigate('/login');
        }

        const isFavourited = home.favouriteUsers?.includes(user._id);

        try {
            if (isFavourited) {
                await axios.post(`${API_URL}/api/store/remove-favourite`, { _id: home._id }, { withCredentials: true });
                setHomes(homes.map(h => h._id === home._id ? { ...h, favouriteUsers: h.favouriteUsers.filter(id => id !== user._id) } : h));
            } else {
                await axios.post(`${API_URL}/api/store/favourite-list`, { id: home._id }, { withCredentials: true });
                setHomes(homes.map(h => h._id === home._id ? { ...h, favouriteUsers: [...(h.favouriteUsers || []), user._id] } : h));
            }
        } catch (err) {
            console.error("Failed to toggle favourite", err);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();

        const params = {};
        if (searchLocation) params.location = searchLocation;
        if (searchGuests) params.guests = searchGuests;
        if (searchType) params.propertyType = searchType;
        if (searchMinPrice) params.minPrice = searchMinPrice;
        if (searchMaxPrice) params.maxPrice = searchMaxPrice;

        // Always reset to page 1 on new search
        params.page = '1';

        setSearchParams(params);
    };

    const handlePageChange = (newPage) => {
        if (newPage < 1 || newPage > pagination.totalPages) return;
        const currentParams = Object.fromEntries([...searchParams]);
        currentParams.page = newPage.toString();
        setSearchParams(currentParams);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const clearFilters = () => {
        setSearchLocation('');
        setSearchGuests('');
        setSearchType('');
        setSearchMinPrice('');
        setSearchMaxPrice('');
        setSearchParams({});
    };

    return (
        <main className="px-[5%] pt-[100px] pb-16 min-h-screen max-w-[1600px] mx-auto">
            {/* SEARCH BAR */}
            <div className="bg-white rounded-full shadow-[0_8px_25px_rgba(0,0,0,0.06)] border border-slate-100 p-1.5 mx-auto mb-12 max-w-[900px] flex justify-center animate-[slideIn_0.3s_ease-out] hover:shadow-[0_12px_35px_rgba(0,0,0,0.1)] transition-shadow duration-300">
                <form className="flex flex-col md:flex-row items-center w-full justify-between gap-2 md:gap-0" onSubmit={handleSearch}>

                    <div className="flex flex-col flex-1 px-5 py-1 w-full md:w-auto hover:bg-slate-50 rounded-full transition-colors cursor-text focus-within:bg-white focus-within:shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                        <label className="text-[0.65rem] font-extrabold text-slate-800 uppercase tracking-wider mb-0.5 ml-1">Where</label>
                        <input type="text" placeholder="Search destinations" value={searchLocation} onChange={(e) => setSearchLocation(e.target.value)} className="border-none bg-transparent text-sm text-slate-600 outline-none w-full font-medium ml-1 placeholder:font-normal" />
                    </div>

                    <div className="hidden md:block w-px h-8 bg-slate-200"></div>

                    <div className="flex flex-col flex-1 px-5 py-1 w-full md:w-auto hover:bg-slate-50 rounded-full transition-colors cursor-text focus-within:bg-white focus-within:shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                        <label className="text-[0.65rem] font-extrabold text-slate-800 uppercase tracking-wider mb-0.5 ml-1">Guests</label>
                        <input type="number" min="1" placeholder="Add guests" value={searchGuests} onChange={(e) => setSearchGuests(e.target.value)} className="border-none bg-transparent text-sm text-slate-600 outline-none w-full font-medium ml-1 placeholder:font-normal" />
                    </div>

                    <div className="hidden md:block w-px h-8 bg-slate-200"></div>

                    <div 
                        className="flex flex-col flex-1 px-5 py-1 w-full md:w-auto hover:bg-slate-50 rounded-full transition-colors cursor-pointer relative"
                        onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                        tabIndex="0"
                        onBlur={() => setTimeout(() => setShowTypeDropdown(false), 200)}
                    >
                        <label className="text-[0.65rem] font-extrabold text-slate-800 uppercase tracking-wider mb-0.5 ml-1 cursor-pointer">Type</label>
                        <div className="text-sm text-slate-600 w-full font-medium ml-1 truncate">
                            {searchType || 'Any type'}
                        </div>
                        
                        {showTypeDropdown && (
                            <div className="absolute top-[120%] left-0 w-[200px] bg-white shadow-[0_10px_40px_rgba(0,0,0,0.12)] border border-slate-100 z-50 py-2 flex flex-col animate-[fadeUp_0.2s_ease-out]">
                                <div 
                                    className="px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer font-medium transition-colors"
                                    onClick={() => setSearchType('')}
                                >
                                    Any type
                                </div>
                                {PROPERTY_TYPES.map(type => (
                                    <div 
                                        key={type} 
                                        className="px-4 py-2.5 text-sm text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 cursor-pointer font-medium transition-colors"
                                        onClick={() => setSearchType(type)}
                                    >
                                        {type}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="hidden md:block w-px h-8 bg-slate-200"></div>

                    <div className="flex flex-col flex-1 px-5 py-1 w-full md:w-auto hover:bg-slate-50 rounded-full transition-colors cursor-text focus-within:bg-white focus-within:shadow-[0_4px_15px_rgba(0,0,0,0.05)]">
                        <label className="text-[0.65rem] font-extrabold text-slate-800 uppercase tracking-wider mb-0.5 ml-1">Price Range</label>
                        <div className="flex items-center gap-1.5 ml-1">
                            <input type="number" placeholder="Min ₹" value={searchMinPrice} onChange={(e) => setSearchMinPrice(e.target.value)} className="border-none bg-transparent text-sm text-slate-600 outline-none w-[55px] font-medium placeholder:font-normal" />
                            <span className="text-slate-300">-</span>
                            <input type="number" placeholder="Max ₹" value={searchMaxPrice} onChange={(e) => setSearchMaxPrice(e.target.value)} className="border-none bg-transparent text-sm text-slate-600 outline-none w-[55px] font-medium placeholder:font-normal" />
                        </div>
                    </div>

                    <button type="submit" className="w-full md:w-auto flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-none rounded-full px-7 py-3.5 font-bold cursor-pointer transition-all hover:scale-105 hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] ml-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
                        <span>Search</span>
                    </button>
                </form>
            </div>

            {/* RESULTS HEADER */}
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-slate-800">{searchParams.toString() ? 'Search Results' : 'Explore Properties'}</h2>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20">
                    <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-slate-600 font-medium">Finding the perfect homes...</p>
                </div>
            ) : error ? (
                <div className="text-center p-16 bg-white rounded-[20px] border border-dashed border-slate-300 max-w-[600px] mx-auto my-8">
                    <h3 className="text-2xl mb-2 text-slate-800 font-bold">Oops!</h3>
                    <p className="text-slate-500 mb-6">{error}</p>
                    <button className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors" onClick={fetchHomes}>Try Again</button>
                </div>
            ) : homes.length === 0 ? (
                <div className="text-center p-16 bg-white rounded-[20px] border border-dashed border-slate-300 max-w-[600px] mx-auto my-8 animate-[fadeUp_0.4s_ease-out]">
                    <h3 className="text-2xl mb-2 text-slate-800 font-bold">No homes found</h3>
                    <p className="text-slate-500 mb-6">Try changing your location or adjusting your filters.</p>
                    <button className="px-6 py-3 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold hover:bg-slate-50 transition-colors" onClick={clearFilters}>Clear Filters</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                    {homes.map((home, index) => {
                        const image = home.imageUrl || (home.images && home.images.length > 0 ? home.images[0] : null);
                        return (
                            <Link to={`/property/${home._id}`} className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] block animate-[fadeUp_0.5s_backwards]" key={home._id} style={{ animationDelay: `${index * 0.05}s` }}>
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
                                        {home.favouriteUsers?.includes(user?._id) ? (
                                            <span className="text-rose-500 drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">♥</span>
                                        ) : (
                                            <span className="text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">♡</span>
                                        )}
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

            {/* PAGINATION UI */}
            {!loading && !error && homes.length > 0 && pagination.totalPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-16 mb-8">
                    <button
                        onClick={() => handlePageChange(pagination.page - 1)}
                        disabled={pagination.page <= 1}
                        className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        ← Previous
                    </button>

                    <div className="flex gap-2 mx-4 overflow-x-auto">
                        {[...Array(pagination.totalPages)].map((_, i) => {
                            const p = i + 1;
                            // Only show a few pages around current to avoid long scroll on mobile
                            if (p === 1 || p === pagination.totalPages || (p >= pagination.page - 1 && p <= pagination.page + 1)) {
                                return (
                                    <button
                                        key={p}
                                        onClick={() => handlePageChange(p)}
                                        className={`w-10 h-10 rounded-xl font-bold transition-colors ${pagination.page === p ? 'bg-indigo-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'}`}
                                    >
                                        {p}
                                    </button>
                                );
                            } else if ((p === pagination.page - 2 && p > 1) || (p === pagination.page + 2 && p < pagination.totalPages)) {
                                return <span key={p} className="flex items-end justify-center px-1 text-slate-400">...</span>;
                            }
                            return null;
                        })}
                    </div>

                    <button
                        onClick={() => handlePageChange(pagination.page + 1)}
                        disabled={pagination.page >= pagination.totalPages}
                        className="px-4 py-2 rounded-xl font-bold text-slate-700 bg-white border border-slate-200 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Next →
                    </button>
                </div>
            )}
        </main>
    );
};

export default HomeList;
