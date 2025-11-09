// Admin Dashboard JavaScript
// API Configuration - Points to Render backend
const API_BASE_URL = 'https://webgemini-portfolio.onrender.com/api';

console.log('Admin Dashboard using API:', API_BASE_URL);
let authToken = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    
    // BYPASS: Comment out authentication check for local testing
    // if (!authToken) {
    //     redirectToLogin();
    //     return;
    // }

    // BYPASS: Use mock data instead of verifying auth
    loadMockAdminData();
    
    // Set up event listeners
    setupEventListeners();
    
    // Load initial data (will use mock data)
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

// BYPASS: Mock admin data for local testing without backend
function loadMockAdminData() {
    console.log('Loading mock admin data for local testing...');
    
    const mockUser = localStorage.getItem('mockUser');
    if (mockUser) {
        const user = JSON.parse(mockUser);
        document.getElementById('adminName').textContent = user.username;
    } else {
        document.getElementById('adminName').textContent = 'Admin Demo';
    }
    
    console.log('Mock admin user loaded');
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
        // BYPASS: Use mock data if no authToken or mock token
        if (!authToken || authToken.startsWith('mock-')) {
            const mockStats = {
                total_affiliates: 8,
                total_clients: 45,
                total_revenue: 125000.00,
                total_commissions: 12500.00,
                pending_commissions: 3200.00,
                paid_commissions: 9300.00
            };
            
            document.getElementById('totalAffiliates').textContent = mockStats.total_affiliates;
            document.getElementById('totalClients').textContent = mockStats.total_clients;
            document.getElementById('totalRevenue').textContent = `R${mockStats.total_revenue.toFixed(2)}`;
            document.getElementById('totalCommissions').textContent = `R${mockStats.total_commissions.toFixed(2)}`;
            document.getElementById('pendingCommissions').textContent = `R${mockStats.pending_commissions.toFixed(2)}`;
            document.getElementById('paidCommissions').textContent = `R${mockStats.paid_commissions.toFixed(2)}`;
            
            console.log('Loaded mock overview stats:', mockStats);
            return;
        }
        
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
        // BYPASS: Use mock data if no authToken or mock token
        if (!authToken || authToken.startsWith('mock-')) {
            const mockAffiliates = [
                {
                    id: 1,
                    full_name: 'John Smith',
                    email: 'john@example.com',
                    username: 'johnsmith',
                    coupon_code: 'JOHNSMITH@WG',
                    status: 'active',
                    created_at: '2024-09-15'
                },
                {
                    id: 2,
                    full_name: 'Sarah Johnson',
                    email: 'sarah@example.com',
                    username: 'sarahj',
                    coupon_code: 'SARAHJ@WG',
                    status: 'active',
                    created_at: '2024-09-20'
                },
                {
                    id: 3,
                    full_name: 'Mike Williams',
                    email: 'mike@example.com',
                    username: 'mikew',
                    coupon_code: 'MIKEW@WG',
                    status: 'active',
                    created_at: '2024-10-01'
                },
                {
                    id: 4,
                    full_name: 'Demo Affiliate',
                    email: 'demo@example.com',
                    username: 'affiliate',
                    coupon_code: 'DEMO2024',
                    status: 'active',
                    created_at: '2024-10-15'
                }
            ];
            
            const tbody = document.getElementById('affiliatesTableBody');
            tbody.innerHTML = mockAffiliates.map(affiliate => `
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
            
            console.log('Loaded mock affiliates:', mockAffiliates.length);
            return;
        }
        
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
        // BYPASS: Use mock data if no authToken or mock token
        if (!authToken || authToken.startsWith('mock-')) {
            const mockClients = [
                {
                    id: 1,
                    name: 'Emma Davis',
                    email: 'emma@company.com',
                    plan_type: 'Premium Plan',
                    plan_price: 5000,
                    referred_by: 'JOHNSMITH@WG',
                    affiliate_name: 'John Smith',
                    commission_amount: 500,
                    commission_status: 'paid',
                    signup_date: '2024-10-10'
                },
                {
                    id: 2,
                    name: 'Robert Chen',
                    email: 'robert@startup.com',
                    plan_type: 'Standard Plan',
                    plan_price: 2000,
                    referred_by: 'SARAHJ@WG',
                    affiliate_name: 'Sarah Johnson',
                    commission_amount: 200,
                    commission_status: 'pending',
                    signup_date: '2024-10-18'
                },
                {
                    id: 3,
                    name: 'Lisa Wong',
                    email: 'lisa@business.com',
                    plan_type: 'Basic Plan',
                    plan_price: 1000,
                    referred_by: 'MIKEW@WG',
                    affiliate_name: 'Mike Williams',
                    commission_amount: 100,
                    commission_status: 'confirmed',
                    signup_date: '2024-10-22'
                },
                {
                    id: 4,
                    name: 'David Brown',
                    email: 'david@tech.com',
                    plan_type: 'Enterprise Plan',
                    plan_price: 10000,
                    referred_by: 'DEMO2024',
                    affiliate_name: 'Demo Affiliate',
                    commission_amount: 1000,
                    commission_status: 'paid',
                    signup_date: '2024-10-25'
                }
            ];
            
            const tbody = document.getElementById('clientsTableBody');
            tbody.innerHTML = mockClients.map(client => `
                <tr>
                    <td>${client.id}</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.plan_type}</td>
                    <td>R${client.plan_price.toFixed(2)}</td>
                    <td><span class="coupon-badge">${client.referred_by}</span></td>
                    <td>${client.affiliate_name}</td>
                    <td>R${client.commission_amount.toFixed(2)}</td>
                    <td><span class="status-badge ${client.commission_status}">${client.commission_status}</span></td>
                    <td>${new Date(client.signup_date).toLocaleDateString()}</td>
                </tr>
            `).join('');
            
            console.log('Loaded mock clients:', mockClients.length);
            return;
        }
        
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
