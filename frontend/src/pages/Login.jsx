import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData)
            .then(res => {
                if (res.data.success) {
                    login(res.data.user);
                    if (res.data.user.userType === 'host') {
                        navigate('/host/dashboard');
                    } else {
                        navigate('/trips');
                    }
                }
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Login failed');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <main className="w-[90%] max-w-[450px] mx-auto mt-[120px] bg-white/70 backdrop-blur-xl p-10 rounded-[24px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/80 animate-[fadeUp_0.6s_ease-out]">
            <h1 className="text-center text-3xl font-extrabold mb-6 bg-gradient-to-br from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">Welcome Back</h1>
            
            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl text-center text-sm font-semibold mb-5">{error}</div>}
            
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="mb-6 text-left">
                    <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Email Address</label>
                    <input 
                        type="email" 
                        name="email" 
                        onChange={handleChange} 
                        required 
                        className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"
                    />
                </div>
                <div className="mb-6 text-left">
                    <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Password</label>
                    <input 
                        type="password" 
                        name="password" 
                        onChange={handleChange} 
                        required 
                        className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"
                    />
                    <div className="text-right mt-2">
                        <Link to="/forgot-password" className="text-sm text-indigo-500 font-medium hover:underline">Forgot password?</Link>
                    </div>
                </div>
                <button type="submit" disabled={loading} className="w-full p-4 rounded-xl border-none text-[1.05rem] font-semibold cursor-pointer bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-[0_10px_25px_rgba(79,70,229,0.4)]">
                    {loading ? 'Logging in...' : 'Log In'}
                </button>
            </form>

            <p className="text-center mt-6 text-[0.9rem] text-slate-600 font-medium">
                Don't have an account? <Link to="/signup" className="text-indigo-600 font-bold hover:underline">Sign up</Link>
            </p>
        </main>
    );
};

export default Login;
