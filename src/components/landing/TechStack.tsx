'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Layers, Database, Cpu, Zap, Fingerprint, ShieldCheck } from 'lucide-react';

export const TechStack: React.FC = () => {
  return (
    <section id="tech-stack" className="py-24 bg-black text-white px-4 border-y-8 border-primary-500 relative">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-8">
          <div>
            <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter mb-4 drop-shadow-[4px_4px_0px_#f43f5e]">
              BUILT FOR THE <br /> <span className="text-primary-500">RESISTANCE.</span>
            </h2>
            <div className="w-full h-4 bg-primary-500/20" />
          </div>
          <p className="max-w-md font-mono text-sm text-neutral-400 border-l-4 border-primary-500 pl-6 py-2 uppercase tracking-tighter font-bold">
            ZeroVault is engineered with zero-compromise modern web protocols. No middleman. No leaks.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { icon: Layers, title: "Next.js 16", desc: "React Framework for static site generation. Zero backend calls." },
            { icon: Database, title: "IndexedDB", desc: "Native browser database for local-first persistence." },
            { icon: Fingerprint, title: "Web Crypto", desc: "Native browser AES-GCM encryption at 256-bit scale." },
            { icon: Cpu, title: "TypeScript", desc: "Strictly typed protocol implementation for reliability." },
            { icon: Zap, title: "Turbopack", desc: "Ultra-fast incremental compilation for massive vaults." },
            { icon: ShieldCheck, title: "PBKDF2", desc: "600,000 iterations for master key derivation." }
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.6 }}
              className="group border-2 border-primary-500/30 p-8 flex flex-col gap-6 hover:bg-white hover:text-black transition-all duration-500 cursor-cell"
            >
              <item.icon size={32} className="text-primary-500 group-hover:scale-125 transition-transform" />
              <div>
                <h4 className="text-xl font-black uppercase mb-2">{item.title}</h4>
                <p className="font-mono text-xs opacity-60 leading-relaxed font-bold">{item.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Decorative cyber text */}
      <div className="absolute bottom-4 right-4 font-mono text-[80px] font-black opacity-[0.03] select-none pointer-events-none tracking-tighter">
        SECURE_CORE_V1.2
      </div>
    </section>
  );
};
