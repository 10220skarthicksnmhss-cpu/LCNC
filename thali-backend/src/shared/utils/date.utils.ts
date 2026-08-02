// src/shared/utils/date.utils.ts
import { subHours, format, isAfter } from 'date-fns';

export interface AlertWindow {
  notifyAt: Date;
  respondDeadline: Date;
  lockAt: Date;
}

/**
 * Calculates the three critical timestamps for a price alert.
 * notifyAt       = deliveryDateTime - 5 hours  (notification sent)
 * respondDeadline = deliveryDateTime - 3 hours  (user must respond by)
 * lockAt          = respondDeadline              (order gets locked)
 */
export function calculateAlertWindow(
  deliveryDate: Date,
  deliveryTime: string, // "HH:MM"
): AlertWindow {
  const [hours, minutes] = deliveryTime.split(':').map(Number);
  const deliveryDateTime = new Date(deliveryDate);
  deliveryDateTime.setHours(hours, minutes, 0, 0);

  const notifyAt       = subHours(deliveryDateTime, 5);
  const respondDeadline = subHours(deliveryDateTime, 3);
  const lockAt          = respondDeadline;

  return { notifyAt, respondDeadline, lockAt };
}

export function isDeadlinePassed(deadline: Date): boolean {
  return isAfter(new Date(), deadline);
}

export function secondsUntil(target: Date): number {
  return Math.max(0, Math.floor((target.getTime() - Date.now()) / 1000));
}

export function formatTime(date: Date): string {
  return format(date, 'hh:mm aa');
}

export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}
