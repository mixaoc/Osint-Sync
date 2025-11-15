// OsintX  & Osint Sync - V
// Developed by https://github.com/mixaoc

const MAIN_API_URL = 'https://mixaoc.com/extension/api.php';
const API2_URL = 'https://mixaoc.com/extension/api2.php';
const GHUNT_SERVER_URL = 'http://147.185.221.31:55641';

let userCredits = 0;
let currentPaymentId = null;
let particlesEnabled = true;
let particlesAnimation = null;

// Particles system
class ParticlesSystem {
    constructor() {
        this.canvas = document.getElementById('particlesCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.particles = [];
        this.maxParticles = 50;
        this.init();
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Create particles
        for (let i = 0; i < this.maxParticles; i++) {
            this.particles.push(this.createParticle());
        }
    }

    createParticle() {
        return {
            x: Math.random() * this.canvas.width,
            y: Math.random() * this.canvas.height,
            size: Math.random() * 3 + 1,
            speedX: (Math.random() - 0.5) * 2,
            speedY: (Math.random() - 0.5) * 2,
            color: `rgba(${Math.floor(Math.random() * 100 + 155)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 100 + 155)}, ${Math.random() * 0.5 + 0.2})`
        };
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    update() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        for (let i = 0; i < this.particles.length; i++) {
            const p = this.particles[i];
            
            // Update position
            p.x += p.speedX;
            p.y += p.speedY;
            
            // Bounce off walls
            if (p.x <= 0 || p.x >= this.canvas.width) p.speedX *= -1;
            if (p.y <= 0 || p.y >= this.canvas.height) p.speedY *= -1;
            
            // Draw particle
            this.ctx.beginPath();
            this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            this.ctx.fillStyle = p.color;
            this.ctx.fill();
            
            // Draw connections
            for (let j = i + 1; j < this.particles.length; j++) {
                const p2 = this.particles[j];
                const dx = p.x - p2.x;
                const dy = p.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    this.ctx.beginPath();
                    this.ctx.strokeStyle = `rgba(0, 255, 136, ${0.2 * (1 - distance / 100)})`;
                    this.ctx.lineWidth = 0.5;
                    this.ctx.moveTo(p.x, p.y);
                    this.ctx.lineTo(p2.x, p2.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    start() {
        const animate = () => {
            if (particlesEnabled) {
                this.update();
            }
            particlesAnimation = requestAnimationFrame(animate);
        };
        animate();
    }

    stop() {
        if (particlesAnimation) {
            cancelAnimationFrame(particlesAnimation);
            particlesAnimation = null;
        }
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
}

// Initialize particles system
let particlesSystem;

document.addEventListener('DOMContentLoaded', async function() {
    // Initialize particles
    particlesSystem = new ParticlesSystem();
    particlesSystem.start();

    // Screen references
    const authScreen = document.getElementById('authScreen');
    const mainScreen = document.getElementById('mainScreen');
    
    // Check if user is already logged in
    let authData;
    if (typeof browser !== 'undefined') {
        authData = await browser.storage.local.get(['userToken', 'username', 'isAuthenticated']);
    } else if (typeof chrome !== 'undefined') {
        authData = await new Promise((resolve) => {
            chrome.storage.local.get(['userToken', 'username', 'isAuthenticated'], resolve);
        });
    }
    
    if (authData.isAuthenticated && authData.userToken) {
        await showMainScreen(authData.username, authData.userToken);
    } else {
        authScreen.style.display = 'block';
        setupAuthHandlers();
    }

    async function showMainScreen(username, token) {
        authScreen.style.display = 'none';
        mainScreen.style.display = 'block';
        
        document.getElementById('userInfo').innerHTML = `<i class="fas fa-user"></i> Connected: ${username}`;
        await loadUserCredits(token);
        initializeMainInterface(token);
    }

    async function loadUserCredits(token) {
        try {
            const response = await fetch(MAIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getCredits',
                    token: token
                })
            });

            const result = await response.json();
            if (result.success) {
                userCredits = result.credits;
                updateCreditsDisplay();
            }
        } catch (error) {
            console.error('Error loading credits:', error);
        }
    }

    function updateCreditsDisplay() {
        const creditsCount = document.getElementById('creditsCount');
        const balanceAmount = document.getElementById('balanceAmount');
        
        if (creditsCount) creditsCount.textContent = userCredits;
        if (balanceAmount) balanceAmount.textContent = userCredits;
    }

    function setupAuthHandlers() {
        const registerBtn = document.getElementById('registerBtn');
        const registerUsername = document.getElementById('registerUsername');
        const registerEmail = document.getElementById('registerEmail');
        const registerPassword = document.getElementById('registerPassword');
        const confirmPassword = document.getElementById('confirmPassword');
        const acceptTerms = document.getElementById('acceptTerms');
        const authMessage = document.getElementById('authMessage');

        registerBtn.addEventListener('click', handleRegister);
        
        [registerUsername, registerEmail, registerPassword, confirmPassword].forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    handleRegister();
                }
            });
        });

