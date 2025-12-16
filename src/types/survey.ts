/**
 * Survey Types and Zod Validation Schemas
 * 
 * This module defines all TypeScript types and Zod schemas
 * for survey data validation, shared between client and server.
 */

import { z } from 'zod';

// ============================================
// Survey Option Constants
// ============================================

/** Age range options for Step 1 */
export const AGE_RANGES = [
  '18-24',
  '25-34',
  '35-44',
  '45-54',
  '55-64',
  '65+',
] as const;

/** Gender options for Step 2 */
export const GENDERS = ['male', 'female'] as const;

/** Channel options for Step 3 (multi-select) */
export const CHANNELS = [
  'facebook',
  'instagram',
  'tiktok',
  'ecommerce',
  'retail',
  'medical',
  'other',
] as const;

/** Human-readable labels for channels */
export const CHANNEL_LABELS: Record<typeof CHANNELS[number], string> = {
  facebook: 'Facebook',
  instagram: 'Instagram',
  tiktok: 'TikTok',
  ecommerce: 'Ecommerce (Shopee / Lazada)',
  retail: 'Retail store (EveandBoy / Sephora)',
  medical: 'Certified medical store',
  other: 'Other',
};

/** Price range options for Step 4 */
export const PRICE_RANGES = [
  'lte500',
  '500-1500',
  '1500-2500',
  'gte2500',
] as const;

/** Human-readable labels for price ranges */
export const PRICE_RANGE_LABELS: Record<typeof PRICE_RANGES[number], string> = {
  lte500: '≤ 500 THB',
  '500-1500': '500–1,500 THB',
  '1500-2500': '1,500–2,500 THB',
  gte2500: '≥ 2,500 THB',
};

// ============================================
// Zod Schemas
// ============================================

/** Schema for age range selection */
export const ageRangeSchema = z.enum(AGE_RANGES, {
  message: 'Please select your age range',
});

/** Schema for gender selection */
export const genderSchema = z.enum(GENDERS, {
  message: 'Please select your gender',
});

/** Schema for channel selection (multi-select) */
export const channelsSchema = z.array(z.enum(CHANNELS)).min(1, {
  message: 'Please select at least one channel',
});

/** Schema for price range selection */
export const priceRangeSchema = z.enum(PRICE_RANGES, {
  message: 'Please select a price range',
});

/** Schema for current brand input */
export const currentBrandSchema = z
  .string()
  .min(1, { message: 'Please enter your current supplement brand' })
  .max(200, { message: 'Brand name is too long' });

/** Schema for LINE user ID */
export const lineUserIdSchema = z
  .string()
  .min(1, { message: 'LINE user ID is required' });

/** Schema for optional "other" channel text */
export const channelOtherTextSchema = z.string().max(200).nullable().optional();

// ============================================
// Combined Schemas for API
// ============================================

/** Full survey submission schema */
export const surveySubmitSchema = z.object({
  lineUserId: lineUserIdSchema,
  ageRange: ageRangeSchema,
  gender: genderSchema,
  channels: channelsSchema,
  channelOtherText: channelOtherTextSchema,
  priceRange: priceRangeSchema,
  currentBrand: currentBrandSchema,
});

/** Schema for checking survey status */
export const surveyStatusSchema = z.object({
  lineUserId: lineUserIdSchema,
});

// ============================================
// TypeScript Types (inferred from Zod)
// ============================================

export type AgeRange = z.infer<typeof ageRangeSchema>;
export type Gender = z.infer<typeof genderSchema>;
export type Channel = typeof CHANNELS[number];
export type PriceRange = z.infer<typeof priceRangeSchema>;

export type SurveySubmitInput = z.infer<typeof surveySubmitSchema>;
export type SurveyStatusInput = z.infer<typeof surveyStatusSchema>;

/** Survey form state (client-side, before submission) */
export interface SurveyFormData {
  ageRange: AgeRange | null;
  gender: Gender | null;
  channels: Channel[];
  channelOtherText: string;
  priceRange: PriceRange | null;
  currentBrand: string;
}

/** Initial empty form state */
export const INITIAL_FORM_DATA: SurveyFormData = {
  ageRange: null,
  gender: null,
  channels: [],
  channelOtherText: '',
  priceRange: null,
  currentBrand: '',
};

/** Survey status response */
export interface SurveyStatusResponse {
  alreadySubmitted: boolean;
  couponCode?: string;
}

/** Survey submission response */
export interface SurveySubmitResponse {
  success: boolean;
  couponCode: string;
}
