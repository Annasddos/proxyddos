// app.js

// Dapatkan referensi elemen-elemen DOM
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

// Elemen untuk Payment Slide dan Theme Toggle
const openPaymentSlideButton = document.getElementById('openPaymentSlide');
const closePaymentSlideButton = document.getElementById('closePaymentSlide');
const paymentSlide = document.getElementById('paymentSlide');
const themeToggle = document.querySelector('.theme-toggle');
const body = document.body;
const particlesContainer = document.getElementById('particles');

let isLoginMode = true; // State untuk mode login/register

// --- Fungsi-fungsi Pembantu ---

// Fungsi untuk menghasilkan ID pengguna unik
function generateUniqueId() {
    return Math.floor(10000000 + Math.random() * 90000000); // Nomor acak 8 digit
}

// Fungsi untuk mengatur status pengguna
function setMyStatus(status) {
    myStatusIndicator.classList.remove('online', 'offline', 'idle');
    if (status === 'online') {
        myStatusIndicator.classList.add('online');
    } else if (status === 'offline') {
        myStatusIndicator.classList.add('offline');
    } else { // default to idle
        myStatusIndicator.classList.add('idle');
    }
}

// Fungsi untuk mensimulasikan status pengguna lain
function updateOtherUsersStatus() {
    const statuses = ['Online', 'Offline', 'Online', 'Online', 'Offline'];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    const randomId = generateUniqueId(); // ID berbeda untuk pengguna lain
    otherUsersStatus.textContent = `${randomStatus} (ID: ${randomId})`;
}

// Fungsi untuk menampilkan toast notifikasi
function showToast(title, message, iconClass = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;

    toast.querySelector('.toast-title').textContent = title;
    toast.querySelector('.toast-message').textContent = message;
    
    const toastIcon = toast.querySelector('.toast-icon');
    toastIcon.className = 'toast-icon'; // Reset class
    if (iconClass) {
        toastIcon.classList.add(iconClass);
    }
    
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000); // Sembunyikan setelah 3 detik
}

// Fungsi untuk menciptakan partikel-partikel
function createParticles() {
    const numParticles = 50; // Jumlah partikel yang diinginkan

    for (let i = 0; i < numParticles; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        
        // Posisi acak
        const x = Math.random() * 100; // % dari lebar
        const y = Math.random() * 100; // % dari tinggi
        particle.style.left = `${x}vw`;
        particle.style.top = `${y}vh`;

        // Ukuran acak
        const size = Math.random() * 5 + 3; // Ukuran antara 3px dan 8px
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;

        // Delay animasi acak agar tidak semua bergerak bersamaan
        const animationDelay = Math.random() * 6; // Delay hingga 6 detik
        particle.style.animationDelay = `${animationDelay}s`;
        
        // Durasi animasi acak
        const animationDuration = Math.random() * 10 + 6; // Durasi antara 6s dan 16s
        particle.style.animationDuration = `${animationDuration}s`;

        particlesContainer.appendChild(particle);
    }
}


// --- Event Listeners dan Logika Aplikasi ---

// 1. Logika Splash Screen dan Inisialisasi Awal
window.addEventListener('load', () => {
    // Set ID pengguna saya saat halaman dimuat
    const myGeneratedId = generateUniqueId();
    myUserIdElement.textContent = myGeneratedId;
    setMyStatus('idle'); // Status awal: idle

    // Inisialisasi tema dari localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        body.setAttribute('data-theme', savedTheme);
    } else {
        // Default ke dark mode jika belum ada di localStorage (sesuai HTML awal)
        body.setAttribute('data-theme', 'dark');
    }
    
    createParticles(); // Panggil fungsi untuk membuat partikel

    setTimeout(() => {
        splashScreen.classList.add('hidden'); // Mulai animasi fade-out
        setTimeout(() => {
            splashScreen.style.display = 'none'; // Sembunyikan setelah fade-out selesai
            loginRegisterContainer.classList.add('active'); // Tampilkan form login/register
        }, 1000); // Tunggu animasi fade-out selesai (sesuai transisi CSS)
    }, 2000); // Tampilkan splash screen selama 2 detik
    
    // Mulai pembaruan status pengguna lain
    setInterval(updateOtherUsersStatus, 5000); // Perbarui setiap 5 detik
    updateOtherUsersStatus(); // Pembaruan pertama kali
});

// 2. Logika Login/Registrasi
toggleAuthMode.addEventListener('click', () => {
    isLoginMode = !isLoginMode;
    if (isLoginMode) {
        formTitle.textContent = 'Login';
        authButton.textContent = 'Login';
        toggleAuthMode.textContent = 'Belum punya akun? Buat akun baru';
    } else {
        formTitle.textContent = 'Daftar Akun Baru';
        authButton.textContent = 'Daftar';
        toggleAuthMode.textContent = 'Sudah punya akun? Login';
    }
    // Kosongkan input saat beralih mode
    usernameInput.value = '';
    passwordInput.value = '';
});