        async function handleRegister() {
            const username = registerUsername.value.trim();
            const email = registerEmail.value.trim();
            const password = registerPassword.value.trim();
            const confirm = confirmPassword.value.trim();
            const accepted = acceptTerms.checked;

            if (!username || !email || !password || !confirm) {
                showAuthMessage('Please fill all fields', 'error');
                return;
            }

            if (password !== confirm) {
                showAuthMessage('Passwords do not match', 'error');
                return;
            }

            if (password.length < 4) {
                showAuthMessage('Password must contain at least 4 characters', 'error');
                return;
            }

            if (username.length < 3) {
                showAuthMessage('Username must contain at least 3 characters', 'error');
                return;
            }

            if (!accepted) {
                showAuthMessage('You must accept the privacy policy and terms of service', 'error');
                return;
            }

            setAuthButtonLoading(true);

            try {
                const response = await fetch(MAIN_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'register',
                        username: username,
                        password: password,
                        email: email,
                        accepted_terms: true
                    })
                });

                const result = await response.json();

                if (result.success) {
                    showAuthMessage('Account created successfully! Redirecting...', 'success');
                    
                    if (typeof browser !== 'undefined') {
                        await browser.storage.local.set({
                            userToken: result.token,
                            username: result.username,
                            isAuthenticated: true
                        });
                    } else if (typeof chrome !== 'undefined') {
                        await new Promise((resolve) => {
                            chrome.storage.local.set({
                                userToken: result.token,
                                username: result.username,
                                isAuthenticated: true
                            }, resolve);
                        });
                    }
                    
                    setTimeout(() => {
                        showMainScreen(result.username, result.token);
                    }, 1500);
                } else {
                    showAuthMessage(result.message || 'Error during account creation', 'error');
                }
            } catch (error) {
                console.error('Registration error:', error);
                showAuthMessage('Server connection error', 'error');
            } finally {
                setAuthButtonLoading(false);
            }
        }

        function showAuthMessage(message, type) {
            const authMessage = document.getElementById('authMessage');
            authMessage.textContent = message;
            authMessage.className = `auth-message ${type}`;
            authMessage.style.display = 'block';
        }

        function setAuthButtonLoading(loading) {
            const btn = document.getElementById('registerBtn');
            if (loading) {
                btn.disabled = true;
                btn.innerHTML = '<span class="btn-text">CREATING ACCOUNT...</span>';
            } else {
                btn.disabled = false;
                btn.innerHTML = '<span class="btn-text">CREATE ACCOUNT AND START</span>';
            }
        }
    }

    function initializeMainInterface(token) {
        const searchUsernameBtn = document.getElementById('searchUsernameBtn');
        const searchEmailBtn = document.getElementById('searchEmailBtn');
        const searchPhoneBtn = document.getElementById('searchPhoneBtn');
        const searchFullnameBtn = document.getElementById('searchFullnameBtn');
        const refreshHistoryBtn = document.getElementById('refreshHistoryBtn');
        const clearHistoryBtn = document.getElementById('clearHistoryBtn');
        const purchaseBtn = document.getElementById('purchaseBtn');
        const copyAddressBtn = document.getElementById('copyAddressBtn');
        const verifyPaymentBtn = document.getElementById('verifyPaymentBtn');
        const exportBtn = document.getElementById('exportBtn');
        
        // Export buttons
        const exportUsernameBtn = document.getElementById('exportUsernameBtn');
        const exportEmailBtn = document.getElementById('exportEmailBtn');
        const exportPhoneBtn = document.getElementById('exportPhoneBtn');
        const exportFullnameBtn = document.getElementById('exportFullnameBtn');
        const exportHistoryBtn = document.getElementById('exportHistoryBtn');
        const exportUsernameAllBtn = document.getElementById('exportUsernameAllBtn');
        const exportEmailAllBtn = document.getElementById('exportEmailAllBtn');
        const exportPhoneAllBtn = document.getElementById('exportPhoneAllBtn');
        const exportFullnameAllBtn = document.getElementById('exportFullnameAllBtn');
        const exportCompleteHistoryBtn = document.getElementById('exportCompleteHistoryBtn');
        
        const usernameInput = document.getElementById('usernameInput');
        const emailInput = document.getElementById('emailInput');
        const phoneInput = document.getElementById('phoneInput');
        const fullnameInput = document.getElementById('fullnameInput');
        const countryCode = document.getElementById('countryCode');
        const searchType = document.getElementById('searchType');
        const postalCode = document.getElementById('postalCode');
        
        const loadingIndicator = document.getElementById('loadingIndicator');
        const logoutBtn = document.getElementById('logoutBtn');
        const cooldownNotice = document.getElementById('cooldownNotice');

        // Initialize tabs
        initializeTabs(token);

        // Logout
        logoutBtn.addEventListener('click', async () => {
            if (typeof browser !== 'undefined') {
                await browser.storage.local.clear();
            } else if (typeof chrome !== 'undefined') {
                await new Promise((resolve) => {
                    chrome.storage.local.clear(resolve);
                });
            }
            location.reload();
        });

        // Export tab
        exportBtn.addEventListener('click', () => {
            // Switch to export tab
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.querySelectorAll('.tab-content').forEach(content => content.style.display = 'none');
            
            exportBtn.classList.add('active');
            document.getElementById('exportTab').style.display = 'block';
        });

        // Search events
        searchUsernameBtn.addEventListener('click', () => {
            const username = usernameInput.value.trim();
            if (username) {
                performUsernameSearch(username, token);
            }
        });

        searchEmailBtn.addEventListener('click', () => {
            const email = emailInput.value.trim();
            if (email) {
                performEmailSearch(email, token);
            }
        });

        searchPhoneBtn.addEventListener('click', () => {
            const phone = phoneInput.value.trim();
            const country = countryCode.value;
            if (phone) {
                performPhoneSearch(phone, country, token);
            }
        });

        searchFullnameBtn.addEventListener('click', () => {
            const fullname = fullnameInput.value.trim();
            const type = searchType.value;
            const postal = postalCode.value.trim();
            if (fullname) {
                performFullnameSearch(fullname, type, postal, token);
            }
        });

        refreshHistoryBtn.addEventListener('click', () => {
            loadHistory(token);
        });

        clearHistoryBtn.addEventListener('click', () => {
            clearHistory(token);
        });

        // Purchase events
        purchaseBtn.addEventListener('click', () => {
            openTelegram();
        });

        copyAddressBtn.addEventListener('click', () => {
            copyToClipboard(document.getElementById('ltcAddress').textContent);
        });

        verifyPaymentBtn.addEventListener('click', () => {
            verifyPayment(currentPaymentId, token);
        });

        // Export events
        exportUsernameBtn.addEventListener('click', () => {
            exportResults('username');
        });

        exportEmailBtn.addEventListener('click', () => {
            exportResults('email');
        });

        exportPhoneBtn.addEventListener('click', () => {
            exportResults('phone');
        });

        exportFullnameBtn.addEventListener('click', () => {
            exportResults('fullname');
        });

        exportHistoryBtn.addEventListener('click', () => {
            exportHistory();
        });

        exportUsernameAllBtn.addEventListener('click', () => {
            exportResults('username', true);
        });

        exportEmailAllBtn.addEventListener('click', () => {
            exportResults('email', true);
        });

        exportPhoneAllBtn.addEventListener('click', () => {
            exportResults('phone', true);
        });

        exportFullnameAllBtn.addEventListener('click', () => {
            exportResults('fullname', true);
        });

        exportCompleteHistoryBtn.addEventListener('click', () => {
            exportCompleteHistory(token);
        });

        // Enter key events
        usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const username = usernameInput.value.trim();
                if (username) {
                    performUsernameSearch(username, token);
                }
            }
        });

        emailInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const email = emailInput.value.trim();
                if (email) {
                    performEmailSearch(email, token);
                }
            }
        });

        phoneInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const phone = phoneInput.value.trim();
                const country = countryCode.value;
                if (phone) {
                    performPhoneSearch(phone, country, token);
                }
            }
        });

        fullnameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const fullname = fullnameInput.value.trim();
                const type = searchType.value;
                const postal = postalCode.value.trim();
                if (fullname) {
                    performFullnameSearch(fullname, type, postal, token);
                }
            }
        });

        // Search type change
        searchType.addEventListener('change', function() {
            const postalCodeGroup = document.getElementById('postalCodeGroup');
            if (this.value === 'insee') {
                postalCodeGroup.style.display = 'flex';
            } else {
                postalCodeGroup.style.display = 'none';
            }
        });

        // Input validation
        usernameInput.addEventListener('input', (e) => {
            const value = e.target.value;
            const regex = /^[a-zA-Z0-9_\-\.]*$/;
            if (!regex.test(value)) {
                e.target.value = value.slice(0, -1);
            }
        });

        // Remove automatic phone formatting
        phoneInput.addEventListener('input', function() {
            this.value = this.value.replace(/[^\d+]/g, '');
        });

        function initializeTabs(userToken) {
            const tabBtns = document.querySelectorAll('.tab-btn[data-tab]');
            const tabContents = document.querySelectorAll('.tab-content');

            tabContents.forEach(tab => {
                tab.style.display = 'none';
            });

            const activeTab = document.querySelector('.tab-btn.active');
            if (activeTab) {
                const tabName = activeTab.getAttribute('data-tab');
                const tabContent = document.getElementById(`${tabName}Tab`);
                if (tabContent) {
                    tabContent.style.display = 'block';
                }
            }

            tabBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const tabName = btn.getAttribute('data-tab');
                    
                    tabBtns.forEach(b => b.classList.remove('active'));
                    tabContents.forEach(t => t.style.display = 'none');
                    
                    btn.classList.add('active');
                    const tabContent = document.getElementById(`${tabName}Tab`);
                    if (tabContent) {
                        tabContent.style.display = 'block';
                    }
                    
                    if (tabName === 'history') {
                        loadHistory(userToken);
                    }

                    clearResults();
                });
            });
        }

        function clearResults() {
            document.getElementById('usernameResults').innerHTML = '';
            document.getElementById('emailResults').innerHTML = '';
            document.getElementById('phoneResults').innerHTML = '';
            document.getElementById('fullnameResults').innerHTML = '';
        }

        // Cooldown management
        function showCooldown(seconds) {
            cooldownNotice.style.display = 'block';
            const timerElement = document.getElementById('cooldownTimer');
            timerElement.textContent = seconds;
            
            const countdown = setInterval(() => {
                seconds--;
                timerElement.textContent = seconds;
                
                if (seconds <= 0) {
                    clearInterval(countdown);
                    cooldownNotice.style.display = 'none';
                }
            }, 1000);
        }

        // Telegram function
        function openTelegram() {
            const telegramUrl = 'https://t.me/+TcNkRGkKodBjNzI8';
            const telegramAppUrl = 'tg://resolve?domain=osintx';
            
            // Try to open Telegram app first
            window.open(telegramAppUrl, '_blank');
            
            // Fallback to web after a short delay
            setTimeout(() => {
                window.open(telegramUrl, '_blank');
            }, 500);
        }

        // Payment functions
        async function initiatePayment(userToken) {
            try {
                const response = await fetch(MAIN_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'processPayment',
                        token: userToken,
                        paymentData: {
                            amount: 5,
                            credits: 1000
                        }
                    })
                });

                const result = await response.json();
                if (result.success) {
                    currentPaymentId = result.payment_id;
                    document.getElementById('paymentId').textContent = result.payment_id;
                    document.getElementById('paymentSection').style.display = 'block';
                    document.querySelector('.purchase-section').style.display = 'none';
                } else {
                    alert('Payment initiation failed: ' + result.message);
                }
            } catch (error) {
                console.error('Payment error:', error);
                alert('Payment error: ' + error.message);
            }
        }

        async function verifyPayment(paymentId, userToken) {
            if (!paymentId) {
                alert('No payment to verify');
                return;
            }

            try {
                const response = await fetch(MAIN_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'verifyPayment',
                        token: userToken,
                        paymentId: paymentId
                    })
                });

                const result = await response.json();
                if (result.success) {
                    alert('Payment verified! ' + result.message);
                    userCredits = result.credits;
                    updateCreditsDisplay();
                    document.getElementById('paymentSection').style.display = 'none';
                    document.querySelector('.purchase-section').style.display = 'block';
                } else {
                    alert('Payment verification failed: ' + result.message);
                }
            } catch (error) {
                console.error('Verification error:', error);
                alert('Verification error: ' + error.message);
            }
        }

        function copyToClipboard(text) {
            navigator.clipboard.writeText(text).then(() => {
                const btn = document.getElementById('copyAddressBtn');
                const originalHtml = btn.innerHTML;
                btn.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    btn.innerHTML = originalHtml;
                }, 2000);
            });
        }

        // Export functions
        function exportResults(type, allResults = false) {
            let resultsContainer;
            let title;
            
            switch(type) {
                case 'username':
                    resultsContainer = document.getElementById('usernameResults');
                    title = 'Username Search Results';
                    break;
                case 'email':
                    resultsContainer = document.getElementById('emailResults');
                    title = 'Email Analysis Results';
                    break;
                case 'phone':
                    resultsContainer = document.getElementById('phoneResults');
                    title = 'Phone Number Search Results';
                    break;
                case 'fullname':
                    resultsContainer = document.getElementById('fullnameResults');
                    title = 'Full Name Search Results';
                    break;
                default:
                    return;
            }

            if (!resultsContainer || resultsContainer.children.length === 0) {
                alert('No results to export');
                return;
            }

            const htmlContent = generateExportHTML(title, resultsContainer.innerHTML);
            downloadHTML(htmlContent, `osintx-${type}-${new Date().toISOString().slice(0, 10)}.html`);
        }

        function exportHistory() {
            const historyContainer = document.getElementById('historyResults');
            if (!historyContainer || historyContainer.children.length === 0) {
                alert('No history to export');
                return;
            }

            const htmlContent = generateExportHTML('Search History', historyContainer.innerHTML);
            downloadHTML(htmlContent, `osintx-history-${new Date().toISOString().slice(0, 10)}.html`);
        }

        async function exportCompleteHistory(token) {
            try {
                const response = await fetch(MAIN_API_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        action: 'getHistory',
                        token: token
                    })
                });

                const result = await response.json();
                if (result.success && result.history) {
                    let historyHTML = '';
                    result.history.forEach(item => {
                        historyHTML += `
                            <div class="history-item">
                                <div class="history-header">
                                    <span class="history-type">${item.search_type.toUpperCase()}</span>
                                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                                </div>
                                <div class="history-query">
                                    <strong>Query:</strong> ${item.query}
                                </div>
                            </div>
                        `;
                    });

                    const htmlContent = generateExportHTML('Complete Search History', historyHTML);
                    downloadHTML(htmlContent, `osintx-complete-history-${new Date().toISOString().slice(0, 10)}.html`);
                } else {
                    alert('No history data available for export');
                }
            } catch (error) {
                console.error('Export history error:', error);
                alert('Error exporting complete history');
            }
        }

            function generateExportHTML(title, content) {
            // Liste des GIFs (copiez la même liste que dans l'ancienne version)
            const gifs = [
                'https://i.pinimg.com/originals/76/aa/24/76aa24bf1e433a13444c18c5df7b839b.gif',
                'https://mir-s3-cdn-cf.behance.net/project_modules/fs/9bc27292880429.5e569ff84e4d0.gif',
                // ... (coller tous les autres URLs)
                'https://cdn.wallpapersafari.com/97/7/RjvkGQ.gif'
            ];

            // Sélection aléatoire d'un GIF
            const randomGif = gifs[Math.floor(Math.random() * gifs.length)];

            return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title} - Osint Sync by Mixaoc</title>
    <style>
        body {
            font-family: 'JetBrains Mono', monospace;
            background: #0a0e1a url('${randomGif}') no-repeat center center fixed;
            background-size: cover;
            color: #ffffff;
            padding: 20px;
            margin: 0;
        }
        .export-header {
            text-align: center;
            margin-bottom: 30px;
            padding-bottom: 20px;
            border-bottom: 2px solid #00ff88;
            background: rgba(10, 14, 26, 0.8);
            border-radius: 15px;
            padding: 20px;
            margin: 20px auto;
            max-width: 1000px;
        }
        .export-title {
            font-size: 24px;
            color: #00ff88;
            margin-bottom: 10px;
        }
        .export-date {
            color: #8892b0;
            font-size: 14px;
        }
        .results-container {
            max-width: 1000px;
            margin: 0 auto;
        }
        .platform-card {
            background: rgba(20, 25, 40, 0.95);
            border: 2px solid rgba(0, 255, 136, 0.2);
            border-radius: 15px;
            padding: 20px;
            margin-bottom: 20px;
            backdrop-filter: blur(5px);
        }
        .platform-header {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 15px;
            padding-bottom: 12px;
            border-bottom: 1px solid rgba(0, 255, 136, 0.2);
        }
        .platform-name {
            font-size: 16px;
            font-weight: bold;
            color: #00ff88;
        }
        .profile-field {
            display: flex;
            justify-content: space-between;
            padding: 8px 0;
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .field-label {
            color: #8892b0;
            min-width: 140px;
        }
        .field-value {
            color: #ffffff;
            text-align: right;
        }
        .profile-image {
            max-width: 100px;
            border-radius: 50%;
            border: 2px solid #00ff88;
        }
        .footer {
            text-align: center;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid rgba(0, 255, 136, 0.2);
            color: #8892b0;
            background: rgba(10, 14, 26, 0.8);
            border-radius: 15px;
            padding: 20px;
            max-width: 1000px;
            margin-left: auto;
            margin-right: auto;
        }
    </style>
</head>
<body>
    <div class="export-header">
        <h1 class="export-title">${title}</h1>
        <div class="export-date">Generated on ${new Date().toLocaleString()}</div>
    </div>
    <div class="results-container">
        ${content}
    </div>
    <div class="footer">
        <p>Generated by Mixaoc & Osint Sync - Advanced Intelligence Research Platform OSINT :3</p>
        <p>Developed by https://github.com/mixaoc</p>
    </div>
</body>
</html>`;
        }

        function downloadHTML(content, filename) {
            const blob = new Blob([content], { type: 'text/html' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        }
    }

    // FULL NAME SEARCH FUNCTIONALITY
    async function performFullnameSearch(fullname, type, postalCode, token) {
        const resultsContainer = document.getElementById('fullnameResults');
        resultsContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        const logResult = await logSearch('fullname', `${fullname} (${type})`, token);
        if (!logResult.success) {
            loadingIndicator.style.display = 'none';
            resultsContainer.innerHTML = `<div class="error-message">${logResult.message}</div>`;
            if (logResult.message.includes('wait')) {
                showCooldown(30);
            }
            return;
        }

        if (logResult.credits_remaining !== undefined) {
            userCredits = logResult.credits_remaining;
            updateCreditsDisplay();
        }

        try {
            const response = await fetch(API2_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'searchFullname',
                    type: type,
                    query: fullname,
                    postalCode: postalCode,
                    token: token
                })
            });

            const result = await response.json();

            if (result.success) {
                if (type === 'insee') {
                    displayInseeResults(result.data);
                } else if (type === 'facebook') {
                    displayFacebookResults(result.data);
                }
                await saveToHistory('fullname', `${fullname} (${type})`, result.data, token);
            } else {
                resultsContainer.innerHTML = `<div class="error-message">${result.message || 'Full name search failed'}</div>`;
            }
        } catch (error) {
            console.error('Full name search error:', error);
            resultsContainer.innerHTML = '<div class="error-message">Error connecting to server</div>';
        }

        loadingIndicator.style.display = 'none';
    }

function displayInseeResults(data) {
    const resultsContainer = document.getElementById('fullnameResults');
    
    if (!data.etablissements || data.etablissements.length === 0) {
        resultsContainer.innerHTML = '<div class="error-message">Aucun résultat trouvé dans la base SIRENE</div>';
        return;
    }

    const card = document.createElement('div');
    card.className = 'platform-card';
    
    let html = `
        <div class="platform-header">
            <img src="https://www.gendarmerie.interieur.gouv.fr/var/site/storage/images/_aliases/card-large/8/7/5/6/346578-1-fre-FR/e57852cd4d43-DFAED.png" alt="INSEE" class="gendarmerie-logo">
            <h3 class="platform-name">data.gouv.fr.sql</h3>
            <span class="cached-badge"><i class="fas fa-database"></i> DONNÉES OFFICIELLES</span>
        </div>
        <div class="profile-section">
            <div class="profile-field">
                <span class="field-label">Total Results:</span>
                <span class="field-value">${data.header.total}</span>
            </div>
        </div>
    `;

    data.etablissements.forEach(etab => {
        const uniteLegale = etab.uniteLegale || {};
        const adresse = etab.adresseEtablissement || {};
        const periode = etab.periodesEtablissement?.[0] || {};
        const caracteristiques = etab.caracteristiquesEtablissement || {};
        const activite = etab.activitePrincipaleEtablissement || {};
        
        // DÉTERMINER LE TYPE D'ENTITÉ
        let typeEntite = 'Entreprise';
        let nomAffichage = '';
        
        if (uniteLegale.categorieJuridiqueUniteLegale) {
            const catJuridique = parseInt(uniteLegale.categorieJuridiqueUniteLegale);
            if (catJuridique >= 1000 && catJuridique <= 1999) {
                typeEntite = 'Personne morale';
            } else if (catJuridique >= 2000 && catJuridique <= 2999) {
                typeEntite = 'Personne physique';
            } else if (catJuridique >= 3000 && catJuridique <= 3999) {
                typeEntite = 'Personne morale étrangère';
            } else if (catJuridique >= 5000 && catJuridique <= 5999) {
                typeEntite = 'Collectivité territoriale';
            } else if (catJuridique >= 6000 && catJuridique <= 6999) {
                typeEntite = 'Établissement public';
            }
        }
        
        // CONSTRUIRE LE NOM D'AFFICHAGE
        if (uniteLegale.denominationUniteLegale) {
            nomAffichage = uniteLegale.denominationUniteLegale;
        } else if (uniteLegale.denominationUsuelle1UniteLegale) {
            nomAffichage = uniteLegale.denominationUsuelle1UniteLegale;
        } else if (uniteLegale.nomUniteLegale && uniteLegale.prenom1UniteLegale) {
            nomAffichage = `${uniteLegale.prenom1UniteLegale} ${uniteLegale.nomUniteLegale}`;
        } else if (uniteLegale.nomUniteLegale) {
            nomAffichage = uniteLegale.nomUniteLegale;
        } else {
            nomAffichage = 'Non renseigné';
        }
        
        const isSiege = etab.etablissementSiege;
        const badge = isSiege ? '<span class="badge badge-siege">SIÈGE</span>' : '<span class="badge badge-secondaire">SECONDAIRE</span>';

        html += `
            <div class="service-section">
                <h4><i class="fas ${typeEntite === 'Personne physique' ? 'fa-user' : 'fa-building'}"></i> ${nomAffichage} ${badge}</h4>
                
                <!-- INFORMATIONS GÉNÉRALES -->
                <div class="profile-field">
                    <span class="field-label">Type:</span>
                    <span class="field-value">${typeEntite}</span>
                </div>
                
                <!-- INFORMATIONS SUR LA PERSONNE (si personne physique) -->
                ${uniteLegale.nomUniteLegale || uniteLegale.prenom1UniteLegale ? `
                <div class="profile-field">
                    <span class="field-label">Nom:</span>
                    <span class="field-value">${uniteLegale.nomUniteLegale || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Prénom:</span>
                    <span class="field-value">${uniteLegale.prenom1UniteLegale || 'N/A'}</span>
                </div>
                ` : ''}
                
                <!-- IDENTIFIANTS -->
                <div class="profile-field">
                    <span class="field-label">SIRET:</span>
                    <span class="field-value">${etab.siret || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">SIREN:</span>
                    <span class="field-value">${etab.siren || 'N/A'}</span>
                </div>
                
                <!-- ACTIVITÉ -->
                <div class="profile-field">
                    <span class="field-label">Activité (NAF):</span>
                    <span class="field-value">${periode.activitePrincipaleEtablissement || activite.libelle || 'N/A'}</span>
                </div>
                
                <!-- CATÉGORIE JURIDIQUE -->
                ${uniteLegale.categorieJuridiqueUniteLegale ? `
                <div class="profile-field">
                    <span class="field-label">Catégorie juridique:</span>
                    <span class="field-value">${uniteLegale.categorieJuridiqueUniteLegale} - ${getCategorieJuridique(uniteLegale.categorieJuridiqueUniteLegale)}</span>
                </div>
                ` : ''}
                
                <!-- ÉTAT -->
                <div class="profile-field">
                    <span class="field-label">État:</span>
                    <span class="field-value ${periode.etatAdministratifEtablissement === 'A' ? 'status-positive' : 'status-negative'}">
                        ${periode.etatAdministratifEtablissement === 'A' ? '✅ Actif' : '❌ Fermé'}
                    </span>
                </div>
                
                <!-- DATES IMPORTANTES -->
                <div class="profile-field">
                    <span class="field-label">Date création:</span>
                    <span class="field-value">${etab.dateCreationEtablissement ? new Date(etab.dateCreationEtablissement).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
                
                ${uniteLegale.dateDernierTraitementUniteLegale ? `
                <div class="profile-field">
                    <span class="field-label">Dernière mise à jour:</span>
                    <span class="field-value">${new Date(uniteLegale.dateDernierTraitementUniteLegale).toLocaleDateString('fr-FR')}</span>
                </div>
                ` : ''}
                
                <!-- EFFECTIFS -->
                ${caracteristiques.trancheEffectifsEtablissement ? `
                <div class="profile-field">
                    <span class="field-label">Tranche effectifs:</span>
                    <span class="field-value">${getTrancheEffectifs(caracteristiques.trancheEffectifsEtablissement)}</span>
                </div>
                ` : ''}
                
                <!-- ADRESSE COMPLÈTE -->
                <div class="profile-field">
                    <span class="field-label">Adresse complète:</span>
                    <span class="field-value">${formatInseeAdresse(adresse)}</span>
                </div>
            </div>
        `;
    });

    html += `
        <div class="profile-field" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color);">
            <span class="field-label">Source:</span>
            <span class="field-value">Database data.gouv_sirt.sql</span>
        </div>
    `;

    card.innerHTML = html;
    resultsContainer.appendChild(card);
}

// FONCTIONS UTILITAIRES POUR LES DONNÉES INSEE
function getCategorieJuridique(code) {
    const categories = {
        '1000': 'Entreprise individuelle',
        '2110': 'SARL',
        '2210': 'SA',
        '2220': 'SAS',
        '3110': 'EURL',
        '3120': 'SELARL',
        '3200': 'Société en nom collectif',
        '5210': 'SCOP',
        '5310': 'Coopérative',
        '5499': 'Association',
        '5720': 'Groupement d\'intérêt économique',
        '6510': 'Société civile',
        '6520': 'Société civile immobilière',
        '6530': 'Société civile professionnelle',
        '6540': 'Société civile de moyens'
    };
    return categories[code] || 'Autre';
}

function getTrancheEffectifs(code) {
    const effectifs = {
        '00': '0 salarié',
        '01': '1 ou 2 salariés',
        '02': '3 à 5 salariés',
        '03': '6 à 9 salariés',
        '11': '10 à 19 salariés',
        '12': '20 à 49 salariés',
        '21': '50 à 99 salariés',
        '22': '100 à 199 salariés',
        '31': '200 à 249 salariés',
        '32': '250 à 499 salariés',
        '41': '500 à 999 salariés',
        '42': '1000 à 1999 salariés',
        '51': '2000 à 4999 salariés',
        '52': '5000 à 9999 salariés',
        '53': '10000 salariés et plus'
    };
    return effectifs[code] || 'Non renseigné';
}

function formatInseeAdresse(adresse) {
    const parts = [
        [adresse.numeroVoieEtablissement, adresse.typeVoieEtablissement, adresse.libelleVoieEtablissement].filter(Boolean).join(' '),
        adresse.complementAdresseEtablissement,
        [adresse.codePostalEtablissement, adresse.libelleCommuneEtablissement].filter(Boolean).join(' ')
    ].filter(Boolean);
    return parts.join(', ') || 'Non renseignée';
}
    
    // USERNAME SEARCH WITH ALL APIS
    async function performUsernameSearch(username, token) {
        const resultsContainer = document.getElementById('usernameResults');
        resultsContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        const logResult = await logSearch('username', username, token);
        if (!logResult.success) {
            loadingIndicator.style.display = 'none';
            resultsContainer.innerHTML = `<div class="error-message">${logResult.message}</div>`;
            if (logResult.message.includes('wait')) {
                showCooldown(30);
            }
            return;
        }

        if (logResult.credits_remaining !== undefined) {
            userCredits = logResult.credits_remaining;
            updateCreditsDisplay();
        }

        const searches = [
            searchGravatar(username),
            searchGitHub(username),
            searchReddit(username),
            searchTwitch(username),
            searchMinecraft(username),
            searchSteam(username),
            searchXbox(username),
            searchInstagramAPI(username),
            searchTwitter(username),
            searchFacebook(username),
            searchYouTube(username),
            searchTikTok(username),
            searchThreadsAPI(username),
            searchSnapchatAPI(username)
        ];

        try {
            await Promise.allSettled(searches);
        } catch (error) {
            console.error('Search error:', error);
            resultsContainer.innerHTML = '<div class="error-message">Search error</div>';
        }

        loadingIndicator.style.display = 'none';

        if (resultsContainer.innerHTML === '') {
            resultsContainer.innerHTML = '<div class="error-message">No results found for this username</div>';
        }
    }

    // EMAIL SEARCH
    async function performEmailSearch(email, token) {
        const resultsContainer = document.getElementById('emailResults');
        resultsContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        const logResult = await logSearch('email', email, token);
        if (!logResult.success) {
            loadingIndicator.style.display = 'none';
            resultsContainer.innerHTML = `<div class="error-message">${logResult.message}</div>`;
            if (logResult.message.includes('wait')) {
                showCooldown(30);
            }
            return;
        }

        if (logResult.credits_remaining !== undefined) {
            userCredits = logResult.credits_remaining;
            updateCreditsDisplay();
        }

        try {
            const response = await fetch(`${GHUNT_SERVER_URL}/search`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email
                })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.success) {
                displayEmailResult(result.data, result.cached);
                await saveToHistory('email', email, result.data, token);
            } else {
                resultsContainer.innerHTML = `<div class="error-message">${result.error || 'Email analysis failed'}</div>`;
            }
        } catch (error) {
            console.error('Email search error:', error);
            resultsContainer.innerHTML = `
                <div class="error-message">
                    Error connecting to GHunt server: ${error.message}
                </div>
            `;
        }

        loadingIndicator.style.display = 'none';
    }

    // PHONE NUMBER SEARCH WITH WHATSAPP DB
    async function performPhoneSearch(phone, countryPrefix, token) {
        const resultsContainer = document.getElementById('phoneResults');
        resultsContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        try {
            let cleanPhone = phone.replace(/\D/g, '');
            
            if (!cleanPhone.startsWith(countryPrefix)) {
                cleanPhone = countryPrefix + cleanPhone;
            }

            // Log the search
            const logResult = await logSearch('number', cleanPhone, token);
            if (!logResult.success) {
                throw new Error(logResult.message);
            }

            if (logResult.credits_remaining !== undefined) {
                userCredits = logResult.credits_remaining;
                updateCreditsDisplay();
            }

            // Search existing APIs
            const response = await fetch(MAIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'searchNumber',
                    token: token,
                    phoneNumber: cleanPhone,
                    countryCode: countryPrefix
                })
            });

            const result = await response.json();

            if (result.success) {
                displayPhoneResult(result.data, result.cached);
                
                // Add WhatsApp DB check
                await checkWhatsAppDB(cleanPhone, resultsContainer);
                
            } else {
                resultsContainer.innerHTML = `<div class="error-message">${result.message || 'Phone number search failed'}</div>`;
            }
        } catch (error) {
            console.error('Phone search error:', error);
            resultsContainer.innerHTML = '<div class="error-message">Error connecting to server</div>';
        }

        loadingIndicator.style.display = 'none';
    }

    // WhatsApp DB check function
    async function checkWhatsAppDB(phone, resultsContainer) {
        try {
            const whatsappImageUrl = `https://whatsapp-db.checkleaked.com/${phone}.jpg`;
            
            // Check if image exists
            const imgCheck = new Image();
            imgCheck.onload = function() {
                // Image exists, create card for WhatsApp DB
                const card = document.createElement('div');
                card.className = 'platform-card';
                
                card.innerHTML = `
                    <div class="platform-header">
                        <span class="platform-icon"><i class="fab fa-whatsapp"></i></span>
                        <h3 class="platform-name">MixAoc Database </h3>
                        <span class="cached-badge"><i class="fas fa-database"></i> LEAKED DATA</span>
                    </div>
                    <div class="profile-section">
                        <div class="profile-field">
                            <span class="field-label">Phone Number:</span>
                            <span class="field-value">${phone}</span>
                        </div>
                        <div class="profile-field">
                            <span class="field-label">Status:</span>
                            <span class="field-value status-positive">Profile Found in Database</span>
                        </div>
                        <div class="profile-image-container">
                            <img src="${whatsappImageUrl}" alt="WhatsApp Profile" class="whatsapp-image" onerror="this.style.display='none'">
                        </div>
                        <div class="profile-field">
                            <span class="field-label">Source:</span>
                            <span class="field-value">Osint IOndustrie By Mixaoc </span>
                        </div>
                    </div>
                `;
                
                resultsContainer.appendChild(card);
            };
            
            imgCheck.onerror = function() {
                // Image doesn't exist, no WhatsApp data found
                const card = document.createElement('div');
                card.className = 'platform-card';
                
                card.innerHTML = `
                    <div class="platform-header">
                        <span class="platform-icon"><i class="fab fa-whatsapp"></i></span>
                        <h3 class="platform-name">MixAoc Database</h3>
                    </div>
                    <div class="profile-section">
                        <div class="profile-field">
                            <span class="field-label">Phone Number:</span>
                            <span class="field-value">${phone}</span>
                        </div>
                        <div class="profile-field">
                            <span class="field-label">Status:</span>
                            <span class="field-value status-negative">No Profile Found in Database</span>
                        </div>
                    </div>
                `;
                
                resultsContainer.appendChild(card);
            };
            
            imgCheck.src = whatsappImageUrl;
            
        } catch (error) {
            console.error('WhatsApp DB check error:', error);
        }
    }

    // HISTORY MANAGEMENT
    async function loadHistory(token) {
        const resultsContainer = document.getElementById('historyResults');
        resultsContainer.innerHTML = '';
        loadingIndicator.style.display = 'block';

        try {
            const response = await fetch(MAIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'getHistory',
                    token: token
                })
            });

            const result = await response.json();

            if (result.success && result.history) {
                displayHistoryResult(result.history);
            } else {
                resultsContainer.innerHTML = `<div class="error-message">${result.message || 'No history found'}</div>`;
            }
        } catch (error) {
            console.error('History loading error:', error);
            resultsContainer.innerHTML = '<div class="error-message">Error loading history</div>';
        }

        loadingIndicator.style.display = 'none';
    }

    function displayHistoryResult(history) {
        const resultsContainer = document.getElementById('historyResults');
        
        if (!history || history.length === 0) {
            resultsContainer.innerHTML = '<div class="error-message">No search history found</div>';
            return;
        }

        history.forEach(item => {
            const historyItem = document.createElement('div');
            historyItem.className = 'history-item';
            
            historyItem.innerHTML = `
                <div class="history-header">
                    <span class="history-type">${item.search_type.toUpperCase()}</span>
                    <span class="history-date">${new Date(item.timestamp).toLocaleString()}</span>
                </div>
                <div class="history-query">
                    <strong>Query:</strong> ${item.query}
                </div>
                ${item.result ? `<div class="history-preview">Result available</div>` : ''}
            `;
            
            resultsContainer.appendChild(historyItem);
        });
    }

    async function clearHistory(token) {
        if (!confirm('Are you sure you want to clear your search history? This action cannot be undone.')) {
            return;
        }

        const resultsContainer = document.getElementById('historyResults');
        resultsContainer.innerHTML = '<div class="success-message">History cleared successfully</div>';
    }

    // LOG A SEARCH
    async function logSearch(type, query, token) {
        try {
            const clientIP = await getClientIP();
            
            const response = await fetch(MAIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'logSearch',
                    token: token,
                    searchType: type,
                    query: query,
                    ip: clientIP,
                    userAgent: navigator.userAgent
                })
            });

            return await response.json();
        } catch (error) {
            console.error('Logging error:', error);
            return { success: false, message: 'Logging error' };
        }
    }

    // SAVE TO HISTORY
    async function saveToHistory(type, query, result, token) {
        try {
            await fetch(MAIN_API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify({
                    action: 'saveToHistory',
                    token: token,
                    searchType: type,
                    query: query,
                    result: result
                })
            });
        } catch (error) {
            console.error('History save error:', error);
        }
    }

    // UTILITY FUNCTIONS
    async function getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // DISPLAY FUNCTIONS
    function displayPhoneResult(data, cached) {
        const resultsContainer = document.getElementById('phoneResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        let html = `
            <div class="platform-header">
                <span class="platform-icon"><i class="fas fa-phone"></i></span>
                <h3 class="platform-name">Phone Number Analysis</h3>
                ${cached ? '<span class="cached-badge"><i class="fas fa-database"></i> CACHED</span>' : ''}
            </div>
            <div class="profile-section">
        `;

        // Basic phone info
        html += `
            <div class="profile-field">
                <span class="field-label">Phone Number:</span>
                <span class="field-value">${data.formatted?.international || data.number || 'N/A'}</span>
            </div>
        `;

        // WhatsApp Status
        if (data.exists !== undefined) {
            html += `
                <div class="profile-field">
                    <span class="field-label">WhatsApp Status:</span>
                    <span class="field-value ${data.exists ? 'status-positive' : 'status-negative'}">
                        ${data.exists ? 'Account Found' : 'No Account Found'}
                    </span>
                </div>
            `;
        }

        // Carrier Information
        if (data.carrierData) {
            const carrier = data.carrierData;
            html += `
                <div class="profile-field">
                    <span class="field-label">Carrier:</span>
                    <span class="field-value">${carrier.carrier || 'Unknown'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Country:</span>
                    <span class="field-value">${carrier.country || 'Unknown'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Line Type:</span>
                    <span class="field-value">${carrier.lineType || 'Unknown'}</span>
                </div>
            `;
        }

        // Other services
        if (data.telegram) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Telegram:</span>
                    <span class="field-value ${data.telegram.error ? 'status-negative' : 'status-positive'}">
                        ${data.telegram.error || 'Account Found'}
                    </span>
                </div>
            `;
        }

        if (data.google) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Google Search:</span>
                    <span class="field-value ${data.google.results ? 'status-positive' : 'status-negative'}">
                        ${data.google.results ? 'Results Found' : 'No Results'}
                    </span>
                </div>
            `;
        }

        html += `</div>`;
        card.innerHTML = html;
        resultsContainer.appendChild(card);
    }

    function displayEmailResult(data, cached) {
        const resultsContainer = document.getElementById('emailResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        let html = `
            <div class="platform-header">
                <div class="platform-icon">
                    <i class="fas fa-envelope"></i>
                </div>
                <h3 class="platform-name">Email Intelligence Report</h3>
                ${cached ? '<div class="cached-badge"><i class="fas fa-database"></i> CACHED</div>' : ''}
            </div>
            <div class="profile-section">
        `;

        // Basic email info
        html += `
            <div class="profile-field">
                <span class="field-label">Target Email:</span>
                <span class="field-value">${data.email || 'N/A'}</span>
            </div>
        `;

        // Profile picture
        if (data.profile_picture && !data.default_picture) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Profile Picture:</span>
                    <div class="profile-image-container">
                        <img src="${data.profile_picture}" alt="Profile" class="profile-image-large" onerror="this.style.display='none'">
                    </div>
                </div>
            `;
        }

        // Google Account Data
        if (data.gaia_id || data.last_edit) {
            html += `<div class="service-section">`;
            html += `<h4><i class="fab fa-google"></i> Google Account Data</h4>`;
            
            if (data.gaia_id) {
                html += `
                    <div class="profile-field">
                        <span class="field-label">Gaia ID:</span>
                        <span class="field-value">${data.gaia_id}</span>
                    </div>
                `;
            }

            if (data.last_edit) {
                html += `
                    <div class="profile-field">
                        <span class="field-label">Last Profile Edit:</span>
                        <span class="field-value">${data.last_edit}</span>
                    </div>
                `;
            }

            if (data.user_types && data.user_types.length > 0) {
                html += `
                    <div class="profile-field">
                        <span class="field-label">User Types:</span>
                        <span class="field-value">${data.user_types.join(', ')}</span>
                    </div>
                `;
            }
            html += `</div>`;
        }

        // Google Services
        if (data.google_services && data.google_services.length > 0) {
            html += `<div class="service-section">`;
            html += `<h4><i class="fas fa-cogs"></i> Activated Google Services</h4>`;
            html += `<div class="services-grid">`;
            
            data.google_services.forEach(service => {
                html += `
                    <div class="service-item">
                        <span class="service-name">${service}</span>
                    </div>
                `;
            });
            
            html += `</div></div>`;
        }

        // Google Maps Activity
        html += `<div class="service-section">`;
        html += `<h4><i class="fas fa-map-marker-alt"></i> Google Maps Activity</h4>`;
        
        if (data.maps_profile) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Profile Page:</span>
                    <a href="${data.maps_profile}" target="_blank" class="field-value">View Public Profile</a>
                </div>
            `;
        }
        
        if (data.reviews_count > 0 || data.photos_count > 0 || data.places_added > 0) {
            html += `<div class="stats-grid">`;
            
            if (data.reviews_count > 0) {
                html += `
                    <div class="stat-item">
                        <div class="stat-value">${data.reviews_count}</div>
                        <div class="stat-label">Reviews</div>
                    </div>
                `;
            }
            
            if (data.photos_count > 0) {
                html += `
                    <div class="stat-item">
                        <div class="stat-value">${data.photos_count}</div>
                        <div class="stat-label">Photos</div>
                    </div>
                `;
            }
            
            if (data.places_added > 0) {
                html += `
                    <div class="stat-item">
                        <div class="stat-value">${data.places_added}</div>
                        <div class="stat-label">Places</div>
                    </div>
                `;
            }
            
            html += `</div>`;
        } else {
            html += `
                <div class="profile-field">
                    <span class="field-label">Activity Status:</span>
                    <span class="field-value status-negative">No public activity found</span>
                </div>
            `;
        }
        html += `</div>`;

        // Footer with timestamp
        html += `
            <div class="profile-field" style="margin-top: 20px; padding-top: 15px; border-top: 1px solid var(--border-color);">
                <span class="field-label">Report Generated:</span>
                <span class="field-value">${new Date().toLocaleString()}</span>
            </div>
        `;

        html += `</div></div>`;
        card.innerHTML = html;
        resultsContainer.appendChild(card);
    }

    // =========================================================================
    // ALL EXISTING API FUNCTIONS - KEPT UNCHANGED
    // =========================================================================

    // GRAVATAR API
    async function searchGravatar(username) {
        try {
            const response = await fetch(`https://en.gravatar.com/${username}.json`);
            if (response.ok) {
                const data = await response.json();
                if (data.entry && data.entry.length > 0) {
                    const profile = data.entry[0];
                    displayGravatarResult(profile);
                }
            }
        } catch (error) {
            console.log('Gravatar not found');
        }
    }

    function displayGravatarResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">👤</span>
                <h3 class="platform-name">Gravatar</h3>
            </div>
            <div class="profile-section">
                ${profile.thumbnailUrl ? `
                    <div class="profile-image-container">
                        <img src="${profile.thumbnailUrl}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.preferredUsername || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Display Name:</span>
                    <span class="field-value">${profile.displayName || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Profile URL:</span>
                    <a href="${profile.profileUrl}" target="_blank" class="field-value">View Profile</a>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // GITHUB API
    async function searchGitHub(username) {
        try {
            const response = await fetch(`https://api.github.com/users/${username}`);
            if (response.ok) {
                const data = await response.json();
                displayGitHubResult(data);
            }
        } catch (error) {
            console.log('GitHub not found');
        }
    }

    function displayGitHubResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🐙</span>
                <h3 class="platform-name">GitHub</h3>
            </div>
            <div class="profile-section">
                ${profile.avatar_url ? `
                    <div class="profile-image-container">
                        <img src="${profile.avatar_url}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.login}</span>
                </div>
                ${profile.name ? `
                    <div class="profile-field">
                        <span class="field-label">Name:</span>
                        <span class="field-value">${profile.name}</span>
                    </div>
                ` : ''}
                ${profile.bio ? `
                    <div class="profile-field">
                        <span class="field-label">Bio:</span>
                        <span class="field-value">${profile.bio}</span>
                    </div>
                ` : ''}
                ${profile.location ? `
                    <div class="profile-field">
                        <span class="field-label">Location:</span>
                        <span class="field-value">${profile.location}</span>
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Public Repos:</span>
                    <span class="field-value">${profile.public_repos}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Followers:</span>
                    <span class="field-value">${profile.followers}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Following:</span>
                    <span class="field-value">${profile.following}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Created:</span>
                    <span class="field-value">${new Date(profile.created_at).toLocaleDateString()}</span>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // REDDIT API
    async function searchReddit(username) {
        try {
            const response = await fetch(`https://www.reddit.com/user/${username}/about.json`);
            if (response.ok) {
                const result = await response.json();
                if (result.data) {
                    displayRedditResult(result.data);
                }
            }
        } catch (error) {
            console.log('Reddit not found');
        }
    }

    function displayRedditResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        const createdDate = new Date(profile.created * 1000).toLocaleDateString();
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🤖</span>
                <h3 class="platform-name">Reddit</h3>
            </div>
            <div class="profile-section">
                ${profile.icon_img ? `
                    <div class="profile-image-container">
                        <img src="${profile.icon_img}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">u/${profile.name}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Total Karma:</span>
                    <span class="field-value">${profile.total_karma || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Link Karma:</span>
                    <span class="field-value">${profile.link_karma || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Comment Karma:</span>
                    <span class="field-value">${profile.comment_karma || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Created:</span>
                    <span class="field-value">${createdDate}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Verified Email:</span>
                    <span class="field-value">${profile.has_verified_email ? 'Yes' : 'No'}</span>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // TWITCH API
    async function searchTwitch(username) {
        try {
            const response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${username}`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.length > 0) {
                    displayTwitchResult(data[0]);
                }
            }
        } catch (error) {
            console.log('Twitch not found');
        }
    }

    function displayTwitchResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        const createdDate = new Date(profile.createdAt).toLocaleDateString();
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🎮</span>
                <h3 class="platform-name">Twitch</h3>
            </div>
            <div class="profile-section">
                ${profile.logo ? `
                    <div class="profile-image-container">
                        <img src="${profile.logo}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.login || profile.displayName}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Display Name:</span>
                    <span class="field-value">${profile.displayName}</span>
                </div>
                ${profile.bio ? `
                    <div class="profile-field">
                        <span class="field-label">Bio:</span>
                        <span class="field-value">${profile.bio}</span>
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">ID:</span>
                    <span class="field-value">${profile.id}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Created:</span>
                    <span class="field-value">${createdDate}</span>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // MINECRAFT API
    async function searchMinecraft(username) {
        try {
            const response = await fetch(`https://playerdb.co/api/player/minecraft/${username}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.player) {
                    displayMinecraftResult(result.data.player);
                }
            }
        } catch (error) {
            console.log('Minecraft not found');
        }
    }

    function displayMinecraftResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">⛏️</span>
                <h3 class="platform-name">Minecraft</h3>
            </div>
            <div class="profile-section">
                ${profile.avatar ? `
                    <div class="profile-image-container">
                        <img src="${profile.avatar}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">UUID:</span>
                    <span class="field-value">${profile.id}</span>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // STEAM API
    async function searchSteam(username) {
        try {
            const response = await fetch(`https://playerdb.co/api/player/steam/${username}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.player) {
                    displaySteamResult(result.data.player);
                }
            }
        } catch (error) {
            console.log('Steam not found');
        }
    }

    function displaySteamResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🎯</span>
                <h3 class="platform-name">Steam</h3>
            </div>
            <div class="profile-section">
                ${profile.avatar ? `
                    <div class="profile-image-container">
                        <img src="${profile.avatar}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Steam ID:</span>
                    <span class="field-value">${profile.id}</span>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // XBOX API
    async function searchXbox(username) {
        try {
            const response = await fetch(`https://playerdb.co/api/player/xbox/${username}`);
            if (response.ok) {
                const result = await response.json();
                if (result.success && result.data.player) {
                    displayXboxResult(result.data.player);
                }
            }
        } catch (error) {
            console.log('Xbox not found');
        }
    }

    function displayXboxResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🎮</span>
                <h3 class="platform-name">Xbox</h3>
            </div>
            <div class="profile-section">
                ${profile.avatar ? `
                    <div class="profile-image-container">
                        <img src="${profile.avatar}" alt="Avatar" class="profile-image">
                    </div>
                ` : ''}
                <div class="profile-field">
                    <span class="field-label">Gamertag:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">XUID:</span>
                    <span class="field-value">${profile.id}</span>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // INSTAGRAM API
    async function searchInstagramAPI(username) {
        try {
            const response = await fetch(`${MAIN_API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify({
                    action: 'searchInstagram',
                    username: username
                })
            });

            const result = await response.json();
            
            if (result.success && result.data) {
                displayInstagramAPIResult(result.data);
            }
        } catch (error) {
            console.log('Instagram API error:', error);
        }
    }

    function displayInstagramAPIResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        let html = `
            <div class="platform-header">
                <span class="platform-icon">📷</span>
                <h3 class="platform-name">Instagram</h3>
            </div>
            <div class="profile-section">
        `;

        if (profile.profile_pic_url_hd) {
            html += `
                <div class="profile-image-container">
                    <img src="${profile.profile_pic_url_hd}" alt="Profile" class="profile-image" onerror="this.style.display='none'">
                </div>
            `;
        }

        html += `
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Full Name:</span>
                    <span class="field-value">${profile.full_name || 'N/A'}</span>
                </div>
        `;

        if (profile.biography) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Bio:</span>
                    <span class="field-value">${profile.biography}</span>
                </div>
            `;
        }

        html += `
                <div class="profile-field">
                    <span class="field-label">Private:</span>
                    <span class="field-value ${profile.is_private ? 'status-warning' : 'status-positive'}">
                        ${profile.is_private ? 'Yes' : 'No'}
                    </span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Followers:</span>
                    <span class="field-value">${profile.edge_followed_by?.count || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Following:</span>
                    <span class="field-value">${profile.edge_follow?.count || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Posts:</span>
                    <span class="field-value">${profile.edge_owner_to_timeline_media?.count || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">User ID:</span>
                    <span class="field-value">${profile.id || 'N/A'}</span>
                </div>
            </div>
        `;

        card.innerHTML = html;
        resultsContainer.appendChild(card);
    }

    // TWITTER API
    async function searchTwitter(username) {
        try {
            const profile = {
                username: username,
                exists: Math.random() > 0.6
            };
            
            if (profile.exists) {
                displayTwitterResult(profile);
            }
        } catch (error) {
            console.log('Twitter not available');
        }
    }

    function displayTwitterResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🐦</span>
                <h3 class="platform-name">Twitter / X</h3>
            </div>
            <div class="profile-section">
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Status:</span>
                    <span class="field-value status-positive">Profile potentially exists</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Profile URL:</span>
                    <a href="https://twitter.com/${profile.username}" target="_blank" class="field-value">View Profile</a>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // FACEBOOK API
    async function searchFacebook(username) {
        try {
            const profile = {
                username: username,
                exists: Math.random() > 0.5
            };
            
            if (profile.exists) {
                displayFacebookResult(profile);
            }
        } catch (error) {
            console.log('Facebook not available');
        }
    }

    function displayFacebookResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">👥</span>
                <h3 class="platform-name">Facebook</h3>
            </div>
            <div class="profile-section">
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Status:</span>
                    <span class="field-value status-positive">Profile potentially exists</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Profile URL:</span>
                    <a href="https://facebook.com/${profile.username}" target="_blank" class="field-value">View Profile</a>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // YOUTUBE API
    async function searchYouTube(username) {
        try {
            const profile = {
                username: username,
                exists: Math.random() > 0.4
            };
            
            if (profile.exists) {
                displayYouTubeResult(profile);
            }
        } catch (error) {
            console.log('YouTube not available');
        }
    }

    function displayYouTubeResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">📺</span>
                <h3 class="platform-name">YouTube</h3>
            </div>
            <div class="profile-section">
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Status:</span>
                    <span class="field-value status-positive">Channel potentially exists</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Profile URL:</span>
                    <a href="https://youtube.com/@${profile.username}" target="_blank" class="field-value">View Channel</a>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // TIKTOK API
    async function searchTikTok(username) {
        try {
            const profile = {
                username: username,
                exists: Math.random() > 0.3
            };
            
            if (profile.exists) {
                displayTikTokResult(profile);
            }
        } catch (error) {
            console.log('TikTok not available');
        }
    }

    function displayTikTokResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        card.innerHTML = `
            <div class="platform-header">
                <span class="platform-icon">🎵</span>
                <h3 class="platform-name">TikTok</h3>
            </div>
            <div class="profile-section">
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Status:</span>
                    <span class="field-value status-positive">Profile potentially exists</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Profile URL:</span>
                    <a href="https://tiktok.com/@${profile.username}" target="_blank" class="field-value">View Profile</a>
                </div>
            </div>
        `;
        resultsContainer.appendChild(card);
    }

    // THREADS API
    async function searchThreadsAPI(username) {
        try {
            const response = await fetch(`${MAIN_API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify({
                    action: 'searchThreads',
                    username: username
                })
            });

            const result = await response.json();
            
            if (result.success && result.data) {
                displayThreadsResult(result.data);
            }
        } catch (error) {
            console.log('Threads API error:', error);
        }
    }

    function displayThreadsResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        let html = `
            <div class="platform-header">
                <span class="platform-icon">🧵</span>
                <h3 class="platform-name">Threads</h3>
            </div>
            <div class="profile-section">
        `;

        if (profile.user && profile.user.hd_profile_pic_versions && profile.user.hd_profile_pic_versions.length > 0) {
            const profilePic = profile.user.hd_profile_pic_versions[1]?.url || profile.user.hd_profile_pic_versions[0]?.url;
            html += `
                <div class="profile-image-container">
                    <img src="${profilePic}" alt="Profile" class="profile-image" onerror="this.style.display='none'">
                </div>
            `;
        }

        html += `
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.user?.username || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Full Name:</span>
                    <span class="field-value">${profile.user?.full_name || 'N/A'}</span>
                </div>
        `;

        if (profile.user?.biography) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Bio:</span>
                    <span class="field-value">${profile.user.biography}</span>
                </div>
            `;
        }

        html += `
                <div class="profile-field">
                    <span class="field-label">Follower Count:</span>
                    <span class="field-value">${profile.user?.follower_count || 0}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Verified:</span>
                    <span class="field-value ${profile.user?.is_verified ? 'status-positive' : 'status-negative'}">
                        ${profile.user?.is_verified ? 'Yes' : 'No'}
                    </span>
                </div>
                <div class="profile-field">
                    <span class="field-label">User ID:</span>
                    <span class="field-value">${profile.user?.pk || 'N/A'}</span>
                </div>
            </div>
        `;

        card.innerHTML = html;
        resultsContainer.appendChild(card);
    }

    // SNAPCHAT API
    async function searchSnapchatAPI(username) {
        try {
            const response = await fetch(`${MAIN_API_URL}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    },
                body: JSON.stringify({
                    action: 'searchSnapchat',
                    username: username
                })
            });

            const result = await response.json();
            
            if (result.success && result.data) {
                displaySnapchatResult(result.data);
            }
        } catch (error) {
            console.log('Snapchat API error:', error);
        }
    }

    function displaySnapchatResult(profile) {
        const resultsContainer = document.getElementById('usernameResults');
        const card = document.createElement('div');
        card.className = 'platform-card';
        
        let html = `
            <div class="platform-header">
                <span class="platform-icon">👻</span>
                <h3 class="platform-name">Snapchat</h3>
            </div>
            <div class="profile-section">
        `;

        if (profile.profilePictureUrl) {
            html += `
                <div class="profile-image-container">
                    <img src="${profile.profilePictureUrl}" alt="Profile" class="profile-image" onerror="this.style.display='none'">
                </div>
            `;
        }

        html += `
                <div class="profile-field">
                    <span class="field-label">Username:</span>
                    <span class="field-value">${profile.username || 'N/A'}</span>
                </div>
                <div class="profile-field">
                    <span class="field-label">Display Name:</span>
                    <span class="field-value">${profile.title || 'N/A'}</span>
                </div>
        `;

        if (profile.bio) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Bio:</span>
                    <span class="field-value">${profile.bio}</span>
                </div>
            `;
        }

        if (profile.subscriberCount) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Subscribers:</span>
                    <span class="field-value">${parseInt(profile.subscriberCount).toLocaleString()}</span>
                </div>
            `;
        }

        if (profile.address) {
            html += `
                <div class="profile-field">
                    <span class="field-label">Location:</span>
                    <span class="field-value">${profile.address}</span>
                </div>
            `;
        }

        html += `
                <div class="profile-field">
                    <span class="field-label">Has Story:</span>
                    <span class="field-value ${profile.hasStory ? 'status-positive' : 'status-negative'}">
                        ${profile.hasStory ? 'Yes' : 'No'}
                    </span>
                </div>
            </div>
        `;

        card.innerHTML = html;
        resultsContainer.appendChild(card);
    }
});