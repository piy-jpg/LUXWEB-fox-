/**
 * Real Telecom SMS Gateway Service
 * Delivers authentic SMS messages directly to physical mobile handsets
 * Supports: Fast2SMS (India), Twilio (Global), and 2Factor
 */

const https = require('https');

async function sendRealSms({ phone, otp }) {
  const rawDigits = phone.replace(/\D/g, '');
  const last10 = rawDigits.slice(-10);
  const fullPhone = phone.startsWith('+') ? phone : `+91${last10}`;

  const fast2smsKey = process.env.FAST2SMS_API_KEY || 'Aim3HE7cHJXLDVBKyycjY438KWiMrGG7bbiapw0yCqEPRckC7Auz7yc1VbzM';
  const twilioSid = process.env.TWILIO_ACCOUNT_SID;
  const twilioAuth = process.env.TWILIO_AUTH_TOKEN;
  const twilioPhone = process.env.TWILIO_PHONE_NUMBER;
  const twoFactorKey = process.env.TWOFACTOR_API_KEY;

  // 1. FAST2SMS (India mobile networks: Airtel, Jio, Vi, BSNL)
  if (fast2smsKey) {
    try {
      const payload = JSON.stringify({
        variables_values: otp,
        route: 'otp',
        numbers: last10,
      });

      const options = {
        hostname: 'www.fast2sms.com',
        path: '/dev/bulkV2',
        method: 'POST',
        headers: {
          'authorization': fast2smsKey,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      };

      const result = await makeHttpsRequest(options, payload);
      console.log('[SMS Gateway] Fast2SMS dispatched:', result);
      if (result && (result.return === true || result.status_code === 200)) {
        return { success: true, provider: 'Fast2SMS', result };
      }
    } catch (err) {
      console.error('[SMS Gateway] Fast2SMS error:', err.message);
    }
  }

  // 2. TWILIO (Global telecom delivery)
  if (twilioSid && twilioAuth && twilioPhone) {
    try {
      const messageBody = `Lumière Atelier: Your private verification code is ${otp}. Valid for 5 minutes.`;
      const formBody = new URLSearchParams({
        To: fullPhone,
        From: twilioPhone,
        Body: messageBody,
      }).toString();

      const authHeader = 'Basic ' + Buffer.from(`${twilioSid}:${twilioAuth}`).toString('base64');
      const options = {
        hostname: 'api.twilio.com',
        path: `/2010-04-01/Accounts/${twilioSid}/Messages.json`,
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/x-www-form-urlencoded',
          'Content-Length': Buffer.byteLength(formBody),
        },
      };

      const result = await makeHttpsRequest(options, formBody);
      console.log('[SMS Gateway] Twilio dispatched:', result);
      return { success: true, provider: 'Twilio', result };
    } catch (err) {
      console.error('[SMS Gateway] Twilio error:', err.message);
    }
  }

  // 3. 2FACTOR.IN (India SMS Gateway)
  if (twoFactorKey) {
    try {
      const options = {
        hostname: '2factor.in',
        path: `/API/V1/${twoFactorKey}/SMS/${fullPhone}/${otp}/OTP1`,
        method: 'GET',
      };

      const result = await makeHttpsRequest(options);
      console.log('[SMS Gateway] 2Factor dispatched:', result);
      return { success: true, provider: '2Factor', result };
    } catch (err) {
      console.error('[SMS Gateway] 2Factor error:', err.message);
    }
  }

  console.warn('[SMS Gateway] No telecom SMS provider configured. Add FAST2SMS_API_KEY or TWILIO credentials to .env.');
  return {
    success: false,
    provider: 'none',
    message: 'SMS gateway not configured',
  };
}

function makeHttpsRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve({ raw: data, statusCode: res.statusCode });
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.setTimeout(8000, () => {
      req.destroy();
      reject(new Error('SMS Gateway request timed out'));
    });

    if (postData) {
      req.write(postData);
    }
    req.end();
  });
}

module.exports = { sendRealSms };
