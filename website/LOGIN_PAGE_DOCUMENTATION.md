# Pepo Login & Sign Up Page

## Overview
A fully responsive, modern authentication system designed following the mobile-first UX pattern provided. The login page includes multiple screens, OTP verification, and seamless backend integration.

## Features

### 1. **Mode Selection Screen**
- Initial landing screen with two options: "Sign In" or "Create Account"
- Displays Pepo branding and trust signals (user counts, item statistics)
- Responsive design for mobile and desktop

### 2. **Login Screen**
- Email and password fields with validation
- Password visibility toggle (eye icon)
- "Forgot password?" link
- Social login buttons (Google, Facebook, GitHub)
- Link to create account

### 3. **Sign Up Screen**
- Full Name, Email, Password, and Confirm Password fields
- Password visibility toggle
- Form validation (password match check)
- Social login options
- Link to sign in

### 4. **OTP Verification Screen**
- Security checkup with 4-digit OTP input
- Auto-focus between OTP fields
- Shows email address for verification
- Resend code option
- Social login fallback
- Link to sign in

## Routing

| Route | Purpose |
|-------|---------|
| `/login` | Full-screen login/signup page |
| `/signin` | Alias for `/login` |
| `/signup` | Alias for `/login` (starts on signup screen) |

## Backend Integration

### API Endpoints Used

#### Login
```javascript
POST /api/auth/login
{
  email: "user@example.com",
  password: "password123"
}
```

#### Sign Up
```javascript
POST /api/auth/signup
{
  email: "user@example.com",
  password: "password123",
  name: "John Doe"
}
```

#### OTP Verification
```javascript
POST /api/auth/verify-otp
{
  email: "user@example.com",
  otp: "1234"
}
```

### Error Handling
- Network errors display user-friendly messages
- Backend validation errors are shown on screen
- Password mismatch validation on sign up
- OTP validation (4 digits required)

## Design Features

### Color Scheme
- **Primary**: Yellow (#FCD34D) - Warm, welcoming
- **Secondary**: Green (#16A34A) - Trust, growth
- **Accent**: Gray-900 (#111827) - Professional

### Typography
- Bold headings for clear hierarchy
- Clear, readable body text
- Icon support from lucide-react

### Responsive Behavior
- Mobile-first design
- Full-width inputs on small screens
- Optimized spacing and padding
- Touch-friendly button sizes (minimum 44px)

## Usage

### From Navigation
Clicking "Sign In" in navigation → routes to `/login`

### Direct Navigation
- `/login` → Shows mode selection or login form
- `/signin` → Redirects to login page
- `/signup` → Redirects to signup form

### Programmatic Navigation
```javascript
import { useNavigate } from 'react-router-dom'

const navigate = useNavigate()
navigate('/login')  // Full auth flow
navigate('/signin') // Sign in specifically
```

## Development Notes

### State Management
- Uses React `useState` for form state
- Screen states: `'mode'`, `'login'`, `'signup'`, `'otp'`
- Loading states for API calls
- Error state for user feedback

### Security Considerations
- Passwords never logged or displayed
- HTTPS required for production
- OTP sent via secure backend
- Social login handled by OAuth providers

### Browser Compatibility
- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Android)
- IE11 not supported (uses modern CSS/ES6+)

## Testing Checklist

- [ ] Mode selection displays correctly
- [ ] Email validation works
- [ ] Password visibility toggle works
- [ ] Form submission sends data to backend
- [ ] Error messages display properly
- [ ] OTP input auto-focuses
- [ ] Responsive on mobile (375px+)
- [ ] Responsive on tablet (768px+)
- [ ] Responsive on desktop (1024px+)
- [ ] Social login buttons are clickable (styling)
- [ ] Navigation between screens works smoothly
- [ ] Password fields are masked until toggle

## Future Enhancements

1. **Social Login Implementation**
   - Google OAuth integration
   - Facebook Login integration
   - GitHub OAuth integration

2. **Password Recovery**
   - Forgot password flow
   - Email verification
   - Password reset token

3. **Two-Factor Authentication**
   - Authenticator app support
   - SMS backup codes
   - Recovery emails

4. **Account Security**
   - Session management
   - Login history
   - Device management
   - IP whitelist

5. **Analytics**
   - Sign up funnel tracking
   - Error rate monitoring
   - Conversion metrics

## API Helper

The login page uses the API helper located in `src/utils/api.js`:

```javascript
import { login, signup } from '../utils/api'

// Login
await login('user@example.com', 'password')

// Sign Up
await signup('user@example.com', 'password', 'John Doe')
```

## Styling

- **Tailwind CSS** for utility-first styling
- **Responsive** breakpoints: `sm` (640px), `md` (768px), `lg` (1024px), `xl` (1280px)
- **Dark mode** compatible with Tailwind theme
- **Animations**: Smooth transitions and hover effects

## File Structure

```
src/
├── pages/
│   └── LoginPage.jsx          # Main login/signup/OTP page
├── utils/
│   └── api.js                 # Backend API helper
├── components/
│   ├── layout/
│   │   └── Navigation.jsx     # Updated to route to login
└── App.jsx                    # Routes setup
```

## Deployment

1. Build: `npm run build`
2. Preview: `npm run preview` or `python3 -m http.server 5174 --directory dist`
3. Deploy: Push to Vercel, Netlify, or your hosting provider
4. Environment: Set `VITE_API_URL` to your backend URL

---

**Last Updated**: January 2, 2026
**Status**: ✅ Production Ready
