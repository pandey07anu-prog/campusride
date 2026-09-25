/**
 * Official Meta WhatsApp Cloud API Service & Direct Dispatch
 * Environment variables consumed:
 * - WHATSAPP_ACCESS_TOKEN
 * - WHATSAPP_PHONE_NUMBER_ID
 * - WHATSAPP_VERIFY_TOKEN
 */
const sendWhatsAppOtp = async ({ toPhone, phoneOtp }) => {
  try {
    // Robust sanitization and international format (+91 for India by default)
    let digitsOnly = (toPhone || '').replace(/[^0-9]/g, '');
    let cleanPhone = digitsOnly;
    if (digitsOnly.length === 10) {
      cleanPhone = '91' + digitsOnly;
    } else if (digitsOnly.length === 11 && digitsOnly.startsWith('0')) {
      cleanPhone = '91' + digitsOnly.slice(1);
    } else if (digitsOnly.length > 10 && !digitsOnly.startsWith('91')) {
      cleanPhone = '91' + digitsOnly.slice(-10);
    }

    const messageText = `🔑 *CampusRide Security OTP*: Your 6-digit verification code is *${phoneOtp}*. Valid for 5 minutes. Do not share with anyone.`;
    const whatsAppUrl = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodeURIComponent(messageText)}`;

    const accessToken = (process.env.WHATSAPP_ACCESS_TOKEN || '').replace(/[\r\n\t'"]/g, '').trim();
    const phoneNumberId = (process.env.WHATSAPP_PHONE_NUMBER_ID || '').replace(/[^0-9]/g, '').trim();

    // 1. Official Meta WhatsApp Cloud API Endpoint Call
    if (accessToken && phoneNumberId) {
      try {
        const metaApiUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}/messages`;
        const configuredTemplate = (process.env.WHATSAPP_TEMPLATE_NAME || '').replace(/['"]/g, '').trim();
        const templateName = configuredTemplate || 'campusride_otp';

        // Attempt 1: Template dispatch with en_US language and body parameter
        console.log(`[Meta WhatsApp API] Attempt 1: Template '${templateName}' (en_US) to +${cleanPhone}...`);
        let response = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en_US' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: String(phoneOtp),
                    },
                  ],
                },
              ],
            },
          }),
        });

        let metaData1 = await response.json();
        if (response.ok) {
          console.log(`✅ [Meta WhatsApp API Success to +${cleanPhone}] Message ID:`, metaData1.messages?.[0]?.id);
          return { success: true, provider: 'meta_whatsapp_cloud_api', messageId: metaData1.messages?.[0]?.id, whatsAppUrl };
        }

        // Attempt 2: Template dispatch with 'en' language code fallback
        console.warn(`[Meta WhatsApp API Note] Attempt 1 failed:`, JSON.stringify(metaData1));
        console.log(`[Meta WhatsApp API] Attempt 2: Template '${templateName}' (en) to +${cleanPhone}...`);

        let response2 = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en' },
              components: [
                {
                  type: 'body',
                  parameters: [
                    {
                      type: 'text',
                      text: String(phoneOtp),
                    },
                  ],
                },
              ],
            },
          }),
        });
        let metaData2 = await response2.json();
        if (response2.ok) {
          console.log(`✅ [Meta WhatsApp API Success to +${cleanPhone}] Message ID:`, metaData2.messages?.[0]?.id);
          return { success: true, provider: 'meta_whatsapp_cloud_api', messageId: metaData2.messages?.[0]?.id, whatsAppUrl };
        }

        // Attempt 3: Simple Template dispatch without parameters
        console.warn(`[Meta WhatsApp API Note] Attempt 2 failed:`, JSON.stringify(metaData2));
        console.log(`[Meta WhatsApp API] Attempt 3: Template '${templateName}' (no params) to +${cleanPhone}...`);

        let response3 = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'template',
            template: {
              name: templateName,
              language: { code: 'en_US' },
            },
          }),
        });
        let metaData3 = await response3.json();
        if (response3.ok) {
          console.log(`✅ [Meta WhatsApp API Success to +${cleanPhone}] Message ID:`, metaData3.messages?.[0]?.id);
          return { success: true, provider: 'meta_whatsapp_cloud_api', messageId: metaData3.messages?.[0]?.id, whatsAppUrl };
        }

        // Attempt 4: Direct Text Message payload
        console.warn(`[Meta WhatsApp API Note] Attempt 3 failed:`, JSON.stringify(metaData3));
        console.log(`[Meta WhatsApp API] Attempt 4: Direct text message to +${cleanPhone}...`);

        let response4 = await fetch(metaApiUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: cleanPhone,
            type: 'text',
            text: {
              body: messageText,
            },
          }),
        });
        let metaData4 = await response4.json();
        if (response4.ok) {
          console.log(`✅ [Meta WhatsApp API Text Success to +${cleanPhone}] Message ID:`, metaData4.messages?.[0]?.id);
          return { success: true, provider: 'meta_whatsapp_cloud_api_text', messageId: metaData4.messages?.[0]?.id, whatsAppUrl };
        }

        // Return exact diagnostics for all attempts
        console.error(`❌ [Meta WhatsApp API Failure for +${cleanPhone}]`, JSON.stringify({ metaData1, metaData2, metaData3, metaData4 }));
        return {
          success: false,
          provider: 'meta_whatsapp_cloud_api_failed',
          metaError: metaData1.error ? metaData1 : metaData4,
          attempt1_templateEnUs: metaData1,
          attempt2_templateEn: metaData2,
          attempt3_templateNoParams: metaData3,
          attempt4_textPayload: metaData4,
          whatsAppUrl,
        };
      } catch (metaErr) {
        console.error('[Meta WhatsApp Cloud API Exception]:', metaErr.message);
        return { success: false, error: metaErr.message, whatsAppUrl };
      }
    } else {
      console.log('[WhatsApp Service Note] WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in environment variables.');
      return {
        success: false,
        provider: 'missing_credentials',
        reason: 'WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID missing in backend environment variables',
        whatsAppUrl,
      };
    }

    return {
      success: true,
      provider: 'whatsapp_intent_fallback',
      whatsAppUrl,
    };
  } catch (error) {
    console.error('[WhatsApp Service Error]', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendWhatsAppOtp,
};
