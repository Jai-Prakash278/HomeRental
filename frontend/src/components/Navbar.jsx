import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getLinkClass = (path) => 
        `font-semibold no-underline transition-colors ${pathname === path ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-600 hover:text-indigo-600 border-b-2 border-transparent pb-1'}`;

    return (
        <nav className="fixed top-0 left-0 right-0 min-h-[80px] py-4 md:py-0 bg-white/95 backdrop-blur-xl border-b border-slate-200 z-50 flex flex-wrap items-center justify-between px-[6%] shadow-sm gap-y-4">
            <div className="flex items-center">
                <Link to="/" className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent no-underline tracking-tight flex items-center gap-2">
                    <span className="text-3xl text-indigo-600">⌂</span> HomeRental
                </Link>
            </div>

            {/* Mobile menu button */}
            <button 
                className="md:hidden flex items-center p-2 text-slate-600 hover:text-indigo-600 bg-transparent border-none cursor-pointer"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMobileMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
                </svg>
            </button>

            <ul className={`${isMobileMenuOpen ? 'flex' : 'hidden'} md:flex flex-col md:flex-row absolute md:relative top-full md:top-auto left-0 w-full md:w-auto min-h-[calc(100vh-80px)] md:min-h-0 bg-white/95 backdrop-blur-xl md:bg-transparent shadow-2xl md:shadow-none list-none gap-8 md:gap-3 lg:gap-5 items-center m-0 p-10 md:p-0 z-40 transition-all flex-wrap justify-center`}>
                {isLoggedIn ? (
                    <>
                        <li><Link to="/explore" className={getLinkClass('/explore')}>Explore</Link></li>
                        <li><Link to="/trips" className={getLinkClass('/trips')}>Trip</Link></li>
                        <li><Link to="/favorites" className={getLinkClass('/favorites')}>Favorite</Link></li>
                        
                        {user?.userType === 'host' && (
                            <>
                                <li><Link to="/host/homes" className={getLinkClass('/host/homes')}>Property</Link></li>
                                <li><Link to="/host/dashboard" className={getLinkClass('/host/dashboard')}>Overview</Link></li>
                                <li><Link to="/host/bookings" className={getLinkClass('/host/bookings')}>Reservation</Link></li>
                            </>
                        )}
                        <li className="w-full md:w-auto mt-4 md:mt-0">
                            <button onClick={handleLogout} className="w-full md:w-auto px-5 py-3 md:py-2.5 rounded-xl font-semibold cursor-pointer border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/" className={getLinkClass('/')} onClick={() => setIsMobileMenuOpen(false)}>Home</Link></li>
                        <div className="flex flex-col md:flex-row items-center gap-4 md:ml-2 w-full md:w-auto mt-4 md:mt-0">
                            <li className="w-full md:w-auto">
                                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full md:w-auto px-5 py-3 md:py-2.5 rounded-xl font-bold cursor-pointer border-2 border-indigo-100 bg-white text-indigo-600 shadow-sm transition-all hover:border-indigo-600 hover:text-indigo-700 hover:-translate-y-0.5 whitespace-nowrap">
                                    Login
                                </Link>
                            </li>
                            <li className="w-full md:w-auto">
                                <Link to="/signup" onClick={() => setIsMobileMenuOpen(false)} className="block text-center w-full md:w-auto px-5 py-3 md:py-2.5 rounded-xl font-bold cursor-pointer border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)] whitespace-nowrap">
                                    Sign Up
                                </Link>
                            </li>
                        </div>
                    </>
                )}
            </ul>
        </nav>
    );
};

export default Navbar;
