import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from parent directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 Testing Twilio Verify configurations...\n');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_VERIFY_SERVICE_SID;

console.log('1. Environment Variables:');
console.log(`   - TWILIO_ACCOUNT_SID: ${accountSid ? '✅ ' + accountSid.substring(0, 5) + '...' : '❌ Missing'}`);
console.log(`   - TWILIO_VERIFY_SERVICE_SID: ${serviceSid ? '✅ ' + serviceSid.substring(0, 5) + '...' : '❌ Missing'}`);

if (!accountSid || !authToken || !serviceSid) {
    console.error('\n❌ Missing credentials in .env file.');
    process.exit(1);
}

const client = twilio(accountSid, authToken);

async function testverify() {
    // Hardcoded number from user request for testing
    const testPhone = '+917349618040';

    console.log(`\n2. Sending Verification to ${testPhone}...`);

    try {
        const verification = await client.verify.v2.services(serviceSid)
            .verifications
            .create({ to: testPhone, channel: 'sms' });

        console.log(`\n✅ Success! Verification Status: ${verification.status}`);
        console.log(`   SID: ${verification.sid}`);
        console.log('\n👉 If you received the SMS, configuration is perfect.');
    } catch (error) {
        console.error('\n❌ Twilio Verify Error:');
        console.error(`   Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        console.error(`   More Info: ${error.more_info}`);
    }
}

testverify();
