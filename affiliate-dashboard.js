// Affiliate Dashboard JavaScript
const API_BASE_URL = window.location.origin.includes('github.dev') 
    ? `${window.location.origin}/api`
    : 'http://localhost:3001/api';
let authToken = null;
let currentUser = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        redirectToLogin();
        return;
    }

    // Verify token and load user info
    verifyAuth();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load dashboard data
    loadDashboardData();
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
        loadReferrals()
    ]);
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
            document.getElementById('totalEarnings').textContent = `R${(stats.total_earnings || 0).toFixed(2)}`;
            document.getElementById('pendingEarnings').textContent = `R${(stats.pending_earnings || 0).toFixed(2)}`;
            document.getElementById('paidEarnings').textContent = `R${(stats.paid_earnings || 0).toFixed(2)}`;
            
            // Update earnings section
            document.getElementById('earningsTotal').textContent = `R${(stats.total_earnings || 0).toFixed(2)}`;
            document.getElementById('earningsPending').textContent = `R${(stats.pending_earnings || 0).toFixed(2)}`;
            document.getElementById('earningsPaid').textContent = `R${(stats.paid_earnings || 0).toFixed(2)}`;
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

            tbody.innerHTML = data.referrals.map(referral => `
                <tr>
                    <td>${referral.name}</td>
                    <td>${referral.email}</td>
                    <td>${referral.plan_type}</td>
                    <td>R${referral.plan_price.toFixed(2)}</td>
                    <td>${referral.commission_rate ? (referral.commission_rate * 100).toFixed(0) + '%' : 'N/A'}</td>
                    <td>R${referral.commission_amount ? referral.commission_amount.toFixed(2) : '0.00'}</td>
                    <td><span class="status-badge ${referral.commission_status}">${referral.commission_status || 'pending'}</span></td>
                    <td>${new Date(referral.signup_date).toLocaleDateString()}</td>
                </tr>
            `).join('');
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
