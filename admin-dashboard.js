// Admin Dashboard JavaScript
// API Configuration - Points to Render backend
const API_BASE_URL = 'https://webgemini-affiliate-backend.onrender.com/api';

console.log('Admin Dashboard using API:', API_BASE_URL);
let authToken = null;

// Check authentication on page load
document.addEventListener('DOMContentLoaded', () => {
    authToken = localStorage.getItem('authToken');
    
    // Clear any old mock data
    localStorage.removeItem('mockUser');
    
    if (!authToken || authToken.startsWith('mock-')) {
        redirectToLogin();
        return;
    }

    // Verify token and load admin info
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
        loadClients(),
        loadAnalytics()
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
                tbody.innerHTML = '<tr><td colspan="8" class="no-data">No affiliates found</td></tr>';
                return;
            }

            tbody.innerHTML = data.affiliates.map(affiliate => `
                <tr data-affiliate-id="${affiliate.id}">
                    <td>${affiliate.id}</td>
                    <td>${affiliate.full_name}</td>
                    <td>${affiliate.email}</td>
                    <td>${affiliate.username}</td>
                    <td><span class="coupon-badge">${affiliate.coupon_code}</span></td>
                    <td><span class="status-badge ${affiliate.status}">${affiliate.status}</span></td>
                    <td>${new Date(affiliate.created_at).toLocaleDateString()}</td>
                    <td class="action-buttons">
                        ${affiliate.status === 'active' ? 
                            `<button class="btn-archive" onclick="archiveAffiliate(${affiliate.id})" title="Archive">
                                <i class="fas fa-archive"></i>
                            </button>` :
                            `<button class="btn-activate" onclick="activateAffiliate(${affiliate.id})" title="Activate">
                                <i class="fas fa-check"></i>
                            </button>`
                        }
                        <button class="btn-delete" onclick="deleteAffiliate(${affiliate.id}, '${affiliate.username}')" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (error) {
        console.error('Error loading affiliates:', error);
        document.getElementById('affiliatesTableBody').innerHTML = 
            '<tr><td colspan="8" class="error">Error loading affiliates</td></tr>';
    }
}

async function loadClients() {
    try {
        console.log('Fetching clients from:', `${API_BASE_URL}/affiliates/admin/clients`);
        
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients`, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        console.log('Response status:', response.status);
        
        if (!response.ok) {
            const errorText = await response.text();
            console.error('Server error:', errorText);
            throw new Error(`Server returned ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Clients data received:', data);

        if (!data.success) {
            throw new Error(data.message || 'Failed to load clients');
        }

        if (data.success) {
            const tbody = document.getElementById('clientsTableBody');
            const commissionsBody = document.getElementById('commissionsTableBody');
            
            if (data.clients.length === 0) {
                tbody.innerHTML = '<tr><td colspan="11" class="no-data">No clients found</td></tr>';
                commissionsBody.innerHTML = '<tr><td colspan="8" class="no-data">No commissions found</td></tr>';
                return;
            }

            // Populate clients table
            tbody.innerHTML = data.clients.map(client => {
                const clientStatus = client.status || 'active';
                const isPaid = clientStatus === 'paid';
                
                return `
                <tr data-client-id="${client.id}">
                    <td>${client.id}</td>
                    <td>${client.name}</td>
                    <td>${client.email}</td>
                    <td>${client.plan_type}</td>
                    <td>R${client.plan_price.toFixed(2)}</td>
                    <td>${client.affiliate_name || 'N/A'}</td>
                    <td>${client.coupon_code ? `<span class="coupon-badge">${client.coupon_code}</span>` : 'N/A'}</td>
                    <td>${client.commission_amount ? `R${client.commission_amount.toFixed(2)}` : 'N/A'}</td>
                    <td>${new Date(client.signup_date).toLocaleDateString()}</td>
                    <td><span class="status-badge ${clientStatus}">${clientStatus}</span></td>
                    <td class="action-buttons">
                        ${!isPaid && clientStatus === 'active' ? 
                            `<button class="btn-paid" onclick="markClientAsPaid(${client.id}, '${client.name}')" title="Mark as Paid">
                                <i class="fas fa-money-check-alt"></i>
                            </button>` : ''
                        }
                        ${clientStatus === 'active' ? 
                            `<button class="btn-archive" onclick="archiveClient(${client.id})" title="Archive">
                                <i class="fas fa-archive"></i>
                            </button>` :
                            !isPaid ? `<button class="btn-activate" onclick="activateClient(${client.id})" title="Activate">
                                <i class="fas fa-check"></i>
                            </button>` : ''
                        }
                        ${!isPaid ? 
                            `<button class="btn-delete" onclick="deleteClient(${client.id}, '${client.name}')" title="Delete">
                                <i class="fas fa-trash"></i>
                            </button>` : ''
                        }
                    </td>
                </tr>
            `}).join('');

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
        const tbody = document.getElementById('clientsTableBody');
        tbody.innerHTML = `<tr><td colspan="11" class="error">Error loading clients: ${error.message}</td></tr>`;
        
        // Also show error in commissions table
        const commissionsBody = document.getElementById('commissionsTableBody');
        if (commissionsBody) {
            commissionsBody.innerHTML = `<tr><td colspan="8" class="error">Error loading commissions</td></tr>`;
        }
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

// Load Analytics Data
let signupChart = null;

async function loadAnalytics() {
    try {
        const [clientsData, affiliatesData] = await Promise.all([
            fetch(`${API_BASE_URL}/affiliates/admin/clients`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).then(res => res.json()),
            fetch(`${API_BASE_URL}/affiliates/all`, {
                headers: { 'Authorization': `Bearer ${authToken}` }
            }).then(res => res.json())
        ]);

        if (clientsData.success && affiliatesData.success) {
            const clients = clientsData.clients;
            const affiliates = affiliatesData.affiliates;

            // Load all analytics sections
            loadTopPerformers(clients, affiliates);
            loadSignupTrends(clients);
            loadPlanDistribution(clients);
            loadReferralActivity(clients);
            loadRevenueTrends(clients);
        }
    } catch (error) {
        console.error('Error loading analytics:', error);
    }
}

function loadTopPerformers(clients, affiliates) {
    const affiliateStats = {};

    // Calculate stats for each affiliate
    affiliates.forEach(aff => {
        affiliateStats[aff.id] = {
            name: aff.full_name,
            username: aff.username,
            referrals: 0,
            earnings: 0
        };
    });

    clients.forEach(client => {
        if (client.affiliate_id && affiliateStats[client.affiliate_id]) {
            affiliateStats[client.affiliate_id].referrals++;
            affiliateStats[client.affiliate_id].earnings += client.commission_amount || 0;
        }
    });

    // Sort by earnings
    const topPerformers = Object.values(affiliateStats)
        .filter(aff => aff.referrals > 0)
        .sort((a, b) => b.earnings - a.earnings)
        .slice(0, 5);

    const tbody = document.getElementById('topPerformersBody');
    
    if (topPerformers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="no-data">No affiliate activity yet</td></tr>';
        return;
    }

    tbody.innerHTML = topPerformers.map((aff, index) => `
        <tr>
            <td><span style="font-weight: 700; color: ${index === 0 ? '#f59e0b' : '#64748b'}">#${index + 1}</span></td>
            <td>${aff.name}</td>
            <td>${aff.referrals}</td>
            <td>R${aff.earnings.toFixed(2)}</td>
            <td>${aff.referrals > 0 ? '100%' : '0%'}</td>
        </tr>
    `).join('');
}

function loadSignupTrends(clients) {
    // Get last 30 days of data
    const today = new Date();
    const last30Days = [];
    const signupCounts = {};

    // Initialize all 30 days
    for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last30Days.push(dateStr);
        signupCounts[dateStr] = 0;
    }

    // Count signups per day
    clients.forEach(client => {
        const signupDate = new Date(client.signup_date).toISOString().split('T')[0];
        if (signupCounts.hasOwnProperty(signupDate)) {
            signupCounts[signupDate]++;
        }
    });

    const counts = last30Days.map(date => signupCounts[date]);
    const labels = last30Days.map(date => {
        const d = new Date(date);
        return `${d.getMonth() + 1}/${d.getDate()}`;
    });

    // Destroy existing chart if it exists
    if (signupChart) {
        signupChart.destroy();
    }

    const ctx = document.getElementById('signupCanvas').getContext('2d');
    signupChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Client Signups',
                data: counts,
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    }
                }
            }
        }
    });
}

function loadPlanDistribution(clients) {
    const planCounts = {
        'Starter': 0,
        'Professional': 0,
        'Enterprise': 0
    };

    clients.forEach(client => {
        if (planCounts.hasOwnProperty(client.plan_type)) {
            planCounts[client.plan_type]++;
        }
    });

    const total = clients.length || 1;
    
    // Update bars
    document.getElementById('starterCount').textContent = planCounts.Starter;
    document.getElementById('starterBar').style.width = `${(planCounts.Starter / total) * 100}%`;
    
    document.getElementById('professionalCount').textContent = planCounts.Professional;
    document.getElementById('professionalBar').style.width = `${(planCounts.Professional / total) * 100}%`;
    
    document.getElementById('enterpriseCount').textContent = planCounts.Enterprise;
    document.getElementById('enterpriseBar').style.width = `${(planCounts.Enterprise / total) * 100}%`;
}

function loadReferralActivity(clients) {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 7);
    
    const monthAgo = new Date(today);
    monthAgo.setMonth(monthAgo.getMonth() - 1);

    let dailyCount = 0;
    let weeklyCount = 0;
    let monthlyCount = 0;

    clients.forEach(client => {
        const signupDate = new Date(client.signup_date);
        
        if (signupDate.toISOString().split('T')[0] === todayStr) {
            dailyCount++;
        }
        if (signupDate >= weekAgo) {
            weeklyCount++;
        }
        if (signupDate >= monthAgo) {
            monthlyCount++;
        }
    });

    document.getElementById('dailyReferrals').textContent = dailyCount;
    document.getElementById('weeklyReferrals').textContent = weeklyCount;
    document.getElementById('monthlyReferrals').textContent = monthlyCount;
}

function loadRevenueTrends(clients) {
    if (clients.length === 0) {
        document.getElementById('avgDealValue').textContent = 'R0.00';
        document.getElementById('avgCommissionRate').textContent = '0%';
        document.getElementById('growthRate').textContent = '0%';
        return;
    }

    // Average deal value
    const totalRevenue = clients.reduce((sum, c) => sum + c.plan_price, 0);
    const avgDeal = totalRevenue / clients.length;
    document.getElementById('avgDealValue').textContent = `R${avgDeal.toFixed(2)}`;

    // Average commission rate
    const totalCommissions = clients.reduce((sum, c) => sum + (c.commission_amount || 0), 0);
    const avgCommission = (totalCommissions / totalRevenue) * 100;
    document.getElementById('avgCommissionRate').textContent = `${avgCommission.toFixed(1)}%`;

    // Growth rate (compare last 15 days vs previous 15 days)
    const today = new Date();
    const fifteenDaysAgo = new Date(today);
    fifteenDaysAgo.setDate(fifteenDaysAgo.getDate() - 15);
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentClients = clients.filter(c => new Date(c.signup_date) >= fifteenDaysAgo).length;
    const previousClients = clients.filter(c => {
        const date = new Date(c.signup_date);
        return date >= thirtyDaysAgo && date < fifteenDaysAgo;
    }).length;

    const growth = previousClients > 0 ? ((recentClients - previousClients) / previousClients) * 100 : 0;
    document.getElementById('growthRate').textContent = `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
}

// Archive/Activate/Delete Affiliate Functions
async function archiveAffiliate(affiliateId) {
    if (!confirm('Are you sure you want to archive this affiliate? They will no longer be able to access their dashboard.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/affiliates/${affiliateId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'archived' })
        });

        const data = await response.json();

        if (data.success) {
            alert('Affiliate archived successfully');
            loadAffiliates(); // Reload the table
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error archiving affiliate:', error);
        alert('Failed to archive affiliate. Please try again.');
    }
}

async function activateAffiliate(affiliateId) {
    if (!confirm('Are you sure you want to reactivate this affiliate?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/affiliates/${affiliateId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'active' })
        });

        const data = await response.json();

        if (data.success) {
            alert('Affiliate activated successfully');
            loadAffiliates(); // Reload the table
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error activating affiliate:', error);
        alert('Failed to activate affiliate. Please try again.');
    }
}

async function deleteAffiliate(affiliateId, username) {
    if (!confirm(`⚠️ WARNING: This will permanently delete affiliate "${username}" and all their associated data (commissions, referrals, etc.).\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`)) {
        return;
    }

    // Double confirmation for delete
    if (!confirm('Please confirm one more time: Delete this affiliate permanently?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/affiliates/${affiliateId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('Affiliate deleted successfully');
            loadDashboardData(); // Reload all data including stats
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting affiliate:', error);
        alert('Failed to delete affiliate. Please try again.');
    }
}

// Archive/Activate/Delete Client Functions
async function markClientAsPaid(clientId, clientName) {
    if (!confirm(`Mark client "${clientName}" as PAID?\n\nThis will:\n- Change client status to "paid"\n- Mark affiliate commission as "paid"\n- Update affiliate's earnings\n\nContinue?`)) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}/mark-paid`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('✅ Client marked as paid! Affiliate commission has been updated.');
            loadDashboardData(); // Reload all data including stats
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error marking client as paid:', error);
        alert('Failed to mark client as paid. Please try again.');
    }
}

async function archiveClient(clientId) {
    if (!confirm('Are you sure you want to archive this client? Their data will be preserved but marked as archived.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'archived' })
        });

        const data = await response.json();

        if (data.success) {
            alert('Client archived successfully');
            loadClients(); // Reload the table
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error archiving client:', error);
        alert('Failed to archive client. Please try again.');
    }
}

async function activateClient(clientId) {
    if (!confirm('Are you sure you want to reactivate this client?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}/status`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${authToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'active' })
        });

        const data = await response.json();

        if (data.success) {
            alert('Client activated successfully');
            loadClients(); // Reload the table
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error activating client:', error);
        alert('Failed to activate client. Please try again.');
    }
}

async function deleteClient(clientId, clientName) {
    if (!confirm(`⚠️ WARNING: This will permanently delete client "${clientName}" and all their associated data (commissions, referrals, etc.).\n\nThis action CANNOT be undone!\n\nAre you absolutely sure?`)) {
        return;
    }

    // Double confirmation for delete
    if (!confirm('Please confirm one more time: Delete this client permanently?')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        });

        const data = await response.json();

        if (data.success) {
            alert('Client deleted successfully');
            loadDashboardData(); // Reload all data including stats
        } else {
            alert(`Error: ${data.message}`);
        }
    } catch (error) {
        console.error('Error deleting client:', error);
        alert('Failed to delete client. Please try again.');
    }
}

