
// Affiliate Dashboard JavaScript
// API Configuration - Points to Render backend
const API_BASE_URL = 'https://webgemini-affiliate-backend.onrender.com/api';

console.log('Affiliate Dashboard using API:', API_BASE_URL);
let authToken = null;
let currentUser = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    
    // Clear any old mock data
    localStorage.removeItem('mockUser');
    
    if (!authToken || authToken.startsWith('mock-')) {
        redirectToLogin();
        return;
    }

    // Verify token and load user info
    verifyAuth();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load dashboard data (ensure currency rate fetched first when available)
    if (window.currencyConverter && typeof window.currencyConverter.getRate === 'function') {
        window.currencyConverter.getRate().catch(() => {}).finally(() => {
            loadDashboardData();
        });
    } else {
        loadDashboardData();
    }
});

function setupEventListeners() {
    // Navigation - fix event handling
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const section = item.getAttribute('data-section');
            if (section) {
                switchSection(section);
            }
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadDashboardData();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Copy coupon button
    document.getElementById('copyCouponBtn').addEventListener('click', () => {
        copyToClipboard(document.getElementById('couponCode').textContent);
    });

    // Copy link preview button (overview section)
    const copyLinkPreviewBtn = document.getElementById('copyLinkPreviewBtn');
    if (copyLinkPreviewBtn) {
        copyLinkPreviewBtn.addEventListener('click', () => {
            copyToClipboard(document.getElementById('referralLinkPreview').value);
        });
    }

    // Copy link button (share section)
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    if (copyLinkBtn) {
        copyLinkBtn.addEventListener('click', () => {
            copyToClipboard(document.getElementById('referralLink').value);
        });
    }

    // Referral search
    document.getElementById('referralSearch').addEventListener('input', (e) => {
        filterTable('referralsTableBody', e.target.value);
    });

    // Social share buttons
    document.getElementById('shareTwitter').addEventListener('click', () => shareOnSocial('twitter'));
    document.getElementById('shareFacebook').addEventListener('click', () => shareOnSocial('facebook'));
    document.getElementById('shareLinkedIn').addEventListener('click', () => shareOnSocial('linkedin'));
    document.getElementById('shareWhatsApp').addEventListener('click', () => shareOnSocial('whatsapp'));
}

function switchSection(section) {
    // Update nav items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
    });
    document.querySelector(`[data-section="${section}"]`).classList.add('active');

    // Update sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.remove('active');
    });
    document.getElementById(`${section}-section`).classList.add('active');
}

async function verifyAuth() {
    console.log('Verifying authentication...');
    console.log('API Base URL:', API_BASE_URL);
    console.log('Auth Token:', authToken ? 'Present' : 'Missing');
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/profile`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status);
        
        const data = await response.json();
        console.log('Profile data received:', data);

        if (!data.success) {
            console.error('Profile fetch failed:', data.message);
            redirectToLogin();
            return;
        }

        currentUser = data.user;
        
        // Update all user info elements
        const affiliateNameEl = document.getElementById('affiliateName');
        if (affiliateNameEl) affiliateNameEl.textContent = data.user.full_name;
        
        const welcomeNameEl = document.getElementById('welcomeName');
        if (welcomeNameEl) welcomeNameEl.textContent = data.user.full_name;
        
        const couponCodeEl = document.getElementById('couponCode');
        if (couponCodeEl) couponCodeEl.textContent = data.user.coupon_code;
        
        // Set affiliate ID
        const affiliateIdElement = document.getElementById('affiliateId');
        if (affiliateIdElement) {
            affiliateIdElement.textContent = `#${data.user.id}`;
        } else {
            console.warn('affiliateId element not found');
        }
        
        // Set referral link in both places
        const referralLink = `${window.location.origin}/client-signup.html?ref=${data.user.coupon_code}`;
        
        const referralLinkElement = document.getElementById('referralLink');
        if (referralLinkElement) {
            referralLinkElement.value = referralLink;
        } else {
            console.warn('referralLink element not found');
        }
        
        const referralLinkPreviewElement = document.getElementById('referralLinkPreview');
        if (referralLinkPreviewElement) {
            referralLinkPreviewElement.value = referralLink;
        } else {
            console.warn('referralLinkPreview element not found');
        }
        
        console.log('User info loaded:', {
            id: data.user.id,
            name: data.user.full_name,
            coupon: data.user.coupon_code,
            link: referralLink
        });
        
    } catch (error) {
        console.error('Auth verification failed:', error);
        redirectToLogin();
    }
}

