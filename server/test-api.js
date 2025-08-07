const fetch = require('node-fetch');

const BASE_URL = 'http://localhost:5000/api';

async function testAPI() {
  console.log('🧪 Testing ClinicPlus API...\n');

  try {
    // Test health endpoint
    console.log('1. Testing health endpoint...');
    const healthResponse = await fetch(`${BASE_URL}/health`);
    const healthData = await healthResponse.json();
    console.log('✅ Health check:', healthData);

    // Test clinics endpoint
    console.log('\n2. Testing clinics endpoint...');
    const clinicsResponse = await fetch(`${BASE_URL}/clinics`);
    const clinics = await clinicsResponse.json();
    console.log('✅ Clinics:', clinics.length, 'found');

    // Test doctors endpoint
    console.log('\n3. Testing doctors endpoint...');
    const doctorsResponse = await fetch(`${BASE_URL}/doctors`);
    const doctors = await doctorsResponse.json();
    console.log('✅ Doctors:', doctors.length, 'found');

    // Test registration endpoint
    console.log('\n4. Testing registration endpoint...');
    const testUser = {
      name: 'Test User',
      email: `test${Date.now()}@example.com`,
      password: 'password123',
      role: 'patient'
    };

    const registerResponse = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(testUser)
    });

    if (registerResponse.ok) {
      console.log('✅ Registration successful');
      
      // Test login
      console.log('\n5. Testing login endpoint...');
      const loginResponse = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: testUser.email,
          password: testUser.password
        })
      });

      if (loginResponse.ok) {
        const loginData = await loginResponse.json();
        console.log('✅ Login successful');
        console.log('Token received:', loginData.token ? 'Yes' : 'No');
        console.log('User role:', loginData.user.role);
      } else {
        console.log('❌ Login failed');
      }
    } else {
      console.log('❌ Registration failed');
    }

    console.log('\n🎉 API testing completed!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.log('\nMake sure the server is running on port 5000');
  }
}

// Run the test
testAPI(); 