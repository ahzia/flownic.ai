/**
 * Stable domain terms — do not use exam/test/session/match/booking interchangeably.
 * See technical guide §8.1.
 */

export const ASSESSMENT_TRACK_SLUG = "telc-de-b1-speaking" as const;

export type AssessmentTrackSlug = typeof ASSESSMENT_TRACK_SLUG;

export const BOOKING_STATUSES = [
  "draft",
  "pending_confirmation",
  "confirmed",
  "cancelled",
  "late",
  "no_show",
  "completed",
] as const;

export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export const SESSION_MODES = ["peer", "ai_examiner"] as const;
export type SessionMode = (typeof SESSION_MODES)[number];

export const SESSION_STATUSES = [
  "scheduled",
  "waiting",
  "in_progress",
  "processing",
  "completed",
  "failed",
  "cancelled",
] as const;

export type SessionStatus = (typeof SESSION_STATUSES)[number];

export const SESSION_ROLES = ["examiner", "candidate"] as const;
export type SessionRole = (typeof SESSION_ROLES)[number];

export const ATTENDANCE_STATES = [
  "expected",
  "joined",
  "ready",
  "left",
  "completed",
  "no_show",
] as const;

export type AttendanceState = (typeof ATTENDANCE_STATES)[number];

export const PRACTICE_SLOT_STATUSES = [
  "draft",
  "published",
  "closed",
  "cancelled",
] as const;

export type PracticeSlotStatus = (typeof PRACTICE_SLOT_STATUSES)[number];
