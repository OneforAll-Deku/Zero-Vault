import { Button } from "./Button";
import { Card } from "./Card";
import { AlertCircle } from "lucide-react";

interface ConfirmModalProps {
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    onCancel: () => void;
    confirmText?: string;
    cancelText?: string;
    variant?: "danger" | "normal";
}

export function ConfirmModal({
    isOpen,
    title,
    message,
    onConfirm,
    onCancel,
    confirmText = "CONFIRM",
    cancelText = "CANCEL",
    variant = "normal"
}: ConfirmModalProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
            <div onClick={onCancel} className="absolute inset-0" />
            <Card className={`w-full max-w-sm bg-white border-4 border-black relative z-[110] p-8 animate-in zoom-in-95 duration-200 shadow-[10px_10px_0px_0px_rgba(0,0,0,1)]`}>
                <div className="flex flex-col items-center text-center">
                    <div className={`w-16 h-16 rounded-full border-4 border-black flex items-center justify-center mb-6 transition-colors ${variant === 'danger' ? 'bg-primary-500 text-white' : 'bg-yellow-400 text-black'}`}>
                        <AlertCircle size={32} strokeWidth={3} />
                    </div>

                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2 text-black leading-none">
                        {title}
                    </h2>

                    <p className="text-neutral-500 font-mono text-sm leading-relaxed mb-8">
                        {message}
                    </p>

                    <div className="flex gap-4 w-full">
                        <Button
                            className="flex-1 bg-white border-2 border-black text-black hover:bg-neutral-100 py-4 font-black text-sm active:translate-y-1 transition-all"
                            onClick={onCancel}
                        >
                            {cancelText}
                        </Button>
                        <Button
                            className={`flex-1 border-2 border-black text-white py-4 font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none transition-all ${variant === 'danger' ? 'bg-primary-500 hover:bg-primary-600' : 'bg-black hover:bg-neutral-800'}`}
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </Card>
        </div>
    );
}
