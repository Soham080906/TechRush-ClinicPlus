const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '.env');

// Check if .env file already exists
if (fs.existsSync(envPath)) {
  console.log('✅ .env file already exists');
  process.exit(0);
}

// Create .env file with default values
const envContent = `# MongoDB Connection String
# Replace with your actual MongoDB URI
MONGO_URI=mongodb://localhost:27017/clinicplus

# JWT Secret Key (change this in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Server Port
PORT=5000

# Environment
NODE_ENV=development
`;

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env file created successfully!');
  console.log('📝 Please update the MONGO_URI with your actual MongoDB connection string');
  console.log('🔑 You can change the JWT_SECRET to any secure random string');
} catch (error) {
  console.error('❌ Error creating .env file:', error);
  process.exit(1);
} 