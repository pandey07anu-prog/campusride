/**
 * Real-time SMS Gateway Service (Twilio / Fast2SMS / 2Factor integration for Indian Mobile Numbers)
 */
const sendOtpSms = async ({ toPhone, phoneOtp }) => {
  try {
    const clean10Digits = (toPhone || '').replace(/[^0-9]/g, '').slice(-10);
    const otpString = String(phoneOtp || '').trim();

    // 1. Fast2SMS integration (Sends instant SMS OTP to ANY 10-digit Indian mobile number)
    const fast2smsKey = process.env.FAST2SMS_API_KEY;
    if (fast2smsKey) {
      const cleanKey = fast2smsKey.replace(/['"]/g, '').trim();
      const messageText = `🔑 CampusRide Security OTP: Your code is ${otpString}. Valid for 5 minutes. Do not share.`;
      
      // Attempt 1: Fast2SMS Official OTP POST Endpoint
      let response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
        method: 'POST',
        headers: {
          authorization: cleanKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          route: 'otp',
          variables_values: otpString,
          numbers: clean10Digits,
        }),
      });
      let data = await response.json();

      // Attempt 2: Fast2SMS OTP GET Endpoint
      if (!data.return) {
        console.warn('[Fast2SMS POST OTP Note]:', JSON.stringify(data));
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(cleanKey)}&route=otp&variables_values=${otpString}&flash=0&numbers=${clean10Digits}`;
        response = await fetch(url);
        data = await response.json();
      }

      // Attempt 3: Fast2SMS Quick POST Endpoint
      if (!data.return) {
        console.warn('[Fast2SMS GET OTP Note]:', JSON.stringify(data));
        response = await fetch('https://www.fast2sms.com/dev/bulkV2', {
          method: 'POST',
          headers: {
            authorization: cleanKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            route: 'q',
            message: messageText,
            flash: 0,
            numbers: clean10Digits,
          }),
        });
        data = await response.json();
      }

      // Attempt 4: Fast2SMS Quick GET Endpoint
      if (!data.return) {
        console.warn('[Fast2SMS POST Quick Note]:', JSON.stringify(data));
        const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${encodeURIComponent(cleanKey)}&route=q&message=${encodeURIComponent(messageText)}&flash=0&numbers=${clean10Digits}`;
        response = await fetch(url);
        data = await response.json();
      }

      if (data.return) {
        console.log(`✅ [SMS OTP Delivered via Fast2SMS to +91${clean10Digits}] Message ID:`, data.request_id || 'Sent');
      } else {
        console.error(`❌ [Fast2SMS Error Response for +91${clean10Digits}]:`, JSON.stringify(data));
      }

      return { success: Boolean(data.return), provider: 'fast2sms', data };
    }

    // 2. 2Factor.in Indian SMS Gateway integration
    const twoFactorKey = process.env.TWOFACTOR_API_KEY;
    if (twoFactorKey) {
      const cleanKey = twoFactorKey.replace(/['"]/g, '').trim();
      const url = `https://2factor.in/API/V1/${cleanKey}/SMS/${clean10Digits}/${otpString}/CampusRide+OTP`;
      const response = await fetch(url);
      const data = await response.json();
      console.log(`✅ [SMS OTP Sent via 2Factor to +91${clean10Digits}]:`, data);
      return { success: true, provider: '2factor', data };
    }

    // 3. Twilio International SMS integration
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromPhone = process.env.TWILIO_PHONE_NUMBER;

    if (accountSid && authToken && fromPhone) {
      const twilio = require('twilio')(accountSid, authToken);
      const formattedToPhone = toPhone.startsWith('+') ? toPhone : `+91${clean10Digits}`;
      const message = await twilio.messages.create({
        body: `🔑 CampusRide Verification OTP: ${otpString}. Valid for 5 minutes. Do not share.`,
        from: fromPhone,
        to: formattedToPhone,
      });
      console.log(`✅ [SMS OTP Sent via Twilio to ${formattedToPhone}] SID:`, message.sid);
      return { success: true, provider: 'twilio', sid: message.sid };
    }

    console.log(`[SMS Gateway Note] Sent OTP ${otpString} to mobile number ${toPhone}`);
    return { success: true, simulated: true };
  } catch (error) {
    console.error('[SMS Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOtpSms,
};
