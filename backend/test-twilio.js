import dotenv from 'dotenv';
import twilio from 'twilio';

dotenv.config();

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromPhone = process.env.TWILIO_PHONE_NUMBER;
const toPhone = '+919999999999'; // Demo number

console.log('--- Twilio Test Script ---');
console.log('SID:', accountSid ? accountSid.substring(0, 6) + '...' : 'MISSING');
console.log('Token:', authToken ? 'PRESENT' : 'MISSING');
console.log('From:', fromPhone);

if (!accountSid || !authToken || !fromPhone) {
    console.error('❌ Missing credentials');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function testSMS() {
    try {
        console.log('Attempting to send message...');
        const message = await client.messages.create({
            body: 'Test generated from debugging script',
            from: fromPhone,
            to: toPhone
        });
        console.log('✅ Success! Message SID:', message.sid);
    } catch (error) {
        console.log('❌ Error caught gracefully:');
        console.log('Code:', error.code);
        console.log('Message:', error.message);
        console.log('Status:', error.status);
    }
}

testSMS();
