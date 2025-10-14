<<<<<<< HEAD
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
=======
// server.js
// Minimal OTP backend using Twilio Verify
// Endpoints:
//   POST /otp/send   { to: "+91XXXXXXXXXX" }
//   POST /otp/verify { to: "+91XXXXXXXXXX", code: "123456" }

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { ethers } from 'ethers';

const app = express();
app.use(cors());
app.use(express.json());

// Twilio client (Verify v2)
// Requires: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID
let twilioClient = null;
try {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
  if (TWILIO_ACCOUNT_SID && TWILIO_AUTH_TOKEN) {
    const twilio = (await import('twilio')).default;
    twilioClient = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
} catch (e) {
  // defer error until endpoint usage
}

function assertEnv() {
  const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID } = process.env;
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_VERIFY_SID) {
    throw new Error('Missing Twilio env: TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFY_SID');
  }
  if (!twilioClient) {
    throw new Error('Twilio client not initialized');
  }
}

app.post('/otp/send', async (req, res) => {
  try {
    assertEnv();
    const { to } = req.body || {};
    if (!to) return res.status(400).json({ ok: false, error: 'Missing to' });
    const verification = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verifications.create({ to, channel: 'sms' });
    return res.json({ ok: true, status: verification.status });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

app.post('/otp/verify', async (req, res) => {
  try {
    assertEnv();
    const { to, code } = req.body || {};
    if (!to || !code) return res.status(400).json({ ok: false, error: 'Missing to or code' });
    const check = await twilioClient.verify.v2
      .services(process.env.TWILIO_VERIFY_SID)
      .verificationChecks.create({ to, code });
    const valid = check.status === 'approved';
    return res.json({ ok: valid, status: check.status });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

// Admin-funded wallet endpoint: POST /fund { to, amount }
app.post('/fund', async (req, res) => {
  try {
    const { to, amount } = req.body || {};
    if (!to || !amount) return res.status(400).json({ ok: false, error: 'Missing to or amount' });
    const rpcUrl = process.env.RPC_URL;
    const adminPk = process.env.ADMIN_PRIVATE_KEY;
    if (!rpcUrl || !adminPk) return res.status(500).json({ ok: false, error: 'Server not configured' });
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const admin = new ethers.Wallet(adminPk, provider);
    const tx = await admin.sendTransaction({ to, value: ethers.parseEther(String(amount)) });
    return res.json({ ok: true, tx: tx.hash });
  } catch (e) {
    return res.status(500).json({ ok: false, error: e.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`OTP server listening on http://localhost:${PORT}`);
});


>>>>>>> 04b8ef9195580d9cc9cc43badc772ebc02bb6cc5
