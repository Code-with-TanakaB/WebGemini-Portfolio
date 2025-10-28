// Admin Dashboard JavaScript
// API Configuration - Auto-detects environment
const API_BASE_URL = (() => {
    // If on localhost/Codespaces, use local backend
    if (window.location.hostname === 'localhost' || 
        window.location.hostname.includes('github.dev')) {
        return 'http://localhost:3001/api';
    }
    
    // Production: Render deployment URL
    // TODO: Replace with your actual Render URL after deployment
    return 'https://webgemini-affiliate-backend.onrender.com/api';
})();

console.log('Admin Dashboard using API:', API_BASE_URL);
let authToken = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    
    if (!authToken) {
        redirectToLogin();
        return;
    }

    // Verify token and check if user is admin
    verifyAuth();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data
    loadDashboardData();
});

function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);
        });
    });

    // Refresh button
    document.getElementById('refreshBtn').addEventListener('click', () => {
        loadDashboardData();
    });

    // Logout button
    document.getElementById('logoutBtn').addEventListener('click', logout);

    // Add affiliate button
    document.getElementById('addAffiliateBtn').addEventListener('click', () => {
        document.getElementById('addAffiliateModal').style.display = 'flex';
    });

    // Close modal
    document.getElementById('closeModal').addEventListener('click', closeModal);
    document.getElementById('cancelBtn').addEventListener('click', closeModal);

    // Add affiliate form
    document.getElementById('addAffiliateForm').addEventListener('submit', handleAddAffiliate);

    // Auto-generate coupon code from username
    document.getElementById('username').addEventListener('input', (e) => {
        const username = e.target.value;
        const nameBase = username.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
        const couponPrefix = nameBase.substring(0, 7);
        const couponCode = `${couponPrefix}@WG`;
        document.getElementById('couponCode').value = couponCode;
    });

    // Client search
    document.getElementById('clientSearch').addEventListener('input', (e) => {
        filterTable('clientsTableBody', e.target.value);
    });

    // Commission filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            const filter = e.target.dataset.filter;
            filterCommissions(filter);
        });
    });
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
    try {
        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (!data.success || data.user.role !== 'admin') {
            alert('Access denied. Admin privileges required.');
            redirectToLogin();
            return;
        }

        document.getElementById('adminName').textContent = data.user.username;
    } catch (error) {
        console.error('Auth verification failed:', error);
        redirectToLogin();
    }
}

async function loadDashboardData() {
    await Promise.all([
        loadOverviewStats(),
        loadAffiliates(),
        loadClients()
    ]);
}

async function loadOverviewStats() {
    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const stats = data.stats;
            document.getElementById('totalAffiliates').textContent = stats.total_affiliates;
            document.getElementById('totalClients').textContent = stats.total_clients;
            document.getElementById('totalRevenue').textContent = `R${stats.total_revenue.toFixed(2)}`;
            document.getElementById('totalCommissions').textContent = `R${stats.total_commissions.toFixed(2)}`;
            document.getElementById('pendingCommissions').textContent = `R${stats.pending_commissions.toFixed(2)}`;
            document.getElementById('paidCommissions').textContent = `R${stats.paid_commissions.toFixed(2)}`;
        }
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

