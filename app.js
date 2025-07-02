// app.js

// --- DOM Element References ---
const splashScreen = document.getElementById('splashScreen');
const loginRegisterContainer = document.getElementById('loginRegisterContainer');
const mainContent = document.querySelector('main.container');
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const authButton = document.getElementById('authButton');
const toggleAuthMode = document.getElementById('toggleAuthMode');
const formTitle = document.getElementById('formTitle');
const myUserIdElement = document.getElementById('myUserId');
const myStatusIndicator = document.getElementById('myStatusIndicator');
const otherUsersStatus = document.getElementById('otherUsersStatus');
const userStatusSection = document.getElementById('userStatusSection'); // Reference to the status section

// Payment Slide & Theme Toggle Elements
const openPaymentSlideButton = document.getElementById('openPaymentSlide');
const closePaymentSlideButton = document.getElementById('closePaymentSlide');
const paymentSlide = document.getElementById('paymentSlide');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const particlesContainer = document.getElementById('particles');
const gatewayAudio = document.getElementById('gatewayAudio');

// --- Global Variables ---
let isLoginMode = true; // State for login/register form
// Load registered users from localStorage, or initialize as empty object
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {}; 
let currentUserId = null; // To store logged-in user's ID


// --- Helper Functions ---

/**
 * Generates a unique 8-digit user ID.
 * Ensures the ID is unique among currently registered users.
 * @returns {number}
 */
function generateUniqueId() {
    let id;
    const existingIds = Object.values(registeredUsers).map(user => user.id);
    do {
        id = Math.floor(10000000 + Math.random() * 90000000);
    } while (existingIds.includes(id));
    return id;
}

/**
 * Sets the current user's online/offline/idle status.
 * @param {string} status - 'online', 'offline', or 'idle'
 */
function setMyStatus(status) {
    myStatusIndicator.classList.remove('online', 'offline', 'idle');
    myStatusIndicator.classList.add(status);
}

/**
 * Simulates and updates other users' online/offline status and ID.
 */
function updateOtherUsersStatus() {
    const statuses = ['Online', 'Offline', 'Online', 'Online', 'Offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    // Ensure simulated other user ID is different from current user ID and always unique for display
    let otherId;
    do {
        otherId = generateUniqueId(); // Using general ID generation for simulation
    } while (otherId === currentUserId);

    otherUsersStatus.textContent = `${randomStatus} (ID: ${otherId})`;
}

/**
 * Displays a toast notification.
 * @param {string} title - The title of the toast.
 * @param {string} message - The message content.
 * @param {string} iconClass - Class for the toast icon ('success', 'warning', 'error', 'info').
 */
function showToast(title, message, iconClass = 'info') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-message').textContent = message;
    
    const toastIcon = toast.querySelector('.toast-icon');
    toastIcon.className = 'toast-icon'; // Reset class
    if (iconClass) {
        toastIcon.classList.add(iconClass); // Add the new icon class
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Hide after 3 seconds
}

/**
 * Creates dynamic particles in the background.
 */
function createParticles() {
    // Clear existing particles if any to prevent accumulation on theme change
    if (particlesContainer) {
        particlesContainer.innerHTML = ''; 
    } else {
        console.warn("Particles container not found!");
        return;
    }

    const numParticles = 50; 

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Random position
        const x = Math.random() * 100; // % of viewport width
        const y = Math.random() * 100; // % of viewport height
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;

        // Random size
        const size = Math.random() * 5 + 3; // Size between 3px and 8px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Random animation delay for staggered effect
        const animationDelay = Math.random() * 6; // Delay up to 6 seconds
        particle.style.animationDelay = `${animationDelay}s`;
        
        // Random animation duration for varying speeds
        const animationDuration = Math.random() * 10 + 6; // Duration between 6s and 16s
        particle.style.setProperty('--animation-duration', `${animationDuration}s`); // Set CSS variable
        particle.style.setProperty('--particle-opacity', `${Math.random() * 0.4 + 0.6}`); // Set CSS variable for varying opacity

        particlesContainer.appendChild(particle);
    }
}


// --- Event Listeners and Main Logic ---

// 1. Initial Page Load & Splash Screen Logic
window.addEventListener('load', () => {
    // Initialize theme from localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
    } else {
        // Default to dark mode if no theme saved
        body.setAttribute('data-theme', 'dark');
    }
    
    createParticles(); // Create dynamic particles

    // Simulate splash screen animation and then show login/register form
    setTimeout(() => {
        splashScreen.classList.add('hidden'); // Start fade-out animation
        setTimeout(() => {
            splashScreen.style.display = 'none'; // Hide completely after fade-out
            loginRegisterContainer.classList.add('active'); // Show login/register form
        }, 1000); // Wait for fade-out animation to complete (matching CSS transition)
    }, 2000); // Display splash screen for 2 seconds

    // Start updating other users' status periodically
    setInterval(updateOtherUsersStatus, 5000); // Update every 5 seconds
    // No initial update for myUserId; it's set only after login
});


