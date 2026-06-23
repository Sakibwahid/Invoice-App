# Quick Testing Guide - New Authentication Features

## Getting Started

### Start the Development Server
```bash
npm run dev
```
The app will be available at: `http://localhost:5174/`

## Testing Scenarios

### 1. Fresh Visit (No Authentication)
**Expected Behavior**: Redirected to login page

1. Visit `http://localhost:5174/`
2. Should see beautiful glassmorphism login page
3. Check animated blob background
4. Verify blue gradient header

### 2. Create New Account (Signup Flow)

1. Click **"Create Account"** button on login page
2. Or navigate to `http://localhost:5174/signup`

**Test Form Validation**:
- Leave email field empty, try to submit → Should show "Please fill in all fields"
- Enter invalid email (no @), try to submit → Should show "Please enter a valid email address"
- Enter password less than 6 chars → Should show "Password must be at least 6 characters"
- Enter different passwords in both fields → Should show "Passwords do not match"

**Test Successful Signup**:
1. Enter valid email: `testuser@example.com`
2. Enter password: `TestPass123`
3. Confirm password: `TestPass123`
4. Click **"Create Account"**
5. Should see loading spinner with "Creating account..."
6. Should redirect to dashboard after success

### 3. Login Flow

1. From login page, enter credentials:
   - Email: `testuser@example.com`
   - Password: `TestPass123`
2. Click **"Sign In"**
3. Should see loading spinner
4. Should redirect to dashboard

**Test Error Handling**:
- Try with wrong email → Shows "Email not found"
- Try with wrong password → Shows "Incorrect password"
- Try with invalid email format → Shows "Invalid email format"

### 4. Password Visibility Toggle

On both Login and Signup pages:
1. Click eye icon in password field
2. Password should be visible as text
3. Click again to hide
4. Verify works on both password and confirm password fields

### 5. Session Management

1. Login successfully
2. Refresh the page (F5)
3. Should stay logged in (no redirect to login)
4. Should see dashboard immediately

### 6. Protected Routes

1. While logged in, open DevTools Console
2. Run: `localStorage.clear()` to simulate logout
3. Refresh page or navigate to `/invoices`
4. Should redirect to login
5. Should show loading spinner briefly

### 7. Responsive Design

**Mobile View** (375px width):
1. Press F12 to open DevTools
2. Toggle device toolbar (Ctrl+Shift+M)
3. Check iPhone 12 view
4. Verify:
   - Forms are properly sized
   - Text is readable
   - Buttons are touchable (48px+ height)
   - No horizontal scrolling

**Tablet View** (768px width):
1. Check iPad view
2. Verify card width and spacing
3. Check button sizes

**Desktop View** (1920px width):
1. Verify centered layout
2. Check maximum width constraints
3. Verify card size

### 8. Browser Compatibility

Test in multiple browsers:
- Chrome/Edge (Chromium)
- Firefox
- Safari
- Mobile browsers

### 9. Animation Testing

Verify animations work smoothly:
1. Login page should have blob animations
2. Buttons should have hover effects
3. Forms should have focus states
4. Loading spinners should rotate smoothly
5. No jank or stuttering

### 10. Accessibility Testing

1. Use Tab key to navigate form
   - Tab order should be logical
   - Email → Password → Show/Hide → Submit
2. Check color contrast:
   - Text should be readable
   - Errors should be visible
3. Test screen reader (install NVDA or JAWS trial)
   - All text should be readable
   - Buttons should be announced
   - Errors should be announced

## Performance Testing

### 1. Bundle Size Check
1. Open DevTools → Network tab
2. Refresh page
3. Look at file sizes:
   - Main bundle: ~110 KB (should be reasonable)
   - Firebase: ~350 KB (expected)
   - React Query: ~32 KB (expected)

### 2. Loading Performance
1. Open DevTools → Performance tab
2. Record page load
3. Check for:
   - Low Largest Contentful Paint (LCP)
   - Smooth animations
   - No long main thread blocking

### 3. Caching
1. Load login page
2. Check DevTools → Network tab
3. Filter by "js" files
4. Size should show "(from disk cache)" on subsequent loads

## Security Testing

### 1. Password Security
1. Inspect password input with DevTools
2. HTML should show `type="password"`
3. No plain text in source
4. No plain text in console

### 2. Error Messages
1. Try invalid email
2. Error should not expose Firebase internals
3. Error should be user-friendly

### 3. Form Security
1. Try to bypass client validation
2. Try submitting with DevTools (disable button)
3. Should still fail on Firebase (server-side)

### 4. Session Security
1. Copy auth token from storage
2. Try to use in another browser
3. Should work (that's how sessions work)
4. But logout should revoke it

## Common Issues & Fixes

### Issue: Page shows white screen
**Fix**:
- Check browser console for errors
- Clear browser cache (Ctrl+Shift+Del)
- Restart dev server

### Issue: Login/Signup button doesn't work
**Fix**:
- Check Firebase configuration in .env
- Check internet connection
- Check Firebase console for auth errors

### Issue: Animations don't work
**Fix**:
- Check browser DevTools for CSS errors
- Disable browser extensions
- Try different browser

### Issue: Styles look broken
**Fix**:
- Check if Tailwind is loaded (check network tab)
- Clear browser cache
- Check for CSS conflicts

## Performance Targets

After improvements:
- Login page load: < 1.5 seconds
- Form submission: < 2 seconds
- Dashboard load: < 3 seconds
- No visible jank on animations

## Reporting Issues

If you find issues:

1. Note the exact steps to reproduce
2. Check browser console for errors
3. Include browser and OS info
4. Screenshot or video if possible
5. Check if it's reproducible

Example:
```
Browser: Chrome 120.0.1234
OS: Windows 11
Steps:
1. Visit /login
2. Click sign up button
3. Enter invalid email
Result: Form doesn't show error message
Expected: Error message appears below email field
```

---

**Happy Testing! 🚀**
