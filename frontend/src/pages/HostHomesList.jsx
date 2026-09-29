import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL;

const HostHomesList = () => {
    const [homes, setHomes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [confirmModal, setConfirmModal] = useState({ isOpen: false, home: null, newStatus: '' });
    const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        fetchHostHomes();
    }, [isLoggedIn, navigate]);

    const fetchHostHomes = () => {
        setLoading(true);
        axios.get(`${API_URL}/api/host/hostHome-list`)
            .then(res => {
                setHomes(res.data.homes || []);
            })
            .catch(err => {
                console.error("Error fetching host homes", err);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleToggleClick = (home) => {
        const newStatus = home.status === 'INACTIVE' ? 'ACTIVE' : 'INACTIVE';
        setConfirmModal({ isOpen: true, home, newStatus });
    };

    const confirmToggleStatus = () => {
        const { home, newStatus } = confirmModal;
        
        axios.post(`${API_URL}/api/host/delete-home/${home._id}`, {}, { withCredentials: true })
            .then(res => {
                setHomes(homes.map(h => h._id === home._id ? { ...h, status: newStatus } : h));
            })
            .catch(err => {
                console.error("Error toggling status", err);
            })
            .finally(() => {
                setConfirmModal({ isOpen: false, home: null, newStatus: '' });
            });
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center py-32">
            <div className="w-10 h-10 border-4 border-slate-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
            <p className="text-slate-600 font-medium">Loading your properties...</p>
        </div>
    );

    return (
        <main className="px-[5%] pt-[100px] pb-16 min-h-screen max-w-[1600px] mx-auto">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800">Your Listed Homes</h1>
                <Link to="/host/addHome" className="px-6 py-3 bg-gradient-to-br from-indigo-600 to-indigo-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all">
                    + Add New Property
                </Link>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {homes.map((home, index) => {
                    const image = home.imageUrl || (home.images && home.images.length > 0 ? home.images[0] : null);
                    return (
                        <div className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_15px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(0,0,0,0.1)] block animate-[fadeUp_0.5s_backwards]" key={home._id} style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="relative h-[220px] overflow-hidden bg-slate-100">
                                <img 
                                    src={image ? (image.includes('/') || image.includes('\\\\') ? `${API_URL}/${image.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${image}`) : ''} 
                                    onError={(e) => { e.target.src = 'https://via.placeholder.com/500x300?text=No+Image'; }} 
                                    alt={home.houseName} 
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                />
                                <div className={`absolute top-4 right-4 ${home.status === 'INACTIVE' ? 'bg-slate-600' : 'bg-emerald-600'} text-white px-3 py-1 rounded-full text-xs font-bold shadow-md`}>
                                    {home.status === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE'}
                                </div>
                            </div>
                            <div className="p-5">
                                <div className="flex justify-between items-center mb-1.5">
                                    <p className="text-[0.85rem] text-slate-500 font-semibold uppercase tracking-wide truncate">{home.city || home.location}</p>
                                </div>
                                <h2 className="text-[1.1rem] font-bold text-slate-900 mb-3 truncate">{home.houseName}</h2>
                                
                                <div className="mb-4">
                                    <p className="text-lg font-extrabold text-slate-900">₹{home.price} <span className="text-[0.9rem] font-medium text-slate-500">/ night</span></p>
                                </div>
                                
                                <div className="flex gap-3">
                                    <Link to={`/host/edit-home/${home._id}`} className="flex-1 text-center bg-indigo-50 text-indigo-700 py-2.5 rounded-lg font-semibold hover:bg-indigo-100 transition-colors border border-indigo-100">
                                        Edit
                                    </Link>
                                    <button onClick={() => handleToggleClick(home)} className={`flex-1 ${home.status === 'INACTIVE' ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100' : 'bg-rose-50 text-rose-600 border-rose-100 hover:bg-rose-100'} py-2.5 rounded-lg font-semibold transition-colors border cursor-pointer`}>
                                        {home.status === 'INACTIVE' ? 'Activate' : 'Deactivate'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                })}
                
                {homes.length === 0 && (
                    <div className="col-span-full text-center p-16 bg-white rounded-[20px] border border-dashed border-slate-300 max-w-[600px] mx-auto my-8">
                        <h3 className="text-2xl mb-2 text-slate-800 font-bold">You haven't listed any homes yet.</h3>
                        <p className="text-slate-500 mb-6">Start earning by listing your first property today!</p>
                        <Link to="/host/addHome" className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold shadow-md hover:bg-indigo-700 transition-colors">List your space</Link>
                    </div>
                )}
            </div>

            {/* Custom Confirmation Modal */}
            <ConfirmModal 
                isOpen={confirmModal.isOpen}
                title="Confirm Action"
                message={
                    <p className="m-0">
                        Are you sure you want to {confirmModal.newStatus === 'ACTIVE' ? 'activate' : 'deactivate'} <strong>{confirmModal.home?.houseName}</strong>?
                        {confirmModal.newStatus === 'INACTIVE' && ' It will no longer appear in the public search.'}
                    </p>
                }
                onCancel={() => setConfirmModal({ isOpen: false, home: null, newStatus: '' })}
                onConfirm={confirmToggleStatus}
                confirmText={confirmModal.newStatus === 'ACTIVE' ? 'Activate' : 'Deactivate'}
                confirmColor={confirmModal.newStatus === 'ACTIVE' ? 'emerald' : 'rose'}
            />
        </main>
    );
};

export default HostHomesList;
