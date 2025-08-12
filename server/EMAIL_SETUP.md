# Email Setup for Forgot Password Feature

## Overview
The forgot password functionality uses nodemailer to send OTP emails to users. This guide explains how to configure email settings.

## Prerequisites
1. A Gmail account (or other email provider)
2. 2-Step Verification enabled on your Gmail account
3. App password generated for this application

## Gmail Setup Steps

### 1. Enable 2-Step Verification
1. Go to your Google Account settings
2. Navigate to Security
3. Enable 2-Step Verification if not already enabled

### 2. Generate App Password
1. In Security section, find "App passwords"
2. Click "App passwords"
3. Select "Mail" as the app and "Other" as device
4. Enter a name (e.g., "ClinicPlus")
5. Click "Generate"
6. Copy the 16-character password (this is your EMAIL_PASS)

### 3. Update Environment Variables
1. Copy the `.env.example` file to `.env` (if not already done)
2. Update the following variables:
   ```
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

## Alternative Email Providers

### Outlook/Hotmail
```javascript
const transporter = nodemailer.createTransporter({
    service: 'outlook',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

### Custom SMTP Server
```javascript
const transporter = nodemailer.createTransporter({
    host: 'your-smtp-server.com',
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});
```

## Testing Email Functionality

1. Start the server: `npm start`
2. Navigate to the forgot password page
3. Enter a registered email address
4. Check your email for the OTP
5. Use the OTP to reset the password

## Troubleshooting

### Common Issues

1. **Authentication failed**: Check your app password is correct
2. **Less secure app access**: Use app passwords instead
3. **Gmail blocking**: Check spam folder and Gmail security settings
4. **Port issues**: Ensure port 587 or 465 is not blocked by firewall

### Debug Mode
To see detailed email logs, add this to your server.js:
```javascript
const transporter = nodemailer.createTransporter({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    },
    debug: true,
    logger: true
});
```

## Security Notes

1. **Never commit .env files** to version control
2. **Use app passwords** instead of your main password
3. **Rotate app passwords** regularly
4. **Monitor email logs** for suspicious activity
5. **Rate limit** password reset requests in production

## Production Considerations

1. Use environment-specific email configurations
2. Implement email templates with proper branding
3. Add rate limiting for password reset requests
4. Set up email delivery monitoring
5. Consider using email service providers (SendGrid, Mailgun, etc.) for better deliverability
