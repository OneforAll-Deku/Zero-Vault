'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, ServerOff } from 'lucide-react';

const PROTOCOL_TEXT = `[INITIALIZING SECURE PROTOCOL]
> DERIVING MASTER KEY (PBKDF2)
> GENERATING SALT: ${Math.random().toString(16).slice(2, 10)}
> INITIALIZING AES-256-GCM
> ENCRYPTING LOCAL VAULT... 
> STATUS: [DONE]
> SERVER CONNECTIVITY: [TERMINATED]
> KNOWLEDGE LEAK PROBABILITY: 0.000%`;

export const SecuritySection: React.FC = () => {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < PROTOCOL_TEXT.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + PROTOCOL_TEXT[index]);
        setIndex((prev) => prev + 1);
      }, 30);
      return () => clearTimeout(timeout);
    } else {
      // Loop or stay finished
      const resetTimeout = setTimeout(() => {
        setDisplayText('');
        setIndex(0);
      }, 5000);
      return () => clearTimeout(resetTimeout);
    }
  }, [index]);

  return (
    <section className="py-20 overflow-hidden relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-black p-8 border-4 border-primary-500 shadow-retro relative z-10 min-h-[220px]">
              <pre className="font-mono text-[10px] sm:text-xs text-primary-400 overflow-hidden whitespace-pre-wrap">
                {displayText}
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Infinity, duration: 0.5 }}
                  className="inline-block w-2 h-4 bg-primary-400 ml-1 align-middle"
                />
              </pre>
            </div>
            {/* Decortative retro elements */}
            <div className="absolute -top-4 -right-4 w-full h-full border-4 border-black -z-10 bg-primary-100"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-500/10 blur-[100px] -z-20"></div>
          </motion.div>

          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tight mb-8 drop-shadow-[2px_2px_0px_#000]">
              ZERO KNOWLEDGE <br />
              <span className="text-primary-600">INFRASTRUCTURE</span>
            </h2>
            
            <div className="space-y-8">
              {[
                { 
                  icon: ServerOff, 
                  title: "NO SERVER SIDE", 
                  desc: "Your master password never hits a database. Encryption keys are generated and used only in your browser's RAM." 
                },
                { 
                  icon: Key, 
                  title: "PBKDF2 DERIVATION", 
                  desc: "We use 600,000 iterations of HMAC-SHA-256 to derive your encryption key, making brute-force attacks computationally unfeasible." 
                },
                { 
                  icon: ShieldCheck, 
                  title: "LOCAL IMMUTABILITY", 
                  desc: "Once specialized in your browser, your vault remains isolated. Not even the service provider can 'backdoor' your access." 
                }
              ].map((item, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="bg-primary-500 p-3 border-2 border-black text-white shadow-retro">
                    <item.icon size={24} />
                  </div>
                  <div>
                    <h4 className="text-xl font-black uppercase mb-1 text-white">{item.title}</h4>
                    <p className="font-bold text-neutral-400 font-mono text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
