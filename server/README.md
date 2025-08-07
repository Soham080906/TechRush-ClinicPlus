# ClinicPlus Backend Server

## Setup Instructions

### 1. Install Dependencies
```bash
npm install
```

### 2. Create Environment File
Run the setup script to create the `.env` file:
```bash
npm run setup
```

Or manually create a `.env` file in the server directory with:
```
MONGO_URI=mongodb://localhost:27017/clinicplus
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=5000
NODE_ENV=development
```

### 3. Update MongoDB URI
Replace the `MONGO_URI` in the `.env` file with your actual MongoDB connection string:
- For local MongoDB: `mongodb://localhost:27017/clinicplus`
- For MongoDB Atlas: `mongodb+srv://username:password@cluster.mongodb.net/clinicplus`

### 4. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user (supports doctor registration)
- `POST /api/auth/login` - Login user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update user profile
- `DELETE /api/users/profile` - Delete user account
- `GET /api/users/stats` - Get user statistics

### Clinics
- `GET /api/clinics` - Get all clinics
- `GET /api/clinics/:id` - Get clinic by ID
- `POST /api/clinics` - Add new clinic
- `PUT /api/clinics/:id` - Update clinic
- `DELETE /api/clinics/:id` - Delete clinic

### Doctors
- `GET /api/doctors` - Get all doctors
- `GET /api/doctors/:id` - Get doctor by ID
- `POST /api/doctors` - Add new doctor
- `PUT /api/doctors/:id` - Update doctor
- `GET /api/doctors/user/:userId` - Get doctor by user ID
- `PUT /api/doctors/profile/me` - Update doctor's own profile
- `PUT /api/doctors/:id/slots` - Update doctor's available slots
- `GET /api/doctors/:id/slots` - Get doctor's available slots

### Appointments
- `GET /api/appointments/my` - Get user's appointments
- `POST /api/appointments` - Book appointment
- `GET /api/appointments/doctor/:doctorId` - Get appointments for a doctor
- `PUT /api/appointments/:id` - Update appointment status
- `DELETE /api/appointments/:id` - Cancel appointment

## Features

### Enhanced Doctor Registration
- When a user registers as a doctor, a doctor profile is automatically created
- Doctor profiles include: specialization, license number, experience, education, phone
- Doctors can be assigned to clinics during registration

### Role-Based Dashboard
- Different interfaces for doctors and patients
- Doctors can view their profile and patient appointments
- Patients can book appointments and view their schedule

### Appointment Management
- Full CRUD operations for appointments
- Status tracking (booked, completed, cancelled)
- Notes support for appointments
- Conflict detection for booking slots

### User Profile Management
- Users can update their basic information
- Password change with current password verification
- Account deletion with cleanup

## Data Models

### User
- `name`, `email`, `password`, `role` (patient/doctor)

### Doctor
- `name`, `specialization`, `clinic` (ref), `user` (ref)
- `licenseNumber`, `experience`, `education`, `phone`
- `availableSlots` (array of dates), `isActive`

### Clinic
- `name`, `location`

### Appointment
- `patient` (ref), `doctor` (ref), `clinic` (ref)
- `slot` (date), `notes`, `status`
- `createdAt`, `updatedAt`

## Troubleshooting

### Common Issues:

1. **"JWT_SECRET environment variable is required"**
   - Make sure you have a `.env` file with `JWT_SECRET`

2. **"MongoDB connection error"**
   - Check your `MONGO_URI` in the `.env` file
   - Ensure MongoDB is running

3. **"Login failed"**
   - Check if the user exists in the database
   - Verify the password is correct
   - Check server logs for detailed error messages

4. **CORS errors**
   - The server includes CORS middleware
   - Make sure frontend is calling the correct URL

5. **Doctor registration issues**
   - Ensure all required doctor fields are provided
   - Check if the clinic ID is valid

### Health Check
Test if the server is running:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"status":"OK","message":"Server is running"}`

## Development

### Adding New Features
1. Create/update models in `models/` directory
2. Add routes in `routes/` directory
3. Update server.js to include new routes
4. Test with frontend integration

### Database Seeding
Use the provided doctor data examples to populate your database:
```bash
# Insert clinics first, then doctors with valid clinic ObjectIds
```

### Environment Variables
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret key for JWT tokens
- `PORT`: Server port (default: 5000)
- `NODE_ENV`: Environment (development/production) 