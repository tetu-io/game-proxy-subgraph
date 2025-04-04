export const SECONDS_IN_DAY = 24 * 60 * 60;

export function getEpochDay(timestamp: number): number {
  return Math.floor(timestamp / SECONDS_IN_DAY);
}

export function getEpochWeek(timestamp: number): number {
  return Math.floor((getEpochDay(timestamp) + 3) / 7);
}