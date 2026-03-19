# ZeroVault: Self-Hosting & Multi-User Implementation Plan

This plan outlines the steps to transform **ZeroVault** into a production-ready, self-hosted password manager that any user can deploy in minutes.

---

## 🏗️ Core Architecture: "The Blind Server"
To maintain absolute security, we will use a **Zero-Knowledge** architecture. The server stores data but cannot decrypt it.

1.  **Client-Side Hashing**: The Master Password is used to derive two keys locally:
    -   **Auth Key**: Sent to the server for login/registration.
    -   **Encryption Key**: Stays in the browser's RAM for decrypting passwords.
2.  **Encrypted Sync**: The server stores an encrypted JSON blob (the vault). It can only read metadata (user ID, last sync time).
3.  **Local-First**: The browser uses IndexedDB for speed. The server is used only for backup and cross-device sync.

---

## 🚀 Phase 1: Easy "One-Click" Setup (Docker)
To make setup easy for others, we will bundle everything into **Docker Containers**.

-   **Docker Compose**: A single file that starts the Web App, the Backend API, and the Database.
-   **Integrated SSL**: Using **Caddy** as a reverse proxy. It automatically handles HTTPS (SSL) for any domain the user provides.
-   **Configurable ENV**: Setup will be as simple as editing a `.env` file with `DOMAIN=vault.example.com`.

---

## 🔐 Phase 2: Zero-Knowledge Authentication
Traditional login sends passwords to servers. ZeroVault won't.

1.  **Argon2id Integration**: We will use the Argon2id hashing algorithm (the current gold standard) inside the browser.
2.  **The Handshake**:
    -   User enters email.
    -   Server sends a unique **Salt**.
    -   Browser calculates `Argon2(Password, Salt)` and sends only the hash.
    -   Server compares the hash.
3.  **Result**: Even if the server database is leaked, there are NO passwords and NO encryption keys in it.

---

## 👥 Phase 3: Multi-User Management
A dashboard for the "Owner" to manage their self-hosted instance.

-   **User Invitations**: The owner can generate invite links for family/friends.
-   **Registration Control**: Disable public registration so strangers can't use your server.
-   **Storage Limits**: Set limits on how much data each user can sync.
-   **Admin Panel**: A neobrutalist UI for viewing system health, active sessions, and user counts.

---

## 🔄 Phase 4: Robust Synchronization Logic
Cross-device sync needs to be smart to avoid data loss.

1.  **Revision History**: Every time the vault is saved, the server keeps a short history of versions (e.g., last 5 saves).
2.  **Conflict Resolution**: If you change a password on your Phone and Laptop at the same time, ZeroVault will show a "Conflict Detected" popup and let you pick the right one.
3.  **Instant Push**: Using **WebSockets** or **Server-Sent Events**, the extension will know immediately when you've added a password on another device.

---

## 🛠️ Phase 5: Hardening & Professionalism
-   **Rate Limiting**: Fail to login 5 times? Your IP is blocked for 10 minutes.
-   **Health Checks**: Automatic monitoring to ensure the database is running.
-   **Automated Backups**: A built-in tool to export the entire server state to an encrypted `.zip` file for off-site storage (e.g., Google Drive or AWS S3).

---

## 🗺️ The Implementation Roadmap
| Step | Task | Goal |
| :--- | :--- | :--- |
| **1** | **Backend Setup** | Create a Node.js API with Express & PostgreSQL. |
| **2** | **Auth Upgrade** | Implement Argon2id on the login page. |
| **3** | **Sync API** | Add `push` and `pull` endpoints for the encrypted blobs. |
| **4** | **Dockerization** | Write the Dockerfile and Compose scripts. |
| **5** | **SSL Integration** | Add Caddy for "HTTPS by default." |

---

**Ready to start?**
I suggest we begin by **creating the Backend API structure** so we have a place to store data other than just your local computer!
