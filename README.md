# 🏥 ClinicPlus - Your Digital Healthcare Companion

Welcome to **ClinicPlus**, a modern web application that makes booking doctor appointments as easy as ordering food online! 🚀

## ✨ What is ClinicPlus?

ClinicPlus is a full-stack web application built with the MERN stack (MongoDB, Express.js, React-ready frontend, Node.js) that connects patients with healthcare providers. Think of it as "Uber for doctor appointments" - simple, fast, and reliable.

### 🌟 Key Features

- **👥 User Management**: Register as a patient or doctor with secure authentication
- **🏥 Clinic & Doctor Directory**: Browse clinics and find the right specialist for your needs
- **📅 Smart Appointment Booking**: Book appointments with real-time availability
- **🔐 Secure Authentication**: JWT-based login with password reset via OTP
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔔 Smart Notifications**: Get reminders for upcoming appointments
- **👨‍⚕️ Doctor Dashboard**: Complete profile management for healthcare providers

## 🚀 Getting Started

### Prerequisites

Before you dive in, make sure you have these installed:
- **Node.js** (version 14 or higher)
- **MongoDB Atlas account** (or local MongoDB)
- **Gmail account** (for password reset emails)
- **Git** (for version control)

### 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ClinicPlus.git
   cd ClinicPlus
   ```

2. **Install server dependencies**
   ```bash
   cd server
   npm install
   ```

3. **Set up environment variables**
   ```bash
   node setup-env.js
   ```
   
   Then edit the `.env` file with your actual credentials:
   ```env
   MONGO_URI=your-mongodb-atlas-connection-string
   JWT_SECRET=your-super-secret-jwt-key
   EMAIL_USER=your-gmail@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open the frontend**
   - Navigate to the `client` folder
   - Open `index.html` in your browser
   - Or serve it using a local server

## 🔧 Configuration Guide

### 📧 Email Setup (Required for Password Reset)

To enable the "Forgot Password" feature, you need to configure Gmail:

1. **Enable 2-Step Verification** on your Google Account
2. **Generate an App Password**:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other"
   - Copy the 16-character password
3. **Update your .env file** with the credentials

### 🗄️ Database Setup

