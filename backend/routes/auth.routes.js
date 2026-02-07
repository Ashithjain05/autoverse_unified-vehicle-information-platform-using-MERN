import express from 'express';
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import { verifyToken } from '../middleware/auth.middleware.js';

const router = express.Router();

// In-memory storage (for demo - replace with database in production)
const otpStore = new Map();
const userStore = new Map();

// Generate OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
router.post('/send-otp', async (req, res) => {
    console.log('🔹 /send-otp request received:', req.body);
    try {
        let { phone } = req.body;

        // Ensure phone is a string and trimmed
        if (phone) phone = phone.toString().trim();

        if (!phone || phone.length !== 10) {
            console.log('❌ Invalid phone number format:', phone);
            return res.status(400).json({ success: false, error: 'Valid 10-digit phone number required' });
        }

        console.log(`🔹 Processing OTP for: ${phone}`);

        // 1. Try Twilio Verify Service (Priority if configured)
        // DISABLED: Causing server crashes/resets on Trial accounts with unverified numbers
        if (false && process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_VERIFY_SERVICE_SID) {

            console.log('🔹 Attempting Twilio Verify...');
            try {
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verifications
                    .create({ to: `+91${phone}`, channel: 'sms' });

                console.log(`✅ Twilio Verify SMS sent to ${phone}`);
                return res.json({ success: true, message: 'OTP sent via SMS' });
            } catch (twilioError) {
                console.error('❌ Twilio Verify Failed:', twilioError.message);
                // Continue to fallback...
            }
        } else {
            console.log('🔹 Twilio Verify skipped (disabled or missing config)');
        }

        // 2. Try Standard Twilio SMS (If Phone Number is provided)
        // DISABLED: Causing server crashes/resets on Trial accounts with unverified numbers
        if (false && process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_PHONE_NUMBER) {

            console.log('🔹 Attempting Twilio SMS...');
            try {
                const otp = generateOTP();
                const expiresAt = Date.now() + 5 * 60 * 1000;

                // Store OTP first
                otpStore.set(phone, { otp, expiresAt, verified: false });

                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                await client.messages.create({
                    body: `Your AutoVerse Login OTP is: ${otp}. Valid for 5 minutes.`,
                    from: process.env.TWILIO_PHONE_NUMBER,
                    to: `+91${phone}`
                });

                console.log(`✅ Twilio Standard SMS sent to ${phone}`);
                return res.json({ success: true, message: 'OTP sent via SMS' });

            } catch (smsError) {
                console.error('❌ Twilio SMS Failed:', smsError.message);
                // Continue to demo fallback...
            }
        } else {
            console.log('🔹 Twilio SMS skipped (disabled or missing config)');
        }

        // --- Demo / Fallback Mode ---
        console.log('🔹 Using Demo Mode');
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000;
        otpStore.set(phone, { otp, expiresAt, verified: false });
        console.log(`\n⚠️  Demo Mode - OTP for ${phone}: ${otp}\n`);

        res.json({
            success: true,
            message: 'OTP generated (Demo Mode)',
            otp: otp // Always return OTP in demo mode
        });

    } catch (error) {
        console.error('❌ Send OTP Critical error:', error);
        res.status(500).json({ success: false, error: 'Failed to send OTP' });
    }
});

// Verify OTP
router.post('/verify-otp', async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({ success: false, error: 'Phone and OTP required' });
        }

        let isVerified = false;

        // 1. Try Twilio Verify First
        if (process.env.TWILIO_ACCOUNT_SID?.startsWith('AC') &&
            process.env.TWILIO_AUTH_TOKEN &&
            process.env.TWILIO_VERIFY_SERVICE_SID) {

            // If the OTP is 6 digits, it might be a real Twilio OTP
            try {
                const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
                const verificationCheck = await client.verify.v2.services(process.env.TWILIO_VERIFY_SERVICE_SID)
                    .verificationChecks
                    .create({ to: `+91${phone}`, code: otp });

                if (verificationCheck.status === 'approved') {
                    isVerified = true;
                    console.log(`✅ Twilio OTP verified for ${phone}`);
                } else {
                    // If Twilio rejected it, check if it matches the Demo OTP (in case they mixed flows)
                    const demoRecord = otpStore.get(phone);
                    if (demoRecord && demoRecord.otp === otp && Date.now() < demoRecord.expiresAt) {
                        isVerified = true;
                        console.log(`⚠️ Valid Demo OTP used even though Twilio is configured`);
                    }
                }
            } catch (err) {
                console.error('Twilio Verify Check Error:', err.message);
                // Fallback to internal check
            }
        }

        // 2. Fallback to Memory Store (Demo Mode)
        if (!isVerified) {
            const otpRecord = otpStore.get(phone);
            if (otpRecord && otpRecord.otp === otp) {
                if (Date.now() > otpRecord.expiresAt) {
                    otpStore.delete(phone);
                    return res.status(400).json({ success: false, error: 'OTP expired' });
                }
                isVerified = true;
                otpStore.delete(phone); // Clear after use
            }
        }

        if (!isVerified) {
            return res.status(400).json({ success: false, error: 'Invalid or Expired OTP' });
        }

        // --- Login Success ---

        // Get or create user
        let user = userStore.get(phone);
        if (!user) {
            user = {
                id: Date.now().toString(),
                phone,
                created_at: new Date()
            };
            userStore.set(phone, user);
        }

        // Generate JWT token
        const token = jwt.sign(
            { userId: user.id, phone: user.phone },
            process.env.JWT_SECRET || 'autoverse-secret-key-change-in-production',
            { expiresIn: '7d' }
        );

        console.log(`✅ User ${phone} logged in`);

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                isProfileComplete: !!(user.name && user.email)
            }
        });

    } catch (error) {
        console.error('Verify OTP error:', error);
        res.status(500).json({ success: false, error: 'Verification failed' });
    }
});

// Update Profile
router.put('/update-profile', verifyToken, (req, res) => {
    try {
        const { name, email } = req.body;
        const { phone } = req.user;

        if (!name || !email) {
            return res.status(400).json({ success: false, error: 'Name and Email are required' });
        }

        const user = userStore.get(phone);
        if (!user) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }

        // Update user
        user.name = name;
        user.email = email;
        userStore.set(phone, user); // Update in store

        console.log(`✅ Profile updated for ${phone}: ${name}, ${email}`);

        res.json({
            success: true,
            message: 'Profile updated successfully',
            user: {
                id: user.id,
                phone: user.phone,
                name: user.name,
                email: user.email,
                isProfileComplete: true
            }
        });

    } catch (error) {
        console.error('Update Profile error:', error);
        res.status(500).json({ success: false, error: 'Failed to update profile' });
    }
});

export default router;
