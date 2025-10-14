const express = require('express');
const { ethers } = require('ethers'); // Ethers is needed for signature verification
const path = require('path');

const app = express();
const PORT = 3000;

// --- CONFIGURATION ---
// The admin list is kept securely on the server.
// REPLACE THESE WITH YOUR REAL ADDRESSES!
const ADMIN_ADDRESSES = [
  "0x1234567890123456789012345678901234567890", // Replace with actual admin address
  "0x0987654321098765432109876543210987654321"  // Replace with actual admin address
];

// --- MIDDLEWARE ---
app.use(express.json()); // To parse JSON request bodies
app.use(express.static(__dirname)); // To serve your static files (HTML, CSS, JS)

// --- API ROUTES ---
app.post('/login', (req, res) => {
  const { address, message, signature } = req.body;

  try {
    // Step 1: Securely verify the signature on the backend.
    const recoveredAddress = ethers.verifyMessage(message, signature);

    // Step 2: Ensure the address that signed the message is the one they claim to be.
    if (recoveredAddress.toLowerCase() !== address.toLowerCase()) {
      return res.status(401).json({ success: false, message: 'Signature verification failed.' });
    }

    // Step 3: Signature is valid! Now, check if the address is on the admin list.
    const isAdmin = ADMIN_ADDRESSES.map(addr => addr.toLowerCase()).includes(address.toLowerCase());

        // --- THIS IS THE ONLY PART TO CHANGE ---
    // Update the URLs to match your new plan.
    
    // Step 4: Determine the correct redirect URL based on the user's role.
    // Note: Your file tree shows your HTML files are in an /html/ folder.
    const redirectUrl = isAdmin ? '/html/admin.html' : '/html/dashboard.html';
    const role = isAdmin ? 'admin' : 'user';

    console.log(`✅ Verified login for ${address}. Role: ${role}.`);

    // Step 5: Send the success response back to the frontend with the correct redirect URL.
    return res.json({
      success: true,
      redirectUrl: redirectUrl
    });

  } catch (error) {
    console.error("Login verification error:", error);
    return res.status(500).json({ success: false, message: 'An error occurred during verification.' });
  }
});

// --- OTP ENDPOINTS ---
app.post('/otp/send', (req, res) => {
  const { to } = req.body;
  console.log(`📱 OTP requested for: ${to}`);
  // TODO: Integrate with Twilio or other OTP service
  res.json({ ok: true, message: "OTP sent successfully" });
});

app.post('/otp/verify', (req, res) => {
  const { to, code } = req.body;
  console.log(`🔐 OTP verification for: ${to}, code: ${code}`);
  // TODO: Verify OTP with Twilio or other service
  // For demo purposes, accept any 6-digit code
  if (code && code.length === 6) {
    res.json({ ok: true, message: "OTP verified successfully" });
  } else {
    res.json({ ok: false, error: "Invalid OTP" });
  }
});

// --- FUNDING ENDPOINT ---
app.post('/fund', async (req, res) => {
  const { to, amount } = req.body;
  console.log(`💰 Funding request: ${amount} ETH to ${to}`);
  // TODO: Implement actual funding logic
  res.json({ 
    ok: true, 
    tx: "0x" + Math.random().toString(16).substr(2, 64), // Mock transaction hash
    message: "Funding successful" 
  });
});

// --- SERVE THE MAIN PAGE ---
app.get('/', (req, res) => {
    // Send the user to the login page by default
    res.sendFile(path.join(__dirname, 'html', 'login.html'));
});


// --- SERVER START ---
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});