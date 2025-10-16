// metamask.js
// Handles MetaMask wallet connection with a simple exported helper

async function connectWallet() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts && accounts[0];
            if (account) {
                showToast(`Wallet connected: ${account}`, 'success');
                return account;
            }
            throw new Error('No account returned');
        } catch (err) {
            console.error('connectWallet error', err);
            showToast('Wallet connection failed', 'error');
            return null;
        }
    } else {
        showToast('MetaMask not installed! Please install it.', 'error');
        return null;
    }
}

// Expose helper for other scripts
window.connectWallet = connectWallet;

// Toast helper (lightweight, same shape as auth.js)
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
