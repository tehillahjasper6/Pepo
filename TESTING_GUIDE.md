# 🧪 PEPO Platform - Complete Testing Guide

**Date**: December 29, 2024  
**Purpose**: Comprehensive testing of all 10 features

---

## ✅ Pre-Testing Checklist

### **Prerequisites**
- [ ] Backend running on port 4000
- [ ] Web app running on port 3000
- [ ] Database seeded with test data
- [ ] Redis running (optional)
- [ ] Two browser windows/tabs ready

---

## 🧪 Feature Testing

### **1. Authentication Testing**

#### **Test Registration**
1. Visit: http://localhost:3000/signup
2. Fill form:
   - Name: Test User
   - Email: test@example.com
   - Password: password123
   - City: Test City
3. Click "Create Account"
4. **Expected**:
   - ✅ Pepo celebrate animation appears
   - ✅ Success toast: "Welcome to PEPO! 🐝"
   - ✅ Auto-redirect to /browse after 2 seconds
   - ✅ User logged in

#### **Test Login**
1. Visit: http://localhost:3000/login
2. Switch to "Password" tab
3. Enter:
   - Email: user1@example.com
   - Password: password123
4. Click "Log In"
5. **Expected**:
   - ✅ Success toast: "Welcome back to PEPO! 🐝"
   - ✅ Redirect to /browse
   - ✅ Token saved in localStorage
   - ✅ User can access protected routes

#### **Test Error Handling**
1. Try login with wrong password
2. **Expected**: Error toast with message
3. Try registration with existing email
4. **Expected**: Error toast with message

---

### **2. Browse Page Testing**

#### **Test Browse**
1. Visit: http://localhost:3000/browse
2. **Expected**:
   - ✅ See 9 giveaways from database
   - ✅ Loading animation while fetching
   - ✅ Giveaways displayed in grid
   - ✅ Each card shows title, category, location

#### **Test Filters**
1. Click "Furniture" filter
2. **Expected**: Only furniture giveaways shown
3. Click "Toys" filter
4. **Expected**: Only toys giveaways shown
5. Click "All"
6. **Expected**: All giveaways shown

#### **Test Empty State**
1. Filter by category with no items
2. **Expected**:
   - ✅ Pepo idle animation
   - ✅ "No [category] giveaways yet" message
   - ✅ "Post a Giveaway" button

---

### **3. Create Giveaway Testing**

#### **Test Form Validation**
1. Visit: http://localhost:3000/create
2. Try to submit empty form
3. **Expected**: Validation errors

#### **Test Image Upload**
1. Click upload area
2. Select 1-5 images
3. **Expected**:
   - ✅ Image previews appear
   - ✅ Can remove images (hover → click ✕)
   - ✅ Max 5 images enforced

#### **Test Create Giveaway**
1. Fill form:
   - Title: Test Giveaway
   - Description: Test description
   - Category: Furniture
   - Location: Test City
   - Upload 1-2 images
2. Click "Post Giveaway"
3. **Expected**:
   - ✅ Loading state (button disabled)
   - ✅ Pepo "give" animation
   - ✅ Success toast
   - ✅ Redirect to /browse
   - ✅ New giveaway appears in list

---

### **4. Giveaway Detail Testing**

#### **Test View Details**
1. Click any giveaway in browse
2. **Expected**:
   - ✅ Full details displayed
   - ✅ Images shown (if available)
   - ✅ Creator information
   - ✅ Participant count
   - ✅ Status displayed

#### **Test Express Interest**
1. Click "Express Interest" button
2. **Expected**:
   - ✅ Success toast: "✋ You're in the draw!"
   - ✅ Button changes to "You're in the draw!"
   - ✅ Pepo idle animation shown
   - ✅ Participant count increases
   - ✅ "Withdraw Interest" button appears

#### **Test Withdraw Interest**
1. Click "Withdraw Interest"
2. **Expected**:
   - ✅ Info toast: "Interest withdrawn"
   - ✅ Button changes back to "Express Interest"
   - ✅ Participant count decreases

---

### **5. Conduct Draw Testing**

#### **Test Draw (Creator Only)**
1. Login as giveaway creator
2. Visit giveaway detail page
3. Click "Draw Winner Now"
4. **Expected**:
   - ✅ Loading overlay appears
   - ✅ Pepo loading animation
   - ✅ "Drawing a winner..." message
   - ✅ After 2-3 seconds: Winner celebration
   - ✅ Winner name displayed
   - ✅ Success toast

#### **Test Draw Permissions**
1. Login as non-creator
2. Visit giveaway detail page
3. **Expected**: No "Draw Winner Now" button visible

---

### **6. Real-Time Messaging Testing**

#### **Test WebSocket Connection**
1. Open two browser windows
2. Window 1: Login as user1
3. Window 2: Login as user2
4. Both visit: `/messages/[giveawayId]`
5. **Expected**:
   - ✅ Both see "🟢 Online" status
   - ✅ Connection established

#### **Test Send Message**
1. Window 1: Type message "Hello!"
2. Click "Send"
3. **Expected**:
   - ✅ Message appears instantly in Window 1
   - ✅ Message appears instantly in Window 2 (no refresh!)
   - ✅ Auto-scrolls to bottom
   - ✅ Timestamp displayed

#### **Test Receive Message**
1. Window 2: Type reply "Hi there!"
2. Click "Send"
3. **Expected**:
   - ✅ Reply appears instantly in both windows
   - ✅ Messages aligned correctly (own = right, other = left)

