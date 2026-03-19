'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layout, CloudOff, Globe, Shield, Lock, Map, Smartphone, Laptop, Monitor } from 'lucide-react';

export const SovereigntyMap: React.FC = () => {
    return (
        <section className="py-32 bg-[#050505] relative overflow-hidden px-4 border-y-4 border-primary-500/20">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(244,63,94,0.05),transparent_70%)]" />
            
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center mb-24">
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        className="inline-block bg-primary-500 text-black font-black px-4 py-1 uppercase text-xs tracking-widest mb-6 shadow-[4px_4px_0px_white]"
                    >
                        PROTOCOL TOPOLOGY
                    </motion.div>
                    <h2 className="text-5xl md:text-8xl font-black text-white uppercase tracking-tighter mb-6 italic leading-none">
                        DATA <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 to-purple-500 drop-shadow-[0_0_30px_rgba(244,63,94,0.3)]">SOVEREIGNTY</span>
                    </h2>
                    <p className="max-w-2xl mx-auto text-neutral-500 font-bold font-mono text-lg uppercase tracking-tight">
                        Visualizing the boundary between your browser and the world.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-center relative">
                    {/* Connection Lines (Desktop Only) */}
                    <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/20 to-transparent hidden lg:block -translate-y-1/2 z-0" />

                    {/* Left: Public Web (Danger Zone) */}
                    <motion.div 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-neutral-900 border-4 border-neutral-800 p-12 text-center group hover:border-red-500/50 transition-colors z-10"
                    >
                        <div className="w-20 h-20 bg-neutral-800 flex items-center justify-center mx-auto mb-8 border-4 border-black group-hover:bg-red-950 transition-colors">
                            <Globe size={40} className="text-neutral-500 group-hover:text-red-500" />
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">PUBLIC WEB</h4>
                        <ul className="space-y-4 font-mono text-xs text-neutral-500 text-left bg-black/40 p-6 border-2 border-white/5 uppercase">
                            <li className="flex items-center gap-2">✕ UNTRUSTED NODE</li>
                            <li className="flex items-center gap-2 text-red-500/50">⚠ MITM VULNERABLE</li>
                            <li className="flex items-center gap-2">✕ THIRD PARTY LOGS</li>
                        </ul>
                    </motion.div>

                    {/* Center: The Vault (Secure Zone) */}
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 100 }}
                        className="bg-black border-4 border-primary-500 p-16 text-center transform lg:scale-125 shadow-[0_0_80px_rgba(244,63,94,0.2)] z-20 relative"
                    >
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary-500 text-black font-black px-4 py-1 text-[10px] uppercase border-2 border-black">
                            SECURE CONTEXT
                        </div>
                        <div className="w-24 h-24 bg-primary-500 flex items-center justify-center mx-auto mb-8 border-4 border-black shadow-[10px_10px_0px_white] animate-pulse">
                            <Lock size={48} className="text-black" />
                        </div>
                        <h4 className="text-3xl font-black text-white uppercase mb-4 tracking-tighter">BROWSER RAM</h4>
                        <div className="font-mono text-[10px] text-primary-400 uppercase font-black tracking-widest mb-6">ISO_LAYER_7_HANDSHAKE</div>
                        <div className="space-y-3">
                            <div className="h-1 w-full bg-primary-900 overflow-hidden">
                                <motion.div 
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                                    className="h-full w-1/3 bg-primary-500 shadow-[0_0_15px_rgba(244,63,94,1)]" 
                                />
                            </div>
                            <div className="text-[10px] text-neutral-500 uppercase font-bold">ALL DATA ENCRYPTED HERE</div>
                        </div>
                    </motion.div>

                    {/* Right: User Device (Safe Storage) */}
                    <motion.div 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        className="bg-neutral-900 border-4 border-neutral-800 p-12 text-center group hover:border-primary-500/50 transition-colors z-10"
                    >
                        <div className="w-20 h-20 bg-neutral-800 flex items-center justify-center mx-auto mb-8 border-4 border-black group-hover:bg-primary-950 transition-colors">
                            <Smartphone size={40} className="text-neutral-500 group-hover:text-primary-500" />
                        </div>
                        <h4 className="text-2xl font-black text-white uppercase mb-4 tracking-tighter">LOCAL DISK</h4>
                        <ul className="space-y-4 font-mono text-xs text-neutral-500 text-left bg-black/40 p-6 border-2 border-white/5 uppercase">
                            <li className="flex items-center gap-2 text-primary-500">✓ AES-256 AT REST</li>
                            <li className="flex items-center gap-2">✓ INDEXED_DB PERSIST</li>
                            <li className="flex items-center gap-2 text-primary-500">✓ ZERO CLOUD SYNC</li>
                        </ul>
                    </motion.div>
                </div>

                {/* Hardware Symbols */}
                <div className="mt-32 flex justify-center gap-12 opacity-20 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-700">
                    <Laptop size={40} className="text-white" />
                    <Monitor size={40} className="text-white" />
                    <Smartphone size={40} className="text-white" />
                </div>
            </div>
            
            {/* Background Text Grid */}
            <div className="absolute top-0 right-0 font-mono text-[120px] font-black opacity-[0.02] rotate-90 select-none pointer-events-none">
                PROTOCOL_MAP_01
                PROTOCOL_MAP_01
            </div>
        </section>
    );
};
