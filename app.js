// app.js

// --- DOM Element References ---
const splashScreen = document.getElementById('splashScreen');
const loadingBar = document.getElementById('loadingBar');
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
const userStatusSection = document.getElementById('userStatusSection'); 

// Payment Slide Elements
const openPaymentSlideButton = document.getElementById('openPaymentSlide');
const closePaymentSlideButton = document.getElementById('closePaymentSlide');
const paymentSlide = document.getElementById('paymentSlide');

// Social Media Slide Elements
const openSosmedSlideButton = document.getElementById('openSosmedSlide');
const closeSosmedSlideButton = document.getElementById('closeSosmedSlide');
const socialMediaSlide = document.getElementById('socialMediaSlide');

// Other global elements
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const particlesContainer = document.getElementById('particles');
const gatewayAudio = document.getElementById('gatewayAudio');

// --- Global Variables ---
let isLoginMode = true; // State for login/register form
// Load registered users from localStorage, or initialize with 'annas'
const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers')) || {}; 

// Ensure 'annas' user exists with specific ID, or update if password changed
if (!registeredUsers['annas'] || registeredUsers['annas'].password !== '1' || registeredUsers['annas'].id !== 12345678) {
    registeredUsers['annas'] = { password: '1', id: 12345678 };
    localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));
}

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
    if (myStatusIndicator) {
        myStatusIndicator.classList.remove('online', 'offline', 'idle');
        myStatusIndicator.classList.add(status);
    }
}

/**
 * Simulates and updates other users' online/offline status and ID.
 */
function updateOtherUsersStatus() {
    const statuses = ['Online', 'Offline', 'Online', 'Online', 'Offline', 'Offline', 'Online'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    let otherId;
    do {
        otherId = generateUniqueId(); 
    } while (otherId === currentUserId); // Make sure it's not the same as logged-in user's ID

    if (otherUsersStatus) {
        otherUsersStatus.textContent = `${randomStatus} (ID: ${otherId})`;
    }
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

    const toastTitle = toast.querySelector('.toast-title');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');

    if (toastTitle) toastTitle.textContent = title;
    if (toastMessage) toastMessage.textContent = message;
    
    if (toastIcon) {
        toastIcon.className = 'toast-icon'; // Reset class
        if (iconClass) {
            toastIcon.classList.add(iconClass); // Add the new icon class
        }
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
    if (particlesContainer) {
        particlesContainer.innerHTML = ''; 
    } else {
        console.warn("Particles container not found! Cannot create particles.");
        return;
    }

    const numParticles = 50; 

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        const x = Math.random() * 100; 
        const y = Math.random() * 100; 
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;

        const size = Math.random() * 5 + 3; 
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        const animationDelay = Math.random() * 6; 
        particle.style.animationDelay = `${animationDelay}s`;
        
        const animationDuration = Math.random() * 10 + 6; 
        particle.style.setProperty('--animation-duration', `${animationDuration}s`); 
        particle.style.setProperty('--particle-opacity', `${Math.random() * 0.4 + 0.6}`); 

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
        body.setAttribute('data-theme', 'dark'); 
    }
    
    createParticles(); // Create dynamic particles

    // Simulate loading bar progress
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        if (loadingBar) loadingBar.style.width = `${progress}%`;
        if (progress >= 100) {
            clearInterval(interval);
            // After loading bar is full, start splash screen fade out
            setTimeout(() => {
                if (splashScreen) {
                    splashScreen.classList.add('hidden'); // Start fade-out animation
                }
                setTimeout(() => {
                    if (splashScreen) {
                        splashScreen.style.display = 'none'; // Hide completely after fade-out
                    }
                    if (loginRegisterContainer) {
                        loginRegisterContainer.classList.add('active'); // Show login/register form
                    }
                }, 1000); // Wait for fade-out animation to complete (matching CSS transition)
            }, 500); // Small delay after loading bar fills up
        }
    }, 100); // Update loading bar every 100ms for 1 second total

    // Start updating other users' status periodically
    setInterval(updateOtherUsersStatus, 5000); 
});


// 2. Login/Register Form Logic
if (toggleAuthMode) {
    toggleAuthMode.addEventListener('click', () => {
        isLoginMode = !isLoginMode;
        if (formTitle) formTitle.textContent = isLoginMode ? 'Login' : 'Daftar Akun Baru';
        if (authButton) authButton.textContent = isLoginMode ? 'Login' : 'Daftar';
        if (toggleAuthMode) toggleAuthMode.textContent = isLoginMode ? 'Belum punya akun? Buat akun baru' : 'Sudah punya akun? Login';
        if (passwordInput) passwordInput.setAttribute('autocomplete', isLoginMode ? 'current-password' : 'new-password');
        
        if (usernameInput) usernameInput.value = '';
        if (passwordInput) passwordInput.value = '';
    });
}

