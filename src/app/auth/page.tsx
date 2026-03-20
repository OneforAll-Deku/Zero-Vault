'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/retroui/Button';
import { Card } from '@/components/retroui/Card';
import { Input } from '@/components/retroui/Input';
import { useAuthStore } from '@/store/authStore';
import { deriveEncryptionKey, deriveVerifierHash, generateSalt } from '@/lib/crypto';
import { getSessionFromExtension, lockExtensionSession } from '@/lib/extensionBridge';
import { deleteDB } from 'idb';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';

export default function AuthPage() {
  const router = useRouter();
  const [hasVault, setHasVault] = useState<boolean | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setUnlocked, setAuthData } = useAuthStore();

  useEffect(() => {
    const salt = localStorage.getItem('zv_salt');
    const hash = localStorage.getItem('zv_hash');

    const checkSession = async () => {
      const activeKey = await getSessionFromExtension();
      if (activeKey) {
        setUnlocked(activeKey);
        router.push('/dashboard');
        return;
      }

      if (salt && hash) {
        setHasVault(true);
        setAuthData(salt, hash);
      } else {
        setHasVault(false);
      }
    };

    checkSession();
  }, []);

  const handleSetup = async () => {
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setLoading(true);
    setError('');

    try {
      const salt = generateSalt();
      const key = await deriveEncryptionKey(password, salt);
      const hash = await deriveVerifierHash(password, salt);

      try {
        const deletePromise = deleteDB('ZeroVaultDB');
        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('DB Delete Timeout')), 2000));
        await Promise.race([deletePromise, timeoutPromise]);
      } catch (e) {
        console.warn("Pre-setup cleanup warning:", e);
      }

      try {
        const lockPromise = lockExtensionSession();
        const timeoutPromise = new Promise(resolve => setTimeout(resolve, 500));
        await Promise.race([lockPromise, timeoutPromise]);
      } catch (e) {
        console.warn("Extension lock warning:", e);
      }

      localStorage.setItem('zv_salt', salt);
      localStorage.setItem('zv_hash', hash);

      setAuthData(salt, hash);
      setUnlocked(key);

      router.push('/dashboard');
    } catch (e: any) {
      console.error("Setup failed:", e);
      if (e.message?.includes("SECURE_CONTEXT_REQUIRED")) {
        setError("SECURE CONTEXT REQUIRED: Please use http://localhost:3000 or HTTPS to enable vault encryption.");
      } else {
        setError("Setup failed: " + (e.message || "Unknown error"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = async () => {
    setLoading(true);
    setError('');

    try {
      const salt = localStorage.getItem('zv_salt');
      const storedHash = localStorage.getItem('zv_hash');

      if (!salt || !storedHash) {
        throw new Error("Vault corrupted. Please reset.");
      }

      const hash = await deriveVerifierHash(password, salt);

      if (hash === storedHash) {
        const key = await deriveEncryptionKey(password, salt);
        setUnlocked(key);
        router.push('/dashboard');
      } else {
        setError("Invalid Password");
      }
    } catch (e: any) {
      console.error("Unlock failed:", e);
      if (e.message?.includes("SECURE_CONTEXT_REQUIRED")) {
        setError("SECURE CONTEXT REQUIRED: Please use http://localhost:3000 or HTTPS to unlock your vault.");
      } else {
        setError(e.message || "Decryption failed");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (window.confirm("WARNING: This will PERMANENTLY DELETE all your passwords and notes. This action cannot be undone. Are you sure?")) {
      setLoading(true);
      try {
        localStorage.clear();

        await deleteDB('ZeroVaultDB');

        await lockExtensionSession();

        window.location.reload();
      } catch (e) {
        console.error("Failed to reset database:", e);
        setError("System wipe failed. Please clear browser data manually.");
        setLoading(false);
      }
    }
  };

  if (hasVault === null) return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-bold">LOADING PROTOCOLS...</div>;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full animate-slide-up">
        <div className="mb-8 text-center bg-white border-2 border-black shadow-retro p-4 inline-block mx-auto transform -rotate-2">
          <h1 className="text-5xl font-black text-black tracking-tighter leading-none">ZERO<span className="text-primary-600">VAULT</span></h1>
          <p className="text-neutral-500 font-bold font-mono text-xs tracking-widest mt-1">NO ONE KNOWS. NOT EVEN US.</p>
        </div>

        <Card className={`bg-white p-8 border-2 border-black shadow-retro transition-transform ${error ? 'animate-shake' : ''}`}>
          <h2 className="text-2xl font-black mb-6 border-b-2 border-black pb-4 text-black uppercase tracking-tight">
            {hasVault ? 'Unlock System' : 'Initialize Protocol'}
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block font-black mb-2 text-xs uppercase tracking-wider text-neutral-500">Master Password</label>
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                placeholder="Enter your master key..."
                className="w-full text-lg border-2 border-black px-4 py-3 font-mono focus:ring-0 focus:border-primary-500 focus:bg-primary-50 transition-colors"
                onKeyDown={(e) => e.key === 'Enter' && (hasVault ? handleUnlock() : undefined)}
                rightElement={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 hover:bg-neutral-100 transition-colors"
                    title={showPassword ? "Hide Password" : "Show Password"}
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                }
              />
            </div>

            {!hasVault && (
              <div>
                <label className="block font-black mb-2 text-xs uppercase tracking-wider text-neutral-500">Confirm Password</label>
                <Input
                  type={showPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat master key..."
                  className="w-full text-lg border-2 border-black px-4 py-3 font-mono focus:ring-0 focus:border-primary-500 focus:bg-primary-50 transition-colors"
                  rightElement={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="p-1 hover:bg-neutral-100 transition-colors"
                      title={showPassword ? "Hide Password" : "Show Password"}
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  }
                />
              </div>
            )}

            {error && (
              <div className="text-white font-bold bg-primary-600 p-4 border-2 border-black flex flex-col gap-2 text-sm shadow-retro-hover">
                <div className="flex items-center gap-2">
                  <ShieldAlert size={18} />
                  <span>{error}</span>
                </div>
              </div>
            )}

            <Button
              className="w-full py-6 text-xl font-black mt-2 bg-primary-500 hover:bg-primary-600 text-white border-2 border-black shadow-retro active:translate-y-1 active:shadow-none transition-all uppercase tracking-wide"
              onClick={hasVault ? handleUnlock : handleSetup}
              disabled={loading}
            >
              {loading ? 'Processing...' : (hasVault ? 'Unlock Access' : 'Create Vault')}
            </Button>

            {hasVault && (
              <div className="pt-2 text-center">
                <button
                  onClick={handleReset}
                  className="text-[10px] text-neutral-400 hover:text-red-600 font-mono transition-colors uppercase tracking-widest"
                >
                  Forgot Password? [Reset System]
                </button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </main>
  );
}
