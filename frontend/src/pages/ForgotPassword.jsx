import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    
    const [step, setStep] = useState(1); // 1 = Request OTP, 2 = Verify OTP & Reset
    
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleRequestOtp = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        setLoading(true);

        axios.post(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, { email })
            .then(res => {
                setMessage(res.data.message);
                setStep(2);
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Something went wrong');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleResetPassword = (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (newPassword !== confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);

        axios.post(`${import.meta.env.VITE_API_URL}/api/auth/reset-password`, { 
            password: newPassword, 
            token: otp 
        })
            .then(res => {
                if (res.data.success) {
                    navigate('/login');
                }
            })
            .catch(err => {
                setError(err.response?.data?.error || 'Failed to reset password');
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <main className="w-[90%] max-w-[450px] mx-auto mt-[120px] bg-white/70 backdrop-blur-xl p-10 rounded-[24px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/80 animate-[fadeUp_0.6s_ease-out]">
            <h1 className="text-center text-3xl font-extrabold mb-6 bg-gradient-to-br from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">Reset Password</h1>
            
            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl text-center text-sm font-semibold mb-5">{error}</div>}
            {message && <div className="bg-emerald-100 text-emerald-700 p-3 rounded-xl text-center text-sm font-semibold mb-5">{message}</div>}
            
            {step === 1 ? (
                <form onSubmit={handleRequestOtp} className="flex flex-col">
                    <div className="mb-6 text-left">
                        <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Email Address</label>
                        <input 
                            type="email" 
                            value={email} 
                            onChange={(e) => setEmail(e.target.value)} 
                            required 
                            className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full p-4 rounded-xl border-none text-[1.05rem] font-semibold cursor-pointer bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? 'Sending...' : 'Send OTP'}
                    </button>
                </form>
            ) : (
                <form onSubmit={handleResetPassword} className="flex flex-col">
                    <div className="mb-4 text-left">
                        <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">6-Digit OTP</label>
                        <input 
                            type="text" 
                            value={otp} 
                            onChange={(e) => setOtp(e.target.value)} 
                            required 
                            placeholder="e.g. 123456"
                            className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] tracking-widest transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none font-mono"
                        />
                    </div>
                    <div className="mb-4 text-left">
                        <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">New Password</label>
                        <input 
                            type="password" 
                            value={newPassword} 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            required 
                            className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"
                        />
                    </div>
                    <div className="mb-6 text-left">
                        <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Confirm New Password</label>
                        <input 
                            type="password" 
                            value={confirmPassword} 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            required 
                            className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"
                        />
                    </div>
                    <button type="submit" disabled={loading} className="w-full p-4 rounded-xl border-none text-[1.05rem] font-semibold cursor-pointer bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed">
                        {loading ? 'Updating...' : 'Update Password'}
                    </button>
                    <button type="button" onClick={() => setStep(1)} className="mt-4 text-sm font-semibold text-slate-500 hover:text-slate-800 transition-colors">
                        ← Back to Email
                    </button>
                </form>
            )}

            <p className="text-center mt-6 text-[0.9rem] text-slate-600 font-medium">
                Remember your password? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
            </p>
        </main>
    );
};

export default ForgotPassword;
