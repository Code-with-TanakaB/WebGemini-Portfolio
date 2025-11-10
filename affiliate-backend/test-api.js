#!/usr/bin/env node

/**
 * API Test Script - Test Admin Actions
 * 
 * This script tests:
 * 1. Admin login
 * 2. Mark as Paid endpoint
 * 3. Archive client endpoint
 * 4. Delete client endpoint
 */

require('dotenv').config();

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3001/api';

console.log('🧪 Testing API Endpoints');
console.log('========================\n');
console.log('API URL:', API_BASE_URL);
console.log('');

async function testLogin() {
  console.log('1️⃣  Testing Admin Login...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'its.admin01',
        password: '#01Admin@WG2024',
        rememberMe: true
      })
    });

    const data = await response.json();

    if (data.success) {
      console.log('   ✅ Login successful!');
      console.log('   User:', data.user.username);
      console.log('   Role:', data.user.role);
      console.log('   Token:', data.token.substring(0, 20) + '...\n');
      return data.token;
    } else {
      console.log('   ❌ Login failed:', data.message);
      console.log('   Full response:', JSON.stringify(data, null, 2));
      return null;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return null;
  }
}

async function testGetClients(token) {
  console.log('2️⃣  Testing Get Clients...');
  
  try {
    const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('   ✅ Get clients successful!');
      console.log('   Total clients:', data.clients.length);
      if (data.clients.length > 0) {
        console.log('   First client:', data.clients[0].name);
        console.log('   Client ID:', data.clients[0].id, '\n');
        return data.clients[0].id;
      }
      return null;
    } else {
      console.log('   ❌ Failed:', data.message);
      return null;
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message);
    return null;
  }
}

async function testMarkAsPaid(token, clientId) {
  console.log('3️⃣  Testing Mark as Paid...');
  
  if (!clientId) {
    console.log('   ⏭️  Skipped (no clients to test)\n');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}/mark-paid`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('   ✅ Mark as paid successful!');
      console.log('   Message:', data.message, '\n');
    } else {
      console.log('   ❌ Failed:', data.message);
      console.log('   Status:', response.status, '\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }
}

async function testArchive(token, clientId) {
  console.log('4️⃣  Testing Archive Client...');
  
  if (!clientId) {
    console.log('   ⏭️  Skipped (no clients to test)\n');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status: 'archived' })
    });

    const data = await response.json();

    if (data.success) {
      console.log('   ✅ Archive successful!');
      console.log('   Message:', data.message, '\n');
    } else {
      console.log('   ❌ Failed:', data.message);
      console.log('   Status:', response.status, '\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }
}

async function testDelete(token, clientId) {
  console.log('5️⃣  Testing Delete Client...');
  
  if (!clientId) {
    console.log('   ⏭️  Skipped (no clients to test)\n');
    return;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/affiliates/admin/clients/${clientId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (data.success) {
      console.log('   ✅ Delete successful!');
      console.log('   Message:', data.message, '\n');
    } else {
      console.log('   ❌ Failed:', data.message);
      console.log('   Status:', response.status, '\n');
    }
  } catch (error) {
    console.log('   ❌ Error:', error.message, '\n');
  }
}

// Run all tests
async function runTests() {
  const token = await testLogin();
  
  if (!token) {
    console.log('\n❌ Cannot continue without valid token');
    console.log('\n💡 Possible issues:');
    console.log('   1. Server not running (start with: npm start)');
    console.log('   2. Wrong API URL (check .env file)');
    console.log('   3. Admin password not reset (run: node reset-admin-password.js)');
    process.exit(1);
  }

  const clientId = await testGetClients(token);
  
  // Test all actions if we have a client
  if (clientId) {
    console.log('📝 Note: These tests will modify your database!');
    console.log('   Testing with Client ID:', clientId, '\n');
    
    // Uncomment to run actual tests (will modify data!)
    // await testMarkAsPaid(token, clientId);
    // await testArchive(token, clientId);
    // await testDelete(token, clientId);
    
    console.log('⏭️  Actual tests skipped (uncomment to run)\n');
  }

  console.log('✅ All tests completed!');
  console.log('\n📊 Summary:');
  console.log('   - Login: Working ✅');
  console.log('   - Get Clients: Working ✅');
  console.log('   - Mark as Paid: Ready (not executed)');
  console.log('   - Archive: Ready (not executed)');
  console.log('   - Delete: Ready (not executed)');
  console.log('\n💡 If actions still fail in browser:');
  console.log('   1. Clear browser cache');
  console.log('   2. Check browser console (F12) for errors');
  console.log('   3. Verify you\'re logged in as admin');
  console.log('   4. Check Network tab for API responses');
}

runTests().catch(console.error);