async function loadDashboardData() {
    await Promise.all([
        loadStats(),
        loadReferrals(),
        loadGoalProgress()
    ]);
}

async function loadGoalProgress() {
    try {
        // Load current goal
        const goalResponse = await fetch(`${API_BASE_URL}/goals/current`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const goalData = await goalResponse.json();

        if (goalData) {
            // Update goal display
            document.getElementById('achievedReferrals').textContent = goalData.achieved_referrals || 0;
            document.getElementById('targetReferrals').textContent = goalData.target_referrals || 10;
            document.getElementById('daysRemaining').textContent = `${goalData.daysRemaining || 0} days left`;
            
            // Update progress bar
            const progressPercentage = goalData.progress || 0;
            const progressFill = document.getElementById('progressFill');
            const progressPercentageText = document.getElementById('progressPercentage');
            
            progressFill.style.width = `${progressPercentage}%`;
            progressPercentageText.textContent = `${progressPercentage}%`;
            
            // Update goal message based on status
            const goalMessage = document.getElementById('goalMessage');
            const goalMessageIcon = goalMessage.querySelector('i');
            const goalMessageText = goalMessage.querySelector('span');
            
            if (goalData.status === 'completed') {
                goalMessage.className = 'goal-message success';
                goalMessageIcon.className = 'fas fa-trophy';
                goalMessageText.textContent = `🎉 Congratulations! You've reached your goal!`;
            } else if (goalData.status === 'failed') {
                goalMessage.className = 'goal-message failed';
                goalMessageIcon.className = 'fas fa-redo';
                goalMessageText.textContent = `Nice try, ${currentUser.full_name}! You can go again.`;
            } else {
                goalMessage.className = 'goal-message';
                goalMessageIcon.className = 'fas fa-fire';
                if (progressPercentage >= 80) {
                    goalMessageText.textContent = `You're almost there! Just ${goalData.target_referrals - goalData.achieved_referrals} more!`;
                } else if (progressPercentage >= 50) {
                    goalMessageText.textContent = `Great progress! Keep up the momentum!`;
                } else {
                    goalMessageText.textContent = `Keep going! You're doing great!`;
                }
            }
        }

        // Load bonus info
        const bonusResponse = await fetch(`${API_BASE_URL}/goals/bonus`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const bonusData = await bonusResponse.json();

        if (bonusData) {
            document.getElementById('consecutiveWins').textContent = `${bonusData.consecutiveWins || 0} wins`;
            
            // Show bonus badge if active
            const bonusInfo = document.getElementById('bonusInfo');
            if (bonusData.hasBonus) {
                bonusInfo.style.display = 'block';
            } else {
                bonusInfo.style.display = 'none';
            }
        }

    } catch (error) {
        console.error('Error loading goal progress:', error);
    }
}

async function loadStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            
                // Update overview stats
                document.getElementById('totalReferrals').textContent = stats.total_referrals || 0;

                if (window.currencyConverter && typeof window.currencyConverter.convert === 'function') {
                    try {
                        const totalZ = await window.currencyConverter.convert(stats.total_earnings || 0);
                        const pendingZ = await window.currencyConverter.convert(stats.pending_earnings || 0);
                        const paidZ = await window.currencyConverter.convert(stats.paid_earnings || 0);

                        document.getElementById('totalEarnings').textContent = window.currencyConverter.formatZar(totalZ);
                        document.getElementById('pendingEarnings').textContent = window.currencyConverter.formatZar(pendingZ);
                        document.getElementById('paidEarnings').textContent = window.currencyConverter.formatZar(paidZ);

                        // Update earnings section
                        document.getElementById('earningsTotal').textContent = window.currencyConverter.formatZar(totalZ);
                        document.getElementById('earningsPending').textContent = window.currencyConverter.formatZar(pendingZ);
                        document.getElementById('earningsPaid').textContent = window.currencyConverter.formatZar(paidZ);
                    } catch (e) {
                        document.getElementById('totalEarnings').textContent = `R${(stats.total_earnings || 0).toFixed(2)}`;
                        document.getElementById('pendingEarnings').textContent = `R${(stats.pending_earnings || 0).toFixed(2)}`;
                        document.getElementById('paidEarnings').textContent = `R${(stats.paid_earnings || 0).toFixed(2)}`;
                        document.getElementById('earningsTotal').textContent = `R${(stats.total_earnings || 0).toFixed(2)}`;
                        document.getElementById('earningsPending').textContent = `R${(stats.pending_earnings || 0).toFixed(2)}`;
                        document.getElementById('earningsPaid').textContent = `R${(stats.paid_earnings || 0).toFixed(2)}`;
                    }
                } else {
                    document.getElementById('totalEarnings').textContent = `R${(stats.total_earnings || 0).toFixed(2)}`;
                    document.getElementById('pendingEarnings').textContent = `R${(stats.pending_earnings || 0).toFixed(2)}`;
                    document.getElementById('paidEarnings').textContent = `R${(stats.paid_earnings || 0).toFixed(2)}`;
                    document.getElementById('earningsTotal').textContent = `R${(stats.total_earnings || 0).toFixed(2)}`;
                    document.getElementById('earningsPending').textContent = `R${(stats.pending_earnings || 0).toFixed(2)}`;
                    document.getElementById('earningsPaid').textContent = `R${(stats.paid_earnings || 0).toFixed(2)}`;
                }
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadReferrals() {
    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/referrals`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('referralsTableBody');
            
            if (data.referrals.length === 0) {
                tbody.innerHTML = '<tr><td colspan="8" class="no-data">No referrals yet. Start sharing your coupon code!</td></tr>';
                return;
            }

            tbody.innerHTML = data.referrals.map(referral => {
                const planPrice = parseFloat(referral.plan_price) || 0;
                const commissionAmount = referral.commission_amount ? parseFloat(referral.commission_amount) : 0;

                const planPriceZ = window.currencyConverter && window.currencyConverter.convertSync ? window.currencyConverter.convertSync(planPrice) : planPrice;
                const planPriceText = window.currencyConverter && window.currencyConverter.formatZar ? window.currencyConverter.formatZar(planPriceZ) : `R${planPriceZ.toFixed(2)}`;

                const commissionZ = window.currencyConverter && window.currencyConverter.convertSync ? window.currencyConverter.convertSync(commissionAmount) : commissionAmount;
                const commissionText = window.currencyConverter && window.currencyConverter.formatZar ? window.currencyConverter.formatZar(commissionZ) : `R${commissionZ.toFixed(2)}`;

                return `
                <tr>
                    <td>${referral.name}</td>
                    <td>${referral.email}</td>
                    <td>${referral.plan_type}</td>
                    <td>${planPriceText}</td>
                    <td>${referral.commission_rate ? (referral.commission_rate * 100).toFixed(0) + '%' : 'N/A'}</td>
                    <td>${commissionText}</td>
                    <td><span class="status-badge ${referral.commission_status}">${referral.commission_status || 'pending'}</span></td>
                    <td>${new Date(referral.signup_date).toLocaleDateString()}</td>
                </tr>
            `}).join('');
        }
    } catch (error) {
        console.error('Error loading referrals:', error);
        document.getElementById('referralsTableBody').innerHTML = 
            '<tr><td colspan="8" class="error">Error loading referrals</td></tr>';
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const btn = event.target.closest('button');
        const originalHTML = btn.innerHTML;
        btn.innerHTML = '<i class="fas fa-check"></i> Copied!';
        btn.style.backgroundColor = '#10b981';
        
        setTimeout(() => {
            btn.innerHTML = originalHTML;
            btn.style.backgroundColor = '';
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy:', err);
        alert('Failed to copy to clipboard');
    });
}

function shareOnSocial(platform) {
    const referralLink = document.getElementById('referralLink').value;
    const couponCode = currentUser.coupon_code;
    const message = `Check out WebGemini! Use my code ${couponCode} for a discount. ${referralLink}`;
    
    let shareUrl = '';
    
    switch(platform) {
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`;
            break;
        case 'linkedin':
            shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralLink)}`;
            break;
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
    }
    
    if (shareUrl) {
        window.open(shareUrl, '_blank', 'width=600,height=400');
    }
}

function filterTable(tbodyId, searchTerm) {
    const tbody = document.getElementById(tbodyId);
    const rows = tbody.getElementsByTagName('tr');
    
    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    }
}

function logout() {
    localStorage.removeItem('authToken');
    redirectToLogin();
}

function redirectToLogin() {
    window.location.href = 'login.html';
}
