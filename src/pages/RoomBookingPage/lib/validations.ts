import { BookingFormData } from "../hooks/useBookingForm";
import { timeToMinutes } from "./lib";

export const BUSINESS_HOURS = {
  START: "09:00",
  END: "20:00",
  START_MINUTES: 9 * 60,
  END_MINUTES: 20 * 60,
  MIN_DURATION_MINUTES: 30,
} as const;

export function validateTimeRange(
  startTime: string,
  endTime: string,
): {
  valid: boolean;
  message?: string;
} {
  if (!startTime || !endTime) {
    return {
      valid: false,
      message: "시작 시간과 종료 시간을 모두 선택해주세요",
    };
  }

  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);

  if (end <= start) {
    return {
      valid: false,
      message: "종료 시간은 시작 시간보다 늦어야 합니다",
    };
  }

  return { valid: true };
}

export function validateBusinessHours(time: string): {
  valid: boolean;
  message?: string;
} {
  const minutes = timeToMinutes(time);

  if (minutes < BUSINESS_HOURS.START_MINUTES || minutes > BUSINESS_HOURS.END_MINUTES) {
    return {
      valid: false,
      message: `시간은 ${BUSINESS_HOURS.START} ~ ${BUSINESS_HOURS.END} 사이여야 합니다`,
    };
  }

  return { valid: true };
}

export function validateMinDuration(
  startTime: string,
  endTime: string,
): {
  valid: boolean;
  message?: string;
} {
  const start = timeToMinutes(startTime);
  const end = timeToMinutes(endTime);
  const duration = end - start;

  if (duration < BUSINESS_HOURS.MIN_DURATION_MINUTES) {
    return {
      valid: false,
      message: `최소 ${BUSINESS_HOURS.MIN_DURATION_MINUTES}분 이상 예약해야 합니다`,
    };
  }

  return { valid: true };
}

export function validateReservation(
  formValues: BookingFormData,
  selectedRoomId: string | null,
): { valid: boolean; message?: string } {
  if (!selectedRoomId) {
    return {
      valid: false,
      message: "예약할 회의실을 선택해주세요",
    };
  }

  const timeRangeResult = validateTimeRange(formValues.start, formValues.end);
  if (!timeRangeResult.valid) {
    return timeRangeResult;
  }

  const startHoursResult = validateBusinessHours(formValues.start);
  if (!startHoursResult.valid) {
    return startHoursResult;
  }

  const endHoursResult = validateBusinessHours(formValues.end);
  if (!endHoursResult.valid) {
    return endHoursResult;
  }

  const minDurationResult = validateMinDuration(formValues.start, formValues.end);
  if (!minDurationResult.valid) {
    return minDurationResult;
  }
  return { valid: true };
}

// 얘가 무슨 요구사항이었을까?
// 1.. 
// 2..
// 3..
// 얘가 어떤 형태에 맞지 않으면 터져야 해
// zod 쓰면 어떨까?