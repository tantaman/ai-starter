import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useState } from "react";
import { useZero } from "@/ui/use-zero";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/")({
  component: Home,
});

function Home() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }

  if (!session) {
    return <LoginPrompt />;
  }

  return <Dashboard />;
}

function LoginPrompt() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="card max-w-md text-center">
        <h1 className="text-3xl font-bold mb-4">BookMe</h1>
        <p className="text-neutral-600 mb-6">
          Create your scheduling page and let others book time with you.
        </p>
        <Link to="/login" className="btn btn-yellow">
          Get Started
        </Link>
      </div>
    </div>
  );
}

function Dashboard() {
  const { data: session } = useSession();
  const [eventTypes] = useQuery(queries.userEventTypes(session));
  const [upcomingBookings] = useQuery(queries.upcomingBookings(session));
  const [showCreateForm, setShowCreateForm] = useState<boolean>(false);

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">BookMe</div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <Link to="/" className="nav-btn">
            Dashboard
          </Link>
          <Link to="/availability" className="nav-btn">
            Availability
          </Link>
          <Link to="/bookings" className="nav-btn">
            Bookings
          </Link>
        </nav>
        <div className="mt-auto text-xs text-neutral-400">© 2025 BookMe</div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
            <button
              onClick={() => setShowCreateForm(true)}
              className="btn btn-yellow"
            >
              Create Event Type
            </button>
          </div>

          {showCreateForm && (
            <CreateEventTypeForm onClose={() => setShowCreateForm(false)} />
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EventTypesSection eventTypes={eventTypes} />
            <UpcomingBookingsSection bookings={upcomingBookings} />
          </div>
        </div>
      </main>
    </div>
  );
}

function EventTypesSection({ eventTypes }: { eventTypes: any[] }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Your Event Types</h2>
      {eventTypes.length === 0 ? (
        <p className="text-neutral-600 text-sm">
          No event types yet. Create your first one to get started!
        </p>
      ) : (
        <div className="space-y-3">
          {eventTypes.map((eventType) => (
            <div
              key={eventType.id}
              className="border border-neutral-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{eventType.title}</h3>
                  <p className="text-sm text-neutral-600">
                    {eventType.duration} minutes
                  </p>
                  {eventType.description && (
                    <p className="text-xs text-neutral-500 mt-1">
                      {eventType.description}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: eventType.color }}
                  />
                  <Link
                    to={`/book/${eventType.id as string}` as any}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Share Link
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UpcomingBookingsSection({ bookings }: { bookings: any[] }) {
  return (
    <div className="card">
      <h2 className="text-lg font-semibold mb-4">Upcoming Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-neutral-600 text-sm">No upcoming bookings.</p>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="border border-neutral-200 rounded-lg p-3"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{booking.eventType?.title}</h3>
                  <p className="text-sm text-neutral-600">
                    {booking.guestName}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {new Date(booking.startTime).toLocaleDateString()} at{" "}
                    {new Date(booking.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
                <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                  {booking.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CreateEventTypeForm({ onClose }: { onClose: () => void }) {
  const zero = useZero();
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [duration, setDuration] = useState<number>(30);
  const [color, setColor] = useState<string>("#3b82f6");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await zero.mutate.createEventType({
        id: nanoid(),
        title,
        description: description || undefined,
        duration,
        color,
      });
      onClose();
    } catch (error) {
      console.error("Failed to create event type:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Create New Event Type</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-neutral-800">
            Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="e.g., 30 Min Meeting"
            required
          />
        </div>

        <div>
          <label className="block mb-1 text-xs font-medium text-neutral-800">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={2}
            placeholder="Brief description of this meeting type"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-neutral-800">
              Duration (minutes) *
            </label>
            <input
              type="number"
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value) || 30)}
              className="input"
              min="15"
              max="240"
              step="15"
              required
            />
          </div>

          <div>
            <label className="block mb-1 text-xs font-medium text-neutral-800">
              Color
            </label>
            <input
              type="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="input h-10"
            />
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="btn btn-yellow"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating..." : "Create Event Type"}
          </button>
          <button type="button" onClick={onClose} className="btn btn-white">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
