'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Check, Github } from 'lucide-react';
import { Button } from '@/components/retroui/Button';

export const Pricing: React.FC = () => {
  return (
    <section id="pricing" className="py-24 bg-white relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter mb-4">
            ZERO COST. <span className="text-primary-600">ZERO TRACKING.</span>
          </h2>
          <p className="font-mono font-bold text-neutral-500 uppercase tracking-widest">Public Interest Privacy Software</p>
        </div>

        <div className="flex justify-center">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="w-full max-w-lg bg-black text-white p-12 border-8 border-primary-500 shadow-[20px_20px_0px_rgba(0,0,0,1)] relative"
          >
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-primary-500 px-6 py-2 border-4 border-black font-black uppercase tracking-tighter text-white whitespace-nowrap">
              Open Source Standard
            </div>

            <div className="mb-8 border-b-2 border-primary-500 pb-8">
              <div className="text-6xl font-black mb-2">$0<span className="text-2xl text-primary-500">/FOREVER</span></div>
              <p className="font-mono text-primary-400 text-sm">Self-hosting permitted. OSINT verification open.</p>
            </div>

            <ul className="space-y-6 mb-12">
              {[
                "Unlimited Password Storage",
                "AES-256-GCM Local Encryption",
                "Browser Extension Bridge",
                "Zero Cloud Connectivity",
                "System Wipe Protocol",
                "Open Source Codebase"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-4 font-bold font-mono">
                  <div className="bg-primary-500 p-1 border-2 border-white text-white">
                    <Check size={16} />
                  </div>
                  {item}
                </li>
              ))}
            </ul>

            <a href="https://github.com/jimmy/zero-vault" target="_blank" className="block">
              <Button size="lg" className="w-full py-8 text-2xl font-black bg-white text-black border-4 border-primary-500 shadow-[8px_8px_0px_#f43f5e] hover:shadow-none hover:translate-x-2 hover:translate-y-2 transition-all group">
                <Github className="mr-4 group-hover:rotate-12 transition-transform" /> VIEW SOURCE
              </Button>
            </a>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-1/2 left-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full animate-pulse capitalize" />
      <div className="absolute bottom-1/2 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full animate-pulse delay-1000" />
    </section>
  );
};
