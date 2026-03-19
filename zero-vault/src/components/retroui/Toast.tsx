import { useState, useEffect } from 'react';
import { CheckCircle, AlertCircle, X } from 'lucide-react';

interface ToastProps {
    message: string;
    type?: 'success' | 'error' | 'info';
    duration?: number;
    onClose: () => void;
}

export function Toast({ message, type = 'info', duration = 3000, onClose }: ToastProps) {
    useEffect(() => {
        const timer = setTimeout(onClose, duration);
        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgClass = {
        success: 'bg-green-400',
        error: 'bg-primary-500',
        info: 'bg-black text-white'
    }[type];

    const Icon = {
        success: CheckCircle,
        error: AlertCircle,
        info: AlertCircle
    }[type];

    return (
        <div className="fixed bottom-8 right-8 z-[200] animate-in slide-in-from-right-10 duration-300">
            <div className={`flex items-center gap-4 p-4 border-2 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] ${bgClass} min-w-[300px]`}>
                <div className={`p-1 ${type === 'info' ? 'text-white' : 'text-black'}`}>
                    <Icon size={24} strokeWidth={3} />
                </div>

                <div className={`font-black uppercase tracking-tight flex-1 text-sm ${type === 'info' ? 'text-white' : 'text-black'}`}>
                    {message}
                </div>

                <button
                    onClick={onClose}
                    className={`p-1 hover:scale-110 transition-transform ${type === 'info' ? 'text-white' : 'text-black'}`}
                >
                    <X size={18} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
