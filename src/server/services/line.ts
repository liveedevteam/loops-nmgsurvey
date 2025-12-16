/**
 * LINE Messaging API Service
 * 
 * Handles sending messages to users via LINE Messaging API,
 * specifically for pushing coupon Flex Messages after survey completion.
 * 
 * In development mode with test credentials, mocks the API call.
 */

import { messagingApi } from '@line/bot-sdk';
import { buildCouponFlexMessage } from '@/lib/flex-message';

const { MessagingApiClient } = messagingApi;

// ============================================
// Configuration
// ============================================

/**
 * Check if we're in mock mode (development with test token)
 */
function isMockMode(): boolean {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const isDev = process.env.NODE_ENV === 'development';
  
  // Mock mode if in dev and token looks like a placeholder
  return isDev && (!token || token === 'test-token' || token.startsWith('test-'));
}

/**
 * Initialize LINE Messaging API client
 * Uses channel access token from environment variables
 */
function getLineClient(): messagingApi.MessagingApiClient {
  const channelAccessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  
  if (!channelAccessToken) {
    throw new Error('LINE_CHANNEL_ACCESS_TOKEN environment variable is not set');
  }
  
  return new MessagingApiClient({
    channelAccessToken,
  });
}

// ============================================
// Coupon Delivery Service
// ============================================

interface SendCouponOptions {
  /** LINE user ID to send the coupon to */
  lineUserId: string;
  /** Generated coupon code */
  couponCode: string;
}

/**
 * Send a coupon Flex Message to a user via LINE Messaging API
 * 
 * In development mode with test credentials, this will mock the API call
 * and log the message that would be sent.
 * 
 * @param options - Contains lineUserId and couponCode
 * @returns Promise that resolves when message is sent
 * @throws Error if LINE API call fails (production only)
 */
export async function sendCouponToUser(options: SendCouponOptions): Promise<void> {
  const { lineUserId, couponCode } = options;
  
  // Get coupon configuration from environment
  const discountText = process.env.COUPON_DISCOUNT_TEXT || '10% OFF';
  const redeemUrl = process.env.COUPON_REDEEM_URL || 'https://example.com/redeem';
  const expiryDays = parseInt(process.env.COUPON_EXPIRY_DAYS || '30', 10);
  
  // Build the Flex Message
  const flexMessage = buildCouponFlexMessage({
    couponCode,
    discountText,
    redeemUrl,
    expiryDays,
  });
  
  // In mock mode, skip the actual API call
  if (isMockMode()) {
    console.log('🔧 LINE Mock Mode: Would send Flex Message to user');
    console.log(`   📱 User ID: ${lineUserId}`);
    console.log(`   🎫 Coupon Code: ${couponCode}`);
    console.log(`   💰 Discount: ${discountText}`);
    console.log(`   🔗 Redeem URL: ${redeemUrl}`);
    console.log(`   📅 Expires in: ${expiryDays} days`);
    console.log('   ✅ Mock message sent successfully');
    return;
  }
  
  // Production: Get LINE client and send message
  const client = getLineClient();
  
  try {
    await client.pushMessage({
      to: lineUserId,
      messages: [flexMessage],
    });
    
    console.log(`✅ Coupon sent to user: ${lineUserId}, code: ${couponCode}`);
  } catch (error) {
    console.error('❌ Failed to send LINE message:', error);
    throw new Error(`Failed to send coupon to LINE user: ${lineUserId}`);
  }
}

/**
 * Validate that LINE configuration is properly set
 * Can be called at startup to ensure environment is configured
 */
export function validateLineConfig(): boolean {
  if (isMockMode()) {
    console.log('🔧 LINE Service: Running in mock mode (development)');
    return true;
  }
  
  const requiredVars = [
    'LINE_CHANNEL_ACCESS_TOKEN',
  ];
  
  const missing = requiredVars.filter((varName) => !process.env[varName]);
  
  if (missing.length > 0) {
    console.warn(`⚠️ Missing LINE config vars: ${missing.join(', ')}`);
    return false;
  }
  
  return true;
}

const lineService = {
  sendCouponToUser,
  validateLineConfig,
};

export default lineService;