async function loadAffiliates() {
    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/all`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('affiliatesTableBody');
            
            if (data.affiliates.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="no-data">No affiliates found</td></tr>';
                return;
            }

            tbody.innerHTML = data.affiliates.map(affiliate => `
                <tr>
                    <td>${affiliate.id}</td>
                    <td>${affiliate.full_name}</td>
                    <td>${affiliate.email}</td>
                    <td>${affiliate.username}</td>
                    <td><span class="coupon-badge">${affiliate.coupon_code}</span></td>
                    <td><span class="status-badge ${affiliate.status}">${affiliate.status}</span></td>
                    <td>${new Date(affiliate.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading affiliates:', error);
        document.getElementById('affiliatesTableBody').innerHTML = 
            '<tr><td colspan="7" class="error">Error loading affiliates</td></tr>';
    }
}

async function loadClients() {
    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            const tbody = document.getElementById('clientsTableBody');
            const commissionsBody = document.getElementById('commissionsTableBody');
            
            if (data.clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="9" class="no-data">No clients found</td></tr>';
                commissionsBody.innerHTML = '<tr><td colspan="8" class="no-data">No commissions found</td></tr>';
                return;
            }

            // Populate clients table
            tbody.innerHTML = data.clients.map(client => `
                <tr>
                    <td>${client.id}</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.plan_type}</td>
                    <td>R${client.plan_price.toFixed(2)}</td>
                    <td>${client.affiliate_name || 'N/A'}</td>
                    <td>${client.coupon_code ? `<span class="coupon-badge">${client.coupon_code}</span>` : 'N/A'}</td>
                    <td>${client.commission_amount ? `R${client.commission_amount.toFixed(2)}` : 'N/A'}</td>
                    <td>${new Date(client.signup_date).toLocaleDateString()}</td>
                </tr>
            `).join('');

            // Populate commissions table
            const clientsWithCommissions = data.clients.filter(c => c.commission_amount);
            
            if (clientsWithCommissions.length === 0) {
                commissionsBody.innerHTML = '<tr><td colspan="8" class="no-data">No commissions found</td></tr>';
                return;
            }

            commissionsBody.innerHTML = clientsWithCommissions.map(client => `
                <tr data-status="${client.commission_status}">
                    <td>${client.name}</td>
                    <td>${client.affiliate_name}</td>
                    <td>${client.plan_type}</td>
                    <td>R${client.plan_price.toFixed(2)}</td>
                    <td>${(client.commission_rate * 100).toFixed(0)}%</td>
                    <td>R${client.commission_amount.toFixed(2)}</td>
                    <td><span class="status-badge ${client.commission_status}">${client.commission_status}</span></td>
                    <td>${new Date(client.signup_date).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading clients:', error);
        document.getElementById('clientsTableBody').innerHTML = 
            '<tr><td colspan="9" class="error">Error loading clients</td></tr>';
    }
}

async function handleAddAffiliate(e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    // Validate password length
    if (password.length < 8) {
        alert('Password must be at least 8 characters');
        return;
    }

    const formData = {
        full_name: document.getElementById('fullName').value,
        username: username,
        email: document.getElementById('email').value,
        password: password,
        coupon_code: document.getElementById('couponCode').value
    };

    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (data.success) {
            alert(`Affiliate added successfully! Coupon Code: ${formData.coupon_code}`);
            closeModal();
            document.getElementById('addAffiliateForm').reset();
            document.getElementById('couponCode').value = ''; // Clear auto-generated code
            loadAffiliates();
        } else {
            alert(data.message || 'Error adding affiliate');
        }
    } catch (error) {
        console.error('Error adding affiliate:', error);
        alert('Error adding affiliate. Please try again.');
    }
}

function closeModal() {
    document.getElementById('addAffiliateModal').style.display = 'none';
}

function filterTable(tbodyId, searchTerm) {
    const tbody = document.getElementById(tbodyId);
    const rows = tbody.getElementsByTagName('tr');
    
    for (let row of rows) {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm.toLowerCase()) ? '' : 'none';
    }
}

function filterCommissions(status) {
    const tbody = document.getElementById('commissionsTableBody');
    const rows = tbody.getElementsByTagName('tr');
    
    for (let row of rows) {
        if (status === 'all') {
            row.style.display = '';
        } else {
            const rowStatus = row.dataset.status;
            row.style.display = rowStatus === status ? '' : 'none';
        }
    }
}

function logout() {
    localStorage.removeItem('authToken');
    redirectToLogin();
}

function redirectToLogin() {
    window.location.href = 'login.html';
}
