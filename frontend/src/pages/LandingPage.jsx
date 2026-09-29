import React from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    return (
        <main className="min-h-screen flex flex-col pt-[80px]">
            {/* Hero Section */}
            <section className="flex-1 flex flex-col items-center justify-center text-center px-[5%] py-20 bg-gradient-to-br from-indigo-50 via-white to-pink-50 relative overflow-hidden">
                
                {/* Decorative background blur */}
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
                <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
                
                <div className="relative z-10 max-w-4xl mx-auto">
                    <h1 className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight leading-tight">
                        Find your next <br/>
                        <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 bg-clip-text text-transparent">perfect stay.</span>
                    </h1>
                    
                    <p className="text-lg md:text-xl text-slate-600 mb-10 max-w-2xl mx-auto font-medium">
                        Welcome to HomeRental. Whether you're looking for a cozy room for the weekend or want to host travelers in your beautiful property, we've got you covered.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <Link to="/explore" className="px-8 py-4 rounded-full font-bold text-white bg-slate-900 shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:-translate-y-1 transition-transform w-full sm:w-auto">
                            Explore Properties
                        </Link>
                        <div className="flex items-center gap-4 w-full sm:w-auto justify-center">
                            <span className="text-slate-400 font-medium hidden sm:block">or</span>
                            <Link to="/signup" className="px-8 py-4 rounded-full font-bold text-indigo-600 bg-white border border-indigo-100 shadow-[0_10px_30px_rgba(79,70,229,0.1)] hover:border-indigo-600 hover:-translate-y-1 transition-transform w-full sm:w-auto text-center">
                                Become a Host
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </main>
    );
};

export default LandingPage;
