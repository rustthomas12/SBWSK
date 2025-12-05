# Authentication System Documentation

## Overview

This site now includes a complete user authentication system with email verification and contact form functionality using Resend API.

## Features

### 1. User Authentication
- **Email/Password Sign Up** with email verification
- **Secure Login** with JWT tokens
- **Email Verification** via magic links
- **Session Management** with localStorage
- **Protected Routes** (optional)

### 2. Contact Forms
- Working contact form on homepage
- Emails sent to: `tom@lowlightdigital.com`
- Auto-reply confirmation to users
- Pinterest tracking for leads

## How to Use

### For Users:

1. **Sign Up**: Visit `/signup.html` to create an account
2. **Verify Email**: Check email for verification link
3. **Log In**: Visit `/login.html` to access your account
4. **Contact**: Use contact forms to reach out

### For Developers:

#### Enabling Authentication on Pages

By default, authentication is **optional**. To require login on specific pages:

1. Add the auth script to any page:
```html
<script src="js/auth.js?v=1.0.0"></script>
```

2. The auth middleware will:
   - Check if user is logged in
   - Redirect to login if not authenticated
   - Display user info in navbar
   - Handle logout

#### Public Pages (No Login Required)

The following pages are always accessible:
- `login.html`
- `signup.html`
- `verify-email.html`
- `/` (homepage)

To make other pages public, edit `js/auth.js` and add to `publicPages` array.

## API Endpoints

### Authentication

#### POST `/api/auth/signup`
Create new user account with email verification.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Account created! Please check your email to verify your account.",
  "userId": "uuid-here"
}
```

#### POST `/api/auth/login`
Authenticate user and create session.

**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "token": "jwt-token-here",
  "user": {
    "id": "uuid",
    "email": "john@example.com",
    "name": "John Doe"
  }
}
```

#### POST `/api/auth/verify-email`
Verify user email address.

**Request:**
```json
{
  "token": "verification-token"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now log in."
}
```

### Contact Form

#### POST `/api/contact`
Send contact form submission via email.

**Request:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "message": "I'd like to inquire about...",
  "phone": "555-1234", // optional
  "subject": "Custom subject" // optional
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully! We'll get back to you soon."
}
```

## Email Configuration

**Email Service**: Resend
**API Key**: Stored in environment variable `RESEND_API_KEY`
**Send From**: `noreply@smallbusinesswebsitestarterkit.com`
**Sends To**: `tom@lowlightdigital.com`

### Email Templates

1. **Verification Email**
   - Sent on signup
   - Contains magic link to verify email
   - Expires in 24 hours

2. **Contact Form Notification**
   - Sent to admin when contact form submitted
   - Includes all form data
   - Reply-to set to user's email

3. **Contact Form Confirmation**
   - Auto-reply to user
   - Confirms message received
   - Professional thank you message

## Security Features

- **Password Hashing**: SHA-256 (upgrade to bcrypt in production)
- **JWT Tokens**: 7-day expiration
- **Email Verification**: Required before login
- **Input Validation**: Email format, required fields
- **CORS Protection**: Configured on all API endpoints

## Current Limitations

⚠️ **Important**: This implementation uses in-memory storage (Map objects) which is **not suitable for production**.

### What Needs to be Upgraded:

1. **Database Integration**
   - Replace in-memory Maps with real database (MongoDB, PostgreSQL, etc.)
   - Recommended: Vercel Postgres or MongoDB Atlas

2. **Password Hashing**
   - Upgrade from SHA-256 to bcrypt or argon2
   - Add salt rounds for better security

3. **Session Storage**
   - Implement proper session management
   - Consider Redis for session storage

4. **Token Management**
   - Add token refresh mechanism
   - Implement token blacklisting for logout

## Environment Variables

Set these in Vercel project settings:

```
RESEND_API_KEY=re_iMTkYDtk_4xLwrGsBNjHTce7SzFmAVeVK
JWT_SECRET=your-secret-key-here (generate a strong secret)
```

## Testing

### Test Signup Flow:
1. Visit `/signup.html`
2. Fill in name, email, password
3. Submit form
4. Check `tom@lowlightdigital.com` for admin notification
5. Check user's email for verification link
6. Click verification link
7. Redirected to `/login.html`
8. Log in with credentials

### Test Contact Form:
1. Visit `/index.html#contact`
2. Fill in contact form
3. Submit
4. Check `tom@lowlightdigital.com` for message
5. Check sender's email for confirmation

## Pinterest Tracking

The following events are tracked:
- **Account Signup**: Lead event when user creates account
- **Email Verified**: Lead event when email is verified
- **Contact Form**: Lead event when form is submitted

## Troubleshooting

### Email Not Sending
- Check `RESEND_API_KEY` in Vercel environment variables
- Verify domain is configured in Resend dashboard
- Check Vercel function logs for errors

### User Can't Login
- Ensure email is verified first
- Check browser console for errors
- Verify localStorage has authToken

### Auth Not Working
- Ensure `js/auth.js` is loaded on the page
- Check if page is in publicPages array
- Verify JWT_SECRET is set

## Future Enhancements

Consider adding:
- Password reset functionality
- OAuth login (Google, Facebook)
- Two-factor authentication
- User profile management
- Admin dashboard
- Database integration
- Session management improvements

## Support

For authentication issues:
1. Check browser console for errors
2. Verify environment variables are set
3. Check Vercel function logs
4. Contact support at tom@lowlightdigital.com
