// auth.js
// Handles registration, login and OTP verification with smooth toast notifications

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

// Registration form
const registerForm = document.getElementById("registerForm");
if (registerForm) {
    registerForm.addEventListener("submit", (e) => {
        e.preventDefault();
        showToast("Registered successfully! Redirecting to login...", "success");
        setTimeout(() => {
            window.location.href = "login.html";
        }, 1500);
    });
}

// Real OTP integration via backend (Twilio Verify). Configure OTP_API_BASE in .env or use default.
const OTP_API_BASE = (window.OTP_API_BASE || "http://localhost:4000").replace(/\/$/, "");

async function requestOtp(aadhaarOrMobile) {
    const to = aadhaarOrMobile.startsWith("+") ? aadhaarOrMobile : `+91${aadhaarOrMobile}`;
    const res = await fetch(`${OTP_API_BASE}/otp/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to })
    });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "Failed to send OTP");
    sessionStorage.setItem("otpVerified", "false");
}

async function verifyOtpRemote(aadhaarOrMobile, inputOtp) {
    const to = aadhaarOrMobile.startsWith("+") ? aadhaarOrMobile : `+91${aadhaarOrMobile}`;
    const res = await fetch(`${OTP_API_BASE}/otp/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to, code: inputOtp })
    });
    const data = await res.json();
    if (!data.ok) return false;
    sessionStorage.setItem("otpVerified", "true");
    return true;
}

// Login with OTP flow
const loginForm = document.getElementById("loginForm");
if (loginForm) {
    const sendBtn = document.getElementById("sendOtpBtn");
    const verifyBtn = document.getElementById("verifyOtpBtn");
    const otpInput = document.getElementById("otpInput");
    const idInput = document.getElementById("aadhaarOrMobile");

    if (sendBtn && idInput) {
        sendBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const idVal = idInput.value.trim();
            if (!idVal) {
                showToast("Enter Aadhaar or Mobile first", "error");
                return;
            }
            try {
                await requestOtp(idVal);
                showToast("OTP sent. Check your registered mobile.", "success");
            } catch (err) {
                showToast("Failed to send OTP", "error");
            }
        });
    }

    if (verifyBtn && otpInput) {
        verifyBtn.addEventListener("click", async (e) => {
            e.preventDefault();
            const idVal = idInput.value.trim();
            const ok = await verifyOtpRemote(idVal, otpInput.value.trim());
            if (ok) {
                showToast("OTP verified ✅", "success");
                setTimeout(() => {
                    const roleSel = document.getElementById("role");
                    const role = roleSel ? roleSel.value : "user";
                    if (role === "admin") {
                        window.location.href = "admin.html";
                    } else {
                        window.location.href = "dashboard.html";
                    }
                }, 800);
            } else {
                showToast("Invalid OTP", "error");
            }
        });
    }
}
