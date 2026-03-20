'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { KeyRound, Database, Zap, Bomb, ArrowRight } from 'lucide-react';

const steps = [
    {
        icon: KeyRound,
        title: "INITIALIZE PROTOCOL",
        description: "Set a single, unrecoverable master password. This generates a 256-bit AES key locally in your browser. No data ever hits our servers.",
        color: "bg-primary-500",
        textColor: "text-white"
    },
    {
        icon: Database,
        title: "STORE SECRETS",
        description: "Add your passwords, notes, and sensitive data. Everything is encrypted *before* it gets stored in your browser's IndexedDB.",
        color: "bg-white",
        textColor: "text-black"
    },
    {
        icon: Zap,
        title: "DEPLOY EXTENSION",
        description: "Link the ZeroVault browser extension. It requests the decrypted keys from your web vault locally to auto-fill your logins instantly.",
        color: "bg-purple-500",
        textColor: "text-white"
    },
    {
        icon: Bomb,
        title: "SELF DESTRUCT",
        description: "Under threat? One click wipes your entire local database. Zero traces left behind. Total data sovereignty.",
        color: "bg-black",
        textColor: "text-white"
    }
];

export const HowItWorks: React.FC = () => {
    return (
        <section id="how-it-works" className="py-24 bg-[#fafafa] border-y-8 border-black relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '16px 16px' }} />

            <div className="max-w-6xl mx-auto px-4 relative z-10">
                <div className="text-center mb-20">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block bg-black text-white font-black px-4 py-1 uppercase text-xs tracking-widest mb-6 shadow-[4px_4px_0px_#f43f5e]"
                    >
                        TUTORIAL
                    </motion.div>
                    <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter drop-shadow-[4px_4px_0px_#000] text-white">
                        <span className="text-black drop-shadow-[4px_4px_0px_#f43f5e]">HOW TO</span> OPERATE
                    </h2>
                    <p className="mt-6 text-neutral-600 font-mono font-bold max-w-2xl mx-auto uppercase tracking-tight">
                        A step-by-step guide to achieving total digital sovereignty. No cloud required.
                    </p>
                </div>

                <div className="relative">
                    {/* Connecting Line */}
                    <div className="absolute top-1/2 left-0 w-full h-2 bg-black hidden lg:block -translate-y-1/2 z-0"></div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative z-10">
                        {steps.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 50 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative group"
                            >
                                {/* Neo-Brutalist Card */}
                                <div className={`border-4 border-black p-6 ${step.color} ${step.textColor} shadow-[8px_8px_0px_#000] group-hover:translate-x-1 group-hover:-translate-y-1 group-hover:shadow-[12px_12px_0px_#000] transition-all duration-200 h-full flex flex-col`}>
                                    
                                    <div className="flex justify-between items-start mb-6 border-b-2 border-current pb-4 opacity-80">
                                        <div className="font-mono font-black text-3xl">0{i + 1}</div>
                                        <div className="p-3 border-2 border-current bg-black/10">
                                            <step.icon size={28} strokeWidth={2.5} />
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-4 leading-tight">
                                        {step.title}
                                    </h3>
                                    
                                    <p className="font-mono font-bold text-sm opacity-90 leading-relaxed mt-auto">
                                        {step.description}
                                    </p>
                                </div>

                                {/* Mobile Arrow (shows on small screens only) */}
                                {i < steps.length - 1 && (
                                    <div className="flex justify-center my-4 lg:hidden">
                                        <ArrowRight size={32} strokeWidth={3} className="rotate-90 text-black" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};
