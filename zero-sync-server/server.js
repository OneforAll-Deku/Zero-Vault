const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Database Setup
const db = new sqlite3.Database(path.join(__dirname, 'vault.db'), (err) => {
    if (err) console.error('DB Error:', err);
    else {
        console.log('ZeroSync Database Connected.');
        db.run(`CREATE TABLE IF NOT EXISTS sync_slots (
            id TEXT PRIMARY KEY,
            sync_token_hash TEXT NOT NULL,
            encrypted_blob TEXT NOT NULL,
            updated_at INTEGER NOT NULL
        )`);
    }
});

// --- ROUTES ---

// 1. Initialize or Update a Sync Slot
app.post('/api/sync/push', (req, res) => {
    const { slotId, tokenHash, blob } = req.body;

    if (!slotId || !tokenHash || !blob) {
        return res.status(400).json({ error: 'Incomplete data' });
    }

    // Verify if slot exists and if token matches
    db.get('SELECT sync_token_hash FROM sync_slots WHERE id = ?', [slotId], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB Error' });

        if (row) {
            // Check token (In a real app, use timing-safe comparison)
            if (row.sync_token_hash !== tokenHash) {
                return res.status(401).json({ error: 'Unauthorized' });
            }

            // Update
            db.run('UPDATE sync_slots SET encrypted_blob = ?, updated_at = ? WHERE id = ?',
                [blob, Date.now(), slotId], (err) => {
                    if (err) return res.status(500).json({ error: 'Update failed' });
                    res.json({ success: true, message: 'Vault Synced UP' });
                });
        } else {
            // Create New
            db.run('INSERT INTO sync_slots (id, sync_token_hash, encrypted_blob, updated_at) VALUES (?, ?, ?, ?)',
                [slotId, tokenHash, blob, Date.now()], (err) => {
                    if (err) return res.status(500).json({ error: 'Creation failed' });
                    res.json({ success: true, message: 'New Sync Slot Created' });
                });
        }
    });
});

// 2. Fetch the latest blob
app.post('/api/sync/pull', (req, res) => {
    const { slotId, tokenHash } = req.body;

    db.get('SELECT encrypted_blob, sync_token_hash FROM sync_slots WHERE id = ?', [slotId], (err, row) => {
        if (err) return res.status(500).json({ error: 'DB Error' });
        if (!row) return res.status(404).json({ error: 'Slot not found' });

        if (row.sync_token_hash !== tokenHash) {
            return res.status(401).json({ error: 'Unauthorized' });
        }

        res.json({ blob: row.encrypted_blob });
    });
});

app.listen(PORT, () => {
    console.log(`
    ███████╗███████╗██████╗  ██████╗ ███████╗██╗   ██╗███╗   ██╗ ██████╗ 
    ╚══███╔╝██╔════╝██╔══██╗██╔═══██╗██╔════╝╚██╗ ██╔╝████╗  ██║██╔════╝ 
      ███╔╝ █████╗  ██████╔╝██║   ██║███████╗ ╚████╔╝ ██╔██╗ ██║██║      
     ███╔╝  ██╔══╝  ██╔══██╗██║   ██║╚════██║  ╚██╔╝  ██║╚██╗██║██║      
    ███████╗███████╗██║  ██║╚██████╔╝███████║   ██║   ██║ ╚████║╚██████╗ 
    ╚══════╝╚══════╝╚═╝  ╚═╝ ╚═════╝ ╚══════╝   ╚═╝   ╚═╝  ╚═══╝ ╚═════╝ 
                                        SYNC SERVER RUNNING ON PORT ${PORT}
    `);
});