1. **MongoDB Atlas** (Recommended):
   - Create a free cluster at [mongodb.com](https://mongodb.com)
   - Get your connection string
   - Update `MONGO_URI` in your `.env` file

2. **Local MongoDB** (Alternative):
   - Install MongoDB locally
   - Use `mongodb://localhost:27017/clinicplus`

## 🎯 How to Use

### 👤 For Patients

1. **Register/Login**: Create an account or sign in
2. **Browse Clinics**: View available healthcare facilities
3. **Find Doctors**: Search by specialization and clinic
4. **Book Appointments**: Choose your preferred time slot
5. **Manage Bookings**: View, cancel, or reschedule appointments

### 👨‍⚕️ For Doctors

1. **Complete Profile**: Add specialization, experience, and contact info
2. **Set Availability**: Define your working hours
3. **View Appointments**: See your patient schedule
4. **Manage Information**: Update your profile and clinic details

### 🔐 Forgot Password?

1. Click "Forgot Password?" on the login page
2. Enter your registered email address
3. Check your email for the 6-digit OTP
4. Enter the OTP and set a new password
5. Done! 🎉

## 🛠️ Project Structure

```
ClinicPlus/
├── 📁 client/                 # Frontend (HTML, CSS, JavaScript)
│   ├── 📄 index.html         # Landing page
│   ├── 📄 login.html         # Login form
│   ├── 📄 register.html      # Registration form
│   ├── 📄 dashboard.html     # User dashboard
│   ├── 📄 appointments.html  # Appointment booking
│   ├── 📄 forgot-password.html # Password reset
│   └── 📄 styles.css         # Main stylesheet
├── 📁 server/                 # Backend (Node.js + Express)
│   ├── 📁 models/            # Database models
│   ├── 📁 routes/            # API endpoints
│   ├── 📁 middleware/        # Authentication middleware
│   ├── 📄 server.js          # Main server file
│   └── 📄 .env               # Environment variables
└── 📄 README.md              # This file
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Clinics
- `GET /api/clinics` - List all clinics
- `POST /api/clinics` - Create new clinic (Admin only)
- `PUT /api/clinics/:id` - Update clinic (Admin only)
- `DELETE /api/clinics/:id` - Delete clinic (Admin only)

### Doctors
- `GET /api/doctors` - List all doctors
- `GET /api/doctors/user/:userId` - Get doctor by user ID
- `POST /api/doctors` - Create doctor profile (Admin only)
- `PUT /api/doctors/:id` - Update doctor profile (Admin only)
- `DELETE /api/doctors/:id` - Delete doctor (Admin only)

### Appointments
- `GET /api/appointments/my` - Get user's appointments
- `POST /api/appointments` - Book new appointment
- `PUT /api/appointments/:id` - Update appointment status

## 🎨 Customization

### Styling
- Edit `client/styles.css` to change colors, fonts, and layout
- The app uses a modern, clean design with blue (#2563eb) as the primary color
- Responsive design that works on all screen sizes

### Features
- Add new specializations in `client/register.html`
- Modify appointment duration in the booking logic
- Customize email templates in `server/routes/auth.js`

## 🐛 Troubleshooting

### Common Issues

**"Failed to send OTP"**
- Check your Gmail credentials in `.env`
- Ensure 2-Step Verification is enabled
- Verify your App Password is correct

**"Cannot connect to database"**
- Check your MongoDB connection string
- Ensure your IP is whitelisted in MongoDB Atlas
- Verify network connectivity

**"Appointment not booking"**
- Check if the time slot is available
- Ensure you're logged in
- Check browser console for errors

### Debug Mode

To see detailed logs, add this to your server:
```javascript
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { /* your credentials */ },
    debug: true,
    logger: true
});
```

## 🚀 Deployment

### Frontend
- Host on Netlify, Vercel, or any static hosting service
- Update API URLs to point to your production backend

### Backend
- Deploy to Heroku, Railway, or any Node.js hosting service
- Set environment variables in your hosting platform
- Ensure CORS is configured for your frontend domain

## 🚆 Deploying to Railway

Railway can host your Node.js API and serve the static client. This repo is already structured for that.

### 1) Add root package.json (at project root)
Create a file named `package.json` in the repository root with:

```json
{
  "name": "clinicplus",
  "private": true,
  "scripts": {
    "start": "node server/server.js",
    "postinstall": "cd server && npm install"
  },
  "engines": {
    "node": ">=18"
  }
}
```

This ensures Railway runs `npm start` from the root and installs server deps automatically.

### 2) Environment Variables on Railway
Configure these in the Railway project settings (Variables):
- `MONGO_URI`
- `JWT_SECRET`
- `EMAIL_USER`
- `EMAIL_PASS`
- `PORT` (Railway sets this automatically; your server already reads `process.env.PORT`)

### 3) Static Client + API
- The Express server serves files from `client/` and falls back to `index.html` for non-API routes
- All frontend fetch calls now use relative paths like `/api/...` so they work on Railway without changes

### 4) Deploy Steps
- Push your repo to GitHub
- Create a new Railway project → Deploy from GitHub
- Set environment variables
- Deploy and open the Railway URL

If you need a custom domain, add it in Railway’s domain settings and point your DNS accordingly.

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Commit your changes**: `git commit -m 'Add amazing feature'`
4. **Push to the branch**: `git push origin feature/amazing-feature`
5. **Open a Pull Request**

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Font Awesome** for beautiful icons
- **Google Fonts** for the Inter font family
- **MongoDB Atlas** for the database service
- **Nodemailer** for email functionality

## 📞 Support

Having trouble? Here are some ways to get help:

- **Check the issues** on GitHub
- **Create a new issue** with detailed description
- **Email us** at support@clinicplus.com (if configured)

---

## 🎉 You're All Set!

Congratulations! You now have a fully functional healthcare appointment booking system. 

**Next steps:**
1. Test all features thoroughly
2. Customize the design to match your brand
3. Deploy to production
4. Share with your users!

Happy coding! 🚀💻

---

*Built with ❤️ for better healthcare accessibility*