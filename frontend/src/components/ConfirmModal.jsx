import React from 'react';

const ConfirmModal = ({ 
    isOpen, 
    title = 'Confirm Action', 
    message, 
    onCancel, 
    onConfirm, 
    confirmText = 'Confirm', 
    confirmColor = 'emerald'
}) => {
    if (!isOpen) return null;

    const buttonClass = confirmColor === 'emerald' 
        ? 'bg-emerald-600 hover:bg-emerald-700 hover:shadow-[0_8px_20px_rgba(5,150,105,0.3)]'
        : 'bg-rose-600 hover:bg-rose-700 hover:shadow-[0_8px_20px_rgba(225,29,72,0.3)]';

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm transition-opacity">
            <div className="bg-white p-8 rounded-[24px] shadow-2xl max-w-sm w-[90%] animate-[fadeUp_0.2s_ease-out]">
                <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
                <div className="text-slate-600 mb-8 leading-relaxed">
                    {message}
                </div>
                <div className="flex gap-4">
                    <button 
                        onClick={onCancel}
                        className="flex-1 py-3.5 rounded-xl font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors border-none cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={onConfirm}
                        className={`flex-1 py-3.5 rounded-xl font-semibold text-white shadow-md transition-all hover:-translate-y-0.5 border-none cursor-pointer ${buttonClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmModal;
