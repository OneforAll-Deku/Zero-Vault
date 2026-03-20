# 🛡️ ZeroVault

**ZeroVault** is a privacy-first, local-only password management ecosystem. It combines a high-performance web dashboard with a browser extension for seamless autofill, ensuring your sensitive data never leaves your control.

---

## 🏗️ Project Architecture

The system consists of two primary components:

1.  **ZeroVault Web Console (`/zero-vault`)**: A Next.js 15 application using IndexedDB for encrypted local storage and AES-GCM for military-grade encryption.
2.  **ZeroVault Extension (`/extension`)**: A Manifest V3 Chrome extension that provides secure autofill capability by bridging with the local web console.

---

## ✨ Features

-   **Zero-Knowledge Architecture**: All encryption and decryption happen locally in your browser.
-   **Retro Design System**: A high-contrast, "brutalist" UI for a professional yet distinctive experience.
-   **Smart Autofill**: The extension detects login fields and matches credentials based on domain segments.
-   **Security Audit**: Built-in vault health scanner to detect weak, reused, or aging passwords.
-   **Encrypted Backups**: Export and import your vault as an encrypted JSON blob.
-   **Session Persistence**: Extension stays unlocked while your browser is open using `chrome.storage.session`.

---

## 🚀 Getting Started

### 1. Web Vault Setup
```bash
cd zero-vault
npm install
npm run dev
```
The vault will be available at `http://localhost:3000`.

### 2. Extension Installation
1.  Open Chrome and navigate to `chrome://extensions`.
2.  Enable **Developer Mode** (top right toggle).
3.  Click **Load unpacked** and select the `extension` folder from this project.
4.  Copy the **Extension ID** (e.g., `cccinblgohldiknfcfghmmjjhkcgcblc`).

### 3. Final Connection
To allow the Web Vault to talk to the Extension:
1.  Open `zero-vault/src/lib/extensionBridge.ts`.
2.  Update the `EXTENSION_ID` constant with the ID you copied in the previous step.
3.  Refresh your Vault page (localhost:3000) and log in.

---

## 🔒 Security Specifications

-   **Algorithm**: AES-256-GCM (Authenticated Encryption).
-   **Key Derivation**: PBKDF2 with 600,000 iterations (standard) and a unique local salt.
-   **Storage**: W3C IndexedDB API.
-   **Extension Bridge**: Secure cross-extension messaging restricted to verified localhost origins.

---

## 🛠️ Tech Stack

-   **Frontend**: Next.js 15, TailwindCSS, Lucide Icons.
-   **Encryption**: Web Crypto API (SubtleCrypto).
-   **Extension**: Javascript (Manifest V3), Shadow DOM (for UI isolation).
-   **State Management**: Zustand.

---

## 📜 License

MIT - Built by Google Deepmind Advanced Agentic Coding.

---

## 📽️ Presentation Resources

Need to present ZeroVault? Check our [Presentation & PPT Guide](./PRESENTATION_GUIDE.md) for a structured slide outline and real-world problem-solving narratives.
