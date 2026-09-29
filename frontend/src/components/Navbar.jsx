import React, { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

import axios from 'axios';
const API_URL = import.meta.env.VITE_API_URL;

const Navbar = () => {
    const { isLoggedIn, user, logout } = useContext(AuthContext);
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    const getLinkClass = (path) => 
        `font-semibold no-underline transition-colors ${pathname === path ? 'text-indigo-600 border-b-2 border-indigo-600 pb-1' : 'text-slate-600 hover:text-indigo-600 border-b-2 border-transparent pb-1'}`;

    return (
        <nav className="fixed top-0 left-0 right-0 h-[80px] bg-white/80 backdrop-blur-xl border-b border-white/50 z-50 flex items-center justify-between px-[6%] shadow-sm">
            <div className="flex items-center">
                <Link to="/" className="text-2xl font-black bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent no-underline tracking-tight flex items-center gap-2">
                    <span className="text-3xl text-indigo-600">⌂</span> HomeRental
                </Link>
            </div>

            <ul className="flex list-none gap-6 items-center m-0 p-0">
                {isLoggedIn ? (
                    <>
                        <li><Link to="/explore" className={getLinkClass('/explore')}>Explore</Link></li>
                        
                        {user?.userType === 'host' ? (
                            <>
                                <li><Link to="/host/homes" className={getLinkClass('/host/homes')}>Property</Link></li>
                                <li><Link to="/host/dashboard" className={getLinkClass('/host/dashboard')}>Overview</Link></li>
                                <li><Link to="/host/bookings" className={getLinkClass('/host/bookings')}>Reservation</Link></li>
                            </>
                        ) : (
                            <>
                                <li><Link to="/trips" className={getLinkClass('/trips')}>Trip</Link></li>
                                <li><Link to="/favorites" className={getLinkClass('/favorites')}>Favorite</Link></li>
                            </>
                        )}
                        <li>
                            <button onClick={handleLogout} className="px-5 py-2.5 rounded-xl font-semibold cursor-pointer border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-md transition-all hover:-translate-y-0.5 hover:shadow-lg">
                                Logout
                            </button>
                        </li>
                    </>
                ) : (
                    <>
                        <li><Link to="/" className={getLinkClass('/')}>Home</Link></li>
                        <div className="flex items-center gap-4 ml-2">
                            <li>
                                <Link to="/login" className="px-5 py-2.5 rounded-xl font-bold cursor-pointer border-2 border-indigo-100 bg-white text-indigo-600 shadow-sm transition-all hover:border-indigo-600 hover:text-indigo-700 hover:-translate-y-0.5">
                                    Login
                                </Link>
                            </li>
                            <li>
                                <Link to="/signup" className="px-5 py-2.5 rounded-xl font-bold cursor-pointer border-none bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_4px_15px_rgba(79,70,229,0.3)] transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_20px_rgba(79,70,229,0.4)]">
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
