/**
 * SurveyResponse Mongoose Model
 * 
 * This model represents survey responses in MongoDB.
 * Collection name: survey_responses
 */

import mongoose, { Schema, Document, Model } from 'mongoose';
import { AGE_RANGES, GENDERS, CHANNELS, PRICE_RANGES } from '@/types/survey';

// ============================================
// TypeScript Interface
// ============================================

export interface ISurveyResponse extends Document {
  /** LINE user ID (indexed, unique) */
  lineUserId: string;
  
  /** User's age range selection */
  ageRange: typeof AGE_RANGES[number];
  
  /** User's gender selection */
  gender: typeof GENDERS[number];
  
  /** Selected discovery/purchase channels */
  channels: (typeof CHANNELS[number])[];
  
  /** Additional text if "other" channel was selected */
  channelOtherText: string | null;
  
  /** User's price range preference */
  priceRange: typeof PRICE_RANGES[number];
  
  /** User's current supplement brand */
  currentBrand: string;
  
  /** Generated coupon code */
  couponCode: string;
  
  /** Timestamp when coupon was sent via LINE */
  couponSentAt: Date | null;
  
  /** Timestamp when survey was submitted */
  submittedAt: Date;
  
  /** Auto-managed timestamps */
  createdAt: Date;
  updatedAt: Date;
}

// ============================================
// Mongoose Schema Definition
// ============================================

const surveyResponseSchema = new Schema<ISurveyResponse>(
  {
    lineUserId: {
      type: String,
      required: [true, 'LINE user ID is required'],
      unique: true,
      index: true,
      trim: true,
    },
    
    ageRange: {
      type: String,
      required: [true, 'Age range is required'],
      enum: {
        values: AGE_RANGES,
        message: 'Invalid age range value',
      },
    },
    
    gender: {
      type: String,
      required: [true, 'Gender is required'],
      enum: {
        values: GENDERS,
        message: 'Invalid gender value',
      },
    },
    
    channels: {
      type: [String],
      required: [true, 'At least one channel is required'],
      validate: {
        validator: function (v: string[]) {
          return v.length > 0 && v.every((ch) => CHANNELS.includes(ch as typeof CHANNELS[number]));
        },
        message: 'Invalid channel selection',
      },
    },
    
    channelOtherText: {
      type: String,
      default: null,
      trim: true,
      maxlength: [200, 'Other channel text is too long'],
    },
    
    priceRange: {
      type: String,
      required: [true, 'Price range is required'],
      enum: {
        values: PRICE_RANGES,
        message: 'Invalid price range value',
      },
    },
    
    currentBrand: {
      type: String,
      required: [true, 'Current brand is required'],
      trim: true,
      maxlength: [200, 'Brand name is too long'],
    },
    
    couponCode: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      index: true,
    },
    
    couponSentAt: {
      type: Date,
      default: null,
    },
    
    submittedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  {
    // Enable automatic createdAt and updatedAt fields
    timestamps: true,
    
    // Use survey_responses as collection name
    collection: 'survey_responses',
  }
);

// ============================================
// Indexes for Query Performance
// ============================================

// Compound index for common queries
surveyResponseSchema.index({ submittedAt: -1 });
surveyResponseSchema.index({ couponCode: 1, lineUserId: 1 });

// ============================================
// Model Export
// ============================================

/**
 * Prevent model recompilation during hot reloads in development
 */
const SurveyResponse: Model<ISurveyResponse> =
  mongoose.models.SurveyResponse ||
  mongoose.model<ISurveyResponse>('SurveyResponse', surveyResponseSchema);

export default SurveyResponse;

