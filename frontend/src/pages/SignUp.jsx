import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const SignUp = () => {
    const [formData, setFormData] = useState({
        fname: '', lname: '', email: '', password: '', confirmPassword: '', userType: 'guest', term: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? (e.target.checked ? 'on' : '') : e.target.value;
        setFormData({ ...formData, [e.target.name]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setError('');
        
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);

        axios.post(`${import.meta.env.VITE_API_URL}/api/auth/signup`, formData)
            .then(res => {
                if (res.data.success) {
                    navigate('/login');
                }
            })
            .catch(err => {
                const data = err.response?.data;
                if (data?.details && Array.isArray(data.details)) {
                    setError(data.details.join(' • '));
                } else {
                    setError(data?.error || 'Signup failed');
                }
            })
            .finally(() => {
                setLoading(false);
            });
    };

    return (
        <main className="w-[90%] max-w-[450px] mx-auto mt-[120px] bg-white/70 backdrop-blur-xl p-10 rounded-[24px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/80 animate-[fadeUp_0.6s_ease-out] mb-20">
            <h1 className="text-center text-3xl font-extrabold mb-6 bg-gradient-to-br from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">Create Account</h1>
            
            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl text-center text-sm font-semibold mb-5">{error}</div>}
            
            <form onSubmit={handleSubmit} className="flex flex-col">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1 text-left">
                        <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">First Name</label>
                        <input type="text" name="fname" onChange={handleChange} required className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"/>
                    </div>
                    <div className="flex-1 text-left">
                        <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Last Name</label>
                        <input type="text" name="lname" onChange={handleChange} required className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"/>
                    </div>
                </div>

                <div className="mb-4 text-left">
                    <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Email Address</label>
                    <input type="email" name="email" onChange={handleChange} required className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"/>
                </div>

                <div className="mb-4 text-left">
                    <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Password</label>
                    <input type="password" name="password" onChange={handleChange} required className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"/>
                </div>

                <div className="mb-4 text-left">
                    <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">Confirm Password</label>
                    <input type="password" name="confirmPassword" onChange={handleChange} required className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none"/>
                </div>

                <div className="mb-4 text-left">
                    <label className="block text-[0.9rem] font-semibold text-slate-600 mb-2">I want to...</label>
                    <select name="userType" onChange={handleChange} className="w-full rounded-xl bg-white/90 border border-slate-200 p-[14px_16px] text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none">
                        <option value="guest">Book properties (Guest)</option>
                        <option value="host">List my properties (Host)</option>
                    </select>
                </div>

                <div className="mb-6 text-left flex items-start gap-2">
                    <input type="checkbox" name="term" id="term" onChange={handleChange} className="mt-1" />
                    <label htmlFor="term" className="text-[0.85rem] text-slate-600 font-medium leading-tight">
                        I agree to the Terms and Conditions and Privacy Policy
                    </label>
                </div>

                <button type="submit" disabled={loading} className="w-full p-4 rounded-xl border-none text-[1.05rem] font-semibold cursor-pointer bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-[0_10px_25px_rgba(79,70,229,0.4)] transition-all hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(79,70,229,0.5)] mt-2 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:-translate-y-0 disabled:hover:shadow-[0_10px_25px_rgba(79,70,229,0.4)]">
                    {loading ? 'Creating Account...' : 'Sign Up'}
                </button>
            </form>

            <p className="text-center mt-6 text-[0.9rem] text-slate-600 font-medium">
                Already have an account? <Link to="/login" className="text-indigo-600 font-bold hover:underline">Log in</Link>
            </p>
        </main>
    );
};

export default SignUp;
