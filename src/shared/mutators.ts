import { CustomMutatorDefs } from "@rocicorp/zero";
import { schema, Session } from "./schema.js";

export function createMutators(sess: Session | null) {
  return {
    // Event Type Management
    async createEventType(
      tx,
      args: {
        id: string;
        title: string;
        description?: string;
        duration: number;
        color?: string;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.eventType.insert({
        id: args.id,
        userId: sess.user.id,
        title: args.title,
        description: args.description,
        duration: args.duration,
        color: args.color ?? "#3b82f6",
        active: true,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    async updateEventType(
      tx,
      args: {
        id: string;
        title?: string;
        description?: string;
        duration?: number;
        color?: string;
        active?: boolean;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.eventType.update({
        id: args.id,
        ...(args.title && { title: args.title }),
        ...(args.description !== undefined && {
          description: args.description,
        }),
        ...(args.duration && { duration: args.duration }),
        ...(args.color && { color: args.color }),
        ...(args.active !== undefined && { active: args.active }),
        updatedAt: Date.now(),
      });
    },

    async deleteEventType(tx, args: { id: string }) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.eventType.delete({ id: args.id });
    },

    // Availability Management
    async setAvailability(
      tx,
      args: {
        id: string;
        dayOfWeek: number;
        startTime: string;
        endTime: string;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.availabilitySchedule.insert({
        id: args.id,
        userId: sess.user.id,
        dayOfWeek: args.dayOfWeek,
        startTime: args.startTime,
        endTime: args.endTime,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },

    async updateAvailability(
      tx,
      args: {
        id: string;
        startTime?: string;
        endTime?: string;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.availabilitySchedule.update({
        id: args.id,
        ...(args.startTime && { startTime: args.startTime }),
        ...(args.endTime && { endTime: args.endTime }),
        updatedAt: Date.now(),
      });
    },

    async deleteAvailability(tx, args: { id: string }) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.availabilitySchedule.delete({ id: args.id });
    },

    // Booking Management (for hosts)
    async updateBooking(
      tx,
      args: {
        id: string;
        status?: "pending" | "confirmed" | "cancelled";
        notes?: string;
      }
    ) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.booking.update({
        id: args.id,
        ...(args.status && { status: args.status }),
        ...(args.notes !== undefined && { notes: args.notes }),
        updatedAt: Date.now(),
      });
    },

    async cancelBooking(tx, args: { id: string }) {
      if (!sess) throw new Error("Not authenticated");
      await tx.mutate.booking.update({
        id: args.id,
        status: "cancelled",
        updatedAt: Date.now(),
      });
    },

    // Public booking creation (doesn't require authentication)
    async createBooking(
      tx,
      args: {
        id: string;
        eventTypeId: string;
        hostId: string;
        guestName: string;
        guestEmail: string;
        startTime: number;
        endTime: number;
        notes?: string;
      }
    ) {
      await tx.mutate.booking.insert({
        id: args.id,
        eventTypeId: args.eventTypeId,
        hostId: args.hostId,
        guestName: args.guestName,
        guestEmail: args.guestEmail,
        startTime: new Date(args.startTime).getTime(),
        endTime: new Date(args.endTime).getTime(),
        status: "confirmed",
        notes: args.notes,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    },
  } as const satisfies CustomMutatorDefs<typeof schema>;
}

export type Mutators = ReturnType<typeof createMutators>;
