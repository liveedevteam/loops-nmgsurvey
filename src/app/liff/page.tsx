/**
 * LIFF Entry Page
 * 
 * This page handles LIFF URL access (line://app/xxx).
 * Renders the same survey as the root page.
 */

'use client';

import { useEffect } from 'react';
import { SurveyContainer } from '@/components/survey';

export default function LiffPage() {
  // #region agent log
  useEffect(() => {
    console.log('📍 Route: /liff page loaded');
  }, []);
  // #endregion
  
  return <SurveyContainer />;
}
