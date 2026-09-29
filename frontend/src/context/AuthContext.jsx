import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext();

const API_URL = import.meta.env.VITE_API_URL;

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);

    axios.defaults.withCredentials = true; // Crucial for session cookies

    useEffect(() => {
        // Check session on load
        axios.get(`${API_URL}/api/auth/login`)
            .then(response => {
                if (response.data.isLoggedIn) {
                    setIsLoggedIn(true);
                    setUser(response.data.user);
                }
            })
            .catch(err => console.log('Session check failed'))
            .finally(() => setLoading(false));
    }, []);

    const login = (userData) => {
        setIsLoggedIn(true);
        setUser(userData);
    };

    const logout = async () => {
        try {
            await axios.post(`${API_URL}/api/auth/logout`);
            setIsLoggedIn(false);
            setUser(null);
        } catch (err) {
            console.error("Logout error", err);
        }
    };

    return (
        <AuthContext.Provider value={{ user, setUser, isLoggedIn, setIsLoggedIn, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
