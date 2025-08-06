'use client';

import { useState } from 'react';

export type LoginStep = 'phone' | 'otp' | 'notification' | 'deviceLimit';

export function useLoginSteps() {
  const [step, setStep] = useState<LoginStep>('phone');
  const [otpData, setOtpData] = useState<unknown>(null);
  const [notificationContent, setNotificationContent] = useState<unknown>(null);
  const [deviceLimitData, setDeviceLimitData] = useState<unknown>(null);

  const goToStep = (nextStep: LoginStep) => setStep(nextStep);

  return {
    step,
    goToStep,
    otpData,
    setOtpData,
    notificationContent,
    setNotificationContent,
    deviceLimitData,
    setDeviceLimitData,
  };
}
