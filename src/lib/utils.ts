import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Get a date formatted in HST (Hawaii Standard Time) as YYYY-MM-DD.
 *
 * The game's daily puzzle resets at midnight HST, so all date comparisons
 * for streaks, last-played checks, etc. must use HST to stay consistent
 * with the puzzle schedule.
 *
 * HST is UTC-10 with no daylight saving time.
 */
export function getDateInHST(date: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Pacific/Honolulu',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

/**
 * Shift an HST date string by a number of calendar days.
 *
 * This parses the base date as noon in explicit HST (-10:00), so callers
 * get stable results regardless of the user's local timezone.
 */
export function shiftHSTDate(baseDate: string, dayOffset: number): string {
  const d = new Date(`${baseDate}T12:00:00-10:00`);
  d.setDate(d.getDate() + dayOffset);
  return getDateInHST(d);
}

/**
 * Get yesterday's date in HST as YYYY-MM-DD.
 *
 * Computes the HST "today" first, then subtracts one calendar day,
 * so the result is always correct regardless of the caller's local timezone.
 */
export function getYesterdayInHST(): string {
  const todayStr = getDateInHST();
  return shiftHSTDate(todayStr, -1);
}

/**
 * Shuffles an array using Fisher-Yates algorithm.
 * Returns a new array with shuffled elements and a mapping of new index → original index.
 */
export function shuffleWithMapping<T>(array: T[]): { shuffled: T[]; indexMap: number[] } {
  const indices = array.map((_, i) => i);
  
  // Fisher-Yates shuffle on indices
  for (let i = indices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [indices[i], indices[j]] = [indices[j], indices[i]];
  }
  
  return {
    shuffled: indices.map(i => array[i]),
    indexMap: indices, // indexMap[newIndex] = originalIndex
  };
}
