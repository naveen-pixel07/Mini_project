// metamask.js
// Handles MetaMask wallet connection with notifications

async function connectWallet() {
    if (typeof window.ethereum !== "undefined") {
        try {
            const accounts = await ethereum.request({ method: "eth_requestAccounts" });
            const account = accounts[0];
            showToast(`Wallet connected: ${account}`, "success");
            return account;
        } catch (err) {
            console.error(err);
            showToast("Wallet connection failed", "error");
        }
    } else {
        showToast("MetaMask not installed! Please install it.", "error");
    }
}

<<<<<<< HEAD
// Export the connectWallet function for use in other files
window.connectWallet = connectWallet;
=======
// Connect wallet button
const walletBtn = document.getElementById("connectWallet");
if (walletBtn) {
    walletBtn.addEventListener("click", connectWallet);
}
>>>>>>> 04b8ef9195580d9cc9cc43badc772ebc02bb6cc5

// Toast function (same style)
function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast ${type}`;
    toast.innerText = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add("show"), 100);
    setTimeout(() => {
        toast.classList.remove("show");
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}
