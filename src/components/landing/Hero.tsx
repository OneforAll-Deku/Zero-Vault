'use client';

import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/retroui/Button';
import Link from 'next/link';
import { Shield, Lock, EyeOff, Play, Cpu, ServerOff } from 'lucide-react';
import { VaultVisualizer } from './VaultVisualizer';
import { TechDemo } from './TechDemo';

export const Hero: React.FC = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <section className="relative min-h-screen flex flex-col items-center pt-32 pb-24 px-4 overflow-hidden z-10">
      
      <motion.div 
        style={{ y: y1, opacity }}
        className="absolute top-20 right-[-100px] lg:right-20 pointer-events-none opacity-40 lg:opacity-100"
      >
        <VaultVisualizer />
      </motion.div>

      <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[150px] animate-pulse" />
        <div className="absolute top-[40%] right-[5%] w-[400px] h-[400px] bg-purple-500/10 rounded-full blur-[120px]" style={{ animationDelay: '2s' }} />
        <div className="absolute bottom-[10%] left-[30%] w-[600px] h-[600px] bg-pink-500/5 rounded-full blur-[180px]" style={{ animationDelay: '4s' }} />
      </div>

      <div className="max-w-7xl mx-auto flex flex-col items-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "backOut" }}
          className="text-center z-10 max-w-5xl"
        >
          
          <h1 className="text-6xl md:text-9xl font-black text-white mb-6 uppercase tracking-tighter leading-[0.85]">
            <motion.span 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              ULTRA
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-pink-400 to-purple-400 drop-shadow-[0_0_60px_rgba(244,63,94,0.4)]"
            >
              SECURE
            </motion.span>
            <br />
            <motion.span 
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="drop-shadow-[0_0_40px_rgba(255,255,255,0.1)]"
            >
              ZERO
            </motion.span>
            <motion.span 
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-primary-400 drop-shadow-[0_0_60px_rgba(168,85,247,0.4)]"
            >
              VAULT
            </motion.span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-xl md:text-3xl font-bold text-neutral-300 mb-12 max-w-3xl mx-auto leading-tight font-mono tracking-tighter"
          >
            <span className="bg-gradient-to-r from-primary-500 to-pink-500 text-white px-2 shadow-[0_0_20px_rgba(244,63,94,0.3)]">MILITARY-GRADE</span> ENCRYPTION. <br />
            <span className="text-white/90">NO CLOUD. NO LEAKS. NO COMPROMISE.</span>
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            className="flex flex-col sm:flex-row gap-8 justify-center items-center"
          >
            <Link href="/auth">
              <Button size="lg" className="text-2xl font-black bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white border-4 border-black px-12 py-8 shadow-[12px_12px_0px_0px_rgba(0,0,0,1),0_0_40px_rgba(244,63,94,0.25)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1),0_0_60px_rgba(244,63,94,0.35)] transition-all uppercase tracking-tight group">
                ENTER THE VAULT
                <Play className="ml-4 group-hover:translate-x-2 transition-transform" fill="currentColor" size={24} />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="text-2xl font-black bg-transparent hover:bg-white/10 text-white border-4 border-white/30 hover:border-white/60 px-12 py-8 shadow-[12px_12px_0px_0px_rgba(255,255,255,0.05)] hover:translate-x-1 hover:translate-y-1 hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,0.05)] transition-all uppercase tracking-tight backdrop-blur-sm">
                PROTOCOL SPECS
              </Button>
            </a>
          </motion.div>
        </motion.div>

        <TechDemo />
      </div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-7xl w-full z-10 px-4">
        {[
          { icon: ServerOff, title: "100% OFF-GRID", desc: "No central server exists. Your vault is a sovereign digital island in your browser.", gradient: "from-primary-500 to-rose-500" },
          { icon: Lock, title: "AES-GCM-256", desc: "The gold standard of cryptographic protection. Undecipherable by any known computing power.", gradient: "from-purple-500 to-pink-500" },
          { icon: EyeOff, title: "STEALTH BY DESIGN", desc: "If you lose your master key, your data is gone forever. Maximum entropy. No backdoors.", gradient: "from-pink-500 to-primary-500" }
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 50, rotateX: 20 }}
            whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 + i * 0.2, duration: 0.8 }}
            className="group bg-white/5 backdrop-blur-xl border-4 border-white/10 p-10 shadow-[20px_20px_0px_rgba(244,63,94,0.08)] hover:border-primary-500/50 hover:bg-white/10 transition-all duration-500 hover:shadow-[20px_20px_0px_rgba(244,63,94,0.2),0_0_40px_rgba(244,63,94,0.1)]"
          >
            <div className={`w-16 h-16 bg-gradient-to-br ${item.gradient} flex items-center justify-center border-4 border-black mb-8 shadow-retro transition-all group-hover:scale-110 group-hover:rotate-3`}>
              <item.icon size={32} className="text-white" />
            </div>
            <h3 className="text-2xl font-black mb-4 uppercase text-white tracking-tighter">{item.title}</h3>
            <p className="font-bold text-neutral-400 font-mono text-base leading-relaxed group-hover:text-neutral-300 transition-colors">{item.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
};
