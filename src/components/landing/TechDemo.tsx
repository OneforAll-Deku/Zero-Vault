'use client';

import React, { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import { Play, Shield, Lock, Eye, Cpu, Database, Share2, Terminal, Fingerprint, Activity, Layers, Zap } from 'lucide-react';

export const TechDemo: React.FC = () => {
    const x = useMotionValue(0);
    const y = useMotionValue(0);

    const mouseXSpring = useSpring(x, { stiffness: 100, damping: 20 });
    const mouseYSpring = useSpring(y, { stiffness: 100, damping: 20 });

    const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ["15deg", "-15deg"]);
    const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ["-15deg", "15deg"]);

    const [activeCard, setActiveCard] = useState<string | null>(null);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const width = rect.width;
        const height = rect.height;
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const xPct = mouseX / width - 0.5;
        const yPct = mouseY / height - 0.5;

        x.set(xPct);
        y.set(yPct);
    };

    const handleMouseLeave = () => {
        x.set(0);
        y.set(0);
        setActiveCard(null);
    };

    return (
        <div className="relative w-full max-w-7xl mx-auto mt-40 px-4 perspective-1000">
            <div 
                className="relative min-h-[700px] flex items-center justify-center p-8 lg:p-20"
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
            >
                {/* Data Streaming SVG Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-primary-500/20 stroke-2 fill-none overflow-visible -z-5" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <motion.path 
                        d="M 50 50 L 100 100" 
                        vectorEffect="non-scaling-stroke"
                        initial={{ pathLength: 0, opacity: 0 }}
                        whileInView={{ pathLength: 1, opacity: 1 }}
                    />
                </svg>

                {/* Product Showcase Window */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                    }}
                    className="relative w-full max-w-4xl aspect-[16/10] bg-[#0c0c0c] border-[6px] border-black shadow-[40px_40px_0px_0px_rgba(0,0,0,0.6),0_0_120px_rgba(244,63,94,0.15)] overflow-hidden group/window"
                >
                    {/* Window Header */}
                    <div className="h-12 bg-black border-b-4 border-black flex items-center px-6 gap-2 justify-between">
                        <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <div className="w-3 h-3 rounded-full bg-yellow-500" />
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                        </div>
                        <div className="text-[11px] font-black text-white/40 font-mono tracking-widest uppercase">ZERO_VAULT_PROTOCOL_V2.0</div>
                        <div className="flex gap-4 items-center">
                            <div className="w-24 h-1 bg-white/5 rounded-full" />
                            <div className="w-2 h-2 rounded-full bg-primary-500 animate-ping" />
                        </div>
                    </div>

                    {/* Window Body/App Interface Simulation */}
                    <div className="p-10 h-full flex flex-col relative">
                        <div className="flex justify-between items-start mb-12">
                            <div>
                                <motion.h4 
                                  initial={{ opacity: 0 }}
                                  whileInView={{ opacity: 1 }}
                                  className="text-3xl font-black text-white uppercase tracking-tighter mb-1"
                                >
                                  SECURE_DASHBOARD
                                </motion.h4>
                                <div className="flex items-center gap-3">
                                    <span className="text-primary-500 font-mono text-[10px] font-black tracking-widest border border-primary-500/30 px-2 py-0.5">VAULT: OPEN</span>
                                    <span className="text-white/30 font-mono text-[10px] font-black italic">LAST_AUDIT: 2 MIN AGO</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(244,63,94,0.2)' }} className="p-4 bg-white/5 border-2 border-white/10 text-white cursor-pointer transition-colors">
                                    <Shield size={24} />
                                </motion.div>
                                <motion.div whileHover={{ scale: 1.1, backgroundColor: 'rgba(168,85,247,0.2)' }} className="p-4 bg-white/5 border-2 border-white/10 text-white cursor-pointer transition-colors">
                                    <Zap size={24} />
                                </motion.div>
                            </div>
                        </div>

                        {/* Simulated List */}
                        <div className="space-y-6 flex-1">
                            {[1, 2, 3].map((i) => (
                                <motion.div 
                                    key={i} 
                                    initial={{ x: -20, opacity: 0 }}
                                    whileInView={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    className="flex items-center gap-6 bg-white/5 p-6 border-2 border-white/5 group-hover/window:border-primary-500/20 transition-all hover:bg-white/10 cursor-pointer"
                                >
                                    <div className="w-14 h-14 bg-black border-2 border-white/10 flex items-center justify-center group-hover/window:border-primary-500/50 transition-colors">
                                      <Fingerprint className="text-white/40 group-hover/window:text-primary-500 transition-colors" size={28} />
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <div className="h-5 w-48 bg-white/10 group-hover/window:bg-white/20 transition-colors" />
                                        <div className="h-2 w-32 bg-white/5" />
                                    </div>
                                    <div className="w-32 h-10 border-2 border-white/10 flex items-center justify-center font-mono text-[10px] font-black text-white/20">•••••••••••••</div>
                                </motion.div>
                            ))}
                        </div>

                        {/* Glare effect */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none" />
                    </div>
                </motion.div>

                {/* Floating Accessory Cards (Perspective View) */}
                
                {/* 1. Master Key Engine Card */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                        translateZ: 140,
                        x: -300,
                        y: -240
                    }}
                    onMouseEnter={() => setActiveCard('key')}
                    className="absolute hidden lg:block w-72 p-8 bg-black border-4 border-primary-500 shadow-[20px_20px_0px_#000] z-20 group cursor-pointer"
                >
                    <div className="flex justify-between items-start mb-6">
                        <div className="bg-primary-500 text-black w-12 h-12 flex items-center justify-center font-black shadow-[5px_5px_0px_rgba(0,0,0,0.5)]">
                            <Cpu size={28} />
                        </div>
                        <div className="text-[10px] font-mono text-primary-500 animate-pulse">GENERATING...</div>
                    </div>
                    <h5 className="text-white font-black uppercase text-base mb-3 tracking-tighter italic">MASTER_KEY_ENGINE</h5>
                    <div className="font-mono text-[10px] text-primary-400 break-all leading-relaxed opacity-70 bg-primary-500/5 p-3 border border-primary-500/20">
                        {`6f a2 94 11 0c 8b f3 82 a4 k0 l2 ... d0 1e 5a`}
                    </div>
                    <motion.div className="mt-6 space-y-2">
                        <div className="flex justify-between text-[10px] font-black">
                            <span className="text-white/40">ENTROPY</span>
                            <span className="text-primary-500">256-BIT</span>
                        </div>
                        <div className="h-2 w-full bg-white/10 overflow-hidden border border-white/10">
                            <motion.div 
                              animate={{ width: ["0%", "100%", "0%"] }}
                              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                              className="h-full bg-primary-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]" 
                            />
                        </div>
                    </motion.div>
                </motion.div>

                {/* 2. Local Storage Card */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                        translateZ: 110,
                        x: 340,
                        y: 180
                    }}
                    onMouseEnter={() => setActiveCard('storage')}
                    className="absolute hidden lg:block w-80 p-8 bg-white border-4 border-black shadow-[20px_20px_0px_rgba(168,85,247,0.4)] z-20 cursor-pointer"
                >
                    <div className="flex items-center gap-4 mb-6">
                        <div className="bg-black text-white w-10 h-10 flex items-center justify-center shadow-[4px_4px_0px_rgba(168,85,247,1)]">
                            <Database size={22} />
                        </div>
                        <div>
                            <h5 className="text-black font-black uppercase text-sm leading-tight tracking-tighter">OFF-GRID_STORAGE</h5>
                            <div className="text-[9px] font-mono text-purple-600 font-bold">MODE: ISOLATED</div>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="flex justify-between text-[11px] font-black text-black">
                            <span>REDUNDANCY STATUS</span>
                            <span className="text-green-600 items-center flex gap-1"><Activity size={10} /> NOMINAL</span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                                <motion.div 
                                  key={i} 
                                  animate={{ opacity: [0.5, 1, 0.5] }}
                                  transition={{ duration: 2, delay: i * 0.2, repeat: Infinity }}
                                  className={`h-4 border-2 border-black ${i < 3 ? 'bg-purple-600' : 'bg-neutral-100'}`} 
                                />
                            ))}
                        </div>
                        <div className="pt-2 border-t border-black/10">
                            <div className="text-[9px] font-black text-neutral-400 uppercase">LOCATION</div>
                            <div className="text-xs font-black text-black">INDEXED_DB // PERSISTENT</div>
                        </div>
                    </div>
                </motion.div>

                {/* 3. Security Protocol Card (New) */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                        translateZ: 80,
                        x: -280,
                        y: 200
                    }}
                    className="absolute hidden lg:block w-64 p-6 bg-neutral-900 border-2 border-white/20 shadow-2xl backdrop-blur-3xl z-30 group"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="text-primary-500">
                          <Layers size={20} />
                        </div>
                        <h5 className="text-white font-black uppercase text-xs tracking-widest">CIPHER_SUITE</h5>
                    </div>
                    <div className="space-y-3">
                        <div className="bg-white/5 p-3 border border-white/10 flex justify-between items-center group-hover:border-primary-500/50 transition-colors">
                            <span className="text-[9px] font-black text-white/40">METHOD</span>
                            <span className="text-[11px] font-black text-white">AES-GCM</span>
                        </div>
                        <div className="bg-white/5 p-3 border border-white/10 flex justify-between items-center group-hover:border-primary-500/50 transition-colors">
                            <span className="text-[9px] font-black text-white/40">KDF</span>
                            <span className="text-[11px] font-black text-white">PBKDF2</span>
                        </div>
                        <div className="bg-white/5 p-3 border border-white/10 flex justify-between items-center group-hover:border-primary-500/50 transition-colors">
                            <span className="text-[9px] font-black text-white/40">ITERATIONS</span>
                            <span className="text-[11px] font-black text-white">100,000</span>
                        </div>
                    </div>
                </motion.div>

                {/* 4. Real-time Log Card */}
                <motion.div
                    style={{
                        rotateX,
                        rotateY,
                        transformStyle: "preserve-3d",
                        translateZ: 180,
                        x: 380,
                        y: -180
                    }}
                    className="absolute hidden lg:block w-72 p-6 bg-black/90 border-2 border-primary-500 shadow-[10px_10px_40px_rgba(244,63,94,0.2)] z-40 backdrop-blur-md"
                >
                    <div className="flex items-center gap-3 mb-4 border-b border-primary-500/20 pb-4">
                        <Terminal size={18} className="text-primary-500" />
                        <div className="text-[10px] font-black text-white uppercase tracking-widest">LIVE_AUDIT_STREAM</div>
                    </div>
                    <div className="space-y-2 font-mono text-[10px]">
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} className="flex gap-2">
                            <span className="text-primary-500 shrink-0">18:04:12</span>
                            <span className="text-white/60 truncate">AUTH_REQUEST: GRANTED</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 0.5 }} className="flex gap-2">
                            <span className="text-primary-500 shrink-0">18:04:13</span>
                            <span className="text-green-500 truncate">SJP_HANDSHAKE: OK</span>
                        </motion.div>
                        <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ delay: 1 }} className="flex gap-2">
                          <span className="text-primary-500 shrink-0">18:04:15</span>
                          <span className="text-white/40 italic">...ENC_BLOCK_891</span>
                        </motion.div>
                    </div>
                </motion.div>

                {/* Background decorative elements */}
                <div className="absolute inset-0 -z-10 opacity-30 [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_80%,transparent_100%)]">
                    <div className="h-full w-full bg-[linear-gradient(to_right,#f43f5e08_1px,transparent_1px),linear-gradient(to_bottom,#f43f5e08_1px,transparent_1px)] bg-[size:40px_40px]" />
                </div>
                
                {/* Floating particles */}
                <div className="absolute inset-0 pointer-events-none -z-5 overflow-hidden">
                    {[1, 2, 3, 4, 5].map(i => (
                        <motion.div
                          key={i}
                          animate={{ 
                            x: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                            y: [Math.random() * 100, Math.random() * -100, Math.random() * 100],
                            opacity: [0, 0.5, 0]
                          }}
                          transition={{ repeat: Infinity, duration: 10 + i * 2 }}
                          className="absolute w-2 h-2 bg-primary-500/20 blur-sm rounded-full"
                          style={{ 
                            left: `${20 + i * 15}%`, 
                            top: `${30 + i * 10}%` 
                          }}
                        />
                    ))}
                </div>
            </div>

            {/* Feature labels below */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-white/5 border-2 border-white/10 mt-20 group">
                {[
                    { label: "LATENCY", val: "0.04ms", desc: "Local-first execution", icon: Zap },
                    { label: "ENTROPY", val: "256-bit", desc: "Military grade", icon: Lock },
                    { label: "SYNC", val: "OFF-GRID", desc: "Zero cloud usage", icon: Share2 },
                    { label: "PRIVACY", val: "100%", desc: "Total sovereignty", icon: Eye }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 * i }}
                        className="bg-black/40 backdrop-blur-md p-10 hover:bg-primary-500/10 transition-colors relative overflow-hidden group/stat"
                    >
                        <div className="absolute top-4 right-4 text-white/10 group-hover/stat:text-primary-500/30 transition-colors">
                            <stat.icon size={32} />
                        </div>
                        <div className="text-[10px] text-primary-500 font-mono font-black uppercase mb-1 tracking-[0.3em]">{stat.label}</div>
                        <div className="text-4xl font-black mb-1 text-white group-hover/stat:translate-x-2 transition-transform">{stat.val}</div>
                        <div className="text-[10px] font-bold text-neutral-500 font-mono uppercase tracking-tight">
                            {stat.desc}
                        </div>
                    </motion.div>
                ))}
            </div>
        </div>
    );
};
