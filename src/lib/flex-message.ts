/**
 * LINE Flex Message Builder
 * 
 * Creates beautifully formatted Flex Messages for LINE
 * specifically designed for coupon delivery after survey completion.
 */

import { messagingApi } from '@line/bot-sdk';

type FlexMessage = messagingApi.FlexMessage;
type FlexBubble = messagingApi.FlexBubble;

interface CouponFlexMessageOptions {
  /** The generated coupon code */
  couponCode: string;
  /** Discount text to display (e.g., "10% OFF") */
  discountText: string;
  /** URL for the redeem button */
  redeemUrl: string;
  /** Number of days until coupon expires */
  expiryDays: number;
}

/**
 * Builds a premium Flex Message coupon for LINE
 * 
 * Design features:
 * - Gradient hero section with brand feel
 * - Large, prominent coupon code
 * - Redeem CTA button
 * - Clear expiry and terms
 */
export function buildCouponFlexMessage(
  options: CouponFlexMessageOptions
): FlexMessage {
  const { couponCode, discountText, redeemUrl, expiryDays } = options;

  // Calculate expiry date
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + expiryDays);
  const expiryText = expiryDate.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const bubble: FlexBubble = {
    type: 'bubble',
    size: 'mega',
    
    // Hero section with gradient-like appearance
    hero: {
      type: 'box',
      layout: 'vertical',
      contents: [
        {
          type: 'text',
          text: '🎉 Thank You!',
          weight: 'bold',
          size: 'xl',
          color: '#ffffff',
          align: 'center',
        },
        {
          type: 'text',
          text: "Here's your exclusive coupon",
          size: 'sm',
          color: '#ffffff',
          align: 'center',
          margin: 'sm',
        },
      ],
      backgroundColor: '#0D9488',
      paddingAll: '24px',
    },
    
    // Body section with coupon details
    body: {
      type: 'box',
      layout: 'vertical',
      contents: [
        // Discount amount
        {
          type: 'text',
          text: discountText,
          weight: 'bold',
          size: '3xl',
          color: '#0D9488',
          align: 'center',
        },
        
        // Separator
        {
          type: 'separator',
          margin: 'lg',
          color: '#E5E7EB',
        },
        
        // Coupon code section
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: 'YOUR CODE',
              size: 'xs',
              color: '#6B7280',
              align: 'center',
            },
            {
              type: 'text',
              text: couponCode,
              weight: 'bold',
              size: 'xxl',
              color: '#111827',
              align: 'center',
              margin: 'sm',
            },
          ],
          margin: 'lg',
          paddingAll: '16px',
          backgroundColor: '#F9FAFB',
          cornerRadius: '12px',
        },
        
        // Expiry info
        {
          type: 'box',
          layout: 'horizontal',
          contents: [
            {
              type: 'text',
              text: '📅 Valid until:',
              size: 'xs',
              color: '#6B7280',
              flex: 1,
            },
            {
              type: 'text',
              text: expiryText,
              size: 'xs',
              color: '#374151',
              align: 'end',
              flex: 2,
            },
          ],
          margin: 'lg',
        },
      ],
      paddingAll: '20px',
    },
    
    // Footer with CTA
    footer: {
      type: 'box',
      layout: 'vertical',
      contents: [
        // Redeem button
        {
          type: 'button',
          action: {
            type: 'uri',
            label: 'Redeem Now',
            uri: redeemUrl,
          },
          style: 'primary',
          color: '#0D9488',
          height: 'md',
        },
        
        // Terms
        {
          type: 'text',
          text: 'Terms: Cannot be combined with other offers. One-time use only.',
          size: 'xxs',
          color: '#9CA3AF',
          align: 'center',
          margin: 'md',
          wrap: true,
        },
      ],
      paddingAll: '16px',
    },
    
    // Styling
    styles: {
      hero: {
        separator: false,
      },
    },
  };

  return {
    type: 'flex',
    altText: `🎁 Your ${discountText} coupon code: ${couponCode}`,
    contents: bubble,
  };
}

export default buildCouponFlexMessage;
