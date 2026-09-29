import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PROPERTY_TYPES = ['Entire home', 'Apartment', 'Private room', 'Shared room', 'Villa', 'Guest house', 'Other'];
const AVAILABLE_AMENITIES = ['Wi-Fi', 'Kitchen', 'Parking', 'Air Conditioning', 'Heating', 'TV', 'Washing Machine', 'Workspace', 'Pool', 'Balcony'];
const API_URL = import.meta.env.VITE_API_URL;

const HomeForm = () => {
    const { isLoggedIn, loading: authLoading } = useContext(AuthContext);
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditing = Boolean(id);

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        houseName: '', description: '', propertyType: 'Entire home',
        location: '', address: '', city: '', state: '', country: '',
        price: '', cleaningFee: '0', maxGuests: '1', bedrooms: '1', beds: '1', bathrooms: '1', rating: '5', amenities: []
    });

    const [imageFiles, setImageFiles] = useState([]);
    const [previewUrls, setPreviewUrls] = useState([]);

    useEffect(() => {
        if (authLoading) return;

        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (isEditing) {
            axios.get(`${API_URL}/api/host/edit-home/${id}`)
                .then(res => {
                    const home = res.data.home;
                    setFormData({ ...formData, ...home, amenities: home.amenities || [] });
                    
                    if (home.images && home.images.length > 0) {
                        setPreviewUrls(home.images.map(img => img.includes('/') || img.includes('\\\\') ? `${API_URL}/${img.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${img}`));
                    } else if (home.imageUrl) {
                        setPreviewUrls([home.imageUrl.includes('/') || home.imageUrl.includes('\\\\') ? `${API_URL}/${home.imageUrl.replace(/\\/g, '/')}` : `${API_URL}/api/store/images/${home.imageUrl}`]);
                    }
                })
                .catch(err => {
                    setError('Failed to fetch home details.');
                });
        }
    }, [id, isEditing, isLoggedIn, navigate]);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleAmenityToggle = (amenity) => {
        const current = [...formData.amenities];
        if (current.includes(amenity)) setFormData({ ...formData, amenities: current.filter(a => a !== amenity) });
        else setFormData({ ...formData, amenities: [...current, amenity] });
    };

    const handleFiles = (e) => {
        const files = Array.from(e.target.files);
        
        if (imageFiles.length + files.length > 5) {
            setError('You can only select up to 5 images in total.');
            e.target.value = '';
            return;
        }
        
        setError('');
        setImageFiles(prev => [...prev, ...files]);
        setPreviewUrls(prev => [...prev, ...files.map(file => URL.createObjectURL(file))]);
        
        // Reset the input so the user doesn't see "1 file selected" and can click again cleanly
        e.target.value = '';
    };

    const removeImage = (index) => {
        if (imageFiles.length > 0) {
            const newFiles = [...imageFiles];
            newFiles.splice(index, 1);
            setImageFiles(newFiles);
            
            const newUrls = [...previewUrls];
            newUrls.splice(index, 1);
            setPreviewUrls(newUrls);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step < 4) return setStep(step + 1);

        setError(''); setLoading(true);
        
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (key === 'amenities') data.append(key, formData[key].join(','));
            else data.append(key, formData[key]);
        });
        
        if (isEditing) data.append('_id', id);
        imageFiles.forEach(file => data.append('images', file));

        try {
            const url = isEditing ? `${API_URL}/api/host/edit-home` : `${API_URL}/api/host/addHome`;
            await axios.post(url, data, { headers: { 'Content-Type': 'multipart/form-data' } });
            navigate('/host/homes');
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to save home.');
        } finally {
            setLoading(false);
        }
    };

    const inputClass = "w-full rounded-xl bg-white/90 border border-slate-200 p-3.5 text-[0.95rem] transition-all focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 outline-none";
    const labelClass = "block text-[0.9rem] font-semibold text-slate-700 mb-1.5";

    return (
        <main className="w-[90%] max-w-[800px] mx-auto mt-[120px] bg-white/70 backdrop-blur-xl p-12 rounded-[24px] shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] border border-white/80 mb-20 animate-[fadeUp_0.6s_ease-out]">
            <h1 className="text-center text-3xl font-extrabold mb-8 bg-gradient-to-r from-indigo-600 to-fuchsia-500 bg-clip-text text-transparent">
                {isEditing ? 'Edit Your Listing' : 'Create a Listing'}
            </h1>
            
            <div className="flex justify-between mb-8 border-b-2 border-slate-200 pb-4">
                {[1, 2, 3, 4].map(s => (
                    <span key={s} className={`text-sm font-semibold transition-colors ${step >= s ? 'text-indigo-600' : 'text-slate-400'}`}>
                        {s}. {['Basic', 'Location', 'Features', 'Images'][s-1]}
                    </span>
                ))}
            </div>

            {error && <div className="bg-rose-100 text-rose-600 p-3 rounded-xl text-center text-sm font-semibold mb-6">{error}</div>}

            <form onSubmit={handleSubmit} encType="multipart/form-data" className="text-left">
                {step === 1 && (
                    <div className="space-y-6 animate-[slideIn_0.3s_ease-out]">
                        <div>
                            <label className={labelClass}>Property Title</label>
                            <input type="text" name="houseName" value={formData.houseName} onChange={handleChange} required placeholder="e.g. Cozy Beachfront Villa" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Property Type</label>
                            <select name="propertyType" value={formData.propertyType} onChange={handleChange} className={inputClass}>
                                {PROPERTY_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea name="description" value={formData.description} onChange={handleChange} rows="4" required placeholder="Describe what makes your place special..." className={inputClass}></textarea>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-6 animate-[slideIn_0.3s_ease-out]">
                        <div>
                            <label className={labelClass}>General Location</label>
                            <input type="text" name="location" value={formData.location} onChange={handleChange} required placeholder="e.g. North Goa" className={inputClass} />
                        </div>
                        <div>
                            <label className={labelClass}>Street Address</label>
                            <input type="text" name="address" value={formData.address} onChange={handleChange} placeholder="123 Ocean Drive" className={inputClass} />
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={labelClass}>City</label>
                                <input type="text" name="city" value={formData.city} onChange={handleChange} required className={inputClass} />
                            </div>
                            <div className="flex-1">
                                <label className={labelClass}>State</label>
                                <input type="text" name="state" value={formData.state} onChange={handleChange} required className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Country</label>
                            <input type="text" name="country" value={formData.country} onChange={handleChange} required className={inputClass} />
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-6 animate-[slideIn_0.3s_ease-out]">
                        <div className="flex gap-4">
                            {['Guests', 'Bedrooms', 'Beds', 'Baths'].map(lbl => {
                                const name = lbl.toLowerCase() === 'guests' ? 'maxGuests' : lbl.toLowerCase() === 'baths' ? 'bathrooms' : lbl.toLowerCase();
                                return (
                                    <div className="flex-1" key={lbl}>
                                        <label className={labelClass}>{lbl}</label>
                                        <input type="number" step={lbl==='Baths'?"0.5":"1"} name={name} min={lbl==='Guests'?"1":"0"} value={formData[name]} onChange={handleChange} required className={inputClass} />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <label className={labelClass}>Price per night (₹)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required className={inputClass} />
                            </div>
                            <div className="flex-1">
                                <label className={labelClass}>Cleaning Fee (₹) [Optional]</label>
                                <input type="number" name="cleaningFee" value={formData.cleaningFee} onChange={handleChange} className={inputClass} />
                            </div>
                        </div>
                        <div>
                            <label className={labelClass}>Amenities</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-2">
                                {AVAILABLE_AMENITIES.map(amenity => (
                                    <div key={amenity} onClick={() => handleAmenityToggle(amenity)} className={`p-2.5 rounded-xl border text-center text-sm font-medium cursor-pointer transition-all ${formData.amenities.includes(amenity) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-200'}`}>
                                        {amenity}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {step === 4 && (
                    <div className="space-y-6 animate-[slideIn_0.3s_ease-out]">
                        <div>
                            <label className={labelClass}>Upload Property Images</label>
                            <div className="p-8 border-2 border-dashed border-slate-300 rounded-xl text-center bg-slate-50">
                                <input type="file" name="images" onChange={handleFiles} accept="image/*" multiple required={!isEditing && imageFiles.length === 0} className="mb-2" />
                                <p className="text-sm text-slate-500">Select up to 5 images. High quality photos increase bookings!</p>
                            </div>
                        </div>
                        {previewUrls.length > 0 && (
                            <div className="flex flex-wrap gap-4 mt-4">
                                {previewUrls.map((url, idx) => (
                                    <div className="relative w-[120px] h-[90px] rounded-lg overflow-hidden shadow-md" key={idx}>
                                        <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                                        {imageFiles.length > 0 && (
                                            <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/60 text-white border-none rounded-full w-6 h-6 flex items-center justify-center cursor-pointer text-xs">✕</button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <div className="flex gap-4 mt-10">
                    {step > 1 && (
                        <button type="button" onClick={() => setStep(step - 1)} className="flex-1 py-4 rounded-xl border border-slate-300 bg-white text-slate-700 font-semibold cursor-pointer transition-colors hover:bg-slate-50 text-lg">
                            Back
                        </button>
                    )}
                    <button type="submit" disabled={loading} className="flex-[2] py-4 rounded-xl border-none bg-gradient-to-br from-emerald-500 to-emerald-600 text-white font-semibold cursor-pointer transition-transform hover:-translate-y-1 hover:shadow-[0_15px_35px_rgba(16,185,129,0.5)] text-lg disabled:opacity-70">
                        {step < 4 ? 'Next Step' : (loading ? 'Publishing...' : (isEditing ? 'Save Changes' : 'Publish Listing'))}
                    </button>
                </div>
            </form>
        </main>
    );
};

export default HomeForm;
