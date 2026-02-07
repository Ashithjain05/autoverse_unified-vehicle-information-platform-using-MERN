import twilio from 'twilio';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load .env from parent directory
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('\n🔍 Testing Twilio Configuration...\n');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('1. Checking Environment Variables:');
console.log(`   - TWILIO_ACCOUNT_SID: ${accountSid ? (accountSid.startsWith('AC') ? '✅ Valid Format (starts with AC)' : `❌ Invalid Format (starts with ${accountSid.substring(0, 2)})`) : '❌ Missing'}`);
console.log(`   - TWILIO_AUTH_TOKEN:  ${authToken ? '✅ Present' : '❌ Missing'}`);
console.log(`   - TWILIO_PHONE_NUMBER:${fromNumber ? '✅ Present (' + fromNumber + ')' : '❌ Missing'}`);

if (!accountSid || !authToken || !fromNumber) {
    console.error('\n❌ Missing credentials in .env file. Please check specific values above.');
    process.exit(1);
}

if (!accountSid.startsWith('AC')) {
    console.error('\n❌ Critical Error: TWILIO_ACCOUNT_SID usually starts with "AC". Check your Twilio Console.');
    console.error('   Your current value starts with: ' + accountSid.substring(0, 5) + '...');
}

const client = twilio(accountSid, authToken);

async function testSMS() {
    console.log('\n2. Attempting to send test SMS...');
    try {
        // Send to self (the from number) or a dummy number if fromNumber is the verified caller ID
        // Note: In trial accounts, you can only send to verified numbers.
        // We'll try to send to the user's likely number or ask for input? 
        // For safety, let's just use a dummy number that will likely fail validation if not verified, 
        // but we want to test AUTH first.

        // Actually, let's try to fetch account details first to verify credentials WITHOUT sending SMS.
        console.log('   - Verifying Credentials API...');
        const account = await client.api.v2010.accounts(accountSid).fetch();
        console.log(`   ✅ Credentials Verified! Account Name: ${account.friendlyName}`);
        console.log(`   ✅ Account Status: ${account.status}`);

        console.log('\n3. Note on SMS Sending:');
        console.log('   If credentials are good but SMS fails, it might be because:');
        console.log('   - You have a Trial Account and are sending to an unverified number.');
        console.log('   - The "From" number is not purchased/verified on Twilio.');

    } catch (error) {
        console.error('\n❌ Twilio API Error:');
        console.error(`   Code: ${error.code}`);
        console.error(`   Message: ${error.message}`);
        console.error(`   More Info: ${error.moreInfo}`);
    }
}

testSMS();
