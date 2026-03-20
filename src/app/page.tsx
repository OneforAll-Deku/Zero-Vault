'use client';

import React, { useState, useEffect } from 'react';
import { Hero } from '@/components/landing/Hero';
import { Features } from '@/components/landing/Features';
import { SecuritySection } from '@/components/landing/SecuritySection';
import { SovereigntyMap } from '@/components/landing/SovereigntyMap';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { Pricing } from '@/components/landing/Pricing';
import { CanvasBackground } from '@/components/landing/CanvasBackground';
import { Button } from '@/components/retroui/Button';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, HelpCircle, ShieldAlert, Github, Twitter } from 'lucide-react';

const FAQ_DATA = [
  { q: "Is it really free?", a: "Yes. ZeroVault is open-source. Freedom is its core mission." },
  { q: "What if I lose my master password?", a: "Your data is permanently lost. This is by design. We have no backdoors and no 'Password Reset' servers." },
  { q: "Can I use it on multiple devices?", a: "Currently, ZeroVault is local-first. We recommend exporting/importing encrypted vault files manually for cross-device usage." },
  { q: "Is the browser extension required?", a: "The extension provides autofill functionality and a bridge to your secure vault, but it's not strictly required to manage your passwords." }
];

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  useEffect(() => {
    setMounted(true);
    const newLogs = [...Array(5)].map(() => 
      `[SYS_LOG_${Math.random().toString(16).slice(2, 6)}] PBKDF2_KEY_DERIVATION: COMPLETE ... AES_256_GCM_ENCRYPT: ACTIVE ... NO_CLOUD_ACCESS: TRUE ...`
    );
    setLogs(newLogs);
  }, []);

  return (
    <div className="min-h-screen selection:bg-primary-500 selection:text-white">
      <CanvasBackground />
      
      <nav className="fixed top-0 w-full z-50 bg-white border-b-4 border-black px-4 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter hover:scale-105 transition-transform flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-500 border-2 border-black rotate-45 shadow-[2px_2px_0px_#000] flex items-center justify-center -rotate-45">
              <ShieldAlert className="rotate-45 text-white" size={16} />
            </div>
            ZERO<span className="text-primary-600">VAULT</span>
          </Link>
          
          <div className="hidden md:flex gap-8 items-center font-black uppercase text-xs tracking-widest">
            <a href="#features" className="hover:text-primary-600 transition-colors">Features</a>
            <a href="#pricing" className="hover:text-primary-600 transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-primary-600 transition-colors">FAQ</a>
            <Link href="/auth">
              <Button size="sm" className="bg-black text-white px-6 shadow-retro border-2 border-black hover:translate-y-1 hover:shadow-none transition-all">LOGIN</Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>
        <Hero />
        <Features />
        <SecuritySection />
        <SovereigntyMap />
        <HowItWorks />
        <Pricing />

        <section id="faq" className="py-24 bg-[#fafafa] border-y-8 border-black relative overflow-hidden">
          <div className="max-w-4xl mx-auto px-4">
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-12 text-center drop-shadow-[4px_4px_0px_#f43f5e]">
              KNOWLEDGE <span className="text-primary-500">BASE</span>
            </h2>

            <div className="space-y-4">
              {FAQ_DATA.map((item, i) => (
                <div key={i} className="border-4 border-black bg-white shadow-retro">
                  <button 
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full flex justify-between items-center p-6 text-left font-black uppercase tracking-tight group"
                  >
                    <span className="flex items-center gap-4">
                      <HelpCircle size={20} className="text-primary-500 group-hover:rotate-12 transition-transform" />
                      {item.q}
                    </span>
                    <ChevronDown size={24} className={`transition-transform duration-300 ${openFaq === i ? 'rotate-180' : ''}`} />
                  </button>
                  <AnimatePresence>
                    {openFaq === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-primary-50"
                      >
                        <div className="p-6 border-t-4 border-black font-mono font-bold text-sm leading-relaxed text-neutral-600">
                          {item.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {mounted && [...Array(20)].map((_, i) => (
            <div 
              key={i} 
              className="absolute bg-primary-500/10 w-4 h-4 rounded-none border-2 border-black/10 -z-0 pointer-events-none animate-pulse"
              style={{ 
                top: `${Math.random() * 100}%`, 
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`
              }}
            />
          ))}
        </section>
        
        <footer className="bg-black text-white py-24 px-4 text-center border-t-8 border-primary-500">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black mb-8 uppercase tracking-tighter drop-shadow-[4px_4px_0px_#f43f5e]">SECURE YOUR <br /> PROTOCOL TODAY.</h2>
            <Link href="/auth">
              <Button size="lg" className="bg-primary-500 text-white border-4 border-white px-16 py-10 text-2xl font-black shadow-[12px_12px_0px_0px_rgba(255,255,255,0.3)] hover:shadow-none hover:translate-x-3 hover:translate-y-3 transition-all uppercase tracking-tight">
                START INITIALIZATION
              </Button>
            </Link>
            <div className="mt-20 pt-12 border-t border-neutral-800 font-mono text-xs text-neutral-400 text-left">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                <div>
                  <h3 className="text-white font-black uppercase mb-6 tracking-widest border-b-2 border-white/10 pb-2 inline-block">THE MISSION</h3>
                  <p className="font-bold leading-relaxed opacity-80 max-w-sm">
                    We are building tools for the modern internet escape artist. Open source, privacy-first, and intentionally bold. No trackers, no bloat.
                  </p>
                </div>
                <div>
                  <h3 className="text-white font-black uppercase mb-6 tracking-widest border-b-2 border-white/10 pb-2 inline-block">FOLLOW THE SIGNAL</h3>
                  <div className="flex flex-col gap-4">
                    <a 
                      href="https://github.com/OneforAll-Deku/Zero-Vault" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 hover:text-primary-500 transition-colors group"
                    >
                      <Github size={18} className="group-hover:rotate-12 transition-transform" />
                      <span className="font-black uppercase tracking-widest">GITHUB</span>
                    </a>
                    <a 
                      href="#" 
                      className="flex items-center gap-3 hover:text-blue-400 transition-colors group"
                    >
                      <Twitter size={18} className="group-hover:rotate-12 transition-transform" />
                      <span className="font-black uppercase tracking-widest">X / TWITTER</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-8 border-t border-neutral-800 pt-8">
                <p>&copy; 2026 ZEROVAULT PROTOCOL. FOR FREEDOM.</p>
                <div className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity">
                  <span className="uppercase text-[10px] font-black tracking-widest">HANDMADE BY</span>
                  <span className="bg-white text-black px-2 py-0.5 font-black">PRATYAKSH</span>
                  <span className="uppercase text-[10px] font-black tracking-widest">IN 2026.</span>
                </div>
              </div>

              <div className="mt-8 overflow-hidden whitespace-nowrap border-y border-neutral-800 py-3">
                {mounted && (
                  <motion.div
                    animate={{ x: [0, -1000] }}
                    transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
                    className="inline-flex gap-8"
                  >
                    {logs.map((log, i) => (
                      <span key={i} className="uppercase opacity-40 font-black">
                        {log}
                      </span>
                    ))}
                  </motion.div>
                )}
              </div>
              <p className="mt-8 flex justify-center gap-8 opacity-40">
                <span>[ENCRYPTION: AES-256-GCM]</span>
                <span>[STORAGE: LOCAL_IDB]</span>
                <span>[CLOUD: NONE]</span>
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
