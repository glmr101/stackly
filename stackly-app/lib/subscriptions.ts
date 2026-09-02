

export type BillingCycle = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

/**
 * Returns ordinal string for a number, e.g. 1 -> "1st", 2 -> "2nd", 3 -> "3rd", 6 -> "6th", 21 -> "21st"
 */
export function getOrdinalSuffix(day: number): string {
  const num = Math.floor(day) || 1;
  const j = num % 10;
  const k = num % 100;
  if (j === 1 && k !== 11) {
    return `${num}st`;
  }
  if (j === 2 && k !== 12) {
    return `${num}nd`;
  }
  if (j === 3 && k !== 13) {
    return `${num}rd`;
  }
  return `${num}th`;
}

export const WEEKDAYS = [
  { value: 1, label: 'Mon', fullLabel: 'Monday' },
  { value: 2, label: 'Tue', fullLabel: 'Tuesday' },
  { value: 3, label: 'Wed', fullLabel: 'Wednesday' },
  { value: 4, label: 'Thu', fullLabel: 'Thursday' },
  { value: 5, label: 'Fri', fullLabel: 'Friday' },
  { value: 6, label: 'Sat', fullLabel: 'Saturday' },
  { value: 0, label: 'Sun', fullLabel: 'Sunday' },
];

export const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
];

/**
 * Calculates the exact upcoming nextChargeDate ISO string based on cycle and recurrence parameters.
 * Uses local noon (12:00:00) to ensure stability against Daylight Saving and timezone boundaries.
 */
export function calculateNextChargeDate(
  billingCycle: BillingCycle,
  options: {
    dayOfMonth?: number; // 1 - 31
    dayOfWeek?: number;  // 0 = Sun, 1 = Mon ... 6 = Sat
    monthOfYear?: number; // 0 = Jan ... 11 = Dec
  }
): string {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  const currentDate = now.getDate();

  try {
    if (billingCycle === 'weekly') {
      const targetDayOfWeek = options.dayOfWeek !== undefined ? options.dayOfWeek : 1; // Default Monday
      const currentDayOfWeek = now.getDay();
      let daysToAdd = targetDayOfWeek - currentDayOfWeek;
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      const targetDate = new Date(currentYear, currentMonth, currentDate + daysToAdd, 12, 0, 0);
      return targetDate.toISOString();
    }

    if (billingCycle === 'yearly') {
      const targetMonth = options.monthOfYear !== undefined ? options.monthOfYear : currentMonth;
      const targetDay = options.dayOfMonth !== undefined ? options.dayOfMonth : 1;

      // Check days in target month
      const maxDays = new Date(currentYear, targetMonth + 1, 0).getDate();
      const clampedDay = Math.min(Math.max(1, targetDay), maxDays);

      let targetDate = new Date(currentYear, targetMonth, clampedDay, 12, 0, 0);
      // If target date has already passed this year, advance to next year
      if (targetDate.getTime() <= now.getTime()) {
        const nextYearMaxDays = new Date(currentYear + 1, targetMonth + 1, 0).getDate();
        targetDate = new Date(currentYear + 1, targetMonth, Math.min(Math.max(1, targetDay), nextYearMaxDays), 12, 0, 0);
      }
      return targetDate.toISOString();
    }

    if (billingCycle === 'quarterly') {
      const targetDay = options.dayOfMonth !== undefined ? options.dayOfMonth : 1;
      let targetYear = currentYear;
      let targetMonth = currentMonth;

      if (currentDate >= targetDay) {
        targetMonth += 1;
        if (targetMonth > 11) {
          targetMonth = targetMonth % 12;
          targetYear += 1;
        }
      }

      const maxDays = new Date(targetYear, targetMonth + 1, 0).getDate();
      const clampedDay = Math.min(Math.max(1, targetDay), maxDays);
      const targetDate = new Date(targetYear, targetMonth, clampedDay, 12, 0, 0);
      return targetDate.toISOString();
    }

    // Default: Monthly
    const targetDay = options.dayOfMonth !== undefined ? options.dayOfMonth : 6;
    let targetYear = currentYear;
    let targetMonth = currentMonth;

    if (currentDate >= targetDay) {
      targetMonth += 1;
      if (targetMonth > 11) {
        targetMonth = 0;
        targetYear += 1;
      }
    }

    const maxDays = new Date(targetYear, targetMonth + 1, 0).getDate();
    const clampedDay = Math.min(Math.max(1, targetDay), maxDays);
    const targetDate = new Date(targetYear, targetMonth, clampedDay, 12, 0, 0);
    return targetDate.toISOString();
  } catch {
    return new Date().toISOString();
  }
}

