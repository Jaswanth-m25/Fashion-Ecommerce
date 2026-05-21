# Razorpay Payment Integration Setup Guide

## 📋 Overview
This guide will help you set up Razorpay payment gateway for your e-commerce application.

## 🚀 Quick Start

### Step 1: Create a Razorpay Account
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Sign up for a free account
3. Verify your email and phone number
4. Complete KYC (Know Your Customer) verification

### Step 2: Get Your API Keys
1. Log in to Razorpay Dashboard
2. Navigate to **Settings → API Keys**
3. You'll find two keys:
   - **Key ID** (Public Key) - Use in frontend
   - **Key Secret** (Private Key) - Use in backend only

### Step 3: Update Environment Variables
Open your backend `.env` file and update:

```env
RAZORPAY_KEY_ID=your_key_id_here
RAZORPAY_KEY_SECRET=your_key_secret_here
```

Replace `your_key_id_here` and `your_key_secret_here` with your actual Razorpay keys.

### Step 4: Test Payment
Use Razorpay test credentials:
- **Test Card**: 4111 1111 1111 1111
- **Expiry**: Any future date (e.g., 12/25)
- **CVV**: Any 3 digits (e.g., 123)

## 📁 Files Modified/Created

### Backend Changes
1. **`/backend/routes/payment.js`** (NEW)
   - `/payment/create-order` - Creates Razorpay order
   - `/payment/verify-payment` - Verifies payment and creates order

2. **`/backend/index.js`** (UPDATED)
   - Added payment routes registration

3. **`/backend/.env`** (UPDATED)
   - Added Razorpay configuration keys

### Frontend Changes
1. **`/frontend/src/pages/Checkout/Checkout.jsx`** (UPDATED)
   - Integrated Razorpay payment flow
   - Replaced manual card form with Razorpay checkout
   - Added payment verification

2. **`/frontend/src/pages/Checkout/Checkout.css`** (UPDATED)
   - Added Razorpay payment UI styles
   - Added security badges and payment method cards

## 🔄 Payment Flow

```
User Checkout
    ↓
Step 1: Enter Shipping Info
    ↓
Step 2: Click "Pay with Razorpay"
    ↓
Backend Creates Razorpay Order
    ↓
Razorpay Checkout Opens (Popup)
    ↓
User Completes Payment
    ↓
Backend Verifies Signature
    ↓
Order Created in DB
    ↓
Cart Cleared
    ↓
Step 3: Success Page
```

## 💳 Supported Payment Methods

Razorpay supports multiple payment methods:
- 🎫 **Credit/Debit Cards** - Visa, Mastercard, American Express, Rupay
- 📱 **Digital Wallets** - Apple Pay, Google Pay, PhonePe, Paytm, Mobikwik
- 🏦 **Net Banking** - All major Indian banks
- 🔄 **UPI** - Google Pay, PhonePe, Paytm, BHIM, etc.
- 💰 **EMI** - Available on supported cards

## 🔒 Security Features

1. **PCI-DSS Compliant** - Card data handled by Razorpay servers
2. **Signature Verification** - Backend verifies every payment
3. **HTTPS Encryption** - All communication encrypted
4. **No Sensitive Data Stored** - Your server never handles card details

## 🛠️ API Endpoints

### Create Razorpay Order
```bash
POST http://localhost:4000/payment/create-order
Headers:
  - auth-token: <user_token>
  - Content-Type: application/json

Body:
{
  "amount": 1000,
  "currency": "INR",
  "receipt": "receipt_001"
}

Response:
{
  "success": true,
  "orderId": "order_1A2b3C4d5E6f",
  "amount": 100000,
  "currency": "INR"
}
```

### Verify Payment & Create Order
```bash
POST http://localhost:4000/payment/verify-payment
Headers:
  - auth-token: <user_token>
  - Content-Type: application/json

Body:
{
  "razorpay_order_id": "order_1A2b3C4d5E6f",
  "razorpay_payment_id": "pay_1A2b3C4d5E6f",
  "razorpay_signature": "signature_hash",
  "products": [...],
  "address": {...}
}

Response:
{
  "success": true,
  "orderId": 123,
  "message": "Order placed successfully"
}
```

## 📊 Testing Payments

### Test Scenarios

1. **Successful Payment**
   - Card: 4111 1111 1111 1111
   - OTP: 123456
   - Result: Payment succeeds

2. **Failed Payment**
   - Card: 4000 0000 0000 0002
   - OTP: Any value
   - Result: Payment fails

3. **International Card**
   - Card: 4111 1111 1111 1111
   - 3D Secure: Enabled (tests security flow)

## 🐛 Troubleshooting

### Issue: "Razorpay failed to load"
- Check if Razorpay script is loading from CDN
- Verify browser console for errors
- Clear browser cache and try again

### Issue: "Payment verification failed"
- Verify RAZORPAY_KEY_SECRET is correct in .env
- Ensure backend is restarted after .env changes
- Check server logs for detailed error

### Issue: "Order creation failed"
- Verify user authentication token is valid
- Check MongoDB connection
- Ensure products exist in database

## 📈 Next Steps

1. **Go Live Transition**
   - Replace test keys with live keys in production
   - Update frontend Razorpay key to live key
   - Test with real payment methods

2. **Email Notifications**
   - Setup transactional emails
   - Send order confirmation with details

3. **Analytics**
   - Track payment success/failure rates
   - Monitor revenue and order trends
   - Setup alerts for payment failures

4. **Additional Features**
   - Implement payment refunds
   - Add subscription/recurring payments
   - Setup payment webhooks

## 📞 Support
- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: support@razorpay.com
- GitHub Issues: https://github.com/razorpay/razorpay-node

## ✅ Checklist

- [ ] Created Razorpay account
- [ ] Added API keys to .env
- [ ] Tested with test card
- [ ] Verified order creation
- [ ] Tested cart clearing after payment
- [ ] Confirmed email notifications
- [ ] Tested on production domain
- [ ] Transitioned to live keys

---

**Last Updated**: May 16, 2026
**Version**: 1.0