// 2. Login/Register Form Logic
toggleAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        formTitle.textContent = 'Login';
        authButton.textContent = 'Login';
        toggleAuthMode.textContent = 'Belum punya akun? Buat akun baru';
        passwordInput.setAttribute('autocomplete', 'current-password');
    } else {
        formTitle.textContent = 'Daftar Akun Baru';
        authButton.textContent = 'Daftar';
        toggleAuthMode.textContent = 'Sudah punya akun? Login';
        passwordInput.setAttribute('autocomplete', 'new-password');
    }
    // Clear inputs when switching modes
    usernameInput.value = '';
    passwordInput.value = '';
});

authButton.addEventListener('click', () => {
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (username === "" || password === "") {
        showToast('Peringatan', 'Username dan password tidak boleh kosong!', 'warning');
        return;
    }

    if (isLoginMode) {
        // --- Simulate Login ---
        if (registeredUsers[username] && registeredUsers[username].password === password) {
            showToast('Berhasil!', 'Login berhasil!', 'success');
            currentUserId = registeredUsers[username].id;
            myUserIdElement.textContent = currentUserId; // Display user's own ID
            userStatusSection.style.display = 'flex'; // Show user status section

            loginRegisterContainer.classList.remove('active'); // Hide login form
            mainContent.style.display = 'block'; // Show main content
            setMyStatus('online'); // Set user status to online
            if (gatewayAudio) gatewayAudio.play().catch(e => console.error("Audio play failed:", e)); // Play audio on success
        } else {
            showToast('Gagal', 'Username atau password salah!', 'error');
        }
    } else {
        // --- Simulate Registration ---
        if (registeredUsers[username]) {
            showToast('Gagal', 'Username sudah terdaftar. Gunakan nama lain.', 'error');
        } else {
            const newUserId = generateUniqueId();
            registeredUsers[username] = { password: password, id: newUserId };
            localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); // Save to localStorage
            showToast('Berhasil!', 'Akun berhasil dibuat! Silakan login.', 'success');
            usernameInput.value = '';
            passwordInput.value = '';
            isLoginMode = true; // Switch back to login mode after registration
            formTitle.textContent = 'Login';
            authButton.textContent = 'Login';
            toggleAuthMode.textContent = 'Belum punya akun? Buat akun baru';
            passwordInput.setAttribute('autocomplete', 'current-password');
        }
    }
});


// 3. Payment Slide Logic
if (openPaymentSlideButton) {
    openPaymentSlideButton.addEventListener('click', () => {
        paymentSlide.classList.add('active');
        body.classList.add('payment-slide-active'); // Add class to prevent body scroll
    });
}

if (closePaymentSlideButton) {
    closePaymentSlideButton.addEventListener('click', () => {
        paymentSlide.classList.remove('active');
        body.classList.remove('payment-slide-active');
    });
}

// 4. Theme Toggle Logic
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Save theme preference
        // Re-create particles to adapt to new theme colors if needed (CSS handles color, but re-init ensures fresh positions/styles)
        createParticles(); 
    });
}

// 5. Copy Button Logic
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
        const textToCopy = button.dataset.copy;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Berhasil', 'Nomor berhasil disalin!', 'success');
        }).catch(err => {
            showToast('Gagal', 'Gagal menyalin nomor!', 'error');
            console.error('Gagal menyalin:', err);
        });
    });
});

// 6. Status Toggle Logic (Dana, GoPay, OVO)
document.querySelectorAll('.status-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const paymentCard = button.closest('.payment-card');
        if (!paymentCard) return;

        const currentStatus = paymentCard.dataset.status;
        const copyButton = paymentCard.querySelector('.copy-button');
        const statusText = button.querySelector('.status-text');
        const statusIndicator = button.querySelector('.status-indicator');

        if (currentStatus === 'ready') {
            paymentCard.dataset.status = 'not-ready';
            statusText.textContent = 'Not Ready';
            statusIndicator.classList.remove('ready');
            statusIndicator.classList.add('not-ready');
            if (copyButton) copyButton.disabled = true;
            showToast('Status Diperbarui', 'Metode pembayaran menjadi Tidak Siap.', 'warning');
        } else {
            paymentCard.dataset.status = 'ready';
            statusText.textContent = 'Ready';
            statusIndicator.classList.remove('not-ready');
            statusIndicator.classList.add('ready');
            if (copyButton) copyButton.disabled = false;
            showToast('Status Diperbarui', 'Metode pembayaran menjadi Siap.', 'success');
        }
    });
});

// 7. Download QRIS Logic (placeholder)
const downloadQrisButton = document.getElementById('downloadQris');
if (downloadQrisButton) {
    downloadQrisButton.addEventListener('click', () => {
        showToast('Informasi', 'Fungsi unduh QRIS belum diimplementasikan.', 'info');
    });
}