/**
 * Returns human-friendly recurrence description, e.g.:
 * - "Every 6th of the month"
 * - "Every Monday"
 * - "Every 3 months on the 6th"
 * - "Every year on Oct 6th"
 */
export function formatDueSchedule(sub: {
  billingCycle?: BillingCycle;
  nextChargeDate?: string;
  dueDay?: number;
}): string {
  try {
    const cycle = sub.billingCycle || 'monthly';
    const date = sub.nextChargeDate ? new Date(sub.nextChargeDate) : new Date();
    const validDate = isNaN(date.getTime()) ? new Date() : date;
    const day = sub.dueDay !== undefined ? sub.dueDay : validDate.getDate();

    switch (cycle) {
      case 'weekly': {
        const weekdayIndex = sub.dueDay !== undefined ? sub.dueDay : validDate.getDay();
        const weekdayObj = WEEKDAYS.find((w) => w.value === weekdayIndex);
        const weekdayName = weekdayObj ? weekdayObj.fullLabel : 'Monday';
        return `Every ${weekdayName}`;
      }
      case 'monthly': {
        return `Every ${getOrdinalSuffix(day)} of the month`;
      }
      case 'quarterly': {
        return `Every 3 months on the ${getOrdinalSuffix(day)}`;
      }
      case 'yearly': {
        const monthIndex = validDate.getMonth();
        const monthName = MONTHS[monthIndex] || 'Jan';
        return `Every year on ${monthName} ${getOrdinalSuffix(day)}`;
      }
      default:
        return `Every ${getOrdinalSuffix(day)} of the month`;
    }
  } catch {
    return 'Recurring';
  }
}

/**
 * Formats date into readable string, e.g. "Nov 6, 2026"
 * Safe across all JS engines including Hermes.
 */
export function formatReadableDate(dateInput?: Date | string | null): string {
  if (!dateInput) return '';
  try {
    const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    if (isNaN(d.getTime())) return '';
    const m = MONTHS[d.getMonth()] || 'Jan';
    const day = d.getDate();
    const year = d.getFullYear();
    return `${m} ${day}, ${year}`;
  } catch {
    return '';
  }
}

export type DueStatus = {
  isOverdue: boolean;
  isDueSoon: boolean; // within 7 days
  isDueToday: boolean;
  daysRemaining: number;
  label: string;
};

/**
 * Calculates whether a bill is overdue or due within 7 days.
 */
export function getDueStatus(nextChargeDate?: string): DueStatus {
  if (!nextChargeDate) {
    return { isOverdue: false, isDueSoon: false, isDueToday: false, daysRemaining: 999, label: '' };
  }

  try {
    const chargeDate = new Date(nextChargeDate);
    if (isNaN(chargeDate.getTime())) {
      return { isOverdue: false, isDueSoon: false, isDueToday: false, daysRemaining: 999, label: '' };
    }

    const now = new Date();
    // Normalize to midnight for exact day delta calculation
    const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const chargeMidnight = new Date(chargeDate.getFullYear(), chargeDate.getMonth(), chargeDate.getDate()).getTime();

    const diffMs = chargeMidnight - todayMidnight;
    const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));

    if (daysRemaining < 0) {
      return {
        isOverdue: true,
        isDueSoon: false,
        isDueToday: false,
        daysRemaining,
        label: 'Overdue',
      };
    }

    if (daysRemaining === 0) {
      return {
        isOverdue: false,
        isDueSoon: true,
        isDueToday: true,
        daysRemaining: 0,
        label: 'Due today',
      };
    }

    if (daysRemaining <= 7) {
      return {
        isOverdue: false,
        isDueSoon: true,
        isDueToday: false,
        daysRemaining,
        label: `Due in ${daysRemaining} ${daysRemaining === 1 ? 'day' : 'days'}`,
      };
    }

    return {
      isOverdue: false,
      isDueSoon: false,
      isDueToday: false,
      daysRemaining,
      label: `In ${daysRemaining} days`,
    };
  } catch {
    return { isOverdue: false, isDueSoon: false, isDueToday: false, daysRemaining: 999, label: '' };
  }
}