#### **Test Disconnection**
1. Close Window 1
2. **Expected**: Window 2 shows "Connecting..." status

---

### **7. Push Notifications Testing**

#### **Test Enable Notifications**
1. Visit: http://localhost:3000/settings
2. Click "Enable" button
3. **Expected**:
   - ✅ Browser permission prompt appears
   - ✅ Click "Allow"
   - ✅ Success toast: "Push notifications enabled! 🔔"
   - ✅ Green status indicator appears
   - ✅ Pepo idle animation shown

#### **Test Notification Display**
1. Send test notification via backend API:
   ```bash
   curl -X POST http://localhost:4000/api/notifications/send-test \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"userId":"USER_ID","title":"Test","body":"Test notification"}'
   ```
2. **Expected**:
   - ✅ Browser notification appears
   - ✅ Shows Pepo icon
   - ✅ Clickable (opens app)

#### **Test Disable Notifications**
1. Visit settings page
2. Click "Disable"
3. **Expected**:
   - ✅ Info toast: "Push notifications disabled"
   - ✅ Button changes to "Enable"

---

### **8. Error Handling Testing**

#### **Test Network Error**
1. Stop backend server
2. Try to browse giveaways
3. **Expected**:
   - ✅ Error display with Pepo alert
   - ✅ "Try Again" button
   - ✅ Clear error message

#### **Test 401 Error**
1. Clear localStorage token
2. Try to access protected route
3. **Expected**:
   - ✅ Auto-redirect to /login
   - ✅ Error message shown

#### **Test 404 Error**
1. Visit: `/giveaway/invalid-id`
2. **Expected**:
   - ✅ Error display
   - ✅ "Giveaway not found" message
   - ✅ Back button

---

### **9. Loading States Testing**

#### **Test All Loading States**
- Browse page: ✅ Pepo loading animation
- Detail page: ✅ Loading spinner
- Create form: ✅ Button disabled, "Posting..."
- Login: ✅ Button disabled, "Logging in..."
- Draw: ✅ Loading overlay

---

### **10. Animations Testing**

#### **Test All Pepo Emotions**
1. Visit: http://localhost:3000/test-pepo
2. Click each button:
   - **Idle**: ✅ Gentle breathing animation
   - **Celebrate**: ✅ Flying with joy
   - **Give**: ✅ Offering honey
   - **Loading**: ✅ Spinning hive
   - **Alert**: ✅ Concerned bee

#### **Test In-App Animations**
- Signup success: ✅ Celebrate animation
- Giveaway posted: ✅ Give animation
- Loading states: ✅ Loading animation
- Error states: ✅ Alert animation

---

## 🔍 Integration Testing

### **Complete User Flow**

#### **Flow 1: New User Journey**
1. ✅ Register account
2. ✅ Browse giveaways
3. ✅ Express interest in item
4. ✅ View profile
5. ✅ Enable push notifications

#### **Flow 2: Creator Journey**
1. ✅ Login
2. ✅ Create giveaway with images
3. ✅ View interested participants
4. ✅ Conduct draw
5. ✅ See winner celebration
6. ✅ Chat with winner

#### **Flow 3: Winner Journey**
1. ✅ Express interest
2. ✅ Receive notification (if enabled)
3. ✅ See winner announcement
4. ✅ Chat with creator
5. ✅ Coordinate pickup

---

## 🐛 Bug Testing

### **Edge Cases**

#### **Test Empty States**
- Browse with no giveaways
- Messages with no conversations
- Profile with no activity

#### **Test Long Content**
- Very long giveaway title
- Very long description
- Many images (5+)
- Long messages

#### **Test Rapid Actions**
- Rapid clicking buttons
- Multiple form submissions
- Rapid message sending

#### **Test Browser Compatibility**
- Chrome/Edge
- Firefox
- Safari
- Mobile browsers

---

## 📊 Performance Testing

### **Load Times**
- [ ] Page load < 2 seconds
- [ ] API response < 200ms
- [ ] Image upload < 5 seconds
- [ ] Draw completion < 3 seconds

### **Bundle Size**
- [ ] Web app bundle < 500KB
- [ ] Images optimized
- [ ] Code splitting working

---

## 🔒 Security Testing

### **Authentication**
- [ ] Token expires correctly
- [ ] Invalid tokens rejected
- [ ] Password hashing working
- [ ] OAuth redirects secure

### **Authorization**
- [ ] Users can't access admin routes
- [ ] Users can't modify others' giveaways
- [ ] Only creators can conduct draws
- [ ] Only giver/winner can message

---

## 📱 Mobile Testing

### **Responsive Design**
- [ ] Mobile menu works
- [ ] Forms usable on mobile
- [ ] Images display correctly
- [ ] Touch interactions work

---

## ✅ Test Results Template

```
Feature: [Name]
Date: [Date]
Tester: [Name]

✅ Passed:
- [Test case 1]
- [Test case 2]

❌ Failed:
- [Test case 3] - [Issue description]

📝 Notes:
[Any observations]
```

---

## 🎯 Quick Test Script

```bash
# Test Backend Health
curl http://localhost:4000/health

# Test Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user1@example.com","password":"password123"}'

# Test Get Giveaways
curl http://localhost:4000/api/giveaways \
  -H "Authorization: Bearer YOUR_TOKEN"

# Test WebSocket (use browser console)
# Connect to: ws://localhost:4000/messages
```

---

**Happy Testing!** 🧪

*Give Freely. Live Lightly.* 🐝💛



