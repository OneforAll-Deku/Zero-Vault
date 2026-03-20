'use client';

import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/retroui/Button';
import { Card } from '@/components/retroui/Card';
import { Input } from '@/components/retroui/Input';
import { Textarea } from '@/components/retroui/Textarea';
import { encryptData, decryptData } from '@/lib/crypto';
import { syncToExtension, lockExtensionSession } from '@/lib/extensionBridge';
import { openDB, deleteDB } from 'idb';
import { 
    Plus, Copy, Trash2, LogOut, Key, Search, Star, 
    ArrowUpFromLine, Settings, Download, Upload, 
    FileText, Lock, ShieldAlert, Hash, ShieldCheck, 
    AlertTriangle, Clock, Archive, FileSpreadsheet 
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { ConfirmModal } from '@/components/retroui/ConfirmModal';
import { Toast } from '@/components/retroui/Toast';
import { ZipWriter, ZipReader, BlobWriter, BlobReader, TextReader, TextWriter } from "@zip.js/zip.js";

interface VaultItem {
    id: string;
    site: string;
    username?: string;
    password?: string;
    note?: string;
    tags?: string[];
    type: 'password' | 'note';
    created_at: number;
    is_favorite?: boolean;
    is_deleted?: boolean;
}

interface EncryptedItem {
    id: string;
    data: string;
    iv: string;
    updated_at: number;
}

export default function Dashboard() {
    const router = useRouter();
    const { encryptionKey, lock } = useAuthStore();
    const [items, setItems] = useState<VaultItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [view, setView] = useState<'dashboard' | 'settings' | 'audit'>('dashboard');
    const [filterCategory, setFilterCategory] = useState<'all' | 'favorites' | 'trash' | 'tag'>('all');
    const [activeTag, setActiveTag] = useState<string>('');

    const [passwordModal, setPasswordModal] = useState<{
        isOpen: boolean;
        title: string;
        description: string;
        onConfirm: (password: string) => void;
    }>({
        isOpen: false,
        title: '',
        description: '',
        onConfirm: () => { }
    });

    const [confirmConfig, setConfirmConfig] = useState<{
        isOpen: boolean;
        title: string;
        message: string;
        onConfirm: () => void;
        variant: 'normal' | 'danger';
    }>({
        isOpen: false,
        title: '',
        message: '',
        onConfirm: () => { },
        variant: 'normal'
    });

    const askConfirm = (title: string, message: string, onConfirm: () => void, variant: 'normal' | 'danger' = 'normal') => {
        setConfirmConfig({ isOpen: true, title, message, onConfirm, variant });
    };

    const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

    const addToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
        const id = Math.random().toString(36).substr(2, 9);
        setToasts(prev => [...prev, { id, message, type }]);
    };

    const removeToast = (id: string) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    };

    const idleTimerRef = useRef<NodeJS.Timeout>(null);
    const IDLE_TIMEOUT = 5 * 60 * 1000;

    const [entryType, setEntryType] = useState<'password' | 'note'>('password');
    const [newItem, setNewItem] = useState({ site: '', username: '', password: '', note: '', tags: '' });

    const resetIdleTimer = useCallback(() => {
        if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        idleTimerRef.current = setTimeout(() => {
            lock();
            router.push('/');
        }, IDLE_TIMEOUT);
    }, [lock, router]);

    useEffect(() => {
        const events = ['mousedown', 'keydown', 'scroll', 'mousemove'];
        events.forEach(e => window.addEventListener(e, resetIdleTimer));
        resetIdleTimer();
        return () => {
            events.forEach(e => window.removeEventListener(e, resetIdleTimer));
            if (idleTimerRef.current) clearTimeout(idleTimerRef.current);
        };
    }, [resetIdleTimer]);

    useEffect(() => {
        if (!encryptionKey) {
            router.replace('/');
            return;
        }
        loadVault();
    }, [encryptionKey]);

    useEffect(() => {
        if (items.length > 0 && encryptionKey) {
            syncToExtension(items, encryptionKey);
        }
    }, [items, encryptionKey]);

    const loadVault = async () => {
        if (!encryptionKey) return;
        try {
            const db = await openDB('ZeroVaultDB', 1, {
                upgrade(db) {
                    db.createObjectStore('vault', { keyPath: 'id' });
                },
            });

            const encryptedItems = await db.getAll('vault') as EncryptedItem[];
            const decryptedItems: VaultItem[] = [];

            for (const item of encryptedItems) {
                try {
                    const json = await decryptData(item.data, item.iv, encryptionKey);
                    const parsed = JSON.parse(json);

                    if (parsed.is_favorite === undefined) parsed.is_favorite = false;
                    if (parsed.is_deleted === undefined) parsed.is_deleted = false;
                    if (parsed.type === undefined) parsed.type = 'password';
                    if (parsed.tags === undefined) parsed.tags = [];

                    decryptedItems.push(parsed);
                } catch (e) {
                    console.error("Decryption failed for item:", item.id, e);
                }
            }
            setItems(decryptedItems.sort((a, b) => b.created_at - a.created_at));
        } catch (e) {
            console.error("Vault loading failed:", e);
            addToast("Failed to decrypt vault. Please re-login.", "error");
            lock();
            router.push('/');
        } finally {
            setLoading(false);
        }
    };

    const updateItem = async (item: VaultItem) => {
        if (!encryptionKey) return;
        setItems(prev => prev.map(i => i.id === item.id ? item : i));

        const json = JSON.stringify(item);
        const { cipherText, iv } = await encryptData(json, encryptionKey);
        const db = await openDB('ZeroVaultDB', 1);
        await db.put('vault', {
            id: item.id,
            data: cipherText,
            iv: iv,
            updated_at: Date.now()
        });
    }

    const handleAdd = async () => {
        if (!encryptionKey || !newItem.site) return;
        if (entryType === 'password' && !newItem.password) return;
        if (entryType === 'note' && !newItem.note) return;

        const tags = newItem.tags
            .split(/[ ,]+/)
            .map(t => t.trim().replace(/^#/, ''))
            .filter(Boolean);

        const vaultItem: VaultItem = {
            id: uuidv4(),
            site: newItem.site,
            username: entryType === 'password' ? newItem.username : undefined,
            password: entryType === 'password' ? newItem.password : undefined,
            note: entryType === 'note' ? newItem.note : undefined,
            tags: tags,
            type: entryType,
            created_at: Date.now(),
            is_favorite: false,
            is_deleted: false
        };

        await updateItem(vaultItem);
        setItems(prev => [vaultItem, ...prev]);

        setShowAddModal(false);
        setNewItem({ site: '', username: '', password: '', note: '', tags: '' });
        setEntryType('password');
    };

    const toggleFavorite = (item: VaultItem) => updateItem({ ...item, is_favorite: !item.is_favorite });

    const moveToTrash = async (id: string) => {
        askConfirm(
            "Move to Trash?",
            "This item will be moved to your Trash bin. You can restore it later.",
            () => {
                const item = items.find(i => i.id === id);
                if (item) updateItem({ ...item, is_deleted: true });
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            }
        );
    };

    const restoreFromTrash = (item: VaultItem) => updateItem({ ...item, is_deleted: false });

    const deletePermanently = async (id: string) => {
        askConfirm(
            "PERMANENTLY DELETE?",
            "This action cannot be undone. The entry will be lost forever.",
            async () => {
                const db = await openDB('ZeroVaultDB', 1);
                await db.delete('vault', id);
                setItems(items.filter(i => i.id !== id));
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
            },
            "danger"
        );
    };

    const handleExport = async () => {
        if (!encryptionKey) return;
        const db = await openDB('ZeroVaultDB', 1);
        const encryptedItems = await db.getAll('vault');

        const backup = {
            type: 'zero-vault-backup',
            version: 1,
            exported_at: Date.now(),
            items: encryptedItems
        };

        const blob = new Blob([JSON.stringify(backup)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zero-vault-backup-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportCSVZip = async () => {
        if (!encryptionKey || items.length === 0) return;

        setPasswordModal({
            isOpen: true,
            title: "SECURE ARCHIVE ENCRYPTION",
            description: "Choose a strong password to protect your exported ZIP archive. This password will be required when importing the data back.",
            onConfirm: async (zipPassword) => {
                setPasswordModal(prev => ({ ...prev, isOpen: false }));
                try {
                    addToast("Generating secure archive...", "info");
                    
                    const escapeCSV = (val: string = "") => `"${val.replace(/"/g, '""')}"`;
                    const header = "Site,Username,Password,Note,Tags,Created At\n";
                    const rows = items
                        .filter(i => !i.is_deleted)
                        .map(i => [
                            i.site,
                            i.username || '',
                            i.password || '',
                            i.note || '',
                            (i.tags || []).join(';'),
                            new Date(i.created_at).toISOString()
                        ].map(escapeCSV).join(","))
                        .join("\n");
                    
                    const csvContent = header + rows;

                    const blobWriter = new BlobWriter("application/zip");
                    const zipWriter = new ZipWriter(blobWriter, { 
                        password: zipPassword
                    });
                    
                    await zipWriter.add("zerovault_export.csv", new TextReader(csvContent));
                    const zipBlob = await zipWriter.close();

                    const url = URL.createObjectURL(zipBlob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `zerovault-encrypted-export-${new Date().toISOString().split('T')[0]}.zip`;
                    a.click();
                    URL.revokeObjectURL(url);
                    
                    addToast("Secure ZIP archive exported successfully!", "success");
                } catch (error) {
                    console.error(error);
                    addToast("Archive generation failed.", "error");
                }
            }
        });
    };

    const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const isZip = file.name.endsWith('.zip');

        askConfirm(
            isZip ? "Import Encrypted ZIP?" : "Import JSON Backup?",
            isZip 
                ? "This will extract the CSV from your encrypted archive. You will need the archive password."
                : "Warning: Ensure this backup uses your current Master Password, or the data will be unreadable.",
            async () => {
                setConfirmConfig(prev => ({ ...prev, isOpen: false }));
                
                if (isZip) {
                    setPasswordModal({
                        isOpen: true,
                        title: "ARCHIVE DECRYPTION",
                        description: "Enter the password used to protect this ZIP archive. Incorrect password will result in decryption failure.",
                        onConfirm: async (zipPassword) => {
                            setPasswordModal(prev => ({ ...prev, isOpen: false }));
                            try {
                                addToast("Opening secure archive...", "info");
                                const blobReader = new BlobReader(file);
                                const zipReader = new ZipReader(blobReader, { password: zipPassword });
                                const entries = await zipReader.getEntries();
                                const csvEntry = entries.find(e => e.filename.endsWith('.csv'));

                                if (!csvEntry) {
                                    addToast("No CSV found in archive.", "error");
                                    await zipReader.close();
                                    return;
                                }

                                const csvContent = await (csvEntry as any).getData(new TextWriter());
                                await zipReader.close();

                                const rows = csvContent.split('\n').filter((r: string) => r.trim());
                                const importedItems: VaultItem[] = [];
                                
                                for (let i = 1; i < rows.length; i++) {
                                    const row = rows[i];
                                    const matches = row.match(/(".*?"|[^,]+)(?=\s*,|\s*$)/g);
                                    if (matches && matches.length >= 3) {
                                        const clean = (s: string) => s.startsWith('"') && s.endsWith('"') ? s.slice(1, -1).replace(/""/g, '"') : s;
                                        const [site, user, pass, note, tagsStr, dateStr] = matches.map(clean);
                                        
                                        importedItems.push({
                                            id: uuidv4(),
                                            site: site || "Imported Site",
                                            username: user,
                                            password: pass,
                                            note: note,
                                            tags: tagsStr ? tagsStr.split(';') : [],
                                            type: note && !pass ? 'note' : 'password',
                                            created_at: dateStr ? new Date(dateStr).getTime() : Date.now(),
                                            is_favorite: false,
                                            is_deleted: false
                                        });
                                    }
                                }

                                if (importedItems.length === 0) {
                                    addToast("No valid entries found in CSV.", "error");
                                    return;
                                }

                                for (const item of importedItems) {
                                    await updateItem(item);
                                }

                                addToast(`Successfully imported ${importedItems.length} items from ZIP!`, "success");
                                loadVault();
                            } catch (err) {
                                console.error(err);
                                addToast("Failed to decrypt or parse ZIP. Check password.", "error");
                            }
                        }
                    });
                } else {
                    const reader = new FileReader();
                    reader.onload = async (event) => {
                        try {
                            const backup = JSON.parse(event.target?.result as string);
                            if (backup.type !== 'zero-vault-backup' || !Array.isArray(backup.items)) {
                                addToast("Invalid backup file.", "error");
                                return;
                            }

                            const db = await openDB('ZeroVaultDB', 1);
                            let importedCount = 0;

                            for (const item of backup.items) {
                                await db.put('vault', item);
                                importedCount++;
                            }

                            addToast(`Successfully imported ${importedCount} items!`, "success");
                            loadVault();

                        } catch (err) {
                            console.error(err);
                            addToast("Import failed.", "error");
                        }
                    };
                    reader.readAsText(file);
                }
            }
        );
    };

    const handleLogout = () => {
        lock();
        router.push('/');
    };

    const securityStats = useMemo(() => {
        const passwordItems = items.filter(i => !i.is_deleted && i.type === 'password');
        const weak = passwordItems.filter(i => {
            const p = i.password || '';
            const isLong = p.length >= 10;
            const hasUpper = /[A-Z]/.test(p);
            const hasLower = /[a-z]/.test(p);
            const hasNumber = /[0-9]/.test(p);
            const hasSymbol = /[^A-Za-z0-9]/.test(p);
            return !(isLong && hasUpper && hasLower && hasNumber && hasSymbol);
        });

        const reused: VaultItem[] = [];
        const passMap = new Map<string, VaultItem[]>();
        passwordItems.forEach(i => {
            if (!i.password) return;
            const existing = passMap.get(i.password) || [];
            passMap.set(i.password, [...existing, i]);
        });
        passMap.forEach(group => {
            if (group.length > 1) reused.push(...group);
        });

        const old = passwordItems.filter(i => {
            const sixMonthsAgo = Date.now() - (180 * 24 * 60 * 60 * 1000);
            return (i.created_at || 0) < sixMonthsAgo;
        });

        const totalPoints = passwordItems.length * 4;
        let score = 0;
        if (passwordItems.length > 0) {
            const weakDeduction = weak.length * 1;
            const reuseDeduction = reused.length * 1;
            const oldDeduction = old.length * 0.5;
            score = Math.max(0, Math.min(100, Math.round(((totalPoints - weakDeduction - reuseDeduction - oldDeduction) / totalPoints) * 100)));
        } else {
            score = 100;
        }

        return { weak, reused, old, score };
    }, [items]);

    const filteredItems = items.filter(i => {
        const matchesSearch = i.site.toLowerCase().includes(search.toLowerCase()) ||
            (i.username?.toLowerCase().includes(search.toLowerCase()) ?? false) ||
            (i.tags?.some(t => t.toLowerCase().includes(search.toLowerCase())) ?? false);

        let matchesFilter = false;
        if (filterCategory === 'all') matchesFilter = !i.is_deleted;
        if (filterCategory === 'favorites') matchesFilter = !i.is_deleted && !!i.is_favorite;
        if (filterCategory === 'trash') matchesFilter = !!i.is_deleted;
        if (filterCategory === 'tag') matchesFilter = !i.is_deleted && (i.tags?.includes(activeTag) ?? false);

        return matchesSearch && matchesFilter;
    });

    const uniqueTags = Array.from(new Set(items.flatMap(i => i.tags || []))).sort();

    if (loading) return <div className="min-h-screen flex items-center justify-center font-bold">DECRYPTING VAULT...</div>;

    const generateRandomPassword = () => {
        const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+";
        const array = new Uint32Array(16);
        window.crypto.getRandomValues(array);
        let retVal = "";
        for (let i = 0; i < 16; ++i) {
            retVal += charset.charAt(array[i] % charset.length);
        }
        return retVal;
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row">
            <aside className="w-full md:w-72 bg-white border-b-2 md:border-b-0 md:border-r-2 border-black p-6 flex flex-col justify-between sticky top-0 z-10 md:h-screen overflow-y-auto">
                <div>
                    <div className="mb-8 p-4 bg-black text-white transform -rotate-1 inline-block shadow-retro">
                        <h1 className="text-3xl font-black tracking-tighter leading-none">ZERO<span className="text-primary-500">VAULT</span></h1>
                    </div>

                    <nav className="space-y-2 mb-8">
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-lg font-black border-2 border-black transition-transform ${view === 'dashboard' && filterCategory === 'all' ? 'bg-primary-50 translate-x-1 shadow-retro-hover' : 'bg-transparent hover:bg-neutral-100 border-transparent hover:border-black'}`}
                            onClick={() => { setView('dashboard'); setFilterCategory('all'); }}
                        >
                            <div className={`p-1 mr-3 ${view === 'dashboard' && filterCategory === 'all' ? 'bg-primary-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                <Key size={16} />
                            </div>
                            ALL ITEMS
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-lg font-black border-2 border-black transition-transform ${view === 'dashboard' && filterCategory === 'favorites' ? 'bg-yellow-50 translate-x-1 shadow-retro-hover' : 'bg-transparent hover:bg-neutral-100 border-transparent hover:border-black'}`}
                            onClick={() => { setView('dashboard'); setFilterCategory('favorites'); }}
                        >
                            <div className={`p-1 mr-3 ${view === 'dashboard' && filterCategory === 'favorites' ? 'bg-yellow-400 text-black' : 'bg-neutral-200 text-neutral-500'}`}>
                                <Star size={16} fill={filterCategory === 'favorites' ? 'black' : 'none'} />
                            </div>
                            FAVORITES
                        </Button>
                        <Button
                            variant="ghost"
                            className={`w-full justify-start text-lg font-black border-2 border-black transition-transform ${view === 'dashboard' && filterCategory === 'trash' ? 'bg-red-50 translate-x-1 shadow-retro-hover' : 'bg-transparent hover:bg-neutral-100 border-transparent hover:border-black'}`}
                            onClick={() => { setView('dashboard'); setFilterCategory('trash'); }}
                        >
                            <div className={`p-1 mr-3 ${view === 'dashboard' && filterCategory === 'trash' ? 'bg-red-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                <Trash2 size={16} />
                            </div>
                            TRASH BIN
                        </Button>

                        <div className="pt-4 mt-4 border-t-2 border-dashed border-neutral-300">
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-lg font-black border-2 border-black transition-transform ${view === 'audit' ? 'bg-primary-50 translate-x-1 shadow-retro-hover' : 'bg-transparent hover:bg-neutral-100 border-transparent hover:border-black'}`}
                                onClick={() => setView('audit')}
                            >
                                <div className={`p-1 mr-3 ${view === 'audit' ? 'bg-green-500 text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                    <ShieldCheck size={16} />
                                </div>
                                <span className="truncate">VAULT AUDIT</span>
                            </Button>
                            <Button
                                variant="ghost"
                                className={`w-full justify-start text-lg font-black border-2 border-black transition-transform ${view === 'settings' ? 'bg-neutral-100 translate-x-1 shadow-retro-hover' : 'bg-transparent hover:bg-neutral-100 border-transparent hover:border-black'}`}
                                onClick={() => setView('settings')}
                            >
                                <div className={`p-1 mr-3 ${view === 'settings' ? 'bg-black text-white' : 'bg-neutral-200 text-neutral-500'}`}>
                                    <Settings size={16} />
                                </div>
                                SYSTEM
                            </Button>
                        </div>
                    </nav>

                    {uniqueTags.length > 0 && (
                        <div className="mb-8 animate-in fade-in">
                            <h3 className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-4">TAGS</h3>
                            <div className="space-y-2">
                                {uniqueTags.map(tag => (
                                    <Button
                                        key={tag}
                                        variant="ghost"
                                        className={`w-full justify-start text-sm font-bold border-2 border-transparent transition-all ${filterCategory === 'tag' && activeTag === tag ? 'bg-neutral-100 border-black translate-x-1' : 'hover:bg-neutral-50 hover:border-neutral-200'}`}
                                        onClick={() => { setView('dashboard'); setFilterCategory('tag'); setActiveTag(tag); }}
                                    >
                                        <Hash size={14} className="mr-2 text-neutral-400" />
                                        {tag.toUpperCase()}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 md:mt-0 pt-6 border-t-2 border-dashed border-gray-300">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-10 h-10 bg-neutral-200 rounded-full border-2 border-black flex items-center justify-center font-bold">
                            ME
                        </div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-neutral-400">LOGGED IN AS</div>
                            <div className="font-bold text-sm">MASTER USER</div>
                        </div>
                    </div>
                    <Button variant="outline" onClick={handleLogout} className="w-full border-2 border-black hover:bg-red-50 hover:text-red-600 hover:border-red-600 font-bold">
                        <LogOut size={16} className="mr-2" /> LOCK VAULT
                    </Button>
                </div>
            </aside>

            <main className="flex-1 p-6 md:p-12 bg-[#f6f6f6] min-h-screen overflow-y-auto">
                {view === 'dashboard' && (
                    <div className="max-w-7xl mx-auto">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tight mb-1">
                                    {filterCategory === 'all' && 'Your Vault'}
                                    {filterCategory === 'favorites' && 'Favorites'}
                                    {filterCategory === 'trash' && 'Trash Bin'}
                                    {filterCategory === 'tag' && <span className="flex items-center gap-2"><Hash className="text-primary-500" strokeWidth={3} /> {activeTag}</span>}
                                </h2>
                                <p className="text-neutral-500 font-mono text-sm">{filteredItems.length} OBJECTS FOUND</p>
                            </div>

                            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                <div className="relative w-full sm:w-80">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-black" size={20} />
                                    <Input
                                        placeholder="SEARCH DATABASE..."
                                        className="pl-12 w-full border-2 border-black h-12 text-lg font-bold placeholder:text-neutral-400 focus:shadow-retro focus:border-primary-500 transition-all"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                                {filterCategory !== 'trash' && (
                                    <Button
                                        onClick={() => setShowAddModal(true)}
                                        className="h-12 border-2 border-black shadow-retro bg-primary-500 hover:bg-primary-600 text-white font-black text-lg px-8 active:translate-y-1 active:shadow-none transition-all"
                                    >
                                        <Plus size={24} className="mr-2" strokeWidth={3} /> NEW ENTRY
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                            {filteredItems.map((item, idx) => (
                                <div key={item.id} className="animate-slide-up" style={{ animationDelay: `${idx * 50}ms` }}>
                                    <VaultCard
                                        item={item}
                                        onToggleFavorite={() => toggleFavorite(item)}
                                        onDelete={() => moveToTrash(item.id)}
                                        onRestore={() => restoreFromTrash(item)}
                                        onPermanentDelete={() => deletePermanently(item.id)}
                                        isTrash={filterCategory === 'trash'}
                                    />
                                </div>
                            ))}
                        </div>

                        {filteredItems.length === 0 && (
                            <div className="flex flex-col items-center justify-center mt-32 text-neutral-400 opacity-50">
                                <div className="border-4 border-neutral-300 p-8 rounded-full mb-4">
                                    <Search size={64} />
                                </div>
                                <div className="text-2xl font-black uppercase">
                                    {search ? 'NO MATCHES FOUND' : 'NOTHING HERE'}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {view === 'audit' && (
                    <div className="max-w-7xl mx-auto animate-slide-up">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-8">
                            <div>
                                <h2 className="text-4xl font-black uppercase tracking-tight mb-2">Security Audit</h2>
                                <p className="text-neutral-500 font-mono text-sm max-w-xl">Comprehensive scan of your local vault. No data is sent to external servers.</p>
                            </div>

                            <Card className="bg-white border-4 border-black p-6 flex items-center gap-6 shadow-retro shrink-0">
                                <div className={`w-20 h-20 rounded-full border-4 border-black flex items-center justify-center text-3xl font-black ${securityStats.score > 80 ? 'bg-green-400' : securityStats.score > 50 ? 'bg-yellow-400' : 'bg-red-400'}`}>
                                    {securityStats.score}%
                                </div>
                                <div>
                                    <div className="text-xs font-black text-neutral-400 uppercase tracking-widest leading-none mb-1">HEALTH SCORE</div>
                                    <div className="text-xl font-black uppercase leading-none">
                                        {securityStats.score > 80 ? 'TACTICAL' : securityStats.score > 50 ? 'CAUTION' : 'CRITICAL'}
                                    </div>
                                </div>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                            <Card className="bg-white border-2 border-black p-6 hover:shadow-retro transition-all cursor-default relative overflow-hidden">
                                <AlertTriangle className="absolute -bottom-4 -right-4 w-24 h-24 text-red-50 opacity-50" />
                                <div className="text-3xl font-black mb-1">{securityStats.weak.length}</div>
                                <div className="text-sm font-black text-neutral-500 uppercase tracking-widest">WEAK SECRETS</div>
                                <p className="text-xs font-mono text-neutral-400 mt-4 leading-relaxed">Passwords lack complexity or are too short.</p>
                            </Card>

                            <Card className="bg-white border-2 border-black p-6 hover:shadow-retro transition-all cursor-default relative overflow-hidden">
                                <Copy className="absolute -bottom-4 -right-4 w-24 h-24 text-yellow-50 opacity-50" />
                                <div className="text-3xl font-black mb-1">{securityStats.reused.length}</div>
                                <div className="text-sm font-black text-neutral-500 uppercase tracking-widest">REUSED SECRETS</div>
                                <p className="text-xs font-mono text-neutral-400 mt-4 leading-relaxed">Identical passwords increase cross-site risk.</p>
                            </Card>

                            <Card className="bg-white border-2 border-black p-6 hover:shadow-retro transition-all cursor-default relative overflow-hidden">
                                <Clock className="absolute -bottom-4 -right-4 w-24 h-24 text-blue-50 opacity-50" />
                                <div className="text-3xl font-black mb-1">{securityStats.old.length}</div>
                                <div className="text-sm font-black text-neutral-500 uppercase tracking-widest">AGING SECRETS</div>
                                <p className="text-xs font-mono text-neutral-400 mt-4 leading-relaxed">Secrets older than 180 days should be rotated.</p>
                            </Card>
                        </div>

                        <div className="space-y-12">
                            {securityStats.weak.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
                                        <AlertTriangle size={24} className="text-red-500" /> VULNERABLE ENTRIES
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {securityStats.weak.map(item => (
                                            <VaultCard key={item.id} item={item} onToggleFavorite={() => toggleFavorite(item)} onDelete={() => moveToTrash(item.id)} onRestore={() => restoreFromTrash(item)} onPermanentDelete={() => deletePermanently(item.id)} isTrash={false} />
                                        ))}
                                    </div>
                                </section>
                            )}

                            {securityStats.reused.length > 0 && (
                                <section>
                                    <h3 className="text-xl font-black mb-6 uppercase flex items-center gap-2">
                                        <Copy size={24} className="text-yellow-500" /> REUSE GROUPS
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {securityStats.reused.map(item => (
                                            <VaultCard key={item.id} item={item} onToggleFavorite={() => toggleFavorite(item)} onDelete={() => moveToTrash(item.id)} onRestore={() => restoreFromTrash(item)} onPermanentDelete={() => deletePermanently(item.id)} isTrash={false} />
                                        ))}
                                    </div>
                                </section>
                            )}
                        </div>
                    </div>
                )}

                {view === 'settings' && (
                    <div className="max-w-4xl mx-auto animate-slide-up">
                        <h2 className="text-4xl font-black uppercase tracking-tight mb-8">System Protocols</h2>

                        <div className="space-y-8">
                            <section>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Lock size={24} /> SECURITY</h3>
                                <Card className="w-full bg-white border-2 border-black p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-bold text-lg">AUTO-LOCK</h4>
                                            <p className="text-sm text-neutral-500">System automatically locks after 5 minutes of inactivity.</p>
                                        </div>
                                        <div className="bg-primary-50 text-primary-600 font-bold px-3 py-1 border-2 border-black text-sm">
                                            ACTIVE
                                        </div>
                                    </div>
                                </Card>
                            </section>

                            <section>
                                <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><ArrowUpFromLine size={24} /> DATA MANAGEMENT</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Card className="w-full bg-primary-50 border-2 border-black p-6 md:col-span-2 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none transition-all">
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="bg-red-500 text-white p-6 border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] shrink-0 animate-pulse-slow">
                                                <Archive size={48} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <span className="bg-black text-white text-[10px] font-black px-2 py-0.5 uppercase tracking-widest">Protocol Beta</span>
                                                    <h4 className="font-black text-2xl uppercase tracking-tighter">Encrypted ZIP Transport</h4>
                                                </div>
                                                <p className="text-neutral-600 font-bold mb-8 text-sm leading-relaxed max-w-xl">
                                                    Package your entire local database into a high-security, WinZip-compatible AES encrypted archive. 
                                                    Contains a structured CSV file optimized for external spreadsheet analysis or offline safe-keeping.
                                                </p>
                                                <div className="flex flex-wrap gap-4">
                                                    <Button 
                                                        onClick={handleExportCSVZip}
                                                        className="border-2 border-black bg-white hover:bg-neutral-100 text-black font-black shadow-retro hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 h-12 px-6"
                                                    >
                                                        <FileSpreadsheet size={18} /> GENERATE PROTOCOL ARCHIVE
                                                    </Button>
                                                    
                                                    <Button 
                                                        onClick={handleExport}
                                                        variant="ghost"
                                                        className="text-xs font-black text-neutral-400 hover:text-black uppercase tracking-widest"
                                                    >
                                                        Legacy JSON Blob
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </Card>

                                    <Card className="w-full bg-white border-2 border-black p-6">
                                        <div className="mb-4 bg-neutral-100 p-3 w-12 h-12 flex items-center justify-center border-2 border-black shrink-0">
                                            <Upload size={24} />
                                        </div>
                                        <h4 className="font-bold text-lg mb-2 uppercase tracking-tight">Restore Protocol</h4>
                                        <p className="text-sm text-neutral-500 mb-6">Import data from a ZeroVault protocol (.zip) or legacy backup (.json).</p>
                                        <div className="relative">
                                            <Button className="w-full border-2 border-black bg-black text-white hover:bg-neutral-800 font-black h-12 shadow-retro active:translate-y-1 active:shadow-none transition-all">
                                                SELECT UPLOAD TARGET
                                            </Button>
                                            <input
                                                type="file"
                                                className="absolute inset-0 opacity-0 cursor-pointer"
                                                accept=".json,.zip"
                                                onChange={handleImport}
                                            />
                                        </div>
                                    </Card>
                                </div>
                            </section>

                            <section>
                                <Card className="w-full bg-red-50 border-2 border-red-500 p-6">
                                    <h4 className="font-bold text-lg mb-2 text-red-600 flex items-center gap-2"><ShieldAlert /> DANGER ZONE</h4>
                                    <p className="text-sm text-red-800 mb-4">Permanently destroy local database.</p>
                                    <Button
                                        onClick={() => {
                                            askConfirm(
                                                "NUKE DATABASE?",
                                                "ALL DATA WILL BE LOST. This will completely wipe your local vault.",
                                                async () => {
                                                    localStorage.clear();
                                                    await deleteDB('ZeroVaultDB');
                                                    await lockExtensionSession();
                                                    window.location.reload();
                                                },
                                                "danger"
                                            );
                                        }}
                                        className="border-2 border-red-600 bg-red-600 text-white hover:bg-red-700 font-bold"
                                    >
                                        NUKE DATABASE
                                    </Button>
                                </Card>
                            </section>
                        </div>
                    </div>
                )}
            </main>

            {showAddModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div onClick={() => setShowAddModal(false)} className="absolute inset-0" />
                    <Card className="w-full max-w-lg bg-white border-4 border-black shadow-[12px_12px_0px_0px_#f43f5e] relative z-10 p-8 animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-start mb-6 border-b-4 border-black pb-4">
                            <h2 className="text-3xl font-black uppercase tracking-tight">NEW ENTRY</h2>
                            <button onClick={() => setShowAddModal(false)} className="hover:bg-black hover:text-white border-2 border-transparent p-1 transition-colors">
                                <Plus size={32} className="rotate-45" />
                            </button>
                        </div>

                        <div className="flex gap-2 mb-6">
                            <Button
                                className={`flex-1 border-2 border-black font-bold text-sm ${entryType === 'password' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                                onClick={() => setEntryType('password')}
                            >
                                <Key size={14} className="mr-2" /> PASSWORD
                            </Button>
                            <Button
                                className={`flex-1 border-2 border-black font-bold text-sm ${entryType === 'note' ? 'bg-black text-white' : 'bg-white text-black hover:bg-neutral-100'}`}
                                onClick={() => setEntryType('note')}
                            >
                                <FileText size={14} className="mr-2" /> SECURE NOTE
                            </Button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-black font-mono text-black uppercase tracking-widest mb-2 block">
                                    {entryType === 'password' ? 'TARGET (SITE NAME OR LINK)' : 'NOTE TITLE'}
                                </label>
                                <Input
                                    placeholder={entryType === 'password' ? "e.g. Netflix, google.com, or paste a link" : "e.g. WIFI_KEYS"}
                                    className="border-2 border-black text-xl px-4 py-3 font-bold w-full focus:shadow-retro transition-all"
                                    value={newItem.site}
                                    onChange={e => {
                                        let val = e.target.value;
                                        if (val.startsWith('http')) {
                                            try {
                                                const url = new URL(val);
                                                val = url.origin + url.pathname;
                                                if (val.endsWith('/')) val = val.slice(0, -1);
                                            } catch (e) { }
                                        }
                                        setNewItem({ ...newItem, site: val });
                                    }}
                                />
                            </div>

                            {entryType === 'password' ? (
                                <>
                                    <div>
                                        <label className="text-sm font-black font-mono text-black uppercase tracking-widest mb-2 block">IDENTITY (USERNAME)</label>
                                        <Input
                                            placeholder="user@email.com"
                                            className="border-2 border-black text-lg px-4 py-3 font-mono w-full focus:shadow-retro transition-all"
                                            value={newItem.username}
                                            onChange={e => setNewItem({ ...newItem, username: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-2">
                                            <label className="text-sm font-black font-mono text-black uppercase tracking-widest block">SECRET (PASSWORD)</label>
                                            <button
                                                onClick={() => setNewItem({ ...newItem, password: generateRandomPassword() })}
                                                className="text-xs bg-black text-white px-2 py-1 font-mono font-bold hover:bg-primary-500 transition-colors uppercase"
                                            >
                                                GENERATE RANDOM
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Input
                                                placeholder="••••••••••••••••"
                                                className="border-2 border-black text-lg px-4 py-3 font-mono w-full pr-12 focus:shadow-retro transition-all"
                                                value={newItem.password}
                                                onChange={e => setNewItem({ ...newItem, password: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div>
                                    <label className="text-sm font-black font-mono text-black uppercase tracking-widest mb-2 block">CONTENT</label>
                                    <Textarea
                                        placeholder="Enter your notes here..."
                                        className="border-2 border-black text-sm font-mono leading-relaxed"
                                        rows={6}
                                        value={newItem.note}
                                        onChange={e => setNewItem({ ...newItem, note: e.target.value })}
                                    />
                                </div>
                            )}

                            <div>
                                <label className="text-sm font-black font-mono text-black uppercase tracking-widest mb-2 block">TAGS (OPTIONAL)</label>
                                <Input
                                    placeholder="e.g. finance, work"
                                    className="border-2 border-black text-sm px-4 py-3 font-mono w-full focus:shadow-retro transition-all"
                                    value={newItem.tags}
                                    onChange={e => setNewItem({ ...newItem, tags: e.target.value })}
                                />
                            </div>

                            <div className="flex gap-4 mt-8">
                                <Button className="flex-1 bg-white border-2 border-black text-black hover:bg-neutral-100 py-4 font-black text-lg" onClick={() => setShowAddModal(false)}>
                                    CANCEL
                                </Button>
                                <Button className="flex-1 bg-black border-2 border-black text-white hover:bg-neutral-800 shadow-retro py-4 font-black text-lg active:translate-y-1 active:shadow-none transition-all" onClick={handleAdd}>
                                    ENCRYPT & SAVE
                                </Button>
                            </div>
                        </div>
                    </Card>
                </div>
            )}

            <ConfirmModal
                isOpen={confirmConfig.isOpen}
                title={confirmConfig.title}
                message={confirmConfig.message}
                onConfirm={confirmConfig.onConfirm}
                onCancel={() => setConfirmConfig(prev => ({ ...prev, isOpen: false }))}
                 variant={confirmConfig.variant}
            />

            {passwordModal.isOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60] animate-in fade-in duration-200">
                    <div onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))} className="absolute inset-0" />
                    <Card className="w-full max-w-md bg-white border-4 border-black shadow-[12px_12px_0px_0px_#000] relative z-10 p-8 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-3 mb-6 border-b-4 border-black pb-4">
                            <div className="bg-primary-500 text-white p-2 border-2 border-black">
                                <Lock size={20} />
                            </div>
                            <h3 className="font-black text-xl uppercase tracking-tighter">{passwordModal.title}</h3>
                        </div>
                        <p className="text-sm font-bold text-neutral-500 mb-8 leading-relaxed">{passwordModal.description}</p>
                        
                        <form onSubmit={(e) => {
                            e.preventDefault();
                            const formData = new FormData(e.currentTarget);
                            const password = formData.get('zipPassword') as string;
                            if (password) passwordModal.onConfirm(password);
                        }}>
                            <div className="mb-8">
                                <label className="text-[10px] font-black uppercase text-neutral-400 tracking-widest mb-2 block">ARCHIVE ACCESS SECRET</label>
                                <Input 
                                    name="zipPassword"
                                    type="password"
                                    autoFocus
                                    placeholder="••••••••••••"
                                    className="border-2 border-black text-xl px-4 py-4 font-mono w-full focus:shadow-retro transition-all text-black"
                                    required
                                />
                            </div>
                            <div className="flex gap-4">
                                <Button 
                                    type="button"
                                    className="flex-1 border-2 border-black bg-white hover:bg-neutral-100 font-black text-black"
                                    onClick={() => setPasswordModal(prev => ({ ...prev, isOpen: false }))}
                                >
                                    ABORT
                                </Button>
                                <Button 
                                    type="submit"
                                    className="flex-1 bg-black text-white border-2 border-black shadow-retro-hover hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all font-black"
                                >
                                    INITIALIZE
                                </Button>
                            </div>
                        </form>
                    </Card>
                </div>
            )}

            <div className="flex flex-col gap-2">
                {toasts.map(toast => (
                    <Toast
                        key={toast.id}
                        message={toast.message}
                        type={toast.type}
                        onClose={() => removeToast(toast.id)}
                    />
                ))}
            </div>
        </div >
    );
}

function VaultCard({
    item,
    onToggleFavorite,
    onDelete,
    onRestore,
    onPermanentDelete,
    isTrash
}: {
    item: VaultItem,
    onToggleFavorite: () => void,
    onDelete: () => void,
    onRestore: () => void,
    onPermanentDelete: () => void,
    isTrash: boolean
}) {
    const [showPass, setShowPass] = useState(false);
    const [copied, setCopied] = useState(false);

    const isNote = item.type === 'note';

    const copyPass = () => {
        if (isTrash) return;
        const content = isNote ? item.note : item.password;
        if (content) {
            navigator.clipboard.writeText(content);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    return (
        <Card className={`bg-white border-2 border-black hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_#000000] shadow-[4px_4px_0px_0px_#000000] transition-all duration-200 p-0 flex flex-col h-full group ${isTrash ? 'opacity-80 grayscale hover:grayscale-0' : ''}`}>
            <div className="p-5 flex-1 relative overflow-hidden">
                {!isTrash && (
                    <div className="absolute top-0 right-0 p-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
                            className="p-2 hover:scale-110 transition-transform text-black"
                        >
                            <Star size={20} fill={item.is_favorite ? "black" : "none"} strokeWidth={item.is_favorite ? 0 : 2} />
                        </button>
                    </div>
                )}

                <div className="flex justify-between items-start mb-3 pr-8">
                    <div className="flex items-center gap-2 w-full">
                        {isNote ? <FileText size={18} className="shrink-0" /> : <Key size={18} className="shrink-0" />}
                        <h3 className="font-black text-xl uppercase tracking-tight text-black break-all leading-tight">
                            {item.site}
                        </h3>
                    </div>
                </div>

                {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-3">
                        {item.tags.map(tag => (
                            <span key={tag} className="text-[10px] font-black uppercase bg-neutral-100 px-2 py-0.5 border border-black text-neutral-500">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {!isNote && (
                    <div className="text-sm font-mono text-neutral-500 truncate border-b-2 border-dashed border-neutral-200 pb-4 mb-4">
                        {item.username}
                    </div>
                )}

                {isNote ? (
                    <div
                        className={`bg-neutral-50 p-3 border-2 border-black min-h-[60px] cursor-pointer hover:bg-neutral-100 transition-colors ${showPass ? '' : 'flex items-center justify-center'}`}
                        onClick={() => setShowPass(!showPass)}
                    >
                        {showPass ? (
                            <p className="font-mono text-xs whitespace-pre-wrap break-all">{item.note}</p>
                        ) : (
                            <div className="flex items-center gap-2 text-neutral-400">
                                <FileText size={16} /> <span>CLICK TO READ</span>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className={`bg-neutral-50 p-3 border-2 border-black flex items-center justify-between ${isTrash ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:bg-neutral-100'} transition-colors`} onClick={copyPass}>
                        <span className="font-mono text-lg font-bold text-black truncate mr-2 select-none">
                            {isTrash ? '••••••••••' : (showPass ? item.password : '••••••••••••')}
                        </span>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowPass(!showPass); }}
                                className="p-1 hover:bg-black hover:text-white transition-colors border border-transparent hover:border-black"
                            >
                                <Lock size={14} />
                            </button>
                            <div className="w-[1px] h-4 bg-neutral-300" />
                            <div className={`text-[10px] font-black uppercase ${copied ? 'text-primary-600' : 'text-neutral-400'}`}>
                                {copied ? 'COPIED' : 'COPY'}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="p-4 border-t-2 border-black bg-neutral-50 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isTrash ? (
                    <>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-black text-green-600 hover:bg-green-100"
                            onClick={onRestore}
                        >
                            RESTORE
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs font-black text-red-600 hover:bg-red-100"
                            onClick={onPermanentDelete}
                        >
                            DELETE FOREVER
                        </Button>
                    </>
                ) : (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs font-black text-neutral-400 hover:text-red-600 hover:bg-red-50"
                        onClick={onDelete}
                    >
                        <Trash2 size={14} className="mr-2" /> MOVE TO TRASH
                    </Button>
                )}
            </div>
        </Card>
    );
}
