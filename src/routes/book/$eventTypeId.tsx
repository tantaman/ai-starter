import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useState, useMemo } from "react";
import { useZero } from "@/ui/use-zero";
import { nanoid } from "nanoid";
import { useSession } from "../../client/auth";

export const Route = createFileRoute("/book/$eventTypeId")({
  component: BookingPage,
});

function BookingPage() {
  const { eventTypeId } = Route.useParams();
  const { data: sess } = useSession();
  const [eventType] = useQuery(queries.publicEventType(sess, eventTypeId));
  const [userAvailability] = useQuery(
    queries.publicUserAvailability(sess, eventType?.userId || "")
  );

  if (!eventType) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="card max-w-md text-center">
          <h1 className="text-2xl font-bold mb-4">Event Not Found</h1>
          <p className="text-neutral-600">
            This booking link is no longer available.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BookingFlow eventType={eventType} userAvailability={userAvailability} />
  );
}

function BookingFlow({
  eventType,
  userAvailability,
}: {
  eventType: any;
  userAvailability: any[];
}) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [showForm, setShowForm] = useState<boolean>(false);

  const availableSlots = useMemo(() => {
    if (!selectedDate) return [];

    const dayOfWeek: number = selectedDate.getDay();
    const dayAvailability = userAvailability.filter(
      (slot) => slot.dayOfWeek === dayOfWeek
    );

    const slots: string[] = [];
    dayAvailability.forEach(({ startTime, endTime }) => {
      const start: Date = new Date(`2025-01-01T${startTime}:00`);
      const end: Date = new Date(`2025-01-01T${endTime}:00`);
      const duration: number = eventType.duration;

      let current: Date = new Date(start);
      while (current < end) {
        const endSlot: Date = new Date(current.getTime() + duration * 60000);
        if (endSlot <= end) {
          slots.push(current.toTimeString().slice(0, 5));
        }
        current = new Date(current.getTime() + 30 * 60000); // 30-minute increments
      }
    });

    return slots;
  }, [selectedDate, userAvailability, eventType.duration]);

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setShowForm(true);
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b border-neutral-200">
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: eventType.color }}
              >
                {eventType.user?.name?.charAt(0)?.toUpperCase() || "?"}
              </div>
              <div>
                <h1 className="text-2xl font-bold">{eventType.title}</h1>
                <p className="text-neutral-600">
                  with {eventType.user?.name} • {eventType.duration} minutes
                </p>
                {eventType.description && (
                  <p className="text-sm text-neutral-500 mt-1">
                    {eventType.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2">
            <div className="p-6 border-r border-neutral-200">
              <h2 className="text-lg font-semibold mb-4">Select a Date</h2>
              <DatePicker
                onDateSelect={setSelectedDate}
                selectedDate={selectedDate}
              />
            </div>

            <div className="p-6">
              <h2 className="text-lg font-semibold mb-4">Select a Time</h2>
              {!selectedDate ? (
                <p className="text-neutral-500">Please select a date first.</p>
              ) : availableSlots.length === 0 ? (
                <p className="text-neutral-500">
                  No available times for this date.
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => handleTimeSelect(time)}
                      className="btn btn-white text-sm"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {showForm && selectedDate && selectedTime && (
          <BookingForm
            eventType={eventType}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onClose={() => setShowForm(false)}
          />
        )}
      </div>
    </div>
  );
}

function DatePicker({
  onDateSelect,
  selectedDate,
}: {
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
}) {
  const today: Date = new Date();
  const dates: Date[] = [];

  // Generate next 14 days
  for (let i = 0; i < 14; i++) {
    const date: Date = new Date(today);
    date.setDate(today.getDate() + i);
    dates.push(date);
  }

  return (
    <div className="grid grid-cols-2 gap-2">
      {dates.map((date) => (
        <button
          key={date.toISOString()}
          onClick={() => onDateSelect(date)}
          className={`p-3 text-left rounded-lg border transition-colors ${
            selectedDate?.toDateString() === date.toDateString()
              ? "border-blue-500 bg-blue-50"
              : "border-neutral-200 hover:border-neutral-300"
          }`}
        >
          <div className="font-medium">
            {date.toLocaleDateString([], { weekday: "short" })}
          </div>
          <div className="text-sm text-neutral-600">
            {date.toLocaleDateString([], { month: "short", day: "numeric" })}
          </div>
        </button>
      ))}
    </div>
  );
}

function BookingForm({
  eventType,
  selectedDate,
  selectedTime,
  onClose,
}: {
  eventType: any;
  selectedDate: Date;
  selectedTime: string;
  onClose: () => void;
}) {
  const zero = useZero();
  const [guestName, setGuestName] = useState<string>("");
  const [guestEmail, setGuestEmail] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isBooked, setIsBooked] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim() || !guestEmail.trim()) return;

    setIsSubmitting(true);
    try {
      const startTime: Date = new Date(selectedDate);
      const [hours, minutes] = selectedTime.split(":").map(Number);
      startTime.setHours(hours, minutes, 0, 0);

      const endTime: Date = new Date(
        startTime.getTime() + eventType.duration * 60000
      );

      await zero.mutate.createBooking({
        id: nanoid(),
        eventTypeId: eventType.id,
        hostId: eventType.userId,
        guestName,
        guestEmail,
        startTime,
        endTime,
        notes: notes || undefined,
      });

      setIsBooked(true);
    } catch (error) {
      console.error("Failed to create booking:", error);
      alert("Failed to book the meeting. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBooked) {
    return (
      <div className="card mt-6 text-center">
        <div className="text-green-600 text-4xl mb-4">✓</div>
        <h2 className="text-xl font-bold mb-2">Booking Confirmed!</h2>
        <p className="text-neutral-600 mb-4">
          Your meeting with {eventType.user?.name} is scheduled for{" "}
          {selectedDate.toLocaleDateString()} at {selectedTime}.
        </p>
        <p className="text-sm text-neutral-500">
          You'll receive a confirmation email at {guestEmail}.
        </p>
      </div>
    );
  }

  return (
    <div className="card mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">Confirm Your Booking</h2>
        <button
          onClick={onClose}
          className="text-neutral-400 hover:text-neutral-600"
        >
          ✕
        </button>
      </div>

      <div className="bg-neutral-50 rounded-lg p-4 mb-6">
        <h3 className="font-medium">{eventType.title}</h3>
        <p className="text-sm text-neutral-600">
          {selectedDate.toLocaleDateString([], {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}{" "}
          at {selectedTime}
        </p>
        <p className="text-sm text-neutral-600">{eventType.duration} minutes</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-neutral-800">
            Your Name *
          </label>
          <input
            type="text"
            value={guestName}
            onChange={(e) => setGuestName(e.target.value)}
            className="input"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-neutral-800">
            Email Address *
          </label>
          <input
            type="email"
            value={guestEmail}
            onChange={(e) => setGuestEmail(e.target.value)}
            className="input"
            placeholder="Enter your email"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-neutral-800">
            Additional Notes
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="input"
            rows={3}
            placeholder="Anything you'd like to share before the meeting?"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-yellow flex-1"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Booking..." : "Confirm Booking"}
          </button>
          <button type="button" onClick={onClose} className="btn btn-white">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
