/**
 * Survey tRPC Router
 * 
 * Handles survey-related API endpoints:
 * - getStatus: Check if user has already submitted a survey
 * - submit: Submit survey responses and send coupon
 */

import { TRPCError } from '@trpc/server';
import { router, loggedProcedure } from '../trpc';
import {
  surveyStatusSchema,
  surveySubmitSchema,
  SurveyStatusResponse,
  SurveySubmitResponse,
} from '@/types/survey';
import { connectDB } from '@/lib/db';
import SurveyResponse from '@/lib/models/SurveyResponse';
import { generateCouponCode } from '@/lib/coupon';
import { sendCouponToUser } from '../services/line';

export const surveyRouter = router({
  /**
   * Check Survey Status
   * 
   * Checks if a user has already submitted a survey.
   * If yes, returns the existing coupon code.
   * 
   * @input { lineUserId: string }
   * @returns { alreadySubmitted: boolean, couponCode?: string }
   */
  getStatus: loggedProcedure
    .input(surveyStatusSchema)
    .query(async ({ input }): Promise<SurveyStatusResponse> => {
      const { lineUserId } = input;
      
      // Connect to database
      await connectDB();
      
      // Check for existing submission
      const existingResponse = await SurveyResponse.findOne({
        lineUserId,
      }).lean();
      
      if (existingResponse) {
        return {
          alreadySubmitted: true,
          couponCode: existingResponse.couponCode,
        };
      }
      
      return {
        alreadySubmitted: false,
      };
    }),

  /**
   * Submit Survey
   * 
   * Saves survey responses, generates a coupon code,
   * and sends a Flex Message coupon via LINE Messaging API.
   * 
   * @input Survey answers + lineUserId
   * @returns { success: boolean, couponCode: string }
   */
  submit: loggedProcedure
    .input(surveySubmitSchema)
    .mutation(async ({ input }): Promise<SurveySubmitResponse> => {
      const {
        lineUserId,
        ageRange,
        gender,
        channels,
        channelOtherText,
        priceRange,
        currentBrand,
      } = input;
      
      // Connect to database
      await connectDB();
      
      // Check for existing submission (prevent duplicates)
      const existingResponse = await SurveyResponse.findOne({ lineUserId });
      
      if (existingResponse) {
        // User has already submitted - return existing coupon
        return {
          success: true,
          couponCode: existingResponse.couponCode,
        };
      }
      
      // Generate unique coupon code
      const couponCode = generateCouponCode();
      
      try {
        // Create new survey response document
        const surveyResponse = new SurveyResponse({
          lineUserId,
          ageRange,
          gender,
          channels,
          channelOtherText: channelOtherText || null,
          priceRange,
          currentBrand,
          couponCode,
          submittedAt: new Date(),
        });
        
        // Save to database
        await surveyResponse.save();
        
        // Send coupon via LINE Messaging API
        try {
          await sendCouponToUser({
            lineUserId,
            couponCode,
          });
          
          // Update couponSentAt timestamp
          await SurveyResponse.updateOne(
            { _id: surveyResponse._id },
            { couponSentAt: new Date() }
          );
        } catch (lineError) {
          // Log LINE API error but don't fail the submission
          // The coupon code is saved, user can still use it
          console.error('Failed to send LINE message:', lineError);
        }
        
        return {
          success: true,
          couponCode,
        };
      } catch (error) {
        // Handle MongoDB duplicate key error
        if (error instanceof Error && error.message.includes('duplicate key')) {
          // Fetch the existing response and return its coupon
          const existing = await SurveyResponse.findOne({ lineUserId });
          if (existing) {
            return {
              success: true,
              couponCode: existing.couponCode,
            };
          }
        }
        
        console.error('Survey submission error:', error);
        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'Failed to save survey response. Please try again.',
        });
      }
    }),
});

export type SurveyRouter = typeof surveyRouter;

