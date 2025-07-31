import { createFileRoute, Link } from "@tanstack/react-router";
import { useSession } from "@/client/auth";
import { useQuery } from "@rocicorp/zero/react";
import { queries } from "@/shared/queries";
import { useState } from "react";
import { useZero } from "@/ui/use-zero";
import { nanoid } from "nanoid";

export const Route = createFileRoute("/availability")({
  component: AvailabilityPage,
});

const DAYS_OF_WEEK: string[] = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
];

const DEFAULT_TIMES: string[] = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"
];

function AvailabilityPage() {
  const { data: session, isPending } = useSession();
  
  if (isPending) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>;
  }
  
  if (!session) {
    return <div className="flex h-screen items-center justify-center">Please log in.</div>;
  }
  
  return <AvailabilityManager />;
}

function AvailabilityManager() {
  const { data: session } = useSession();
  const [availability] = useQuery(queries.userAvailability(session));
  const [showAddForm, setShowAddForm] = useState<boolean>(false);
  
  const availabilityByDay = availability.reduce((acc, slot) => {
    if (!acc[slot.dayOfWeek]) acc[slot.dayOfWeek] = [];
    acc[slot.dayOfWeek].push(slot);
    return acc;
  }, {} as Record<number, typeof availability>);

  return (
    <div className="flex h-screen">
      <aside className="w-56 bg-white border border-black p-3 flex flex-col gap-2 rounded-xl m-3 shadow-[2px_2px_0_#00000020]">
        <div className="text-xl font-extrabold tracking-tight mb-3">
          BookMe
        </div>
        <nav className="flex flex-col divide-y divide-neutral-200">
          <Link to="/" className="nav-btn">Dashboard</Link>
          <Link to="/availability" className="nav-btn">Availability</Link>
          <Link to="/bookings" className="nav-btn">Bookings</Link>
        </nav>
        <div className="mt-auto text-xs text-neutral-400">
          © 2025 BookMe
        </div>
      </aside>

      <main className="flex-1 p-5 overflow-auto">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold tracking-tight">Availability</h1>
            <button 
              onClick={() => setShowAddForm(true)} 
              className="btn btn-yellow"
            >
              Add Time Slot
            </button>
          </div>

          {showAddForm && (
            <AddAvailabilityForm onClose={() => setShowAddForm(false)} />
          )}

          <div className="card">
            <h2 className="text-lg font-semibold mb-4">Weekly Schedule</h2>
            <div className="space-y-4">
              {DAYS_OF_WEEK.map((dayName, dayIndex) => (
                <DaySchedule 
                  key={dayIndex}
                  dayName={dayName}
                  dayIndex={dayIndex}
                  slots={availabilityByDay[dayIndex] || []}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function DaySchedule({ dayName, dayIndex, slots }: {
  dayName: string;
  dayIndex: number;
  slots: any[];
}) {
  const zero = useZero();
  
  const handleDelete = async (slotId: string) => {
    try {
      await zero.mutate.deleteAvailability({ id: slotId });
    } catch (error) {
      console.error("Failed to delete availability:", error);
    }
  };

  return (
    <div className="border border-neutral-200 rounded-lg p-4">
      <h3 className="font-medium mb-3">{dayName}</h3>
      {slots.length === 0 ? (
        <p className="text-sm text-neutral-500">No availability set</p>
      ) : (
        <div className="space-y-2">
          {slots
            .sort((a, b) => a.startTime.localeCompare(b.startTime))
            .map((slot) => (
              <div key={slot.id} className="flex items-center justify-between bg-neutral-50 rounded px-3 py-2">
                <span className="text-sm">
                  {slot.startTime} - {slot.endTime}
                </span>
                <button
                  onClick={() => handleDelete(slot.id)}
                  className="text-xs text-red-600 hover:underline"
                >
                  Delete
                </button>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}

function AddAvailabilityForm({ onClose }: { onClose: () => void }) {
  const zero = useZero();
  const [dayOfWeek, setDayOfWeek] = useState<number>(1); // Monday
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("17:00");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (startTime >= endTime) {
      alert("End time must be after start time");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await zero.mutate.setAvailability({
        id: nanoid(),
        dayOfWeek,
        startTime,
        endTime,
      });
      onClose();
    } catch (error) {
      console.error("Failed to add availability:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="card mb-6">
      <h2 className="text-lg font-semibold mb-4">Add Availability</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1 text-xs font-medium text-neutral-800">
            Day of Week *
          </label>
          <select
            value={dayOfWeek}
            onChange={(e) => setDayOfWeek(parseInt(e.target.value))}
            className="input"
            required
          >
            {DAYS_OF_WEEK.map((dayName, index) => (
              <option key={index} value={index}>
                {dayName}
              </option>
            ))}
          </select>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 text-xs font-medium text-neutral-800">
              Start Time *
            </label>
            <select
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="input"
              required
            >
              {DEFAULT_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block mb-1 text-xs font-medium text-neutral-800">
              End Time *
            </label>
            <select
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="input"
              required
            >
              {DEFAULT_TIMES.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3">
          <button 
            type="submit" 
            className="btn btn-yellow"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Availability"}
          </button>
          <button 
            type="button" 
            onClick={onClose}
            className="btn btn-white"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}