const ZV_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" style="display: block;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>`;

function showToast(message, type = 'info') {
    const host = document.createElement('div');
    host.style.cssText = `
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 2147483647;
        pointer-events: none;
    `;
    document.body.appendChild(host);

    const shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = `
        .toast {
            background: ${type === 'error' ? '#f43f5e' : 'black'};
            color: white;
            padding: 12px 20px;
            border: 2px solid black;
            box-shadow: 4px 4px 0px 0px black;
            font-family: monospace;
            font-size: 13px;
            font-weight: 800;
            display: flex;
            align-items: center;
            gap: 12px;
            pointer-events: auto;
            transform: translateX(120%);
            transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            text-transform: uppercase;
        }
        .toast.visible {
            transform: translateX(0);
        }
    `;
    shadow.appendChild(style);

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <div style="flex-shrink: 0">${ZV_SVG}</div>
        <div>${message}</div>
    `;
    shadow.appendChild(toast);

    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => host.remove(), 300);
    }, 4000);
}

function injectAssistant() {
    // DO NOT show the assistant on the ZeroVault dashboard or setup pages
    if (window.location.hostname === 'localhost' && window.location.port === '3000') return;
    if (window.location.hostname === '127.0.0.1' && window.location.port === '3000') return;

    const passwordInputs = document.querySelectorAll('input[type="password"]');

    passwordInputs.forEach(passInput => {
        if (passInput.dataset.zvInjected) return;
        passInput.dataset.zvInjected = 'true';

        const host = document.createElement('div');
        host.className = 'zv-assistant-host';
        host.style.cssText = `
            position: absolute;
            z-index: 2147483647;
            pointer-events: none;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        document.body.appendChild(host);

        const shadow = host.attachShadow({ mode: 'open' });

        const style = document.createElement('style');
        style.textContent = `
            .badge {
                cursor: pointer;
                background: #f43f5e;
                border: 2px solid black;
                width: 38px;
                height: 26px;
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 2px 2px 0px 0px black;
                transition: all 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                user-select: none;
                border-radius: 4px;
                pointer-events: auto;
            }
            .badge:hover {
                background: #e11d48;
                transform: scale(1.1) rotate(1deg);
                box-shadow: 4px 4px 0px 0px black;
            }
            .badge:active {
                transform: scale(0.95);
                box-shadow: 1px 1px 0px 0px black;
            }
            .tooltip {
                position: absolute;
                bottom: calc(100% + 10px);
                right: 0;
                background: black;
                color: white;
                padding: 4px 8px;
                font-family: monospace;
                font-size: 10px;
                font-weight: bold;
                white-space: nowrap;
                border: 2px solid white;
                box-shadow: 3px 3px 0px 0px #f43f5e;
                opacity: 0;
                transform: translateY(5px);
                transition: all 0.2s;
            }
            .badge:hover + .tooltip {
                opacity: 1;
                transform: translateY(0);
            }
        `;
        shadow.appendChild(style);

        const badge = document.createElement('div');
        badge.className = 'badge';
        badge.innerHTML = ZV_SVG;
        shadow.appendChild(badge);

        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.innerText = 'ZEROVAULT AUTO-FILL';
        shadow.appendChild(tooltip);

        const updatePosition = () => {
            const rect = passInput.getBoundingClientRect();
            const compStyle = window.getComputedStyle(passInput);

            if (rect.width === 0 || rect.height === 0 || compStyle.display === 'none' || compStyle.visibility === 'hidden') {
                host.style.visibility = 'hidden';
                return;
            }

            const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
            const scrollY = window.pageYOffset || document.documentElement.scrollTop;

            const x = rect.left + scrollX + rect.width - 48;
            const y = rect.top + scrollY + (rect.height / 2) - 13;

            host.style.left = x + 'px';
            host.style.top = y + 'px';
            host.style.visibility = 'visible';
        };

        window.addEventListener('scroll', updatePosition, true);
        window.addEventListener('resize', updatePosition);

        if (window.ResizeObserver) {
            new ResizeObserver(updatePosition).observe(passInput);
        }

        setInterval(updatePosition, 300);
        updatePosition();

        badge.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();

            try {
                chrome.runtime.sendMessage({ type: 'GET_SESSION' }, (session) => {
                    if (chrome.runtime.lastError) {
                        const err = chrome.runtime.lastError.message;
                        if (err.includes('context invalidated')) {
                            showToast("Extension updated. Please refresh this page.", "error");
                            return;
                        }
                    }

                    if (!session || !session.unlocked) {
                        showToast("Vault Locked. Unlock at localhost:3000", "error");
                        return;
                    }

                const host = window.location.hostname.toLowerCase();
                const getDomainSegment = (h) => {
                    const p = h.replace(/^www\./, '').split('.');
                    if (p.length > 2) return p[p.length - 2];
                    return p[0];
                };
                const mainSegment = getDomainSegment(host);

                if (!session.items || session.items.length === 0) {
                    showToast("Vault is empty. Add credentials first.", "error");
                    return;
                }

                console.group("ZeroVault Debug");
                console.log("Current Host:", host);
                console.log("Segment Found:", mainSegment);
                console.log("Vault Items Count:", session.items.length);

                const matches = session.items.filter(item => {
                    let site = (item.site || '').toLowerCase().trim();
                    if (!site) return false;

                    // Clean stored site for smarter comparison
                    const cleanSite = site.replace(/^https?:\/\//, '').replace(/^www\./, '');

                    const isMatch = host.includes(cleanSite) ||
                        cleanSite.includes(mainSegment) ||
                        host.endsWith(cleanSite) ||
                        cleanSite.includes(host);

                    if (isMatch) {
                        console.log("ZeroVault | ✅ MATCH FOUND:", item.username, `(Stored: ${site})`);
                    } else {
                        console.log("ZeroVault | ❌ SKIPPING:", item.username, `(Stored: "${site}" does not match "${host}")`);
                    }
                    return isMatch;
                });
                console.log("ZeroVault | Final matches for this page:", matches.length);
                console.groupEnd();

                if (matches.length === 0) {
                    showToast(`No match found for "${mainSegment}"`, "error");
                    return;
                }

                if (matches.length === 1) {
                    // Only auto-fill if it's EXACTLY one match.
                    showToast(`Found 1 match: ${matches[0].username || 'Password'}`);
                    performFill(matches[0], passInput);
                } else {
                    // If 2 or more, ALWAYS show the picker.
                    console.log("ZeroVault | Multiple matches found, showing picker...");
                    showToast(`Found ${matches.length} accounts!`, "info");
                    showAccountPicker(matches, badge, (selected) => {
                        performFill(selected, passInput);
                    });
                }
                });
            } catch (err) {
                if (err.message.includes('context invalidated')) {
                    showToast("Extension updated. Please refresh this page.", "error");
                } else {
                    console.error("ZeroVault Error:", err);
                }
            }
        };
    });
}

function showAccountPicker(matches, anchor, onSelect) {
    const id = 'zv-account-picker';
    const existing = document.getElementById(id);
    if (existing) {
        existing.remove();
        return; // Toggle behavior
    }

    const menu = document.createElement('div');
    menu.id = id;
    const rect = anchor.getBoundingClientRect();

    // Position near the badge but ensure it stays on screen
    let top = rect.bottom + window.scrollY + 5;
    let left = rect.left + window.scrollX - 180;

    if (left < 10) left = 10;
    if (left + 220 > window.innerWidth) left = window.innerWidth - 230;

    menu.style.cssText = `
        position: absolute;
        top: ${top}px;
        left: ${left}px;
        background: white;
        border: 4px solid #f43f5e;
        box-shadow: 8px 8px 0px 0px black;
        z-index: 2147483647;
        width: 220px;
        font-family: 'Courier New', Courier, monospace;
        padding: 4px;
        display: block !important;
        visibility: visible !important;
        animation: zv-pop 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    `;

    // Add animation style if not exists
    if (!document.getElementById('zv-styles')) {
        const s = document.createElement('style');
        s.id = 'zv-styles';
        s.textContent = `@keyframes zv-pop { from { transform: scale(0.9); opacity: 0; } to { transform: scale(1); opacity: 1; } }`;
        document.head.appendChild(s);
    }

    matches.forEach(item => {
        const row = document.createElement('div');
        row.style.cssText = `
            padding: 12px 16px;
            cursor: pointer;
            border-bottom: 2px solid #f0f0f0;
            font-weight: 900;
            font-size: 14px;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            color: black;
            text-align: left;
            transition: background 0.1s;
            text-transform: uppercase;
        `;
        row.innerText = item.username || '[SECURE PASS]';

        row.onmouseover = () => {
            row.style.background = '#000';
            row.style.color = '#fff';
        };
        row.onmouseout = () => {
            row.style.background = 'transparent';
            row.style.color = 'black';
        };
        row.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            onSelect(item);
            menu.remove();
        };
        menu.appendChild(row);
    });

    document.body.appendChild(menu);

    const closeHandler = (e) => {
        if (!menu.contains(e.target) && e.target !== anchor) {
            menu.remove();
            document.removeEventListener('click', closeHandler);
        }
    };
    setTimeout(() => document.addEventListener('click', closeHandler), 10);
}

function performFill(match, passInput) {
    fillField(passInput, match.password);

    // Smarter username field detection
    let userInput = null;
    const form = passInput.closest('form');

    if (form) {
        userInput = form.querySelector('input[type="text"], input[type="email"], input[name*="user"], input[name*="email"], input[name*="login"], input[id*="user"], input[id*="email"]');
    }

    if (!userInput) {
        // Fallback: look globally for the best candidate
        const candidates = Array.from(document.querySelectorAll('input:not([type="password"])'))
            .filter(i => {
                const rect = i.getBoundingClientRect();
                return rect.width > 0 && rect.height > 0;
            });

        userInput = candidates.find(i =>
            i.name?.toLowerCase().includes('user') ||
            i.id?.toLowerCase().includes('user') ||
            i.type === 'email'
        );
    }

    if (userInput) fillField(userInput, match.username || '');
    showToast(`Autofilled: ${match.username || 'Password'}`);
}

function fillField(input, value) {
    if (!input) return;

    input.value = value;

    const nativeValueDescriptor = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value');
    if (nativeValueDescriptor && nativeValueDescriptor.set) {
        nativeValueDescriptor.set.call(input, value);
    }

    ['input', 'change', 'blur', 'focus'].forEach(type => {
        input.dispatchEvent(new Event(type, { bubbles: true }));
    });
}

setInterval(injectAssistant, 2000);
injectAssistant();
