'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Archive, FileSpreadsheet, Lock, ShieldCheck, ArrowRight, ArrowDown } from 'lucide-react';

export const TransportFeature: React.FC = () => {
    return (
        <section className="py-24 bg-white border-b-4 border-black relative overflow-hidden">
            {/* Background elements */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
                 style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <div className="max-w-7xl mx-auto px-4 relative">
                <div className="flex flex-col lg:flex-row items-center gap-16">
                    {/* Visual Side */}
                    <div className="w-full lg:w-1/2 relative perspective-1000">
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.9, rotateY: -15, rotateX: 5 }}
                            whileInView={{ opacity: 1, scale: 1, rotateY: 0, rotateX: 0 }}
                            whileHover={{ scale: 1.02, rotateX: -2, rotateY: 5 }}
                            viewport={{ once: true }}
                            className="relative aspect-square max-w-lg mx-auto transform-style-3d group cursor-pointer"
                        >
                            {/* The "ZIP" Container */}
                            <div className="absolute inset-0 bg-white border-[1px] border-black/10 shadow-[40px_40px_80px_-20px_rgba(0,0,0,0.5),0_0_40px_rgba(244,63,94,0.05)] flex flex-col items-center justify-center p-8 backdrop-blur-3xl overflow-hidden rounded-2xl">
                                {/* Inner depth pattern */}
                                <div className="absolute inset-0 opacity-[0.02] bg-[url('/images/dots.png')] bg-repeat" />
                                
                                <motion.div 
                                    whileHover={{ scale: 1.1, rotate: 12 }}
                                    className="relative z-10 bg-red-500 text-white p-10 border-4 border-black shadow-[12px_12px_0px_#000] rotate-3 transition-all duration-300"
                                >
                                    <Archive size={80} strokeWidth={2.5} />
                                </motion.div>

                                <div className="mt-12 text-center relative z-10">
                                    <div className="text-4xl font-black uppercase tracking-tighter mb-2 text-black leading-none italic">EXPORT.ZIP</div>
                                    <div className="flex items-center gap-3 justify-center text-red-600 font-black bg-red-50 px-4 py-2 border-2 border-red-100 rounded-full">
                                        <Lock size={18} fill="currentColor" /> 
                                        <span className="text-xs uppercase tracking-[0.2em]">ENCRYPTED PROTOCOL</span>
                                    </div>
                                </div>
                                
                                {/* 3D Hover Parallax Elements */}
                                <motion.div 
                                    style={{ translateZ: 120 }}
                                    animate={{ 
                                        y: [0, -15, 0],
                                        rotate: [0, 8, 0]
                                    }}
                                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                                    className="absolute top-8 left-8 bg-black text-white p-5 shadow-[10px_10px_0px_#f43f5e] flex items-center gap-3 z-20 border-2 border-white/10"
                                >
                                    <FileSpreadsheet className="text-green-400" size={36} />
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-neutral-500">FORMAT</div>
                                        <div className="text-sm font-black uppercase tracking-tight">VAULT.CSV</div>
                                    </div>
                                </motion.div>

                                <motion.div 
                                    style={{ translateZ: 150 }}
                                    animate={{ 
                                        y: [0, 15, 0],
                                        rotate: [0, -6, 0]
                                    }}
                                    transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                                    className="absolute bottom-10 right-8 bg-white border-4 border-black p-5 shadow-[10px_10px_0px_#000] flex items-center gap-3 z-30"
                                >
                                    <ShieldCheck className="text-primary-600" size={36} />
                                    <div>
                                        <div className="text-[10px] font-black uppercase text-neutral-400">ENCRYPTION</div>
                                        <div className="text-sm font-black uppercase tracking-tight">AES-256-GCM</div>
                                    </div>
                                </motion.div>

                                {/* Decorative glow orbs */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/10 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity delay-100" />
                            </div>
                        </motion.div>
                    </div>

                    {/* Content Side */}
                    <div className="w-full lg:w-1/2">
                        <div className="mb-2">
                            <span className="bg-black text-white text-[12px] font-black px-3 py-1 uppercase tracking-widest">Protocol Intelligence</span>
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-6 leading-[0.9]">
                            SECURE ARCHIVE <br />
                            <span className="text-primary-600">ENCRYPTED ZIP</span>
                        </h2>
                        
                        <p className="text-xl font-bold text-neutral-700 mb-10 leading-relaxed max-w-xl">
                            Move your vault with total confidence. ZeroVault generates industry-standard, password-protected ZIP archives containing your credentials in structured CSV format.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: "UNIVERSAL COMPATIBILITY", desc: "Open your secure export using any modern compression tool or spreadsheet software (after supplying your transport secret)." },
                                { title: "STRUCTURAL PROTECTION", desc: "Structured CSV layout includes sites, usernames, passwords, notes, and metadata for easy migration." },
                                { title: "OFFLINE FIRST", desc: "No internet connection required. The entire encryption and archiving process happens locally in your browser context." }
                            ].map((item, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ opacity: 0, x: 20 }}
                                    whileInView={{ opacity: 1, x: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.2 }}
                                    className="flex gap-4 p-4 hover:bg-neutral-50 border-l-4 border-transparent hover:border-black transition-all group"
                                >
                                    <div className="shrink-0 w-8 h-8 rounded-full bg-black text-white flex items-center justify-center font-black text-sm">
                                        {i + 1}
                                    </div>
                                    <div>
                                        <h4 className="font-black uppercase text-lg group-hover:text-primary-600 transition-colors">{item.title}</h4>
                                        <p className="font-bold text-neutral-500 font-mono text-sm">{item.desc}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <div className="mt-12 flex flex-col sm:flex-row gap-6">
                            <motion.button 
                                whileHover={{ scale: 1.05, translateZ: 0 }}
                                whileTap={{ scale: 0.95 }}
                                className="bg-black text-white px-10 py-5 rounded-none font-black text-xl uppercase tracking-tighter shadow-[8px_8px_0px_0px_rgba(244,63,94,1)] hover:shadow-none transition-all flex items-center justify-center gap-3"
                            >
                                START SECURE VAULT <ArrowRight size={24} />
                            </motion.button>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};
