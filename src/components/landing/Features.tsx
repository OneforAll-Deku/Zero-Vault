'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Fingerprint, RefreshCw, Cpu, HardDrive, Archive, Shield, Lock } from 'lucide-react';

const FEATURE_DATA = [
  { icon: Database, title: "OFFLINE_PERSISTENCE", desc: "No cloud sync. Your data lives in IndexedDB, surviving browser restarts and working offline.", gradient: "from-blue-500 to-cyan-500" },
  { icon: Zap, title: "INSTANT_DECRYPTION", desc: "Zero network latency. AES-GCM decryption happens in milliseconds directly in your browser's RAM.", gradient: "from-yellow-400 to-orange-500" },
  { icon: Fingerprint, title: "CRYPTO_CONTEXTS", desc: "Native browser Web Crypto APIs ensure military-grade 256-bit protection for every record.", gradient: "from-primary-500 to-pink-500" },
  { icon: RefreshCw, title: "EXTENSION_BRIDGE", desc: "A seamless, secure link between your vault and the browser extension for one-click autofill.", gradient: "from-green-400 to-emerald-600" },
  { icon: Cpu, title: "EMERGENCY_WIPE", desc: "Instant protocol to permanently shred all local vault data when security is compromised.", gradient: "from-red-500 to-rose-700" },
  { icon: Archive, title: "SECURE_ARCHIVE", desc: "Generate password-protected ZIP exports in a standard format for sovereign data backups.", gradient: "from-purple-500 to-indigo-600" },
];

export const Features: React.FC = () => {
  return (
    <section id="features" className="py-32 bg-white border-y-8 border-black relative overflow-hidden">
      {/* Background Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '32px 32px' }} />

      <div className="max-w-7xl mx-auto px-4 relative z-10">
        <div className="flex flex-col md:flex-row items-end justify-between mb-24 gap-8">
          <div className="relative">
            <motion.div 
              initial={{ width: 0 }}
              whileInView={{ width: "80px" }}
              className="h-2 bg-primary-500 mb-8"
            />
            <h2 className="text-6xl md:text-9xl font-black uppercase tracking-tighter leading-[0.8] mb-6">
              SYSTEM <br /> 
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 drop-shadow-[0_10px_20px_rgba(244,63,94,0.1)]">
                CAPABILITIES
              </span>
            </h2>
            <p className="text-neutral-400 font-mono font-black text-xs uppercase tracking-[0.3em] pl-2 border-l-4 border-primary-500 inline-block mt-4">
              PROTOCOL_VERSION: 2.0.4_BETA
            </p>
          </div>
          <div className="max-w-md text-right hidden lg:block">
            <p className="font-bold text-neutral-500 font-mono text-sm uppercase leading-relaxed border-r-4 border-black pr-6">
              Our architecture is designed to minimize attack surfaces by removing the central server entirely. Your browser IS the vault.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 border-4 border-black bg-black">
          {FEATURE_DATA.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="group relative bg-white aspect-square flex flex-col p-12 border-[2px] border-black overflow-hidden hover:bg-black transition-colors duration-500"
            >
              {/* Hover background gradient glow */}
              <div className={`absolute -inset-2 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity`} />
              
              <div className={`w-20 h-20 bg-gradient-to-br ${feature.gradient} text-white flex items-center justify-center mb-10 shadow-[8px_8px_0px_#000] border-4 border-black group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500`}>
                <feature.icon size={40} strokeWidth={2.5} />
              </div>

              <h3 className="text-3xl font-black mb-6 uppercase tracking-tighter leading-none group-hover:text-white transition-colors duration-500">
                {feature.title.replace('_', ' ')}
              </h3>
              
              <p className="font-bold text-neutral-500 font-mono text-base leading-tight opacity-100 group-hover:text-neutral-300 transition-colors duration-500">
                {feature.desc}
              </p>

              {/* Functional Decorative Arrow */}
              <div className="mt-auto flex justify-between items-center opacity-20 group-hover:opacity-100 transition-opacity duration-500">
                <div className="h-1 flex-1 bg-black group-hover:bg-primary-500 transition-colors" />
                <div className="pl-4 text-black group-hover:text-primary-500">
                  <Zap size={20} fill="currentColor" />
                </div>
              </div>

              {/* Inner detail border (revealed on hover) */}
              <div className="absolute inset-4 border-2 border-primary-500/0 group-hover:border-primary-500/40 transition-all duration-700 pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
