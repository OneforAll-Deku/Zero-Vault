const statusDiv = document.getElementById('status');
const openBtn = document.getElementById('open-dashboard');
const lockBtn = document.getElementById('lock-vault');

function updateUI() {
    try {
        chrome.runtime.sendMessage({ type: 'GET_SESSION' }, (session) => {
            if (chrome.runtime.lastError) return;

            if (session && session.unlocked) {
                statusDiv.innerHTML = `<div style="color: #22c55e; font-weight: 800;">✔ VAULT UNLOCKED</div>`;
                statusDiv.parentElement.style.borderColor = '#22c55e';
                lockBtn.classList.remove('hidden');
            } else {
                statusDiv.innerHTML = `<div style="color: #666; font-weight: 800;">✖ VAULT LOCKED</div>`;
                statusDiv.parentElement.style.borderColor = 'black';
                lockBtn.classList.add('hidden');
            }
        });
    } catch (e) {
        console.error(e);
    }
}

openBtn.addEventListener('click', () => {
    window.open('http://localhost:3000');
});

lockBtn.addEventListener('click', () => {
    chrome.runtime.sendMessage({ type: 'LOCK_VAULT' }, () => {
        updateUI();
    });
});

setInterval(updateUI, 1000);
updateUI();