authButton.addEventListener('click', () => {
    const username = usernameInput.value;
    const password = passwordInput.value;

    if (username === "" || password === "") {
        showToast('Peringatan', 'Username dan password tidak boleh kosong!', 'warning');
        return;
    }

    if (isLoginMode) {
        // Simulasi login: Anda akan mengirim data ini ke server sungguhan
        if (username === "user" && password === "pass") { // Contoh kredensial
            showToast('Berhasil!', 'Login berhasil!', 'success');
            loginRegisterContainer.classList.remove('active'); // Sembunyikan form login
            mainContent.style.display = 'block'; // Tampilkan konten utama
            setMyStatus('online'); // Set status ke online setelah login
        } else {
            showToast('Gagal', 'Username atau password salah!', 'error');
        }
    } else {
        // Simulasi registrasi: Anda akan mengirim data ini ke server sungguhan
        showToast('Berhasil!', 'Akun berhasil dibuat! Silakan login.', 'success');
        usernameInput.value = '';
        passwordInput.value = '';
        isLoginMode = true; // Beralih kembali ke mode login setelah registrasi
        formTitle.textContent = 'Login';
        authButton.textContent = 'Login';
        toggleAuthMode.textContent = 'Belum punya akun? Buat akun baru';
    }
});


// 3. Logika untuk Payment Slide
if (openPaymentSlideButton) {
    openPaymentSlideButton.addEventListener('click', () => {
        paymentSlide.classList.add('active');
        body.classList.add('payment-slide-active'); // Class untuk mencegah scroll body
    });
}

if (closePaymentSlideButton) {
    closePaymentSlideButton.addEventListener('click', () => {
        paymentSlide.classList.remove('active');
        body.classList.remove('payment-slide-active');
    });
}

// 4. Logika Theme Toggle
if (themeToggle) {
    themeToggle.addEventListener('click', () => {
        const currentTheme = body.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        body.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme); // Simpan preferensi
    });
}

// 5. Logika Copy Button
document.querySelectorAll('.copy-button').forEach(button => {
    button.addEventListener('click', () => {
        const textToCopy = button.dataset.copy;
        navigator.clipboard.writeText(textToCopy).then(() => {
            showToast('Berhasil', 'Nomor berhasil disalin!', 'success');
        }).catch(err => {
            showToast('Gagal', 'Gagal menyalin nomor!', 'error');
            console.error('Gagal menyalin: ', err);
        });
    });
});

// 6. Logika Status Toggle (Dana, GoPay, OVO)
document.querySelectorAll('.status-toggle').forEach(button => {
    button.addEventListener('click', () => {
        const paymentCard = button.closest('.payment-card');
        if (!paymentCard) return; // Pastikan elemen ditemukan

        const currentStatus = paymentCard.dataset.status;
        const copyButton = paymentCard.querySelector('.copy-button');
        const statusText = button.querySelector('.status-text');
        const statusIndicator = button.querySelector('.status-indicator');

        if (currentStatus === 'ready') {
            paymentCard.dataset.status = 'not-ready';
            statusText.textContent = 'Not Ready';
            statusIndicator.classList.remove('ready');
            statusIndicator.classList.add('not-ready');
            if (copyButton) copyButton.disabled = true; // Nonaktifkan tombol copy
            showToast('Status Diperbarui', 'Metode pembayaran menjadi Tidak Siap.', 'warning');
        } else {
            paymentCard.dataset.status = 'ready';
            statusText.textContent = 'Ready';
            statusIndicator.classList.remove('not-ready');
            statusIndicator.classList.add('ready');
            if (copyButton) copyButton.disabled = true; // Aktifkan tombol copy
            showToast('Status Diperbarui', 'Metode pembayaran menjadi Siap.', 'success');
        }
    });
});

// 7. Logika Download QRIS (opsional, perlu implementasi backend atau JS library jika QR dinamis)
const downloadQrisButton = document.getElementById('downloadQris');
if (downloadQrisButton) {
    downloadQrisButton.addEventListener('click', () => {
        // Dalam aplikasi nyata, Anda akan memicu unduhan gambar QR di sini
        // Untuk contoh ini, kita hanya akan memberikan alert
        showToast('Informasi', 'Fungsi unduh QRIS belum diimplementasikan.', 'info');
        // Atau jika Anda ingin mengunduh gambar statis:
        // const imageUrl = document.querySelector('.qr-image').src;
        // const link = document.createElement('a');
        // link.href = imageUrl;
        // link.download = 'QRIS_Code.jpg';
        // document.body.appendChild(link);
        // link.click();
        // document.body.removeChild(link);
    });
}

// 8. Logika untuk audio (jika ada trigger spesifik)
const gatewayAudio = document.getElementById('gatewayAudio');
// Contoh: putar audio saat login berhasil
// if (gatewayAudio && login berhasil) {
//     gatewayAudio.play();
// }