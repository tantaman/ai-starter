import { queriesWithContext } from "@rocicorp/zero";
import { builder, Session } from "./schema";

export const queries = queriesWithContext({
  currentUser(sess: Session | null) {
    return builder.user.where("id", "IS", sess?.user.id ?? null).one();
  },

  // Event Types
  userEventTypes(sess: Session | null) {
    if (!sess) return builder.eventType.where("id", "=", "").limit(0);
    return builder.eventType
      .where("userId", "=", sess.user.id)
      .where("active", "=", true)
      .orderBy("createdAt", "desc");
  },

  eventType(sess: Session | null, eventTypeId: string) {
    return builder.eventType
      .where("id", "=", eventTypeId)
      .related("user")
      .one();
  },

  // Availability
  userAvailability(sess: Session | null) {
    return builder.availabilitySchedule
      .where("userId", "IS", sess?.user.id ?? null)
      .orderBy("dayOfWeek", "asc")
      .orderBy("startTime", "asc");
  },

  // Bookings
  userBookings(sess: Session | null) {
    return builder.booking
      .where("hostId", "IS", sess?.user.id ?? null)
      .related("eventType")
      .orderBy("startTime", "desc");
  },

  upcomingBookings(sess: Session | null) {
    const now: number = Date.now();
    return builder.booking
      .where("hostId", "IS", sess?.user.id ?? null)
      .where("startTime", ">", now)
      .where("status", "=", "confirmed")
      .related("eventType")
      .orderBy("startTime", "asc")
      .limit(10);
  },

  // Public queries for booking flow
  publicEventType(sess: Session | null, eventTypeId: string) {
    return builder.eventType
      .where("id", "=", eventTypeId)
      .where("active", "=", true)
      .related("user")
      .one();
  },

  publicUserAvailability(sess: Session | null, userId: string) {
    return builder.availabilitySchedule
      .where("userId", "=", userId)
      .orderBy("dayOfWeek", "asc")
      .orderBy("startTime", "asc");
  },

  eventTypeBookings(
    sess: Session | null,
    eventTypeId: string,
    startDate: number,
    endDate: number
  ) {
    return builder.booking
      .where("eventTypeId", "=", eventTypeId)
      .where("startTime", ">=", startDate)
      .where("startTime", "<=", endDate)
      .where("status", "=", "confirmed");
  },
} as const);