if (authButton) {
    authButton.addEventListener('click', () => {
        const username = usernameInput ? usernameInput.value.trim() : '';
        const password = passwordInput ? passwordInput.value.trim() : '';

        if (username === "" || password === "") {
            showToast('Peringatan', 'Username dan password tidak boleh kosong!', 'warning');
            return;
        }

        if (isLoginMode) {
            // --- Simulate Login ---
            if (registeredUsers[username] && registeredUsers[username].password === password) {
                showToast('Berhasil!', 'Login berhasil!', 'success');
                currentUserId = registeredUsers[username].id;
                
                if (myUserIdElement) myUserIdElement.textContent = currentUserId; 
                if (userStatusSection) {
                    userStatusSection.style.display = 'flex'; // Ensure display is flex for animation
                    // Use a timeout to allow display change to register before opacity transition
                    setTimeout(() => {
                        userStatusSection.classList.add('visible'); // Add class for fade-in
                    }, 50); 
                }
                
                if (loginRegisterContainer) loginRegisterContainer.classList.remove('active'); 
                if (mainContent) mainContent.style.display = 'block'; 
                setMyStatus('online'); 
                if (gatewayAudio) gatewayAudio.play().catch(e => console.error("Audio play failed:", e)); 
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
                localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers)); 
                showToast('Berhasil!', 'Akun berhasil dibuat! Silakan login.', 'success');
                
                // Reset form to login mode
                if (usernameInput) usernameInput.value = '';
                if (passwordInput) passwordInput.value = '';
                isLoginMode = true; 
                if (formTitle) formTitle.textContent = 'Login';
                if (authButton) authButton.textContent = 'Login';
                if (toggleAuthMode) toggleAuthMode.textContent = 'Belum punya akun? Buat akun baru';
                if (passwordInput) passwordInput.setAttribute('autocomplete', 'current-password');
            }
        }
    });
}


// 3. Payment Slide Logic
if (openPaymentSlideButton) {
    openPaymentSlideButton.addEventListener('click', () => {
        if (paymentSlide) paymentSlide.classList.add('active');
        if (body) body.classList.add('payment-slide-active'); 
    });
}

if (closePaymentSlideButton) {
    closePaymentSlideButton.addEventListener('click', () => {
        if (paymentSlide) paymentSlide.classList.remove('active');
        if (body) body.classList.remove('payment-slide-active');
    });
}

// 4. Social Media Slide Logic
if (openSosmedSlideButton) {
    openSosmedSlideButton.addEventListener('click', () => {
        if (socialMediaSlide) socialMediaSlide.classList.add('active');
        if (body) body.classList.add('payment-slide-active'); 
    });
}

if (closeSosmedSlideButton) {
    closeSosmedSlideButton.addEventListener('click', () => {
        if (socialMediaSlide) socialMediaSlide.classList.remove('active');
        if (body) body.classList.remove('payment-slide-active');
    });
}


// 5. Theme Toggle Logic
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        if (body) body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); 
        createParticles(); 
    });
}

// 6. Copy Button Logic for payment methods
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
        const textToCopy = button.dataset.copy;
        if (textToCopy) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                showToast('Berhasil', 'Nomor berhasil disalin!', 'success');
            }).catch(err => {
                showToast('Gagal', 'Gagal menyalin nomor!', 'error');
                console.error('Gagal menyalin:', err);
            });
        } else {
            showToast('Error', 'Tidak ada teks untuk disalin!', 'error');
        }
    });
});

// 7. Status Toggle Logic (Dana, GoPay, OVO)
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
            if (statusText) statusText.textContent = 'Not Ready';
            if (statusIndicator) {
                statusIndicator.classList.remove('ready');
                statusIndicator.classList.add('not-ready');
            }
            if (copyButton) copyButton.disabled = true;
            showToast('Status Diperbarui', 'Metode pembayaran menjadi Tidak Siap.', 'warning');
        } else {
            paymentCard.dataset.status = 'ready';
            if (statusText) statusText.textContent = 'Ready';
            if (statusIndicator) {
                statusIndicator.classList.remove('not-ready');
                statusIndicator.classList.add('ready');
            }
            if (copyButton) copyButton.disabled = false;
            showToast('Status Diperbarui', 'Metode pembayaran menjadi Siap.', 'success');
        }
    });
});

// 8. Download QRIS Logic (placeholder)
const downloadQrisButton = document.getElementById('downloadQris');
if (downloadQrisButton) {
    downloadQrisButton.addEventListener('click', () => {
        showToast('Informasi', 'Fungsi unduh QRIS belum diimplementasikan.', 'info');
    });
}